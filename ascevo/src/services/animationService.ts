// 🎬 Animation Service
// Centralized animation configurations and utilities for smooth, delightful interactions
// Provides spring configs, timing values, haptic feedback, and accessibility support

import { Platform, AccessibilityInfo } from 'react-native';

// Conditional import for expo-haptics (may not be installed yet)
let Haptics: any;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  // Haptics not available - will be handled gracefully
  Haptics = null;
}

// ⚙️ Spring Animation Configurations
// Based on react-native-reanimated spring physics
export const ANIMATION_CONFIGS = {
  spring: {
    gentle: {
      damping: 20,
      stiffness: 90,
      mass: 1,
      overshootClamping: false,
    },
    bouncy: {
      damping: 10,
      stiffness: 100,
      mass: 1,
      overshootClamping: false,
    },
    stiff: {
      damping: 15,
      stiffness: 200,
      mass: 1,
      overshootClamping: false,
    },
  },
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

// 🎯 Haptic Feedback Types
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * 📳 Trigger haptic feedback
 * Provides tactile feedback for user interactions
 * Respects platform capabilities and user preferences
 */
export async function triggerHaptic(type: HapticType = 'light'): Promise<void> {
  try {
    // Skip haptics on web (not widely supported)
    if (Platform.OS === 'web') {
      return;
    }

    // Skip if Haptics module is not available
    if (!Haptics) {
      return;
    }

    // Check if reduced motion is enabled (implies user wants minimal feedback)
    const reducedMotion = await isReducedMotionEnabled();
    if (reducedMotion) {
      return;
    }

    // Map haptic types to Expo Haptics
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Silently fail - haptics are nice-to-have, not critical
    console.debug('[Animation] Haptic feedback unavailable:', error);
  }
}

/**
 * ♿ Check if reduced motion is enabled
 * Respects system accessibility settings for motion sensitivity
 * Returns true if animations should be minimized or disabled
 */
export async function isReducedMotionEnabled(): Promise<boolean> {
  try {
    // On web, check CSS media query
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      return mediaQuery.matches;
    }

    // On native, check AccessibilityInfo
    const reducedMotion = await AccessibilityInfo.isReduceMotionEnabled();
    return reducedMotion ?? false;
  } catch (error) {
    console.debug('[Animation] Could not check reduced motion setting:', error);
    // Default to false (animations enabled) if we can't determine
    return false;
  }
}

/**
 * 🎊 Celebration Animation Data
 * Defines the structure for celebration sequences
 */
export interface CelebrationData {
  type: 'lesson_complete' | 'level_up' | 'streak_milestone' | 'achievement';
  title: string;
  subtitle?: string;
  xpEarned?: number;
  achievements?: Array<{ id: string; title: string; icon: string }>;
  streakMilestone?: number;
  newLevel?: number;
  intensity?: 'low' | 'medium' | 'high';
}

/**
 * 🎬 Animation Sequence
 * Represents a sequence of timed animation steps
 */
export interface AnimationSequence {
  steps: AnimationStep[];
  totalDuration: number;
}

export interface AnimationStep {
  delay: number;
  duration: number;
  action: 'fade' | 'scale' | 'slide' | 'confetti' | 'haptic';
  params?: Record<string, any>;
}

/**
 * 🎉 Create celebration sequence
 * Generates a timed sequence of animations for celebrations
 * Adapts based on celebration intensity and reduced motion settings
 */
export async function createCelebrationSequence(
  celebrations: CelebrationData[]
): Promise<AnimationSequence> {
  const reducedMotion = await isReducedMotionEnabled();
  const steps: AnimationStep[] = [];
  let currentDelay = 0;

  for (const celebration of celebrations) {
    const intensity = celebration.intensity || 'medium';
    
    // Determine durations based on intensity and reduced motion
    const baseDuration = reducedMotion ? 150 : ANIMATION_CONFIGS.timing.normal;
    const confettiDuration = reducedMotion ? 0 : (intensity === 'high' ? 2000 : 1000);

    // Step 1: Fade in modal
    steps.push({
      delay: currentDelay,
      duration: baseDuration,
      action: 'fade',
      params: { from: 0, to: 1 },
    });

    // Step 2: Scale in content
    if (!reducedMotion) {
      steps.push({
        delay: currentDelay + 100,
        duration: baseDuration,
        action: 'scale',
        params: { from: 0.8, to: 1 },
      });
    }

    // Step 3: Trigger haptic feedback
    steps.push({
      delay: currentDelay + 150,
      duration: 0,
      action: 'haptic',
      params: { type: intensity === 'high' ? 'success' : 'medium' },
    });

    // Step 4: Show confetti (if not reduced motion)
    if (!reducedMotion && confettiDuration > 0) {
      steps.push({
        delay: currentDelay + 200,
        duration: confettiDuration,
        action: 'confetti',
        params: { intensity },
      });
    }

    // Calculate delay for next celebration
    const celebrationDuration = baseDuration + confettiDuration + 1000; // Add 1s buffer
    currentDelay += celebrationDuration;
  }

  return {
    steps,
    totalDuration: currentDelay,
  };
}

/**
 * 🎨 Get animation config by name
 * Helper to retrieve spring or timing configs
 */
export function getSpringConfig(name: 'gentle' | 'bouncy' | 'stiff') {
  return ANIMATION_CONFIGS.spring[name];
}

export function getTimingDuration(name: 'fast' | 'normal' | 'slow'): number {
  return ANIMATION_CONFIGS.timing[name];
}

/**
 * 🔄 Animation state helper
 * Tracks whether animations should be enabled based on user preferences
 */
let animationsEnabled = true;

export function setAnimationsEnabled(enabled: boolean): void {
  animationsEnabled = enabled;
}

export function areAnimationsEnabled(): boolean {
  return animationsEnabled;
}

/**
 * 🎯 Initialize animation service
 * Sets up listeners for accessibility changes
 */
export async function initializeAnimationService(): Promise<void> {
  try {
    // Check initial reduced motion state
    const reducedMotion = await isReducedMotionEnabled();
    setAnimationsEnabled(!reducedMotion);

    // Listen for changes (native only)
    if (Platform.OS !== 'web') {
      AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
        setAnimationsEnabled(!enabled);
        console.log('[Animation] Reduced motion changed:', enabled);
      });
    }

    console.log('[Animation] ✅ Service initialized, animations:', animationsEnabled);
  } catch (error) {
    console.error('[Animation] Failed to initialize:', error);
  }
}
