/**
 * Premium Pillars Experience - Storage Service
 * 
 * This service provides localStorage persistence utilities for pillar progress,
 * global XP, and completed lessons.
 * 
 * Storage keys:
 * - growthovo_pillar_progress_{pillarKey}
 * - growthovo_xp
 * - growthovo_completed_lessons
 * 
 * Error Handling Strategy:
 * - Wrap all AsyncStorage operations in try-catch
 * - Handle QuotaExceededError with data cleanup and retry
 * - Fall back to in-memory state if AsyncStorage unavailable
 * - Display user-friendly error messages
 * - Never crash the app due to storage errors
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  PillarProgress,
  PremiumPillarKey,
  CompletedLessons,
} from '../types/pillars';
import { VALID_PILLARS } from '../types/pillars';
import { calculateLevel } from './pillarXPService';
import {
  validatePillarKey as validatePillarKeyUtil,
  validateXPValue,
  sanitizeXPValue,
  sanitizeLevelValue,
  sanitizeCompletedLessons,
} from './pillarValidationService';

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  PERSISTENCE_FAILED: 'Unable to save your progress. Please free up device storage space.',
  SYNC_FAILED: 'Progress saved locally but not synced. Will retry when connection is restored.',
  ALREADY_COMPLETED: 'You\'ve already completed this item today!',
  INVALID_DATA: 'Progress data corrupted. Resetting to last known good state.',
  NETWORK_ERROR: 'Connection lost. Your progress is saved and will sync automatically.',
  STORAGE_UNAVAILABLE: 'Storage unavailable. Progress will be saved in memory only.',
  QUOTA_EXCEEDED: 'Storage full. Clearing old data to make space.',
};

/**
 * In-memory fallback cache for when AsyncStorage is unavailable
 */
const inMemoryCache: {
  pillarProgress: Record<string, PillarProgress>;
  globalXP: number;
  completedLessons: CompletedLessons;
  isStorageAvailable: boolean;
} = {
  pillarProgress: {},
  globalXP: 0,
  completedLessons: { lessonIds: [], lastUpdated: new Date().toISOString() },
  isStorageAvailable: true,
};

/**
 * Clear old progress data to free up storage space
 * 
 * Removes progress data older than 90 days to handle QuotaExceededError.
 * This is a last resort when storage is full.
 * 
 * @returns Promise that resolves when cleanup is complete
 */
async function clearOldProgressData(): Promise<void> {
  try {
    console.log('[Storage] Clearing old progress data to free space...');
    
    // Get all keys
    const allKeys = await AsyncStorage.getAllKeys();
    
    // Filter for pillar progress keys
    const progressKeys = allKeys.filter(key => 
      key.startsWith('growthovo_pillar_progress_')
    );
    
    // Load each progress and check age
    const keysToRemove: string[] = [];
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    for (const key of progressKeys) {
      try {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const progress = JSON.parse(data);
          const lastActivity = new Date(progress.lastActivityDate);
          
          // Remove if older than 90 days or invalid date
          if (!progress.lastActivityDate || lastActivity < ninetyDaysAgo) {
            keysToRemove.push(key);
          }
        }
      } catch (error) {
        // If we can't parse it, remove it
        keysToRemove.push(key);
      }
    }
    
    // Remove old keys
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
      console.log(`[Storage] Cleared ${keysToRemove.length} old progress entries`);
    } else {
      console.log('[Storage] No old data to clear');
    }
  } catch (error) {
    console.error('[Storage] Failed to clear old data:', error);
    // Don't throw - this is a best-effort cleanup
  }
}

/**
 * Check if AsyncStorage is available
 * 
 * Tests if AsyncStorage can be accessed (not in private browsing mode, etc.)
 * 
 * @returns Promise that resolves to true if available, false otherwise
 */
async function checkStorageAvailability(): Promise<boolean> {
  try {
    const testKey = 'growthovo_storage_test';
    await AsyncStorage.setItem(testKey, 'test');
    await AsyncStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('[Storage] AsyncStorage unavailable:', error);
    return false;
  }
}

/**
 * Create default pillar progress
 * 
 * Returns a fresh PillarProgress object with level 1, 0 XP.
 * 
 * @param pillarKey - Pillar identifier
 * @returns Default PillarProgress object
 */
export function createDefaultProgress(pillarKey: PremiumPillarKey): PillarProgress {
  return {
    pillarKey,
    xp: 0,
    level: 1,
    completedLessons: [],
    streak: 0,
    lastActivityDate: '',
    challengeCompletedToday: false,
    challengeCompletionDate: null,
  };
}

