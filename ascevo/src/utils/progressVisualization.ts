/**
 * Progress Visualization Utilities
 * 
 * Helper functions for progress color mapping and completion animation triggers.
 * These utilities implement the requirements for progress visualization (7.3, 7.5).
 */

import { colors } from '../theme';

/**
 * Get progress color based on percentage
 * Maps progress percentages to appropriate color levels
 * 
 * Color mapping:
 * - 0-24%: Low (error/red)
 * - 25-49%: Medium (warning/orange)
 * - 50-99%: High (info/blue)
 * - 100%: Complete (success/green)
 * 
 * **Validates: Requirements 7.3**
 * 
 * @param progress - Progress percentage (0-100)
 * @returns Color string for the progress level
 */
export function getProgressColor(progress: number): string {
  if (progress < 25) {
    return colors.error; // Low progress - red
  } else if (progress < 50) {
    return colors.warning; // Medium progress - orange
  } else if (progress < 100) {
    return colors.info; // High progress - blue
  } else {
    return colors.success; // Complete - green
  }
}

/**
 * Check if completion animation should trigger
 * Returns true when progress reaches exactly 100%
 * 
 * **Validates: Requirements 7.5**
 * 
 * @param oldProgress - Previous progress value
 * @param newProgress - New progress value
 * @returns True if completion animation should trigger
 */
export function shouldTriggerCompletionAnimation(
  oldProgress: number,
  newProgress: number
): boolean {
  // Completion animation triggers when:
  // 1. New progress is exactly 100%
  // 2. Old progress was less than 100% (to avoid re-triggering)
  return newProgress === 100 && oldProgress < 100;
}

/**
 * Normalize progress to 0-100 range
 * Clamps values outside the valid range
 * 
 * @param progress - Progress value (can be any number)
 * @returns Clamped progress value (0-100)
 */
export function normalizeProgress(progress: number): number {
  return Math.max(0, Math.min(100, progress));
}

/**
 * Get progress color for 0-1 range (decimal)
 * Converts decimal progress to percentage and returns appropriate color
 * 
 * @param progress - Progress value (0-1)
 * @returns Color string for the progress level
 */
export function getProgressColorDecimal(progress: number): string {
  const percentage = progress * 100;
  return getProgressColor(percentage);
}

/**
 * Check if completion animation should trigger for decimal progress
 * 
 * @param oldProgress - Previous progress value (0-1)
 * @param newProgress - New progress value (0-1)
 * @returns True if completion animation should trigger
 */
export function shouldTriggerCompletionAnimationDecimal(
  oldProgress: number,
  newProgress: number
): boolean {
  return newProgress >= 1.0 && oldProgress < 1.0;
}
