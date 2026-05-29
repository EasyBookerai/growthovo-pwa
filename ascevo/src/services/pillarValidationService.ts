/**
 * Premium Pillars Experience - Validation Service
 * 
 * This service provides data validation functions to ensure data integrity
 * for the XP system. All validation functions are pure and side-effect free.
 * 
 * Task 14.3: Implement data validation
 * - Validate XP values (>= 0, integer)
 * - Validate pillar keys against VALID_PILLARS array
 * - Validate lesson IDs exist in LESSON_CONTENT
 * - Sanitize loaded data from localStorage
 * 
 * Requirements: 16.1
 */

import { VALID_PILLARS, type PremiumPillarKey } from '../types/pillars';
import { LESSON_CONTENT } from '../data/lessonContent';

/**
 * Validate XP value
 * 
 * Checks if XP value is valid:
 * - Must be a number
 * - Must be >= 0
 * - Must be an integer
 * 
 * @param xp - XP value to validate
 * @returns true if valid, false otherwise
 * 
 * @example
 * validateXPValue(100) // true
 * validateXPValue(-10) // false
 * validateXPValue(50.5) // false
 * validateXPValue(NaN) // false
 */
export function validateXPValue(xp: any): xp is number {
  return (
    typeof xp === 'number' &&
    !isNaN(xp) &&
    xp >= 0 &&
    Number.isInteger(xp)
  );
}

/**
 * Validate pillar key
 * 
 * Checks if pillar key exists in VALID_PILLARS array.
 * 
 * @param key - Pillar key to validate
 * @returns true if valid, false otherwise
 * 
 * @example
 * validatePillarKey('mental-health') // true
 * validatePillarKey('invalid-pillar') // false
 * validatePillarKey(null) // false
 */
export function validatePillarKey(key: any): key is PremiumPillarKey {
  return (
    typeof key === 'string' &&
    VALID_PILLARS.includes(key as PremiumPillarKey)
  );
}

/**
 * Validate lesson ID
 * 
 * Checks if lesson ID exists in LESSON_CONTENT.
 * 
 * @param lessonId - Lesson ID to validate
 * @returns true if valid, false otherwise
 * 
 * @example
 * validateLessonId('mental-health-lesson-1') // true
 * validateLessonId('invalid-lesson') // false
 * validateLessonId(null) // false
 */
export function validateLessonId(lessonId: any): lessonId is string {
  return (
    typeof lessonId === 'string' &&
    lessonId in LESSON_CONTENT
  );
}

/**
 * Validate XP amount for award
 * 
 * Checks if XP amount is valid for awarding:
 * - Must be a number
 * - Must be > 0 (can't award 0 or negative XP)
 * - Must be an integer
 * - Must be <= 1000 (max XP per action to prevent abuse)
 * 
 * @param amount - XP amount to validate
 * @returns true if valid, false otherwise
 * 
 * @example
 * validateXPAmount(50) // true
 * validateXPAmount(0) // false
 * validateXPAmount(-10) // false
 * validateXPAmount(1500) // false
 */
export function validateXPAmount(amount: any): amount is number {
  return (
    typeof amount === 'number' &&
    !isNaN(amount) &&
    amount > 0 &&
    amount <= 1000 &&
    Number.isInteger(amount)
  );
}

/**
 * Sanitize XP value
 * 
 * Ensures XP value is valid, returns 0 if invalid.
 * 
 * @param xp - XP value to sanitize
 * @returns Sanitized XP value (>= 0, integer)
 * 
 * @example
 * sanitizeXPValue(100) // 100
 * sanitizeXPValue(-10) // 0
 * sanitizeXPValue(50.5) // 50
 * sanitizeXPValue(NaN) // 0
 */
export function sanitizeXPValue(xp: any): number {
  // Check if it's a valid number
  if (typeof xp !== 'number' || isNaN(xp)) {
    console.warn('[Validation] Invalid XP value (not a number), returning 0');
    return 0;
  }
  
  // Ensure non-negative
  if (xp < 0) {
    console.warn('[Validation] Negative XP value, returning 0');
    return 0;
  }
  
  // Ensure integer
  if (!Number.isInteger(xp)) {
    const rounded = Math.floor(xp);
    console.warn(`[Validation] Non-integer XP value ${xp}, rounding to ${rounded}`);
    return rounded;
  }
  
  return xp;
}

/**
 * Sanitize level value
 * 
 * Ensures level value is valid, returns 1 if invalid.
 * 
 * @param level - Level value to sanitize
 * @returns Sanitized level value (>= 1, integer)
 * 
 * @example
 * sanitizeLevelValue(5) // 5
 * sanitizeLevelValue(0) // 1
 * sanitizeLevelValue(-1) // 1
 * sanitizeLevelValue(5.5) // 5
 */
export function sanitizeLevelValue(level: any): number {
  // Check if it's a valid number
  if (typeof level !== 'number' || isNaN(level)) {
    console.warn('[Validation] Invalid level value (not a number), returning 1');
    return 1;
  }
  
  // Ensure at least 1
  if (level < 1) {
    console.warn('[Validation] Level below 1, returning 1');
    return 1;
  }
  
  // Ensure integer
  if (!Number.isInteger(level)) {
    const rounded = Math.floor(level);
    console.warn(`[Validation] Non-integer level value ${level}, rounding to ${rounded}`);
    return Math.max(1, rounded);
  }
  
  return level;
}