/**
 * Validate pillar key
 * 
 * Checks if pillar key is valid.
 * 
 * @param key - Pillar key to validate
 * @returns true if valid, false otherwise
 */
export function validatePillarKey(key: string): key is PremiumPillarKey {
  return validatePillarKeyUtil(key);
}

/**
 * Validate progress structure
 * 
 * Checks if loaded progress object has valid structure.
 * 
 * @param obj - Object to validate
 * @returns true if valid PillarProgress structure, false otherwise
 */
function isValidProgressStructure(obj: any): obj is PillarProgress {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.xp === 'number' &&
    typeof obj.level === 'number' &&
    Array.isArray(obj.completedLessons) &&
    typeof obj.streak === 'number' &&
    typeof obj.pillarKey === 'string' &&
    typeof obj.lastActivityDate === 'string' &&
    typeof obj.challengeCompletedToday === 'boolean'
  );
}

/**
 * Sanitize and validate loaded progress
 * 
 * Ensures loaded progress has valid values and correct level calculation.
 * Uses validation service functions for comprehensive sanitization.
 * 
 * @param progress - Progress object to sanitize
 * @returns Sanitized PillarProgress object
 */
function sanitizeProgress(progress: PillarProgress): PillarProgress {
  // Sanitize XP using validation service
  progress.xp = sanitizeXPValue(progress.xp);
  
  // Sanitize level using validation service
  progress.level = sanitizeLevelValue(progress.level);
  
  // Ensure level matches XP
  const expectedLevel = calculateLevel(progress.xp);
  if (progress.level !== expectedLevel) {
    console.warn('[Storage] Level mismatch, correcting');
    progress.level = expectedLevel;
  }
  
  // Validate streak
  if (typeof progress.streak !== 'number' || progress.streak < 0) {
    console.warn('[Storage] Invalid streak, resetting to 0');
    progress.streak = 0;
  }
  
  // Sanitize completedLessons array using validation service
  progress.completedLessons = sanitizeCompletedLessons(progress.completedLessons);
  
  // Ensure challenge fields exist with proper types
  if (typeof progress.challengeCompletedToday !== 'boolean') {
    progress.challengeCompletedToday = false;
  }
  
  if (progress.challengeCompletionDate !== null && typeof progress.challengeCompletionDate !== 'string') {
    progress.challengeCompletionDate = null;
  }
  
  return progress;
}

/**
 * Save pillar progress to localStorage
 * 
 * Persists pillar progress with comprehensive error handling:
 * - Handles QuotaExceededError with data cleanup and retry
 * - Falls back to in-memory cache if AsyncStorage unavailable
 * - Provides user-friendly error messages
 * 
 * Preconditions:
 * - pillarKey in VALID_PILLARS
 * - progress.xp >= 0
 * - progress.level >= 1
 * 
 * Postconditions:
 * - localStorage contains progress for pillarKey OR in-memory cache updated
 * 
 * @param pillarKey - Pillar identifier
 * @param progress - Progress object to save
 * @returns Promise that resolves when save is complete
 */
export async function savePillarProgress(
  pillarKey: PremiumPillarKey,
  progress: PillarProgress
): Promise<void> {
  if (!validatePillarKey(pillarKey)) {
    throw new Error(`Invalid pillar key: ${pillarKey}`);
  }
  
  // Always update in-memory cache first (optimistic update)
  inMemoryCache.pillarProgress[pillarKey] = progress;
  
  // Check if storage is available
  if (!inMemoryCache.isStorageAvailable) {
    console.warn('[Storage] AsyncStorage unavailable, using in-memory cache only');
    return; // Don't throw - in-memory cache is sufficient
  }
  
  try {
    const key = `growthovo_pillar_progress_${pillarKey}`;
    const data = JSON.stringify(progress);
    await AsyncStorage.setItem(key, data);
  } catch (error: any) {
    // Handle QuotaExceededError specifically
    if (error?.message?.includes('QuotaExceeded') || error?.code === 'QuotaExceededError') {
      console.warn('[Storage] Quota exceeded, attempting cleanup and retry...');
      
      try {
        // Clear old data
        await clearOldProgressData();
        
        // Retry save
        const key = `growthovo_pillar_progress_${pillarKey}`;
        const data = JSON.stringify(progress);
        await AsyncStorage.setItem(key, data);
        
        console.log('[Storage] Successfully saved after cleanup');
      } catch (retryError) {
        // Cleanup and retry failed - fall back to in-memory only
        console.error('[Storage] Failed to save after cleanup:', retryError);
        inMemoryCache.isStorageAvailable = false;
        
        // Don't throw - in-memory cache has the data
        console.warn('[Storage] Falling back to in-memory cache. Progress saved temporarily.');
      }
    } else {
      // Other storage errors - log but don't crash
      console.error('[Storage] Failed to save pillar progress:', error);
      
      // Check if storage is still available
      const isAvailable = await checkStorageAvailability();
      if (!isAvailable) {
        inMemoryCache.isStorageAvailable = false;
        console.warn('[Storage] AsyncStorage no longer available, using in-memory cache');
      }
      
      // Don't throw - in-memory cache has the data
    }
  }
}

