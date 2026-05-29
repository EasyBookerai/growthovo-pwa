/**
 * Premium Pillars Experience - XP Service
 * 
 * This service provides XP calculation functions for the premium pillars experience.
 * All functions follow the design specification:
 * - Level calculation: level = floor(xp / 500) + 1
 * - Progress calculation: progress = ((xp mod 500) / 500) * 100
 * - XP to next level: remaining = 500 - (xp mod 500)
 */

import { XP_PER_LEVEL, MAX_LEVEL } from '../types/pillars';

/**
 * Calculate level from XP
 * 
 * Formula: level = floor(xp / 500) + 1
 * 
 * Preconditions:
 * - xp >= 0
 * 
 * Postconditions:
 * - level >= 1
 * - level <= MAX_LEVEL
 * 
 * Invariants:
 * - For any XP value x where 0 <= x < 5000:
 *   calculateLevel(x) = floor(x / 500) + 1
 * 
 * @param xp - Experience points (must be >= 0)
 * @returns Level number (1-10)
 * 
 * @example
 * calculateLevel(0)    // returns 1
 * calculateLevel(250)  // returns 1
 * calculateLevel(500)  // returns 2
 * calculateLevel(1500) // returns 4
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) {
    console.warn('Invalid XP value (negative), returning level 1');
    return 1;
  }
  
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return Math.min(level, MAX_LEVEL);
}

/**
 * Calculate progress percentage within current level
 * 
 * Formula: progress = ((xp mod 500) / 500) * 100
 * 
 * Preconditions:
 * - xp >= 0
 * 
 * Postconditions:
 * - 0 <= progress < 100
 * 
 * Invariants:
 * - For any XP value x where 0 <= x < 5000:
 *   calculateProgress(x) = ((x mod 500) / 500) * 100
 * 
 * @param xp - Experience points (must be >= 0)
 * @returns Progress percentage (0-99.99)
 * 
 * @example
 * calculateProgress(0)    // returns 0
 * calculateProgress(250)  // returns 50
 * calculateProgress(499)  // returns 99.8
 * calculateProgress(500)  // returns 0 (new level)
 */
export function calculateProgress(xp: number): number {
  if (xp < 0) {
    console.warn('Invalid XP value (negative), returning 0% progress');
    return 0;
  }
  
  const currentLevelXP = xp % XP_PER_LEVEL;
  const progress = (currentLevelXP / XP_PER_LEVEL) * 100;
  
  return progress;
}

/**
 * Calculate XP remaining to reach next level
 * 
 * Formula: remaining = 500 - (xp mod 500)
 * 
 * Preconditions:
 * - xp >= 0
 * 
 * Postconditions:
 * - 1 <= remaining <= 500
 * 
 * Invariants:
 * - For any XP value x where 0 <= x < 5000:
 *   getXPToNextLevel(x) = 500 - (x mod 500)
 * 
 * @param xp - Experience points (must be >= 0)
 * @returns XP needed to reach next level (1-500)
 * 
 * @example
 * getXPToNextLevel(0)    // returns 500
 * getXPToNextLevel(250)  // returns 250
 * getXPToNextLevel(499)  // returns 1
 * getXPToNextLevel(500)  // returns 500 (new level)
 */
export function getXPToNextLevel(xp: number): number {
  if (xp < 0) {
    console.warn('Invalid XP value (negative), returning 500 XP to next level');
    return XP_PER_LEVEL;
  }
  
  const currentLevelXP = xp % XP_PER_LEVEL;
  const remaining = XP_PER_LEVEL - currentLevelXP;
  
  return remaining;
}

/**
 * Validate XP value
 * 
 * Checks if XP value is valid (non-negative integer).
 * 
 * @param xp - Experience points to validate
 * @returns true if valid, false otherwise
 */
export function validateXP(xp: number): boolean {
  return typeof xp === 'number' && xp >= 0 && Number.isInteger(xp);
}

/**
 * Validate XP amount for awarding
 * 
 * Checks if XP amount is valid for awarding (positive integer, max 1000).
 * 
 * @param amount - XP amount to validate
 * @returns true if valid, false otherwise
 */
export function validateXPAmount(amount: number): boolean {
  return (
    typeof amount === 'number' &&
    amount > 0 &&
    amount <= 1000 &&
    Number.isInteger(amount)
  );
}
