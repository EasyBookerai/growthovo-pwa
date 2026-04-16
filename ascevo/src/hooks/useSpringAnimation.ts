// 🎬 useSpringAnimation Hook
// Reusable spring animation hook using react-native-reanimated
// Provides smooth, physics-based animations with native driver performance

import { useSharedValue, withSpring, WithSpringConfig } from 'react-native-reanimated';
import { useCallback } from 'react';
import { getSpringConfig } from '../services/animationService';
import { usePerformanceStore } from '../store';

/**
 * Spring animation configuration
 * Matches react-native-reanimated's spring config interface
 */
export interface SpringConfig {
  damping?: number;
  stiffness?: number;
  mass?: number;
  overshootClamping?: boolean;
}

/**
 * Return type for useSpringAnimation hook
 */
export interface UseSpringAnimationReturn {
  value: ReturnType<typeof useSharedValue<number>>;
  start: (toValue: number) => void;
  reset: () => void;
}

/**
 * 🎯 useSpringAnimation Hook
 * 
 * Creates a reusable spring animation with start and reset controls.
 * Uses react-native-reanimated for GPU-accelerated, 60fps animations.
 * 
 * @param config - Optional spring configuration (defaults to 'gentle' preset)
 * @returns Object with animated value, start function, and reset function
 * 
 * @example
 * ```tsx
 * const { value, start, reset } = useSpringAnimation();
 * 
 * const animatedStyle = useAnimatedStyle(() => ({
 *   transform: [{ scale: value.value }],
 * }));
 * 
 * // Start animation
 * start(1.2);
 * 
 * // Reset to initial value
 * reset();
 * ```
 * 
 * @example With custom config
 * ```tsx
 * const { value, start } = useSpringAnimation({
 *   damping: 10,
 *   stiffness: 100,
 * });
 * ```
 * 
 * **Validates: Requirements 9.1, 9.3**
 */
export function useSpringAnimation(config?: SpringConfig): UseSpringAnimationReturn {
  const { settings } = usePerformanceStore();
  const animationsEnabled = settings.animationsEnabled;

  // Create shared value starting at 0
  const value = useSharedValue(0);

  // Get default spring config from animationService
  const defaultConfig = getSpringConfig('gentle');
  
  // Merge provided config with defaults
  const springConfig: WithSpringConfig = {
    damping: config?.damping ?? defaultConfig.damping,
    stiffness: config?.stiffness ?? defaultConfig.stiffness,
    mass: config?.mass ?? defaultConfig.mass,
    overshootClamping: config?.overshootClamping ?? defaultConfig.overshootClamping,
  };

  /**
   * Start animation to target value
   * Uses spring physics for natural motion
   */
  const start = useCallback((toValue: number) => {
    if (animationsEnabled) {
      value.value = withSpring(toValue, springConfig);
    } else {
      value.value = toValue;
    }
  }, [value, springConfig, animationsEnabled]);

  /**
   * Reset animation to initial value (0)
   * Animates back to 0 using spring physics
   */
  const reset = useCallback(() => {
    if (animationsEnabled) {
      value.value = withSpring(0, springConfig);
    } else {
      value.value = 0;
    }
  }, [value, springConfig, animationsEnabled]);

  return {
    value,
    start,
    reset,
  };
}