/**
 * Load pillar progress from localStorage
 * 
 * Retrieves pillar progress with validation, sanitization, and fallback:
 * - Tries AsyncStorage first
 * - Falls back to in-memory cache if AsyncStorage unavailable
 * - Returns default progress if not found or corrupted
 * 
 * Preconditions:
 * - pillarKey in VALID_PILLARS
 * 
 * Postconditions:
 * - Returns valid PillarProgress object
 * 
 * @param pillarKey - Pillar identifier
 * @returns Promise that resolves to PillarProgress object
 */
export async function loadPillarProgress(
  pillarKey: PremiumPillarKey
): Promise<PillarProgress> {
  if (!validatePillarKey(pillarKey)) {
    console.warn(`Invalid pillar key: ${pillarKey}, returning default progress`);
    return createDefaultProgress(pillarKey);
  }
  
  // Try AsyncStorage first if available
  if (inMemoryCache.isStorageAvailable) {
    try {
      const key = `growthovo_pillar_progress_${pillarKey}`;
      const data = await AsyncStorage.getItem(key);
      
      if (data) {
        const progress = JSON.parse(data);
        
        // Validate structure
        if (!isValidProgressStructure(progress)) {
          console.warn('[Storage] Invalid progress structure from AsyncStorage, using default');
          return createDefaultProgress(pillarKey);
        }
        
        // Sanitize and cache
        const sanitized = sanitizeProgress(progress);
        inMemoryCache.pillarProgress[pillarKey] = sanitized;
        return sanitized;
      }
    } catch (error) {
      console.error('[Storage] Failed to load from AsyncStorage:', error);
      
      // Check if storage is still available
      const isAvailable = await checkStorageAvailability();
      if (!isAvailable) {
        inMemoryCache.isStorageAvailable = false;
        console.warn('[Storage] AsyncStorage no longer available, using in-memory cache');
      }
    }
  }
  
  // Fall back to in-memory cache
  if (inMemoryCache.pillarProgress[pillarKey]) {
    console.log('[Storage] Using in-memory cache for pillar progress');
    return inMemoryCache.pillarProgress[pillarKey];
  }
  
  // No data found - return default
  const defaultProgress = createDefaultProgress(pillarKey);
  inMemoryCache.pillarProgress[pillarKey] = defaultProgress;
  return defaultProgress;
}

/**
 * Save global XP to localStorage
 * 
 * Persists total XP across all pillars with error handling:
 * - Validates XP value before saving
 * - Handles QuotaExceededError with data cleanup and retry
 * - Falls back to in-memory cache if AsyncStorage unavailable
 * 
 * Preconditions:
 * - xp >= 0
 * 
 * Postconditions:
 * - localStorage contains global XP OR in-memory cache updated
 * 
 * @param xp - Total XP to save
 * @returns Promise that resolves when save is complete
 */
export async function saveGlobalXP(xp: number): Promise<void> {
  // Validate XP value using validation service
  if (!validateXPValue(xp)) {
    throw new Error(`Invalid XP value: ${xp} (must be >= 0 and integer)`);
  }
  
  // Always update in-memory cache first (optimistic update)
  inMemoryCache.globalXP = xp;
  
  // Check if storage is available
  if (!inMemoryCache.isStorageAvailable) {
    console.warn('[Storage] AsyncStorage unavailable, using in-memory cache only');
    return;
  }
  
  try {
    const key = 'growthovo_xp';
    await AsyncStorage.setItem(key, xp.toString());
  } catch (error: any) {
    // Handle QuotaExceededError specifically
    if (error?.message?.includes('QuotaExceeded') || error?.code === 'QuotaExceededError') {
      console.warn('[Storage] Quota exceeded for global XP, attempting cleanup and retry...');
      
      try {
        // Clear old data
        await clearOldProgressData();
        
        // Retry save
        const key = 'growthovo_xp';
        await AsyncStorage.setItem(key, xp.toString());
        
        console.log('[Storage] Successfully saved global XP after cleanup');
      } catch (retryError) {
        console.error('[Storage] Failed to save global XP after cleanup:', retryError);
        inMemoryCache.isStorageAvailable = false;
        console.warn('[Storage] Falling back to in-memory cache for global XP');
      }
    } else {
      console.error('[Storage] Failed to save global XP:', error);
      
      // Check if storage is still available
      const isAvailable = await checkStorageAvailability();
      if (!isAvailable) {
        inMemoryCache.isStorageAvailable = false;
        console.warn('[Storage] AsyncStorage no longer available, using in-memory cache');
      }
    }
  }
}

