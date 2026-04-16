// 🎬 useProgressAnimation Hook
// Smooth progress transition animation using react-native-reanimated
// Automatically animates when target value changes

import { useSharedValue, withTiming, WithTimingConfig, runOnJS } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { getTimingDuration } from '../services/animationService';
import { usePerformanceStore } from '../store';

/**
 * Return type for useProgressAnimation hook
 */
export interface UseProgressAnimationReturn {
  animatedValue: ReturnType<typeof useSharedValue<number>>;
  isAnimating: boolean;
}

/**
 * 🎯 useProgressAnimation Hook
 * 
 * Creates a smooth animation from old progress value to new progress value.
 * Automatically triggers animation when targetValue changes.
 * Uses timing animation for smooth linear progress transitions.
 * 
 * @param targetValue - The target progress value to animate to (0-100 or 0-1)
 * @param duration - Optional animation duration in milliseconds (defaults to 300ms)
 * @returns Object with animatedValue (SharedValue) and isAnimating boolean
 * 
 * @example
 * ```tsx
 * const { animatedValue, isAnimating } = useProgressAnimation(75, 500);
 * 
 * const animatedStyle = useAnimatedStyle(() => ({
 *   width: `${animatedValue.value}%`,
 * }));
 * 
 * return (
 *   <View>
 *     <Animated.View style={[styles.progressBar, animatedStyle]} />
 *     {isAnimating && <Text>Updating...</Text>}
 *   </View>
 * );
 * ```
 * 
 * @example With custom duration
 * ```tsx
 * const { animatedValue } = useProgressAnimation(progress, 1000);
 * ```
 * 
 * **Validates: Requirements 7.2, 9.1**
 */
export function useProgressAnimation(
  targetValue: number,
  duration?: number
): UseProgressAnimationReturn {
  const { settings } = usePerformanceStore();
  const animationsEnabled = settings.animationsEnabled;

  // Create shared value for the animated progress (starts at 0)
  const animatedValue = useSharedValue(0);
  
  // Track animation state
  const [isAnimating, setIsAnimating] = useState(false);

  // Get default duration from animationService if not provided
  const animationDuration = duration ?? getTimingDuration('normal');

  // Timing configuration for smooth linear progress
  const timingConfig: WithTimingConfig = {
    duration: animationDuration,
  };

  // Animate when targetValue changes
  useEffect(() => {
    if (!animationsEnabled) {
      animatedValue.value = targetValue;
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    
    // Create a function to update state on JS thread
    const finishAnimation = () => {
      setIsAnimating(false);
    };
    
    // Animate to new value using timing animation
    animatedValue.value = withTiming(
      targetValue,
      timingConfig,
      (finished) => {
        // Callback runs on UI thread, need to update state on JS thread
        if (finished) {
          runOnJS(finishAnimation)();
        }
      }
    );
  }, [targetValue, animationDuration, animationsEnabled]);

  return {
    animatedValue,
    isAnimating,
  };
}
