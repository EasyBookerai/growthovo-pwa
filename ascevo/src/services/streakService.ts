/**
 * Streak Service — manages user activity streaks and freezes.
 * Local: AsyncStorage under '@growthovo:streak'
 * Remote: Supabase streaks table
 */

import { supabase } from './supabaseClient';
import { XP_AWARDS } from '../types';
import { storeCelebrationEvent } from './celebrationService';
import type { CelebrationData } from './animationService';

const MAX_FREEZES = 2; // Requirement 4.5: Store maximum of 2 Streak_Freezes at once

export interface MilestoneResult {
  isMilestone: boolean;
  xpBonus: number;
  days: number;
}

// ─── Increment Streak ─────────────────────────────────────────────────────────
// Idempotent: only increments if last_activity_date < today.
// Uses RPC for atomic update.
// Returns: { streak: number; freezeAwarded: boolean; newFreezeCount: number }

export async function incrementStreak(
  userId: string,
  onCelebration?: (data: CelebrationData) => void
): Promise<{ streak: number; freezeAwarded: boolean; newFreezeCount: number }> {
  const { data, error } = await supabase.rpc('increment_streak', { p_user_id: userId });
  if (error) throw new Error('Failed to update streak.');
  
  const newStreak = data as number;
  
  // 🎉 Check if this is a milestone and trigger celebration
  const milestone = checkMilestone(newStreak);
  if (milestone.isMilestone) {
    const celebrationData: CelebrationData = {
      type: 'streak_milestone',
      title: `${milestone.days} Day Streak!`,
      subtitle: 'Amazing consistency!',
      xpEarned: milestone.xpBonus,
      streakMilestone: milestone.days,
      intensity: milestone.days >= 100 ? 'high' : milestone.days >= 30 ? 'medium' : 'low',
    };
    
    // Store celebration event in database
    await storeCelebrationEvent(userId, celebrationData);
    
    // Trigger celebration callback if provided
    if (onCelebration) {
      onCelebration(celebrationData);
    }
  }
  
  // Requirement 4.4: Award 1 Streak_Freeze on 7-day streak completion
  // Award freeze on every 7-day milestone (7, 14, 21, 28, etc.)
  let freezeAwarded = false;
  let newFreezeCount = 0;
  if (newStreak > 0 && newStreak % 7 === 0) {
    newFreezeCount = await addStreakFreeze(userId);
    freezeAwarded = true;
  } else {
    // Get current freeze count
    const streakData = await getStreak(userId);
    newFreezeCount = streakData.freeze_count;
  }
  
  return { streak: newStreak, freezeAwarded, newFreezeCount };
}

// ─── Handle Missed Day ────────────────────────────────────────────────────────
// If freeze available: consume one freeze, preserve streak.
// Otherwise: reset streak to 0.
// Requirement 4.6, 4.7: Auto-consume freeze and display toast when consumed
// Returns: { streakPreserved: boolean; newStreak: number; freezeUsed: boolean; newFreezeCount: number }

export async function handleMissedDay(userId: string): Promise<{ streakPreserved: boolean; newStreak: number; freezeUsed: boolean; newFreezeCount: number }> {
  const { data: streak, error } = await supabase
    .from('streaks')
    .select('current_streak, freeze_count')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error('Failed to fetch streak.');

  if (streak.freeze_count > 0) {
    // Consume one freeze, preserve streak
    const newFreezeCount = streak.freeze_count - 1;
    const { error: updateError } = await supabase
      .from('streaks')
      .update({
        freeze_count: newFreezeCount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw new Error('Failed to consume streak freeze.');
    return { streakPreserved: true, newStreak: streak.current_streak, freezeUsed: true, newFreezeCount };
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
    return { streakPreserved: false, newStreak: 0, freezeUsed: false, newFreezeCount: 0 };
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
  return Math.min(currentFreezeCount + 1, MAX_FREEZES); // Requirement 4.5: max 2 freezes
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
