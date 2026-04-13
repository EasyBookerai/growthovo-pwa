import { supabase } from './supabaseClient';
import { getBriefingFallbackFocus } from './briefingService';
import type { EveningDebrief, DebriefFlowState } from '../types';

// ─── hasDebriefBeenShownToday ──────────────────────────────────────────────────

/**
 * Returns true if the user has already completed the evening debrief today.
 * Checks for an existing row in evening_debriefs for today's date.
 * Requirement 16.4
 */
export async function hasDebriefBeenShownToday(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('evening_debriefs')
    .select('id')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (error) {
    console.error('hasDebriefBeenShownToday error:', error);
    return false;
  }

  return data != null;
}

// ─── validateMinWordCount ──────────────────────────────────────────────────────

/**
 * Returns true if `text` contains at least `minWords` non-empty tokens.
 * Splits on any whitespace and filters out empty strings.
 * Requirements 17.4, 17.5
 */
export function validateMinWordCount(text: string, minWords: number): boolean {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length >= minWords;
}

// ─── getTomorrowFocusPreview ───────────────────────────────────────────────────

/**
 * Returns a preview of tomorrow's morning focus based on the user's weakest pillar.
 * Weakest pillar = lowest total XP earned in the last 7 days across xp_transactions.
 * Falls back to 'discipline' if no XP data is available.
 * Requirement 16.7
 */
export async function getTomorrowFocusPreview(userId: string): Promise<string> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('xp_transactions')
    .select('source, amount')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo);

  if (error) {
    console.error('getTomorrowFocusPreview xp query error:', error);
    return getBriefingFallbackFocus('discipline');
  }

  // Aggregate XP per pillar — source values that match pillar keys directly
  const PILLARS = ['mind', 'discipline', 'communication', 'money', 'career', 'relationships'];
  const xpByPillar: Record<string, number> = {};
  for (const pillar of PILLARS) {
    xpByPillar[pillar] = 0;
  }

  if (data) {
    for (const tx of data) {
      const src = (tx.source as string).toLowerCase();
      if (PILLARS.includes(src)) {
        xpByPillar[src] += tx.amount as number;
      }
    }
  }

  // Find the pillar with the lowest XP
  let weakestPillar = 'discipline';
  let lowestXp = Infinity;
  for (const pillar of PILLARS) {
    if (xpByPillar[pillar] < lowestXp) {
      lowestXp = xpByPillar[pillar];
      weakestPillar = pillar;
    }
  }

  return getBriefingFallbackFocus(weakestPillar);
}

// ─── getQ2Insight ─────────────────────────────────────────────────────────────

/**
 * Calls the submit-evening-debrief Edge Function to get a one-sentence insight
 * from the user's Q2 obstacle answer. Returns a fallback string on error.
 * Requirement 17.6
 */
export async function getQ2Insight(userId: string, obstacle: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('submit-evening-debrief', {
      body: { action: 'q2_insight', userId, obstacle },
    });

    if (!error && data?.insight) {
      return data.insight as string;
    }
  } catch (err) {
    console.error('getQ2Insight error:', err);
  }

  return "Obstacles are information. What this one is telling you matters.";
}

// ─── submitDebrief ────────────────────────────────────────────────────────────

/**
 * Submits the full evening debrief to the Edge Function, which handles:
 * - Q2 word count validation
 * - AI-generated closing verdict
 * - Inserting into evening_debriefs
 * - Memory extraction (async)
 * - XP award and streak update
 * Returns the completed EveningDebrief record.
 * Requirement 16.6
 */
export async function submitDebrief(
  userId: string,
  state: DebriefFlowState
): Promise<EveningDebrief> {
  const { data, error } = await supabase.functions.invoke('submit-evening-debrief', {
    body: { userId, debriefData: state },
  });

  if (error || !data) {
    throw new Error('Failed to submit evening debrief.');
  }

  return data as EveningDebrief;
}

// ─── extractMemoriesFromDebrief ───────────────────────────────────────────────

/**
 * Triggers async memory extraction from a completed debrief's Q2 and Q3 answers.
 * Non-blocking — errors are logged but not thrown.
 * Requirement 14.1
 */
export async function extractMemoriesFromDebrief(
  userId: string,
  debrief: EveningDebrief
): Promise<void> {
  const text = [debrief.q2Obstacle, debrief.q3Note].filter(Boolean).join('\n');
  if (!text.trim()) return;

  try {
    await supabase.functions.invoke('extract-memories', {
      body: { userId, text, source: 'evening_debrief' },
    });
  } catch (err) {
    console.error('extractMemoriesFromDebrief error:', err);
  }
}
