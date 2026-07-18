/**
 * useButtonPressAnimation Hook
 * 
 * Provides scale animation for button press feedback.
 * Animates from 1.0 → 0.95 → 1.0 with 150ms duration using native driver.
 * 
 * Task: 13.4 Add button press feedback
 * Requirements: 20.5, 11.1, 11.2, 11.3, 11.4
 * 
 * @returns {Object} Animation utilities
 * @returns {Animated.Value} scaleAnim - Animated value for scale transform
 * @returns {function} handlePressIn - Callback for onPressIn event
 * @returns {function} handlePressOut - Callback for onPressOut event
 * 
 * @example
 * ```tsx
 * const { scaleAnim, handlePressIn, handlePressOut } = useButtonPressAnimation();
 * 
 * <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
 *   <TouchableOpacity
 *     onPressIn={handlePressIn}
 *     onPressOut={handlePressOut}
 *   >
 *     <Text>Press Me</Text>
 *   </TouchableOpacity>
 * </Animated.View>
 * ```
 */

import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { useReducedMotion } from './useReducedMotion';

export function useButtonPressAnimation() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const reduceMotionEnabled = useReducedMotion();

  /**
   * Handle button press in
   * Animates scale from 1.0 to 0.95 with 150ms duration
   * If reduced motion is enabled, sets duration to 0 (instant)
   */
  const handlePressIn = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: reduceMotionEnabled ? 0 : 150,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, reduceMotionEnabled]);

  /**
   * Handle button press out
   * Animates scale from 0.95 back to 1.0 with 150ms duration
   * If reduced motion is enabled, sets duration to 0 (instant)
   */
  const handlePressOut = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 1.0,
      duration: reduceMotionEnabled ? 0 : 150,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, reduceMotionEnabled]);

  return {
    scaleAnim,
    handlePressIn,
    handlePressOut,
    reduceMotionEnabled,
  };
}
