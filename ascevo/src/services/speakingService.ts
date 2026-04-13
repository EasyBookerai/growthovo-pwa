import { supabase } from './supabaseClient';
import {
  checkLevelUnlock as checkLevelUnlockPure,
  checkMilestones as checkMilestonesPure,
} from './speakingMetrics';
import { awardXP } from './progressService';
import { incrementStreak } from './streakService';
import type {
  SpeechSession,
  SpeechProgress,
  SpeechAnalysisResult,
  WeeklyChallenge,
  MilestoneAlert,
  SpeakingLevel,
} from '../types/index';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface StartSessionParams {
  userId: string;
  level: SpeakingLevel;
  topic: string;
  audioUri: string; // local file URI from expo-av
  durationSeconds: number;
  language: string; // BCP-47 code e.g. 'en', 'ro'
}

// ─── Pure helpers (exported for property-based testing) ───────────────────────

/** Personal best: maximum of all session confidence scores */
export function computePersonalBest(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.max(...scores);
}

/** Rolling average: arithmetic mean of the last min(7, n) scores */
export function computeRollingAvg7(scores: number[]): number {
  if (scores.length === 0) return 0;
  const last7 = scores.slice(-7);
  return last7.reduce((sum, s) => sum + s, 0) / last7.length;
}

// ─── ISO week number helper ───────────────────────────────────────────────────

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ─── Row mappers ──────────────────────────────────────────────────────────────

function mapSession(row: any): SpeechSession {
  return {
    id: row.id,
    userId: row.user_id,
    sessionNumber: row.session_number,
    level: row.level as SpeakingLevel,
    topic: row.topic,
    durationSeconds: row.duration_seconds,
    audioUrl: row.audio_url ?? undefined,
    transcript: row.transcript,
    fillerWords: row.filler_words ?? {},
    fillerPositions: row.filler_positions ?? [],
    fillersPerMinute: row.fillers_per_minute,
    paceWpm: row.pace_wpm,
    languageStrength: row.language_strength,
    confidenceScore: row.confidence_score,
    structureScore: row.structure_score,
    openingStrength: row.opening_strength,
    closingStrength: row.closing_strength,
    silenceGaps: row.silence_gaps,
    anxiousPauses: row.anxious_pauses,
    purposefulPauses: row.purposeful_pauses,
    weakLanguageExamples: row.weak_language_examples ?? [],
    strongLanguageExamples: row.strong_language_examples ?? [],
    biggestWin: row.biggest_win ?? undefined,
    biggestFix: row.biggest_fix ?? undefined,
    openingAnalysis: row.opening_analysis ?? undefined,
    closingAnalysis: row.closing_analysis ?? undefined,
    comparedToLastSession: row.compared_to_last_session ?? undefined,
    rexVerdict: row.rex_verdict ?? undefined,
    rexAudioUrl: row.rex_audio_url ?? undefined,
    tomorrowFocus: row.tomorrow_focus ?? undefined,
    createdAt: row.created_at,
  };
}

function mapProgress(row: any): SpeechProgress {
  return {
    userId: row.user_id,
    totalSessions: row.total_sessions,
    currentLevel: row.current_level as SpeakingLevel,
    avgConfidenceLast7: row.avg_confidence_last_7,
    avgFillersLast7: row.avg_fillers_last_7,
    avgPaceLast7: row.avg_pace_last_7,
    sessionsThisWeek: row.sessions_this_week,
    personalBestConfidence: row.personal_best_confidence,
    personalBestOpening: row.personal_best_opening,
    personalBestClosing: row.personal_best_closing,
    levelUnlockDates: row.level_unlock_dates ?? {},
    milestonesTriggered: row.milestones_triggered ?? [],
    updatedAt: row.updated_at,
  };
}

// ─── submitSession ────────────────────────────────────────────────────────────

/**
 * Main entry point — reads audio file, base64-encodes, invokes analyze-speech Edge Function.
 */
