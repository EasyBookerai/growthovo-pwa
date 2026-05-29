/**
 * Premium Pillars Experience - Lesson Service
 * 
 * This service handles lesson completion logic for premium pillars including:
 * - Lesson completion tracking
 * - XP awards (50 XP per lesson)
 * - localStorage persistence
 * - Idempotent operations
 */

import {
  loadPillarProgress,
  savePillarProgress,
  loadCompletedLessons,
  saveCompletedLessons,
  getCurrentDate,
} from './pillarStorageService';
import { awardXP } from './pillarChallengeService';
import type { PremiumPillarKey } from '../types/pillars';
import { PREMIUM_XP_AWARDS } from '../types/pillars';

/**
 * Complete a lesson
 * 
 * Marks a lesson as complete and awards 50 XP.
 * This operation is idempotent - completing the same lesson twice
 * will not award XP again.
 * 
 * Algorithm:
 * 1. Check if lesson already completed (idempotent)
 * 2. Add lesson ID to completedLessons array in localStorage
 * 3. Update pillar progress with lesson ID
 * 4. Award 50 XP via awardXP function
 * 5. Update last activity date
 * 6. Sync with AppContext if callback provided
 * 
 * Preconditions:
 * - lessonId is a valid lesson ID
 * - pillarKey in VALID_PILLARS
 * 
 * Postconditions:
 * - lessonId in completedLessons
 * - pillarProgress.xp_new = pillarProgress.xp_old + 50 (if not already completed)
 * - pillarProgress.completedLessons contains lessonId
 * - If onAppContextSync provided, AppContext is updated
 * 
 * Invariants:
 * - completedLessons contains unique IDs
 * - completedLessons.length <= 24
 * 
 * @param pillarKey - Pillar identifier
 * @param lessonId - Lesson identifier to mark as complete
 * @param onAppContextSync - Optional callback to sync with AppContext
 * @returns Promise that resolves when lesson is completed
 */
export async function completeLesson(
  pillarKey: PremiumPillarKey,
  lessonId: string,
  onAppContextSync?: (xpAmount: number) => Promise<void>
): Promise<void> {
  // Load completed lessons
  const completedLessons = await loadCompletedLessons();
  
  // Check if already completed (idempotent)
  if (completedLessons.lessonIds.includes(lessonId)) {
    console.log(`Lesson ${lessonId} already completed, skipping`);
    return; // No error, just return
  }
  
  // Add lesson ID to completed lessons array
  completedLessons.lessonIds.push(lessonId);
  completedLessons.lastUpdated = new Date().toISOString();
  
  // Save completed lessons to localStorage
  await saveCompletedLessons(completedLessons);
  
  // Update pillar progress with lesson ID
  const progress = await loadPillarProgress(pillarKey);
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
  }
  progress.lastActivityDate = getCurrentDate();
  
  // Save pillar progress
  await savePillarProgress(pillarKey, progress);
  
  // Award 50 XP (with AppContext sync if provided)
  await awardXP(pillarKey, PREMIUM_XP_AWARDS.LESSON_COMPLETE, onAppContextSync);
  
  console.log(`✅ Lesson ${lessonId} completed! +${PREMIUM_XP_AWARDS.LESSON_COMPLETE} XP`);
}

/**
 * Check if a lesson is completed
 * 
 * @param lessonId - Lesson identifier to check
 * @returns Promise that resolves to true if completed, false otherwise
 */
export async function isLessonCompleted(lessonId: string): Promise<boolean> {
  const completedLessons = await loadCompletedLessons();
  return completedLessons.lessonIds.includes(lessonId);
}

/**
 * Get all completed lesson IDs
 * 
 * @returns Promise that resolves to array of completed lesson IDs
 */
export async function getCompletedLessonIds(): Promise<string[]> {
  const completedLessons = await loadCompletedLessons();
  return completedLessons.lessonIds;
}

/**
 * Get completed lesson count for a specific pillar
 * 
 * @param pillarKey - Pillar identifier
 * @returns Promise that resolves to count of completed lessons for the pillar
 */
export async function getCompletedLessonCountForPillar(
  pillarKey: PremiumPillarKey
): Promise<number> {
  const progress = await loadPillarProgress(pillarKey);
  return progress.completedLessons.length;
}
