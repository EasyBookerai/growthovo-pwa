import { ComebackChallenge } from '../types';
import { supabase } from './supabaseClient';
import { sendPartnerStreakBreakNotification } from './notificationService';

// ─── Detect Streak Break ──────────────────────────────────────────────────────

export async function detectStreakBreak(
  userId: string
): Promise<{ broke: boolean; originalStreak: number; freezeActivated: boolean }> {
  const { data: streak, error } = await supabase
    .from('streaks')
    .select('current_streak, last_activity_date, freeze_count, comeback_used_at')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error('Failed to fetch streak.');

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const lastActivity: string | null = streak.last_activity_date
    ? streak.last_activity_date.slice(0, 10)
    : null;

  if (!lastActivity || lastActivity === today) {
    return { broke: false, originalStreak: streak.current_streak, freezeActivated: false };
  }

  if (lastActivity === yesterday) {
    return { broke: false, originalStreak: streak.current_streak, freezeActivated: false };
  }

  const originalStreak: number = streak.current_streak;

  if (streak.freeze_count > 0) {
    const { error: updateError } = await supabase
      .from('streaks')
      .update({ freeze_count: streak.freeze_count - 1 })
      .eq('user_id', userId);

    if (updateError) throw new Error('Failed to activate streak freeze.');
    return { broke: false, originalStreak, freezeActivated: true };
  }

  // Notify partner before returning — Requirement 20.5
  notifyPartnerOfStreakBreak(userId).catch(() => {});

  return { broke: true, originalStreak, freezeActivated: false };
}

// ─── Notify Partner on Streak Break ──────────────────────────────────────────

/**
 * Fires the partner streak-break push notification.
 * Called from detectStreakBreak when broke=true, before any other notification.
 * Requirement 20.5
 */
async function notifyPartnerOfStreakBreak(userId: string): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .maybeSingle();

    const userName: string = profile?.username ?? 'Your partner';
    await sendPartnerStreakBreakNotification(userId, userName);
  } catch {
    // Non-critical
  }
}

// ─── Rex Line by Streak Length ────────────────────────────────────────────────

export function getStreakBrokeRexLine(streak: number): string {
  if (streak <= 7) return `It was only ${streak} days. Start again. Now.`;
  if (streak <= 30) return `You had ${streak} days. That's not nothing. But it's gone. What are you going to do about it?`;
  return `You had ${streak} days. That took real work. Losing it in one night is also real. Sit with that.`;
}

// ─── Comeback Challenge Eligibility ──────────────────────────────────────────

export function canUseComebackChallenge(comebackUsedAt: string | null): boolean {
  if (!comebackUsedAt) return true;
  const daysSince = (Date.now() - new Date(comebackUsedAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= 30;
}

// ─── Create Comeback Challenge ────────────────────────────────────────────────

export async function createComebackChallenge(
  userId: string,
  challengeId: string
): Promise<ComebackChallenge> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('comeback_challenges')
    .insert({ user_id: userId, challenge_id: challengeId, expires_at: expiresAt, completed: false })
    .select()
    .single();

  if (error) throw new Error('Failed to create comeback challenge.');

  return {
    id: data.id,
    userId: data.user_id,
    challengeId: data.challenge_id,
    expiresAt: data.expires_at,
    completed: data.completed,
    proofUrl: data.proof_url ?? undefined,
    streakRestoredTo: data.streak_restored_to ?? undefined,
    createdAt: data.created_at,
  };
}

// ─── Complete Comeback Challenge ──────────────────────────────────────────────

export async function completeComebackChallenge(userId: string, proofUrl: string): Promise<number> {
  const now = new Date().toISOString();

  const { data: challenge, error: challengeError } = await supabase
    .from('comeback_challenges')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (challengeError) throw new Error('No active comeback challenge found.');

  const { data: streak, error: streakError } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single();

  if (streakError) throw new Error('Failed to fetch streak.');

  const restored = calculateRestoredStreak(streak.current_streak);

  const { error: updateChallengeError } = await supabase
    .from('comeback_challenges')
    .update({ completed: true, proof_url: proofUrl, streak_restored_to: restored })
    .eq('id', challenge.id);

  if (updateChallengeError) throw new Error('Failed to update comeback challenge.');

  const { error: updateStreakError } = await supabase
    .from('streaks')
    .update({ current_streak: restored, comeback_used_at: now })
    .eq('user_id', userId);

  if (updateStreakError) throw new Error('Failed to restore streak.');

  return restored;
}

// ─── Calculate Restored Streak ────────────────────────────────────────────────

export function calculateRestoredStreak(original: number): number {
  return Math.floor(original / 2);
}