/**
 * Load global XP from localStorage
 * 
 * Retrieves total XP with validation and fallback:
 * - Tries AsyncStorage first
 * - Validates and sanitizes XP value
 * - Falls back to in-memory cache if AsyncStorage unavailable
 * - Returns 0 if not found or invalid
 * 
 * Postconditions:
 * - Returns XP >= 0
 * 
 * @returns Promise that resolves to global XP value
 */
export async function loadGlobalXP(): Promise<number> {
  // Try AsyncStorage first if available
  if (inMemoryCache.isStorageAvailable) {
    try {
      const key = 'growthovo_xp';
      const data = await AsyncStorage.getItem(key);
      
      if (data) {
        const xp = parseInt(data, 10);
        
        // Validate and sanitize XP value
        if (validateXPValue(xp)) {
          // Cache and return
          inMemoryCache.globalXP = xp;
          return xp;
        } else {
          console.warn('[Storage] Invalid global XP value from AsyncStorage, using 0');
        }
      }
    } catch (error) {
      console.error('[Storage] Failed to load global XP from AsyncStorage:', error);
      
      // Check if storage is still available
      const isAvailable = await checkStorageAvailability();
      if (!isAvailable) {
        inMemoryCache.isStorageAvailable = false;
        console.warn('[Storage] AsyncStorage no longer available, using in-memory cache');
      }
    }
  }
  
  // Fall back to in-memory cache
  if (inMemoryCache.globalXP > 0) {
    console.log('[Storage] Using in-memory cache for global XP');
    return inMemoryCache.globalXP;
  }
  
  // No data found - return 0
  return 0;
}

/**
 * Save completed lessons to localStorage
 * 
 * Persists list of completed lesson IDs with error handling:
 * - Handles QuotaExceededError with data cleanup and retry
 * - Falls back to in-memory cache if AsyncStorage unavailable
 * 
 * Preconditions:
 * - completedLessons.lessonIds contains unique IDs
 * - completedLessons.lessonIds.length <= 24
 * 
 * Postconditions:
 * - localStorage contains completed lessons OR in-memory cache updated
 * 
 * @param completedLessons - Completed lessons object to save
 * @returns Promise that resolves when save is complete
 */
export async function saveCompletedLessons(
  completedLessons: CompletedLessons
): Promise<void> {
  // Always update in-memory cache first (optimistic update)
  inMemoryCache.completedLessons = completedLessons;
  
  // Check if storage is available
  if (!inMemoryCache.isStorageAvailable) {
    console.warn('[Storage] AsyncStorage unavailable, using in-memory cache only');
    return;
  }
  
  try {
    const key = 'growthovo_completed_lessons';
    const data = JSON.stringify(completedLessons);
    await AsyncStorage.setItem(key, data);
  } catch (error: any) {
    // Handle QuotaExceededError specifically
    if (error?.message?.includes('QuotaExceeded') || error?.code === 'QuotaExceededError') {
      console.warn('[Storage] Quota exceeded for completed lessons, attempting cleanup and retry...');
      
      try {
        // Clear old data
        await clearOldProgressData();
        
        // Retry save
        const key = 'growthovo_completed_lessons';
        const data = JSON.stringify(completedLessons);
        await AsyncStorage.setItem(key, data);
        
        console.log('[Storage] Successfully saved completed lessons after cleanup');
      } catch (retryError) {
        console.error('[Storage] Failed to save completed lessons after cleanup:', retryError);
        inMemoryCache.isStorageAvailable = false;
        console.warn('[Storage] Falling back to in-memory cache for completed lessons');
      }
    } else {
      console.error('[Storage] Failed to save completed lessons:', error);
      
      // Check if storage is still available
      const isAvailable = await checkStorageAvailability();
      if (!isAvailable) {
        inMemoryCache.isStorageAvailable = false;
        console.warn('[Storage] AsyncStorage no longer available, using in-memory cache');
      }
    }
  }
}

