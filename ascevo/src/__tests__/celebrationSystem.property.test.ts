// 🧪 Property-Based Tests for Celebration System
// Tests universal properties across all inputs using fast-check
// Validates Requirements 6.1, 6.2, 6.3, 6.4, 6.5

import fc from 'fast-check';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCelebration, CelebrationType } from '../hooks/useCelebration';
import { CelebrationData } from '../services/animationService';

// Mock timers for testing
jest.useFakeTimers();

describe('Property Tests: Celebration System', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  /**
   * Property 20: Lesson Completion Celebration
   * For any completed lesson, a full-screen celebration should be triggered with the lesson completion type.
   * **Validates: Requirements 6.1**
   */
  describe('Property 20: Lesson Completion Celebration', () => {
    it('should trigger celebration for any lesson completion', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }), // lesson title
          fc.integer({ min: 0, max: 500 }), // XP earned
          (lessonTitle, xpEarned) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger('lesson_complete', {
                title: lessonTitle,
                xpEarned,
              });
            });

            // Should start playing immediately
            expect(result.current.isPlaying).toBe(true);
            expect(result.current.currentCelebration).not.toBeNull();
            expect(result.current.currentCelebration?.type).toBe('lesson_complete');
            expect(result.current.currentCelebration?.title).toBe(lessonTitle);
            expect(result.current.currentCelebration?.xpEarned).toBe(xpEarned);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should trigger full-screen celebration for lesson completion', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            subtitle: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
            xpEarned: fc.option(fc.integer({ min: 0, max: 500 }), { nil: undefined }),
          }),
          (celebrationData) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger('lesson_complete', celebrationData);
            });

            // Celebration should be triggered
            expect(result.current.isPlaying).toBe(true);
            expect(result.current.currentCelebration?.type).toBe('lesson_complete');
            
            // All provided data should be present
            expect(result.current.currentCelebration?.title).toBe(celebrationData.title);
            if (celebrationData.subtitle !== undefined) {
              expect(result.current.currentCelebration?.subtitle).toBe(celebrationData.subtitle);
            }
            if (celebrationData.xpEarned !== undefined) {
              expect(result.current.currentCelebration?.xpEarned).toBe(celebrationData.xpEarned);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle lesson completion with minimal data', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }), // title only
          (title) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger('lesson_complete', { title });
            });

            // Should still trigger celebration with just title
            expect(result.current.isPlaying).toBe(true);
            expect(result.current.currentCelebration?.type).toBe('lesson_complete');
            expect(result.current.currentCelebration?.title).toBe(title);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 21: Celebration Data Completeness
   * For any celebration, it should include XP earned, current streak status, and any newly unlocked achievements.
   * **Validates: Requirements 6.2**
   */
  describe('Property 21: Celebration Data Completeness', () => {
    it('should include all provided celebration data fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            type: fc.constantFrom<CelebrationType>(
              'lesson_complete',
              'level_up',
              'streak_milestone',
              'achievement'
            ),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            subtitle: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
            xpEarned: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: undefined }),
            streakMilestone: fc.option(fc.constantFrom(7, 30, 100, 365), { nil: undefined }),
            newLevel: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
            achievements: fc.option(
              fc.array(
                fc.record({
                  id: fc.uuid(),
                  title: fc.string({ minLength: 1, maxLength: 50 }),
                  icon: fc.constantFrom('🏆', '⭐', '🎯', '🔥', '💪'),
                }),
                { minLength: 0, maxLength: 5 }
              ),
              { nil: undefined }
            ),
            intensity: fc.option(fc.constantFrom('low', 'medium', 'high'), { nil: undefined }),
          }),
          (celebrationInput) => {
            const { result } = renderHook(() => useCelebration());
            const { type, ...data } = celebrationInput;

            act(() => {
              result.current.trigger(type, data);
            });

            // All provided fields should be present in current celebration
            expect(result.current.currentCelebration).not.toBeNull();
            expect(result.current.currentCelebration?.type).toBe(type);
            expect(result.current.currentCelebration?.title).toBe(data.title);

            if (data.subtitle !== undefined) {
              expect(result.current.currentCelebration?.subtitle).toBe(data.subtitle);
            }
            if (data.xpEarned !== undefined) {
              expect(result.current.currentCelebration?.xpEarned).toBe(data.xpEarned);
            }
            if (data.streakMilestone !== undefined) {
              expect(result.current.currentCelebration?.streakMilestone).toBe(data.streakMilestone);
            }
            if (data.newLevel !== undefined) {
              expect(result.current.currentCelebration?.newLevel).toBe(data.newLevel);
            }
            if (data.achievements !== undefined) {
              expect(result.current.currentCelebration?.achievements).toEqual(data.achievements);
            }
            if (data.intensity !== undefined) {
              expect(result.current.currentCelebration?.intensity).toBe(data.intensity);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve achievement data completeness', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string({ minLength: 1, maxLength: 50 }),
              icon: fc.constantFrom('🏆', '⭐', '🎯', '🔥', '💪', '🎓', '👑'),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (achievements) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger('achievement', {
                title: 'Achievements Unlocked!',
                achievements,
              });
            });

            // All achievement data should be preserved
            expect(result.current.currentCelebration?.achievements).toHaveLength(achievements.length);
            
            achievements.forEach((achievement, index) => {
              const celebrationAchievement = result.current.currentCelebration?.achievements?.[index];
              expect(celebrationAchievement?.id).toBe(achievement.id);
              expect(celebrationAchievement?.title).toBe(achievement.title);
              expect(celebrationAchievement?.icon).toBe(achievement.icon);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle celebration with XP and streak data', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 500 }), // XP earned
          fc.constantFrom(7, 30, 100, 365), // streak milestone
          (xpEarned, streakMilestone) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger('streak_milestone', {
                title: `${streakMilestone} Day Streak!`,
                xpEarned,
                streakMilestone,
              });
            });

            // Both XP and streak data should be present
            expect(result.current.currentCelebration?.xpEarned).toBe(xpEarned);
            expect(result.current.currentCelebration?.streakMilestone).toBe(streakMilestone);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle celebration with level and XP data', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }), // new level
          fc.integer({ min: 50, max: 1000 }), // XP earned
          (newLevel, xpEarned) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger('level_up', {
                title: 'Level Up!',
                newLevel,
                xpEarned,
              });
            });

            // Both level and XP data should be present
            expect(result.current.currentCelebration?.newLevel).toBe(newLevel);
            expect(result.current.currentCelebration?.xpEarned).toBe(xpEarned);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 22: Celebration Sequencing
   * For any set of multiple celebrations triggered simultaneously, they should be queued
   * and played in sequence rather than overlapping.
   * **Validates: Requirements 6.3**
   */
  describe('Property 22: Celebration Sequencing', () => {
    it('should queue multiple celebrations and play sequentially', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constantFrom<CelebrationType>(
                'lesson_complete',
                'level_up',
                'streak_milestone',
                'achievement'
              ),
              title: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (celebrations) => {
            const { result } = renderHook(() => useCelebration());

            // Trigger all celebrations at once
            act(() => {
              celebrations.forEach((celebration) => {
                result.current.trigger(celebration.type, { title: celebration.title });
              });
            });

            // First celebration should be playing
            expect(result.current.isPlaying).toBe(true);
            expect(result.current.currentCelebration?.title).toBe(celebrations[0].title);

            // Remaining celebrations should be in queue
            expect(result.current.queue).toHaveLength(celebrations.length - 1);

            // Queue should contain all remaining celebrations in order
            result.current.queue.forEach((queuedCelebration, index) => {
              expect(queuedCelebration.title).toBe(celebrations[index + 1].title);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should play celebrations one at a time without overlap', async () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1, maxLength: 50 }),
            { minLength: 3, maxLength: 5 }
          ),
          (titles) => {
            const { result } = renderHook(() => useCelebration());

            // Trigger all celebrations
            act(() => {
              titles.forEach((title) => {
                result.current.trigger('lesson_complete', { title });
              });
            });

            // First should be playing
            expect(result.current.isPlaying).toBe(true);
            expect(result.current.currentCelebration?.title).toBe(titles[0]);

            // Fast-forward to auto-dismiss first celebration
            act(() => {
              jest.advanceTimersByTime(3000);
            });

            // Second should now be playing
            expect(result.current.isPlaying).toBe(true);
            expect(result.current.currentCelebration?.title).toBe(titles[1]);

            // Queue should have decreased by one
            expect(result.current.queue).toHaveLength(titles.length - 2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain celebration order in queue', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              title: fc.string({ minLength: 1, maxLength: 50 }),
              xpEarned: fc.integer({ min: 0, max: 500 }),
            }),
            { minLength: 2, maxLength: 8 }
          ),
          (celebrations) => {
            const { result } = renderHook(() => useCelebration());

            // Trigger all celebrations
            act(() => {
              celebrations.forEach((celebration) => {
                result.current.trigger('lesson_complete', celebration);
              });
            });

            // Verify queue order matches input order (excluding first which is playing)
            result.current.queue.forEach((queuedCelebration, index) => {
              expect(queuedCelebration.title).toBe(celebrations[index + 1].title);
              expect(queuedCelebration.xpEarned).toBe(celebrations[index + 1].xpEarned);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should process entire queue sequentially', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }), // number of celebrations
          (count) => {
            const { result } = renderHook(() => useCelebration());
            const titles = Array.from({ length: count }, (_, i) => `Celebration ${i + 1}`);

            // Trigger all celebrations
            act(() => {
              titles.forEach((title) => {
                result.current.trigger('lesson_complete', { title, intensity: 'low' });
              });
            });

            // Process all celebrations
            for (let i = 0; i < count; i++) {
              expect(result.current.isPlaying).toBe(true);
              expect(result.current.currentCelebration?.title).toBe(titles[i]);

              // Fast-forward to next celebration (low intensity = 2000ms)
              act(() => {
                jest.advanceTimersByTime(2000);
              });
            }

            // All celebrations should be complete
            expect(result.current.isPlaying).toBe(false);
            expect(result.current.queue).toHaveLength(0);
            expect(result.current.currentCelebration).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not overlap celebrations when rapidly triggered', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1, maxLength: 30 }),
            { minLength: 5, maxLength: 15 }
          ),
          (titles) => {
            const { result } = renderHook(() => useCelebration());

            // Rapidly trigger all celebrations
            act(() => {
              titles.forEach((title) => {
                result.current.trigger('achievement', { title });
              });
            });

            // Only one should be playing
            expect(result.current.isPlaying).toBe(true);
            
            // All others should be queued
            expect(result.current.queue).toHaveLength(titles.length - 1);

            // Current celebration should be the first one
            expect(result.current.currentCelebration?.title).toBe(titles[0]);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 23: Celebration Intensity Levels
   * For any celebration, it should have an intensity level that corresponds to the significance of the achievement.
   * **Validates: Requirements 6.4**
   */
  describe('Property 23: Celebration Intensity Levels', () => {
    it('should support all intensity levels', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('low', 'medium', 'high'),
          fc.string({ minLength: 1, maxLength: 100 }),
          (intensity, title) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger('lesson_complete', {
                title,
                intensity,
              });
            });

            // Intensity should be preserved
            expect(result.current.currentCelebration?.intensity).toBe(intensity);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use different durations for different intensities', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('low', 'medium', 'high'),
          (intensity) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger('lesson_complete', {
                title: 'Test',
                intensity,
              });
            });

            expect(result.current.isPlaying).toBe(true);

            // Get expected duration based on intensity
            const expectedDuration = intensity === 'high' ? 4000 : intensity === 'medium' ? 3000 : 2000;

            // Should still be playing before duration
            act(() => {
              jest.advanceTimersByTime(expectedDuration - 1);
            });
            expect(result.current.isPlaying).toBe(true);

            // Should stop playing at duration
            act(() => {
              jest.advanceTimersByTime(1);
            });
            expect(result.current.isPlaying).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should default to medium intensity when not specified', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (title) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger('lesson_complete', { title });
            });

            expect(result.current.isPlaying).toBe(true);

            // Should use medium duration (3000ms)
            act(() => {
              jest.advanceTimersByTime(2999);
            });
            expect(result.current.isPlaying).toBe(true);

            act(() => {
              jest.advanceTimersByTime(1);
            });
            expect(result.current.isPlaying).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle mixed intensity celebrations in queue', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              title: fc.string({ minLength: 1, maxLength: 50 }),
              intensity: fc.constantFrom('low', 'medium', 'high'),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          (celebrations) => {
            const { result } = renderHook(() => useCelebration());

            // Trigger all celebrations
            act(() => {
              celebrations.forEach((celebration) => {
                result.current.trigger('lesson_complete', celebration);
              });
            });

            // Each celebration should maintain its intensity
            celebrations.forEach((celebration, index) => {
              if (index === 0) {
                // First is currently playing
                expect(result.current.currentCelebration?.intensity).toBe(celebration.intensity);
              } else {
                // Rest are in queue
                expect(result.current.queue[index - 1].intensity).toBe(celebration.intensity);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect intensity for auto-dismiss timing', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<[string, number]>(
            ['low', 2000],
            ['medium', 3000],
            ['high', 4000]
          ),
          ([intensity, expectedDuration]) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger('level_up', {
                title: 'Level Up!',
                intensity: intensity as 'low' | 'medium' | 'high',
              });
            });

            // Should be playing
            expect(result.current.isPlaying).toBe(true);

            // Should not dismiss before expected duration
            act(() => {
              jest.advanceTimersByTime(expectedDuration - 100);
            });
            expect(result.current.isPlaying).toBe(true);

            // Should dismiss at expected duration
            act(() => {
              jest.advanceTimersByTime(100);
            });
            expect(result.current.isPlaying).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 24: Celebration Skip Functionality
   * For any playing celebration, the user should be able to skip or fast-forward it.
   * **Validates: Requirements 6.5**
   */
  describe('Property 24: Celebration Skip Functionality', () => {
    it('should allow skipping any playing celebration', () => {
      fc.assert(
        fc.property(
          fc.record({
            type: fc.constantFrom<CelebrationType>(
              'lesson_complete',
              'level_up',
              'streak_milestone',
              'achievement'
            ),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            intensity: fc.constantFrom('low', 'medium', 'high'),
          }),
          (celebration) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger(celebration.type, {
                title: celebration.title,
                intensity: celebration.intensity,
              });
            });

            expect(result.current.isPlaying).toBe(true);

            // Skip the celebration
            act(() => {
              result.current.skip();
            });

            // Should stop playing immediately
            expect(result.current.isPlaying).toBe(false);
            expect(result.current.currentCelebration).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow fast-forwarding any playing celebration', () => {
      fc.assert(
        fc.property(
          fc.record({
            type: fc.constantFrom<CelebrationType>(
              'lesson_complete',
              'level_up',
              'streak_milestone',
              'achievement'
            ),
            title: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          (celebration) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger(celebration.type, { title: celebration.title });
            });

            expect(result.current.isPlaying).toBe(true);

            // Fast-forward the celebration
            act(() => {
              result.current.fastForward();
            });

            // Should still be playing briefly
            expect(result.current.isPlaying).toBe(true);

            // After 500ms, should stop
            act(() => {
              jest.advanceTimersByTime(500);
            });

            expect(result.current.isPlaying).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should skip to next celebration when skipping in a queue', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1, maxLength: 50 }),
            { minLength: 2, maxLength: 5 }
          ),
          (titles) => {
            const { result } = renderHook(() => useCelebration());

            // Trigger all celebrations
            act(() => {
              titles.forEach((title) => {
                result.current.trigger('lesson_complete', { title });
              });
            });

            // First should be playing
            expect(result.current.currentCelebration?.title).toBe(titles[0]);

            // Skip first celebration
            act(() => {
              result.current.skip();
            });

            // Second should now be playing
            expect(result.current.isPlaying).toBe(true);
            expect(result.current.currentCelebration?.title).toBe(titles[1]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle skip when no celebration is playing', () => {
      fc.assert(
        fc.property(
          fc.constant(undefined),
          () => {
            const { result } = renderHook(() => useCelebration());

            // No celebration playing
            expect(result.current.isPlaying).toBe(false);

            // Skip should do nothing
            act(() => {
              result.current.skip();
            });

            // Should still not be playing
            expect(result.current.isPlaying).toBe(false);
            expect(result.current.currentCelebration).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle fast-forward when no celebration is playing', () => {
      fc.assert(
        fc.property(
          fc.constant(undefined),
          () => {
            const { result } = renderHook(() => useCelebration());

            // No celebration playing
            expect(result.current.isPlaying).toBe(false);

            // Fast-forward should do nothing
            act(() => {
              result.current.fastForward();
            });

            // Should still not be playing
            expect(result.current.isPlaying).toBe(false);
            expect(result.current.currentCelebration).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should cancel auto-dismiss timer when skipping', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('low', 'medium', 'high'),
          (intensity) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger('lesson_complete', {
                title: 'Test',
                intensity,
              });
            });

            expect(result.current.isPlaying).toBe(true);

            // Skip before auto-dismiss
            act(() => {
              result.current.skip();
            });

            expect(result.current.isPlaying).toBe(false);

            // Advance past auto-dismiss time
            act(() => {
              jest.advanceTimersByTime(5000);
            });

            // Should still be stopped (no double-dismiss)
            expect(result.current.isPlaying).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should cancel auto-dismiss timer when fast-forwarding', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('low', 'medium', 'high'),
          (intensity) => {
            const { result } = renderHook(() => useCelebration());

            act(() => {
              result.current.trigger('lesson_complete', {
                title: 'Test',
                intensity,
              });
            });

            expect(result.current.isPlaying).toBe(true);

            // Fast-forward
            act(() => {
              result.current.fastForward();
            });

            // Should dismiss at 500ms, not original duration
            act(() => {
              jest.advanceTimersByTime(500);
            });

            expect(result.current.isPlaying).toBe(false);

            // Advance past original auto-dismiss time
            act(() => {
              jest.advanceTimersByTime(5000);
            });

            // Should still be stopped (no double-dismiss)
            expect(result.current.isPlaying).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow skipping through entire queue', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1, maxLength: 30 }),
            { minLength: 3, maxLength: 7 }
          ),
          (titles) => {
            const { result } = renderHook(() => useCelebration());

            // Trigger all celebrations
            act(() => {
              titles.forEach((title) => {
                result.current.trigger('lesson_complete', { title });
              });
            });

            // Skip through all celebrations
            titles.forEach((title, index) => {
              expect(result.current.currentCelebration?.title).toBe(title);
              
              act(() => {
                result.current.skip();
              });

              // If not last, next should be playing
              if (index < titles.length - 1) {
                expect(result.current.isPlaying).toBe(true);
              } else {
                expect(result.current.isPlaying).toBe(false);
              }
            });

            // All celebrations should be complete
            expect(result.current.isPlaying).toBe(false);
            expect(result.current.queue).toHaveLength(0);
            expect(result.current.currentCelebration).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
