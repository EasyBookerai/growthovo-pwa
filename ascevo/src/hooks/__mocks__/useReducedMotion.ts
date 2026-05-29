/**
 * Mock implementation of useReducedMotion hook for testing
 */

export function useReducedMotion(): boolean {
  return false;
}

export function getAnimationDuration(
  duration: number,
  reduceMotionEnabled: boolean
): number {
  return reduceMotionEnabled ? 0 : duration;
}
