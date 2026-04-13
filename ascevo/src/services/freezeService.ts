import { supabase } from './supabaseClient';
import { awardXP } from './progressService';
import * as Notifications from 'expo-notifications';
import { FREEZE_COST_XP, MAX_FREEZES } from '../types';

// ─── Purchase Streak Freeze ──────────────────────────────────────────────────

/**
 * Purchases a streak freeze for the user by deducting 500 XP and incrementing freeze_count.
 * Throws error if insufficient XP or already at max freezes.
 */
export async function purchaseStreakFreeze(
  userId: string,
  currentXp: number,
  currentFreezes: number
): Promise<void> {
  // Validate XP requirement
  if (currentXp < FREEZE_COST_XP) {
    throw new Error('Insufficient XP to purchase streak freeze');
  }

  // Validate freeze limit
  if (currentFreezes >= MAX_FREEZES) {
    throw new Error('Maximum freezes already held');
  }

  // Start transaction to ensure atomicity
  try {
    await awardXP(userId, -FREEZE_COST_XP, 'streak_milestone', 'freeze_purchase');
  } catch (error) {
    throw new Error('Failed to deduct XP for freeze purchase');
  }

  // Increment freeze count in streaks table
  const { error: freezeError } = await supabase
    .from('streaks')
    .update({ freeze_count: currentFreezes + 1 })
    .eq('user_id', userId);

  if (freezeError) {
    // Rollback XP deduction by awarding it back
    try {
      await awardXP(userId, FREEZE_COST_XP, 'streak_milestone', 'freeze_purchase_rollback');
    } catch (rollbackError) {
      // Log rollback failure but don't throw to avoid masking original error
      console.error('Failed to rollback XP deduction:', rollbackError);
    }
    throw new Error('Failed to update freeze count');
  }
}

// ─── Auto Activate Freeze ────────────────────────────────────────────────────

/**
 * Automatically activates a streak freeze if the user has one available.
 * Consumes one freeze and sends a push notification.
 * Returns true if a freeze was activated, false if none available.
 */
export async function autoActivateFreeze(userId: string): Promise<boolean> {
  // Get current freeze count
  const { data: streakData, error: streakError } = await supabase
    .from('streaks')
    .select('freeze_count')
    .eq('user_id', userId)
    .single();

  if (streakError || !streakData) {
    throw new Error('Failed to fetch streak data');
  }

  // Check if user has any freezes available
  if (streakData.freeze_count <= 0) {
    return false;
  }

  // Consume one freeze
  const { error: updateError } = await supabase
    .from('streaks')
    .update({ freeze_count: streakData.freeze_count - 1 })
    .eq('user_id', userId);

  if (updateError) {
    throw new Error('Failed to consume streak freeze');
  }

  // Send push notification
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rex',
        body: "Rex used a streak freeze. You owe him one. Don't miss tomorrow.",
        sound: true,
      },
      trigger: null, // immediate
    });
  } catch (notificationError) {
    // Don't fail the freeze activation if notification fails
    console.warn('Failed to send freeze activation notification:', notificationError);
  }

  return true;
}