export async function submitSession(params: StartSessionParams): Promise<SpeechAnalysisResult> {
  // Read audio file as base64
  let audioBase64: string;
  try {
    const response = await fetch(params.audioUri);
    const blob = await response.blob();
    audioBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Strip the data URL prefix (e.g. "data:audio/m4a;base64,")
        const base64 = result.split(',')[1] ?? result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    throw new Error('Failed to read audio file for upload.');
  }

  // Fetch session context for the Edge Function
  const [progressResult, historyResult] = await Promise.all([
    supabase.from('speech_progress').select('*').eq('user_id', params.userId).maybeSingle(),
    supabase
      .from('speech_sessions')
      .select('confidence_score, biggest_fix, created_at')
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  const progress = progressResult.data;
  const sessionNumber = (progress?.total_sessions ?? 0) + 1;

  const lastThreeSessions = (historyResult.data ?? []).map((s: any) => ({
    confidenceScore: s.confidence_score,
    biggestFix: s.biggest_fix ?? '',
    date: s.created_at,
  }));

  const { data, error } = await supabase.functions.invoke('analyze-speech', {
    body: {
      userId: params.userId,
      level: params.level,
      topic: params.topic,
      audioBase64,
      durationSeconds: params.durationSeconds,
      language: params.language,
      sessionNumber,
      lastThreeSessions,
    },
  });

  if (error) throw new Error(`analyze-speech failed: ${error.message}`);
  
  const result = data as SpeechAnalysisResult;

  // Award XP for completing the session
  await awardXP(params.userId, 30, 'speaking_session', result.sessionId);

  // Update streak
  await incrementStreak(params.userId);

  return result;
}

// ─── getSessionHistory ────────────────────────────────────────────────────────

/** Query speech_sessions ordered by created_at DESC */
export async function getSessionHistory(userId: string): Promise<SpeechSession[]> {
  const { data, error } = await supabase
    .from('speech_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error('Failed to fetch session history.');
  return (data ?? []).map(mapSession);
}

// ─── getSpeechProgress ────────────────────────────────────────────────────────

/** Query speech_progress for user */
export async function getSpeechProgress(userId: string): Promise<SpeechProgress | null> {
  const { data, error } = await supabase
    .from('speech_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error('Failed to fetch speech progress.');
  if (!data) return null;
  return mapProgress(data);
}

// ─── getSessionById ───────────────────────────────────────────────────────────

/** Query single speech_sessions row */
export async function getSessionById(sessionId: string): Promise<SpeechSession | null> {
  const { data, error } = await supabase
    .from('speech_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) throw new Error('Failed to fetch session.');
  if (!data) return null;
  return mapSession(data);
}

// ─── getWeeklyChallenge ───────────────────────────────────────────────────────

/** Query weekly_speaking_challenges for current ISO week number */
export async function getWeeklyChallenge(): Promise<WeeklyChallenge | null> {
  const currentWeek = getISOWeekNumber(new Date());

  const { data, error } = await supabase
    .from('weekly_speaking_challenges')
    .select('*')
    .eq('week_number', currentWeek)
    .maybeSingle();

  if (error) throw new Error('Failed to fetch weekly challenge.');
  if (!data) return null;

  return {
    id: data.id,
    weekNumber: data.week_number,
    prompt: data.prompt,
    xpBonus: data.xp_bonus,
  };
}

// ─── checkLevelUnlockForUser ──────────────────────────────────────────────────

/**
 * Fetches speech_progress, calls checkLevelUnlock pure function.
 * If a new level is unlocked, updates speech_progress.current_level and returns the new level.
 */
export async function checkLevelUnlockForUser(userId: string): Promise<SpeakingLevel | null> {
  const { data, error } = await supabase
    .from('speech_progress')
    .select('total_sessions, avg_confidence_last_7, current_level, level_unlock_dates')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  const currentLevel = data.current_level as SpeakingLevel;
  const newLevel = checkLevelUnlockPure(
    data.total_sessions,
    data.avg_confidence_last_7,
    currentLevel
  );

  if (newLevel <= currentLevel) return null;

  // Update the level and record unlock date
  const levelUnlockDates = {
    ...(data.level_unlock_dates ?? {}),
    [String(newLevel)]: new Date().toISOString(),
  };

  await supabase
    .from('speech_progress')
    .update({ current_level: newLevel, level_unlock_dates: levelUnlockDates })
    .eq('user_id', userId);

  return newLevel;
}

// ─── checkMilestonesForUser ───────────────────────────────────────────────────

/**
 * Fetches speech_progress.milestones_triggered, calls checkMilestones pure function.
 * If alerts are returned, updates speech_progress.milestones_triggered in DB.
 */
export async function checkMilestonesForUser(
  userId: string,
  sessionNumber: number,
  confidenceScore: number
): Promise<MilestoneAlert[]> {
  const { data, error } = await supabase
    .from('speech_progress')
    .select('milestones_triggered, personal_best_confidence')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return [];

  const milestonesTriggered: string[] = data.milestones_triggered ?? [];
  const personalBestConfidence: number = data.personal_best_confidence ?? 0;

  const alerts = checkMilestonesPure(
    sessionNumber,
    confidenceScore,
    personalBestConfidence,
    milestonesTriggered
  );

  if (alerts.length > 0) {
    // Derive the new milestone keys that were triggered
    const SESSION_MILESTONE_MAP: Record<number, string> = {
      1: 'session_1',
      5: 'session_5',
      10: 'session_10',
      25: 'session_25',
      50: 'session_50',
      100: 'session_100',
    };
    const CONFIDENCE_MILESTONE_MAP: Record<number, string> = {
      50: 'confidence_50',
      75: 'confidence_75',
      90: 'confidence_90',
    };

    const newKeys: string[] = [];
    for (const [count, key] of Object.entries(SESSION_MILESTONE_MAP)) {
      if (sessionNumber >= Number(count) && !milestonesTriggered.includes(key)) {
        newKeys.push(key);
      }
    }
    for (const [threshold, key] of Object.entries(CONFIDENCE_MILESTONE_MAP)) {
      if (
        personalBestConfidence < Number(threshold) &&
        confidenceScore >= Number(threshold) &&
        !milestonesTriggered.includes(key)
      ) {
        newKeys.push(key);
      }
    }

    if (newKeys.length > 0) {
      await supabase
        .from('speech_progress')
        .update({ milestones_triggered: [...milestonesTriggered, ...newKeys] })
        .eq('user_id', userId);
    }
  }

  return alerts;
}

// ─── submitWeeklyChallengeSession ─────────────────────────────────────────────

/**
 * Submit a session for the weekly challenge.
 * Awards bonus XP (100) on completion.
 */
export async function submitWeeklyChallengeSession(
  params: StartSessionParams,
  challengeId: string
): Promise<SpeechAnalysisResult> {
  // Submit the session normally
  const result = await submitSession(params);

  // Award bonus XP for weekly challenge completion
  await awardXP(params.userId, 100, 'speaking_challenge', challengeId);

  return result;
}

