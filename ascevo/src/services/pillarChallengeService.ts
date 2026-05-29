/**
 * Premium Pillars Experience - Challenge Service
 * 
 * This service handles daily challenge completion logic including:
 * - Challenge completion tracking
 * - XP awards (30 XP per challenge)
 * - Daily reset functionality
 * - localStorage persistence
 * - AppContext sync with retry queue and exponential backoff
 */

import {
  loadPillarProgress,
  savePillarProgress,
  loadGlobalXP,
  saveGlobalXP,
  getCurrentDate,
  shouldResetDailyChallenge,
} from './pillarStorageService';
import { calculateLevel } from './pillarXPService';
import type { PremiumPillarKey, PillarProgress } from '../types/pillars';
import { PREMIUM_XP_AWARDS } from '../types/pillars';

/**
 * Retry Queue Item
 * 
 * Represents a failed AppContext sync operation that needs to be retried.
 */
interface RetryQueueItem {
  xpAmount: number;
  callback: (xpAmount: number) => Promise<void>;
  retryCount: number;
  timestamp: number;
}

/**
 * Retry queue for failed AppContext syncs
 * Implements exponential backoff: 1s, 2s, 4s, 8s, max 30s
 */
const retryQueue: RetryQueueItem[] = [];
let isProcessingQueue = false;
let syncStatusCallback: ((isSyncing: boolean) => void) | null = null;

/**
 * Register a callback to be notified when sync status changes
 * 
 * @param callback - Function to call with sync status (true = syncing, false = idle)
 */
export function registerSyncStatusCallback(callback: (isSyncing: boolean) => void): void {
  syncStatusCallback = callback;
}

/**
 * Unregister sync status callback
 */
export function unregisterSyncStatusCallback(): void {
  syncStatusCallback = null;
}

/**
 * Calculate exponential backoff delay
 * 
 * Formula: min(2^retryCount * 1000, 30000)
 * Results: 1s, 2s, 4s, 8s, 16s, 30s, 30s, ...
 * 
 * @param retryCount - Number of retries attempted
 * @returns Delay in milliseconds
 */
function calculateBackoffDelay(retryCount: number): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const delay = Math.pow(2, retryCount) * baseDelay;
  return Math.min(delay, maxDelay);
}

/**
 * Add failed sync to retry queue
 * 
 * @param xpAmount - XP amount to sync
 * @param callback - AppContext sync callback
 */
function addToRetryQueue(xpAmount: number, callback: (xpAmount: number) => Promise<void>): void {
  retryQueue.push({
    xpAmount,
    callback,
    retryCount: 0,
    timestamp: Date.now(),
  });
  
  console.log(`[RetryQueue] Added sync to queue. Queue size: ${retryQueue.length}`);
  
  // Notify UI that syncing is in progress
  if (syncStatusCallback) {
    syncStatusCallback(true);
  }
  
  // Start processing queue if not already processing
  if (!isProcessingQueue) {
    processRetryQueue();
  }
}

/**
 * Process retry queue with exponential backoff
 * 
 * Attempts to sync each item in the queue. On failure, increments retry count
 * and schedules next retry with exponential backoff.
 * 
 * Max retries: 10 (after which item is dropped)
 */
async function processRetryQueue(): Promise<void> {
  if (isProcessingQueue || retryQueue.length === 0) {
    return;
  }
  
  isProcessingQueue = true;
  
  while (retryQueue.length > 0) {
    const item = retryQueue[0];
    const delay = calculateBackoffDelay(item.retryCount);
    
    console.log(`[RetryQueue] Retrying sync (attempt ${item.retryCount + 1}) after ${delay}ms`);
    
    // Wait for backoff delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      // Attempt sync
      await item.callback(item.xpAmount);
      
      // Success - remove from queue
      retryQueue.shift();
      console.log(`[RetryQueue] Sync successful. Queue size: ${retryQueue.length}`);
      
      // If queue is empty, notify UI that syncing is complete
      if (retryQueue.length === 0 && syncStatusCallback) {
        syncStatusCallback(false);
      }
    } catch (error) {
      console.error(`[RetryQueue] Retry failed:`, error);
      
      // Increment retry count
      item.retryCount++;
      
      // Check if max retries exceeded (10 retries = ~17 minutes total)
      if (item.retryCount >= 10) {
        console.error(`[RetryQueue] Max retries exceeded, dropping sync`);
        retryQueue.shift();
        
        // If queue is empty, notify UI
        if (retryQueue.length === 0 && syncStatusCallback) {
          syncStatusCallback(false);
        }
      }
      // Otherwise, item stays in queue for next retry
    }
  }
  
  isProcessingQueue = false;
}

/**
 * Get current sync status
 * 
 * @returns true if there are items in the retry queue, false otherwise
 */
export function isSyncing(): boolean {
  return retryQueue.length > 0;
}

/**
 * Award XP to a pillar
 * 
 * Updates pillar XP, recalculates level, and syncs with global XP.
 * Optionally syncs with AppContext for global state updates.
 * 
 * Preconditions:
 * - amount > 0
 * - pillarKey in VALID_PILLARS
 * 
 * Postconditions:
 * - pillarProgress.xp_new = pillarProgress.xp_old + amount
 * - pillarProgress.level = calculateLevel(pillarProgress.xp_new)
 * - globalXP_new = globalXP_old + amount
 * - If onAppContextSync provided, AppContext is updated
 * 
 * Invariants:
 * - pillarProgress.xp >= 0
 * - pillarProgress.level >= 1
 * - pillarProgress.level = calculateLevel(pillarProgress.xp)
 * 
 * @param pillarKey - Pillar identifier
 * @param amount - XP amount to award (must be > 0)
 * @param onAppContextSync - Optional callback to sync with AppContext
 * @returns Promise that resolves when XP is awarded
 */
