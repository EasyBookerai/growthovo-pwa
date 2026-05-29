/**
 * useReducedMotion Hook
 * 
 * Checks if the user has enabled reduced motion in their accessibility settings.
 * Returns true if reduced motion is enabled, false otherwise.
 * 
 * Task: 16.4 Implement reduced motion support
 * Requirements: 20.5
 * 
 * @returns {boolean} reduceMotionEnabled - True if reduced motion is enabled
 * 
 * @example
 * ```tsx
 * const reduceMotionEnabled = useReducedMotion();
 * 
 * Animated.timing(anim, {
 *   toValue: 1,
 *   duration: reduceMotionEnabled ? 0 : 300,
 *   useNativeDriver: true,
 * }).start();
 * ```
 */

import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion(): boolean {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotionEnabled(enabled);
    });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotionEnabled
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  return reduceMotionEnabled;
}

/**
 * Get animation duration based on reduced motion preference
 * 
 * Returns 0 if reduced motion is enabled, otherwise returns the specified duration.
 * 
 * @param duration - Desired animation duration in milliseconds
 * @param reduceMotionEnabled - Whether reduced motion is enabled
 * @returns Animation duration (0 if reduced motion enabled, otherwise duration)
 * 
 * @example
 * ```tsx
 * const reduceMotionEnabled = useReducedMotion();
 * const duration = getAnimationDuration(300, reduceMotionEnabled);
 * 
 * Animated.timing(anim, {
 *   toValue: 1,
 *   duration,
 *   useNativeDriver: true,
 * }).start();
 * ```
 */
export function getAnimationDuration(
  duration: number,
  reduceMotionEnabled: boolean
): number {
  return reduceMotionEnabled ? 0 : duration;
}
