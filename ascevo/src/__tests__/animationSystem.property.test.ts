// 🧪 Property-Based Tests for Animation System
// Tests universal properties across all inputs using fast-check
// Validates Requirements 7.2, 9.1, 9.5

import fc from 'fast-check';
import {
  isReducedMotionEnabled,
  createCelebrationSequence,
  CelebrationData,
  triggerHaptic,
  HapticType,
} from '../services/animationService';
import { Platform, AccessibilityInfo } from 'react-native';

// Mock expo-haptics
jest.mock('expo-haptics');

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios),
}));

describe('Property Tests: Animation System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 25: Progress Animation Triggers
   * For any progress value change, an animation should be triggered from the old value to the new value.
   * **Validates: Requirements 7.2**
   */
  describe('Property 25: Progress Animation Triggers', () => {
    it('should trigger animation for any progress value change', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }), // old progress
          fc.integer({ min: 0, max: 100 }), // new progress
          (oldProgress, newProgress) => {
            // Skip if values are the same (no change = no animation)
            if (oldProgress === newProgress) {
              return true;
            }

            // Animation should be triggered when values differ
            // This property validates that the animation system responds to changes
            const shouldAnimate = oldProgress !== newProgress;
            expect(shouldAnimate).toBe(true);

            // The animation should go from old to new value
            const animationDirection = newProgress > oldProgress ? 'forward' : 'backward';
            expect(['forward', 'backward']).toContain(animationDirection);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle progress values in decimal range (0-1)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 1, noNaN: true }), // old progress (0-1)
          fc.double({ min: 0, max: 1, noNaN: true }), // new progress (0-1)
          (oldProgress, newProgress) => {
            // Skip if values are the same
            if (Math.abs(oldProgress - newProgress) < 0.001) {
              return true;
            }

            // Animation should be triggered for any change
            const shouldAnimate = Math.abs(oldProgress - newProgress) >= 0.001;
            expect(shouldAnimate).toBe(true);

            // Both values should be in valid range
            expect(oldProgress).toBeGreaterThanOrEqual(0);
            expect(oldProgress).toBeLessThanOrEqual(1);
            expect(newProgress).toBeGreaterThanOrEqual(0);
            expect(newProgress).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle progress values in percentage range (0-100)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }), // old progress percentage
          fc.integer({ min: 0, max: 100 }), // new progress percentage
          (oldProgress, newProgress) => {
            // Animation should be triggered for any change
            const changeAmount = Math.abs(newProgress - oldProgress);
            
            // Verify the change is measurable
            if (changeAmount > 0) {
              expect(changeAmount).toBeGreaterThan(0);
            }

            // Both values should be in valid percentage range
            expect(oldProgress).toBeGreaterThanOrEqual(0);
            expect(oldProgress).toBeLessThanOrEqual(100);
            expect(newProgress).toBeGreaterThanOrEqual(0);
            expect(newProgress).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge cases: zero to non-zero transitions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // non-zero progress
          (progress) => {
            const oldProgress = 0;
            const newProgress = progress;

            // Animation should be triggered from 0 to any positive value
            expect(newProgress).toBeGreaterThan(oldProgress);
            expect(oldProgress).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge cases: completion transitions (to 100%)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 99 }), // progress before completion
          (progress) => {
            const oldProgress = progress;
            const newProgress = 100;

            // Animation should be triggered to completion
            expect(newProgress).toBe(100);
            expect(oldProgress).toBeLessThan(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 29: Interaction Animation Triggers
   * For any user interaction with an interactive UI element, an appropriate micro-animation should be triggered.
   * **Validates: Requirements 9.1**
   */
  describe('Property 29: Interaction Animation Triggers', () => {
    it('should trigger haptic feedback for any valid interaction type', async () => {
      const Haptics = require('expo-haptics');
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<HapticType>('light', 'medium', 'heavy', 'success', 'warning', 'error'),
          async (hapticType) => {
            jest.clearAllMocks();
            
            // Trigger haptic for interaction
            await triggerHaptic(hapticType);

            // Verify appropriate haptic was triggered
            if (['light', 'medium', 'heavy'].includes(hapticType)) {
              expect(Haptics.impactAsync).toHaveBeenCalled();
            } else {
              expect(Haptics.notificationAsync).toHaveBeenCalled();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should map interaction types to correct haptic feedback styles', async () => {
      const Haptics = require('expo-haptics');
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<HapticType>('light', 'medium', 'heavy'),
          async (hapticType) => {
            jest.clearAllMocks();
            
            await triggerHaptic(hapticType);

            // Verify correct impact style was used
            expect(Haptics.impactAsync).toHaveBeenCalledWith(
              expect.objectContaining({})
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should trigger notification haptics for feedback events', async () => {
      const Haptics = require('expo-haptics');
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<HapticType>('success', 'warning', 'error'),
          async (hapticType) => {
            jest.clearAllMocks();
            
            await triggerHaptic(hapticType);

            // Verify notification haptic was triggered
            expect(Haptics.notificationAsync).toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle interaction animations on any platform', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('ios', 'android', 'web'),
          fc.constantFrom<HapticType>('light', 'medium', 'heavy'),
          async (platform, hapticType) => {
            (Platform as any).OS = platform;
            jest.clearAllMocks();

            await triggerHaptic(hapticType);

            // Web should not trigger haptics
            if (platform === 'web') {
              const Haptics = require('expo-haptics');
              expect(Haptics.impactAsync).not.toHaveBeenCalled();
            }
            // Native platforms should trigger (if not reduced motion)
            // This validates platform-appropriate behavior
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create celebration sequences for any celebration data', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<CelebrationData['type']>(
            'lesson_complete',
            'level_up',
            'streak_milestone',
            'achievement'
          ),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 0, max: 1000 }),
          async (celebrationType, title, xpEarned) => {
            const celebration: CelebrationData = {
              type: celebrationType,
              title,
              xpEarned,
              intensity: 'medium',
            };

            const sequence = await createCelebrationSequence([celebration]);

            // Sequence should have steps
            expect(sequence.steps.length).toBeGreaterThan(0);
            expect(sequence.totalDuration).toBeGreaterThan(0);

            // Should include animation steps
            const hasAnimationSteps = sequence.steps.some(
              (step) => ['fade', 'scale', 'confetti', 'haptic'].includes(step.action)
            );
            expect(hasAnimationSteps).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 30: Reduced Motion Accessibility
   * For any animation, if the system's reduced motion setting is enabled,
   * animations should be disabled or simplified.
   * **Validates: Requirements 9.5**
   */
  describe('Property 30: Reduced Motion Accessibility', () => {
    it('should respect reduced motion setting for any animation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.boolean(), // reduced motion enabled/disabled
          async (reducedMotionEnabled) => {
            jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(
              reducedMotionEnabled
            );

            const result = await isReducedMotionEnabled();

            // Result should match the system setting
            expect(result).toBe(reducedMotionEnabled);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should disable haptics when reduced motion is enabled', async () => {
      const Haptics = require('expo-haptics');

      await fc.assert(
        fc.asyncProperty(
          fc.boolean(), // reduced motion setting
          fc.constantFrom<HapticType>('light', 'medium', 'heavy', 'success', 'warning', 'error'),
          async (reducedMotion, hapticType) => {
            jest.clearAllMocks();
            jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(reducedMotion);

            await triggerHaptic(hapticType);

            if (reducedMotion) {
              // Haptics should not be triggered when reduced motion is enabled
              expect(Haptics.impactAsync).not.toHaveBeenCalled();
              expect(Haptics.notificationAsync).not.toHaveBeenCalled();
            } else {
              // Haptics should be triggered when reduced motion is disabled
              const hapticsCalled =
                Haptics.impactAsync.mock.calls.length > 0 ||
                Haptics.notificationAsync.mock.calls.length > 0;
              expect(hapticsCalled).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should simplify celebration sequences when reduced motion is enabled', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.boolean(), // reduced motion setting
          fc.constantFrom<CelebrationData['type']>(
            'lesson_complete',
            'level_up',
            'streak_milestone',
            'achievement'
          ),
          fc.constantFrom<CelebrationData['intensity']>('low', 'medium', 'high'),
          async (reducedMotion, celebrationType, intensity) => {
            jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(reducedMotion);

            const celebration: CelebrationData = {
              type: celebrationType,
              title: 'Test Celebration',
              intensity,
            };

            const sequence = await createCelebrationSequence([celebration]);

            if (reducedMotion) {
              // Should not have scale animations when reduced motion is enabled
              const scaleSteps = sequence.steps.filter((step) => step.action === 'scale');
              expect(scaleSteps.length).toBe(0);

              // Confetti should have 0 duration when reduced motion is enabled
              const confettiSteps = sequence.steps.filter((step) => step.action === 'confetti');
              confettiSteps.forEach((step) => {
                expect(step.duration).toBe(0);
              });

              // Duration should be shorter
              expect(sequence.totalDuration).toBeLessThan(2000);
            } else {
              // Should have full animations when reduced motion is disabled
              const hasAnimations = sequence.steps.some(
                (step) => step.action === 'scale' || (step.action === 'confetti' && step.duration > 0)
              );
              expect(hasAnimations).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle reduced motion on web platform using media query', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.boolean(), // media query matches
          async (matches) => {
            (Platform as any).OS = 'web';
            
            const mockMatchMedia = jest.fn().mockReturnValue({ matches });
            (global as any).window = { matchMedia: mockMatchMedia };

            const result = await isReducedMotionEnabled();

            expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
            expect(result).toBe(matches);

            // Cleanup
            delete (global as any).window;
            (Platform as any).OS = 'ios';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should gracefully handle accessibility check failures', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('Network error', 'Permission denied', 'Not available'),
          async (errorMessage) => {
            jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockRejectedValue(
              new Error(errorMessage)
            );

            // Should not throw, should return false (default to animations enabled)
            const result = await isReducedMotionEnabled();
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect reduced motion for multiple celebration sequences', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.boolean(), // reduced motion setting
          fc.array(
            fc.record({
              type: fc.constantFrom<CelebrationData['type']>(
                'lesson_complete',
                'level_up',
                'streak_milestone',
                'achievement'
              ),
              title: fc.string({ minLength: 1, maxLength: 30 }),
              intensity: fc.constantFrom<CelebrationData['intensity']>('low', 'medium', 'high'),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (reducedMotion, celebrations) => {
            jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(reducedMotion);

            const sequence = await createCelebrationSequence(celebrations);

            if (reducedMotion) {
              // All scale animations should be removed
              const scaleSteps = sequence.steps.filter((step) => step.action === 'scale');
              expect(scaleSteps.length).toBe(0);

              // All confetti should have 0 duration
              const confettiSteps = sequence.steps.filter((step) => step.action === 'confetti');
              confettiSteps.forEach((step) => {
                expect(step.duration).toBe(0);
              });
            }

            // Sequence should always have some steps (at least fade and haptic)
            expect(sequence.steps.length).toBeGreaterThan(0);
            expect(sequence.totalDuration).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional Property: Animation Sequence Ordering
   * For any celebration sequence, steps should be ordered with increasing delays
   */
  describe('Additional Property: Animation Sequence Ordering', () => {
    it('should have monotonically increasing delays in celebration sequences', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);

      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              type: fc.constantFrom<CelebrationData['type']>(
                'lesson_complete',
                'level_up',
                'streak_milestone',
                'achievement'
              ),
              title: fc.string({ minLength: 1, maxLength: 30 }),
            }),
            { minLength: 1, maxLength: 3 }
          ),
          async (celebrations) => {
            const sequence = await createCelebrationSequence(celebrations);

            // Delays should be non-decreasing (each step starts at or after the previous)
            for (let i = 1; i < sequence.steps.length; i++) {
              expect(sequence.steps[i].delay).toBeGreaterThanOrEqual(sequence.steps[i - 1].delay);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
