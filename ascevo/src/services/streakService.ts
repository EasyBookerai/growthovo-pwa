import { supabase } from './supabaseClient';
import { XP_AWARDS } from '../types';

const MAX_FREEZES = 5;

export interface MilestoneResult {
  isMilestone: boolean;
  xpBonus: number;
  days: number;
}

// ─── Increment Streak ─────────────────────────────────────────────────────────
// Idempotent: only increments if last_activity_date < today.
// Uses RPC for atomic update.

export async function incrementStreak(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('increment_streak', { p_user_id: userId });
  if (error) throw new Error('Failed to update streak.');
  return data as number;
}

// ─── Handle Missed Day ────────────────────────────────────────────────────────
// If freeze available: consume one freeze, preserve streak.
// Otherwise: reset streak to 0.

export async function handleMissedDay(userId: string): Promise<{ streakPreserved: boolean; newStreak: number }> {
  const { data: streak, error } = await supabase
    .from('streaks')
    .select('current_streak, freeze_count')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error('Failed to fetch streak.');

  if (streak.freeze_count > 0) {
    // Consume one freeze, preserve streak
    const { error: updateError } = await supabase
      .from('streaks')
      .update({
        freeze_count: streak.freeze_count - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw new Error('Failed to consume streak freeze.');
    return { streakPreserved: true, newStreak: streak.current_streak };
  } else {
    // Reset streak
    const { error: resetError } = await supabase
      .from('streaks')
      .update({
        current_streak: 0,
        last_activity_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (resetError) throw new Error('Failed to reset streak.');
    return { streakPreserved: false, newStreak: 0 };
  }
}

// ─── Add Streak Freeze ────────────────────────────────────────────────────────
// Caps at MAX_FREEZES (5).

export async function addStreakFreeze(userId: string): Promise<number> {
  const { data: streak, error } = await supabase
    .from('streaks')
    .select('freeze_count')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error('Failed to fetch streak.');

  const newCount = Math.min(streak.freeze_count + 1, MAX_FREEZES);

  const { error: updateError } = await supabase
    .from('streaks')
    .update({ freeze_count: newCount })
    .eq('user_id', userId);

  if (updateError) throw new Error('Failed to add streak freeze.');
  return newCount;
}

// ─── Check Milestone ─────────────────────────────────────────────────────────
// Returns milestone XP bonus for 7/30/100 day milestones.

export function checkMilestone(streak: number): MilestoneResult {
  if (streak === 100) return { isMilestone: true, xpBonus: XP_AWARDS.STREAK_100, days: 100 };
  if (streak === 30)  return { isMilestone: true, xpBonus: XP_AWARDS.STREAK_30,  days: 30 };
  if (streak === 7)   return { isMilestone: true, xpBonus: XP_AWARDS.STREAK_7,   days: 7 };
  return { isMilestone: false, xpBonus: 0, days: streak };
}

// ─── Get Streak ───────────────────────────────────────────────────────────────

export async function getStreak(userId: string) {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error('Failed to fetch streak.');
  return data;
}

// ─── Pure logic helpers (used in tests without DB) ───────────────────────────

export function applyMissedDay(
  currentStreak: number,
  freezeCount: number
): { newStreak: number; newFreezeCount: number; preserved: boolean } {
  if (freezeCount > 0) {
    return { newStreak: currentStreak, newFreezeCount: freezeCount - 1, preserved: true };
  }
  return { newStreak: 0, newFreezeCount: 0, preserved: false };
}

export function applyAddFreeze(currentFreezeCount: number): number {
  return Math.min(currentFreezeCount + 1, MAX_FREEZES);
}

// ─── Reset Streak to 0 ────────────────────────────────────────────────────────
// Used when user explicitly chooses to start fresh (bypasses freeze logic)

export async function resetStreak(userId: string): Promise<void> {
  const { error } = await supabase
    .from('streaks')
    .update({
      current_streak: 0,
      last_activity_date: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) throw new Error('Failed to reset streak.');
}
