// 🧪 useCelebration Hook Tests
// Unit tests for celebration queue management and sequential playback

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCelebration } from '../useCelebration';

// Mock timers for testing auto-dismiss
jest.useFakeTimers();

describe('useCelebration Hook', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should initialize with empty queue and not playing', () => {
      const { result } = renderHook(() => useCelebration());

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.queue).toEqual([]);
      expect(result.current.currentCelebration).toBeNull();
    });

    it('should provide trigger, skip, and fastForward functions', () => {
      const { result } = renderHook(() => useCelebration());

      expect(typeof result.current.trigger).toBe('function');
      expect(typeof result.current.skip).toBe('function');
      expect(typeof result.current.fastForward).toBe('function');
    });
  });

  describe('Triggering Celebrations', () => {
    it('should add celebration to queue when triggered', async () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('lesson_complete', {
          title: 'Lesson Complete!',
          xpEarned: 50,
        });
      });

      // Wait for state update
      await waitFor(() => {
        expect(result.current.currentCelebration).toMatchObject({
          type: 'lesson_complete',
          title: 'Lesson Complete!',
          xpEarned: 50,
        });
        expect(result.current.isPlaying).toBe(true);
      });
    });

    it('should queue multiple celebrations', () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('lesson_complete', { title: 'Lesson 1' });
        result.current.trigger('level_up', { title: 'Level Up!', newLevel: 5 });
        result.current.trigger('achievement', { title: 'Achievement!' });
      });

      // First celebration should be playing
      expect(result.current.isPlaying).toBe(true);
      expect(result.current.currentCelebration?.title).toBe('Lesson 1');
      
      // Two celebrations should be in queue
      expect(result.current.queue.length).toBe(2);
    });

    it('should include all celebration data fields', async () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('level_up', {
          title: 'Level Up!',
          subtitle: 'You reached level 5',
          xpEarned: 100,
          newLevel: 5,
          intensity: 'high',
        });
      });

      await waitFor(() => {
        expect(result.current.currentCelebration).toMatchObject({
          type: 'level_up',
          title: 'Level Up!',
          subtitle: 'You reached level 5',
          xpEarned: 100,
          newLevel: 5,
          intensity: 'high',
        });
      });
    });
  });

  describe('Sequential Playback', () => {
    it('should play celebrations one at a time', async () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('lesson_complete', { title: 'Lesson 1' });
        result.current.trigger('lesson_complete', { title: 'Lesson 2' });
      });

      // First celebration should be playing
      expect(result.current.currentCelebration?.title).toBe('Lesson 1');
      expect(result.current.queue.length).toBe(1);

      // Fast forward to auto-dismiss
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Wait for state update
      await waitFor(() => {
        expect(result.current.currentCelebration?.title).toBe('Lesson 2');
      });

      expect(result.current.queue.length).toBe(0);
    });

    it('should auto-dismiss after duration based on intensity', () => {
      const { result } = renderHook(() => useCelebration());

      // Low intensity - 2000ms
      act(() => {
        result.current.trigger('lesson_complete', {
          title: 'Low',
          intensity: 'low',
        });
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1999);
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it('should use medium duration by default', () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('lesson_complete', { title: 'Default' });
      });

      expect(result.current.isPlaying).toBe(true);

      // Should not dismiss before 3000ms
      act(() => {
        jest.advanceTimersByTime(2999);
      });

      expect(result.current.isPlaying).toBe(true);

      // Should dismiss at 3000ms
      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it('should use high duration for high intensity', () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('level_up', {
          title: 'High',
          intensity: 'high',
        });
      });

      expect(result.current.isPlaying).toBe(true);

      // Should not dismiss before 4000ms
      act(() => {
        jest.advanceTimersByTime(3999);
      });

      expect(result.current.isPlaying).toBe(true);

      // Should dismiss at 4000ms
      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('Skip Functionality', () => {
    it('should skip current celebration immediately', async () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('lesson_complete', { title: 'Lesson 1' });
        result.current.trigger('lesson_complete', { title: 'Lesson 2' });
      });

      await waitFor(() => {
        expect(result.current.currentCelebration?.title).toBe('Lesson 1');
      });

      // Skip current celebration
      act(() => {
        result.current.skip();
      });

      // Next celebration should start after skip
      await waitFor(() => {
        expect(result.current.currentCelebration?.title).toBe('Lesson 2');
      });
    });

    it('should do nothing if not playing', () => {
      const { result } = renderHook(() => useCelebration());

      expect(result.current.isPlaying).toBe(false);

      act(() => {
        result.current.skip();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentCelebration).toBeNull();
    });

    it('should clear auto-dismiss timeout when skipping', () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('lesson_complete', { title: 'Test' });
      });

      expect(result.current.isPlaying).toBe(true);

      // Skip before auto-dismiss
      act(() => {
        result.current.skip();
      });

      expect(result.current.isPlaying).toBe(false);

      // Advance timers - should not cause any state changes
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('Fast-Forward Functionality', () => {
    it('should fast-forward current celebration with brief display', () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('lesson_complete', { title: 'Test' });
      });

      expect(result.current.isPlaying).toBe(true);

      // Fast-forward
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
    });

    it('should do nothing if not playing', () => {
      const { result } = renderHook(() => useCelebration());

      expect(result.current.isPlaying).toBe(false);

      act(() => {
        result.current.fastForward();
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it('should clear previous timeout when fast-forwarding', () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('lesson_complete', {
          title: 'Test',
          intensity: 'high',
        });
      });

      expect(result.current.isPlaying).toBe(true);

      // Fast-forward
      act(() => {
        result.current.fastForward();
      });

      // Advance past original auto-dismiss time (4000ms)
      act(() => {
        jest.advanceTimersByTime(4000);
      });

      // Should have dismissed at 500ms, not 4000ms
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty celebration data', async () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('achievement', { title: 'Achievement' });
      });

      await waitFor(() => {
        expect(result.current.currentCelebration).toMatchObject({
          type: 'achievement',
          title: 'Achievement',
        });
      });
    });

    it('should handle rapid triggers', () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.trigger('lesson_complete', { title: `Lesson ${i}` });
        }
      });

      // First should be playing
      expect(result.current.isPlaying).toBe(true);
      expect(result.current.currentCelebration?.title).toBe('Lesson 0');
      
      // Rest should be queued
      expect(result.current.queue.length).toBe(9);
    });

    it('should cleanup timeout on unmount', () => {
      const { result, unmount } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('lesson_complete', { title: 'Test' });
      });

      expect(result.current.isPlaying).toBe(true);

      // Unmount while playing
      unmount();

      // Advance timers - should not cause errors
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // No errors should occur
    });
  });

  describe('Celebration Types', () => {
    it('should support lesson_complete type', async () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('lesson_complete', {
          title: 'Lesson Complete!',
          xpEarned: 50,
        });
      });

      await waitFor(() => {
        expect(result.current.currentCelebration?.type).toBe('lesson_complete');
      });
    });

    it('should support level_up type', async () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('level_up', {
          title: 'Level Up!',
          newLevel: 5,
        });
      });

      await waitFor(() => {
        expect(result.current.currentCelebration?.type).toBe('level_up');
      });
    });

    it('should support streak_milestone type', async () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('streak_milestone', {
          title: '7 Day Streak!',
          streakMilestone: 7,
        });
      });

      await waitFor(() => {
        expect(result.current.currentCelebration?.type).toBe('streak_milestone');
      });
    });

    it('should support achievement type', async () => {
      const { result } = renderHook(() => useCelebration());

      act(() => {
        result.current.trigger('achievement', {
          title: 'Achievement Unlocked!',
          achievements: [
            { id: 'first_lesson', title: 'First Lesson', icon: '🎓' },
          ],
        });
      });

      await waitFor(() => {
        expect(result.current.currentCelebration?.type).toBe('achievement');
      });
    });
  });
});