export async function awardXP(
  pillarKey: PremiumPillarKey,
  amount: number,
  onAppContextSync?: (xpAmount: number) => Promise<void>
): Promise<void> {
  if (amount <= 0) {
    throw new Error('XP amount must be positive');
  }

  // Load current progress
  const progress = await loadPillarProgress(pillarKey);
  const oldXP = progress.xp;
  const oldLevel = progress.level;

  // Update XP (optimistic update)
  progress.xp += amount;
  progress.level = calculateLevel(progress.xp);
  progress.lastActivityDate = getCurrentDate();

  // Persist locally (optimistic update)
  await savePillarProgress(pillarKey, progress);

  // Sync to global XP (optimistic update)
  const globalXP = await loadGlobalXP();
  const newGlobalXP = globalXP + amount;
  await saveGlobalXP(newGlobalXP);

  // Sync with AppContext if callback provided (Requirement 17.1, Task 14.2)
  if (onAppContextSync) {
    try {
      await onAppContextSync(amount);
      console.log(`[awardXP] Successfully synced ${amount} XP to AppContext`);
    } catch (error) {
      // Check if this is a network error or unexpected error
      const isNetworkError = error instanceof Error && 
        (error.message.includes('network') || 
         error.message.includes('connection') ||
         error.message.includes('Failed to save') ||
         error.message.includes('timeout'));
      
      if (isNetworkError) {
        // Network error: Keep optimistic update, add to retry queue with exponential backoff
        console.error('[awardXP] Network error syncing with AppContext:', error);
        console.log('[awardXP] Local progress is saved. Adding to retry queue with exponential backoff.');
        
        // Add to retry queue (Task 14.2: Implement retry queue with exponential backoff)
        addToRetryQueue(amount, onAppContextSync);
      } else {
        // Unexpected error: Rollback local state
        console.error('[awardXP] Unexpected error syncing with AppContext, rolling back:', error);
        
        // Rollback pillar progress
        progress.xp = oldXP;
        progress.level = oldLevel;
        await savePillarProgress(pillarKey, progress);
        
        // Rollback global XP
        await saveGlobalXP(globalXP);
        
        // Re-throw to notify caller
        throw new Error(`Failed to sync XP: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  // Log level up if applicable
  if (progress.level > oldLevel) {
    console.log(`🎉 Level up! ${pillarKey} reached level ${progress.level}`);
  }
}

/**
 * Complete daily challenge
 * 
 * Marks challenge as completed and awards 30 XP.
 * 
 * Preconditions:
 * - pillarKey in VALID_PILLARS
 * - !isChallengeCompletedToday(pillarKey)
 * 
 * Postconditions:
 * - pillarProgress.challengeCompletedToday = true
 * - pillarProgress.challengeCompletionDate = getCurrentDate()
 * - pillarProgress.xp_new = pillarProgress.xp_old + 30
 * - If onAppContextSync provided, AppContext is updated
 * 
 * Invariants:
 * - Challenge can only be completed once per day
 * - Challenge resets at midnight
 * 
 * @param pillarKey - Pillar identifier
 * @param onAppContextSync - Optional callback to sync with AppContext
 * @returns Promise that resolves when challenge is completed
 * @throws Error if challenge is already completed today
 */
export async function completeDailyChallenge(
  pillarKey: PremiumPillarKey,
  onAppContextSync?: (xpAmount: number) => Promise<void>
): Promise<void> {
  // Load current progress
  let progress = await loadPillarProgress(pillarKey);

  // Check for daily reset
  if (shouldResetDailyChallenge(progress)) {
    progress.challengeCompletedToday = false;
    progress.challengeCompletionDate = null;
  }

  // Check if already completed today (after potential reset)
  if (progress.challengeCompletedToday) {
    throw new Error('Challenge already completed today');
  }

  // Mark challenge as completed
  progress.challengeCompletedToday = true;
  progress.challengeCompletionDate = getCurrentDate();

  // Save progress (before awarding XP to ensure completion is persisted)
  await savePillarProgress(pillarKey, progress);

  // Award XP (with AppContext sync if provided)
  await awardXP(pillarKey, PREMIUM_XP_AWARDS.DAILY_CHALLENGE, onAppContextSync);
}

/**
 * Check if challenge is completed today
 * 
 * Checks completion status and performs daily reset if needed.
 * 
 * @param pillarKey - Pillar identifier
 * @returns Promise that resolves to true if completed today, false otherwise
 */
export async function isChallengeCompletedToday(
  pillarKey: PremiumPillarKey
): Promise<boolean> {
  let progress = await loadPillarProgress(pillarKey);

  // Check for daily reset
  if (shouldResetDailyChallenge(progress)) {
    progress.challengeCompletedToday = false;
    progress.challengeCompletionDate = null;
    await savePillarProgress(pillarKey, progress);
    return false;
  }

  return progress.challengeCompletedToday;
}

/**
 * Check daily reset for all pillars
 * 
 * Resets challenge completion status if date has changed.
 * Should be called when app comes to foreground.
 * 
 * @returns Promise that resolves when all pillars are checked
 */
export async function checkDailyResetForAllPillars(): Promise<void> {
  const pillars: PremiumPillarKey[] = [
    'mental-health',
    'relationships',
    'career',
    'fitness',
    'finance',
    'hobbies',
  ];

  await Promise.all(
    pillars.map(async (pillarKey) => {
      const progress = await loadPillarProgress(pillarKey);

      // Only save if reset is needed
      if (shouldResetDailyChallenge(progress)) {
        progress.challengeCompletedToday = false;
        progress.challengeCompletionDate = null;
        await savePillarProgress(pillarKey, progress);
      }
    })
  );
}