/**
 * Load completed lessons from localStorage
 * 
 * Retrieves list of completed lesson IDs with validation and fallback:
 * - Tries AsyncStorage first
 * - Falls back to in-memory cache if AsyncStorage unavailable
 * - Returns empty list if not found or invalid
 * 
 * Postconditions:
 * - Returns valid CompletedLessons object
 * 
 * @returns Promise that resolves to CompletedLessons object
 */
export async function loadCompletedLessons(): Promise<CompletedLessons> {
  // Try AsyncStorage first if available
  if (inMemoryCache.isStorageAvailable) {
    try {
      const key = 'growthovo_completed_lessons';
      const data = await AsyncStorage.getItem(key);
      
      if (data) {
        const completedLessons = JSON.parse(data);
        
        // Validate structure
        if (
          typeof completedLessons === 'object' &&
          completedLessons !== null &&
          Array.isArray(completedLessons.lessonIds)
        ) {
          // Cache and return
          inMemoryCache.completedLessons = completedLessons;
          return completedLessons;
        } else {
          console.warn('[Storage] Invalid completed lessons structure from AsyncStorage');
        }
      }
    } catch (error) {
      console.error('[Storage] Failed to load completed lessons from AsyncStorage:', error);
      
      // Check if storage is still available
      const isAvailable = await checkStorageAvailability();
      if (!isAvailable) {
        inMemoryCache.isStorageAvailable = false;
        console.warn('[Storage] AsyncStorage no longer available, using in-memory cache');
      }
    }
  }
  
  // Fall back to in-memory cache
  if (inMemoryCache.completedLessons.lessonIds.length > 0) {
    console.log('[Storage] Using in-memory cache for completed lessons');
    return inMemoryCache.completedLessons;
  }
  
  // No data found - return empty
  const empty: CompletedLessons = {
    lessonIds: [],
    lastUpdated: new Date().toISOString(),
  };
  inMemoryCache.completedLessons = empty;
  return empty;
}

/**
 * Get current date in YYYY-MM-DD format
 * 
 * Used for daily reset logic.
 * 
 * @returns Current date string in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  const date = new Date();
  return date.toISOString().split('T')[0];
}

/**
 * Check if daily challenge should be reset
 * 
 * Compares challenge completion date with current date.
 * 
 * @param progress - Pillar progress to check
 * @returns true if challenge should be reset, false otherwise
 */
export function shouldResetDailyChallenge(progress: PillarProgress): boolean {
  if (!progress.challengeCompletedToday) {
    return false;
  }
  
  const today = getCurrentDate();
  const lastDate = progress.challengeCompletionDate;
  
  return lastDate !== null && lastDate !== today;
}

/**
 * Get storage status
 * 
 * Returns information about storage availability and usage.
 * 
 * @returns Object with storage status information
 */
export function getStorageStatus(): {
  isAvailable: boolean;
  usingInMemoryCache: boolean;
  message: string;
} {
  return {
    isAvailable: inMemoryCache.isStorageAvailable,
    usingInMemoryCache: !inMemoryCache.isStorageAvailable,
    message: inMemoryCache.isStorageAvailable
      ? 'Storage is available'
      : ERROR_MESSAGES.STORAGE_UNAVAILABLE,
  };
}

/**
 * Reset storage availability flag
 * 
 * Allows retrying AsyncStorage after it becomes available again.
 * Should be called when app comes to foreground.
 * 
 * @returns Promise that resolves when check is complete
 */
export async function recheckStorageAvailability(): Promise<void> {
  const isAvailable = await checkStorageAvailability();
  inMemoryCache.isStorageAvailable = isAvailable;
  
  if (isAvailable) {
    console.log('[Storage] AsyncStorage is now available');
  } else {
    console.warn('[Storage] AsyncStorage is still unavailable');
  }
}

/**
 * Clear in-memory cache (for testing purposes)
 * 
 * Resets the in-memory cache to initial state.
 * Should only be used in tests.
 * 
 * @internal
 */
export function clearInMemoryCache(): void {
  inMemoryCache.pillarProgress = {};
  inMemoryCache.globalXP = 0;
  inMemoryCache.completedLessons = { lessonIds: [], lastUpdated: new Date().toISOString() };
  inMemoryCache.isStorageAvailable = true;
}