/**
 * Sanitize completed lessons array
 * 
 * Ensures completed lessons array is valid:
 * - Removes invalid lesson IDs
 * - Removes duplicates
 * - Returns empty array if input is invalid
 * 
 * @param lessonIds - Array of lesson IDs to sanitize
 * @returns Sanitized array of unique, valid lesson IDs
 * 
 * @example
 * sanitizeCompletedLessons(['mental-health-lesson-1', 'mental-health-lesson-2'])
 * // ['mental-health-lesson-1', 'mental-health-lesson-2']
 * 
 * sanitizeCompletedLessons(['mental-health-lesson-1', 'invalid-lesson', 'mental-health-lesson-1'])
 * // ['mental-health-lesson-1']
 */
export function sanitizeCompletedLessons(lessonIds: any): string[] {
  // Check if it's an array
  if (!Array.isArray(lessonIds)) {
    console.warn('[Validation] completedLessons is not an array, returning empty array');
    return [];
  }
  
  // Filter out invalid lesson IDs and remove duplicates
  const validIds = lessonIds.filter((id) => {
    if (!validateLessonId(id)) {
      console.warn(`[Validation] Invalid lesson ID "${id}", removing from completedLessons`);
      return false;
    }
    return true;
  });
  
  // Remove duplicates using Set
  const uniqueIds = Array.from(new Set(validIds));
  
  if (uniqueIds.length !== lessonIds.length) {
    console.warn(
      `[Validation] Removed ${lessonIds.length - uniqueIds.length} invalid/duplicate lesson IDs`
    );
  }
  
  return uniqueIds;
}

/**
 * Sanitize pillar key
 * 
 * Ensures pillar key is valid, returns 'mental-health' as default if invalid.
 * 
 * @param key - Pillar key to sanitize
 * @returns Valid pillar key
 * 
 * @example
 * sanitizePillarKey('career') // 'career'
 * sanitizePillarKey('invalid') // 'mental-health'
 * sanitizePillarKey(null) // 'mental-health'
 */
export function sanitizePillarKey(key: any): PremiumPillarKey {
  if (validatePillarKey(key)) {
    return key;
  }
  
  console.warn(`[Validation] Invalid pillar key "${key}", defaulting to 'mental-health'`);
  return 'mental-health';
}

/**
 * Validate and sanitize pillar progress data
 * 
 * Comprehensive validation and sanitization for pillar progress loaded from storage.
 * Ensures all fields are valid and consistent.
 * 
 * @param data - Raw data loaded from storage
 * @param pillarKey - Expected pillar key
 * @returns Sanitized pillar progress data or null if data is completely invalid
 * 
 * @example
 * const data = { xp: 100, level: 1, completedLessons: ['mental-health-lesson-1'], ... };
 * const sanitized = sanitizePillarProgressData(data, 'mental-health');
 */
export function sanitizePillarProgressData(
  data: any,
  pillarKey: PremiumPillarKey
): {
  xp: number;
  level: number;
  completedLessons: string[];
  streak: number;
} | null {
  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    console.warn('[Validation] Pillar progress data is not an object, returning null');
    return null;
  }
  
  // Sanitize each field
  const sanitized = {
    xp: sanitizeXPValue(data.xp),
    level: sanitizeLevelValue(data.level),
    completedLessons: sanitizeCompletedLessons(data.completedLessons),
    streak: typeof data.streak === 'number' && data.streak >= 0 ? data.streak : 0,
  };
  
  return sanitized;
}

/**
 * Validate lesson belongs to pillar
 * 
 * Checks if a lesson ID belongs to a specific pillar.
 * 
 * @param lessonId - Lesson ID to check
 * @param pillarKey - Pillar key to check against
 * @returns true if lesson belongs to pillar, false otherwise
 * 
 * @example
 * validateLessonBelongsToPillar('mental-health-lesson-1', 'mental-health') // true
 * validateLessonBelongsToPillar('mental-health-lesson-1', 'career') // false
 */
export function validateLessonBelongsToPillar(
  lessonId: string,
  pillarKey: PremiumPillarKey
): boolean {
  if (!validateLessonId(lessonId)) {
    return false;
  }
  
  const lesson = LESSON_CONTENT[lessonId];
  return lesson.pillarKey === pillarKey;
}

/**
 * Get all valid lesson IDs for a pillar
 * 
 * Returns array of all valid lesson IDs for a specific pillar.
 * 
 * @param pillarKey - Pillar key
 * @returns Array of lesson IDs for the pillar
 * 
 * @example
 * getValidLessonIdsForPillar('mental-health')
 * // ['mental-health-lesson-1', 'mental-health-lesson-2', 'mental-health-lesson-3', 'mental-health-lesson-4']
 */
export function getValidLessonIdsForPillar(pillarKey: PremiumPillarKey): string[] {
  if (!validatePillarKey(pillarKey)) {
    console.warn(`[Validation] Invalid pillar key "${pillarKey}", returning empty array`);
    return [];
  }
  
  return Object.keys(LESSON_CONTENT).filter((lessonId) => {
    const lesson = LESSON_CONTENT[lessonId];
    return lesson.pillarKey === pillarKey;
  });
}

/**
 * Validate completed lessons count for pillar
 * 
 * Checks if completed lessons count is within valid range (0-4 per pillar).
 * 
 * @param completedLessons - Array of completed lesson IDs
 * @param pillarKey - Pillar key
 * @returns true if count is valid, false otherwise
 * 
 * @example
 * validateCompletedLessonsCount(['mental-health-lesson-1'], 'mental-health') // true
 * validateCompletedLessonsCount(['mental-health-lesson-1', 'mental-health-lesson-2', ...], 'mental-health') // depends on count
 */
export function validateCompletedLessonsCount(
  completedLessons: string[],
  pillarKey: PremiumPillarKey
): boolean {
  const pillarLessons = completedLessons.filter((lessonId) =>
    validateLessonBelongsToPillar(lessonId, pillarKey)
  );
  
  // Each pillar has exactly 4 lessons
  return pillarLessons.length >= 0 && pillarLessons.length <= 4;
}
