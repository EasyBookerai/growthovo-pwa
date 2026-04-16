// 🧪 Tests for useProgressAnimation Hook
// Validates progress animation hook functionality and timing

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProgressAnimation } from '../useProgressAnimation';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const actualReanimated = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actualReanimated,
    useSharedValue: jest.fn((initialValue: number) => ({
      value: initialValue,
    })),
    withTiming: jest.fn((toValue: number, config: any, callback?: (finished: boolean) => void) => {
      // Simulate animation completion
      if (callback) {
        setTimeout(() => callback(true), 0);
      }
      return toValue;
    }),
  };
});

// Mock animationService
jest.mock('../../services/animationService', () => ({
  getTimingDuration: jest.fn((name: string) => {
    const durations: Record<string, number> = {
      fast: 200,
      normal: 300,
      slow: 500,
    };
    return durations[name] || 300;
  }),
}));

describe('useProgressAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with value starting at 0', () => {
      const { result } = renderHook(() => useProgressAnimation(50));
      
      expect(result.current.animatedValue).toBeDefined();
      expect(result.current.animatedValue.value).toBe(0);
    });

    it('should initialize with isAnimating as true (animates on mount)', () => {
      const { result } = renderHook(() => useProgressAnimation(0));
      
      expect(result.current.isAnimating).toBe(true);
    });

    it('should return animatedValue and isAnimating', () => {
      const { result } = renderHook(() => useProgressAnimation(75));
      
      expect(result.current).toHaveProperty('animatedValue');
      expect(result.current).toHaveProperty('isAnimating');
    });
  });

  describe('Animation Triggering', () => {
    it('should trigger animation when targetValue changes', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { result, rerender } = renderHook(
        ({ value }) => useProgressAnimation(value),
        { initialProps: { value: 0 } }
      );
      
      // Change target value
      rerender({ value: 100 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          100,
          expect.objectContaining({ duration: 300 }),
          expect.any(Function)
        );
      });
    });

    it('should set isAnimating to true when animation starts', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useProgressAnimation(value),
        { initialProps: { value: 0 } }
      );
      
      // Change target value
      act(() => {
        rerender({ value: 50 });
      });
      
      await waitFor(() => {
        expect(result.current.isAnimating).toBe(true);
      });
    });

    it('should not trigger animation again if value does not change', () => {
      const { withTiming } = require('react-native-reanimated');
      const { rerender } = renderHook(
        ({ value }) => useProgressAnimation(value),
        { initialProps: { value: 50 } }
      );
      
      // Get initial call count (should be 1 from mount)
      expect(withTiming).toHaveBeenCalledTimes(1);
      
      // Rerender with same value - should NOT trigger animation again
      // because useEffect dependencies haven't changed
      rerender({ value: 50 });
      
      // Should still be 1
      expect(withTiming).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Duration', () => {
    it('should use default duration when not provided', () => {
      const { getTimingDuration } = require('../../services/animationService');
      renderHook(() => useProgressAnimation(50));
      
      expect(getTimingDuration).toHaveBeenCalledWith('normal');
    });

    it('should use custom duration when provided', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { result, rerender } = renderHook(
        ({ value }) => useProgressAnimation(value, 1000),
        { initialProps: { value: 0 } }
      );
      
      rerender({ value: 100 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          100,
          expect.objectContaining({ duration: 1000 }),
          expect.any(Function)
        );
      });
    });

    it('should handle fast duration', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { result, rerender } = renderHook(
        ({ value }) => useProgressAnimation(value, 200),
        { initialProps: { value: 0 } }
      );
      
      rerender({ value: 75 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          75,
          expect.objectContaining({ duration: 200 }),
          expect.any(Function)
        );
      });
    });

    it('should handle slow duration', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { result, rerender } = renderHook(
        ({ value }) => useProgressAnimation(value, 500),
        { initialProps: { value: 0 } }
      );
      
      rerender({ value: 90 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          90,
          expect.objectContaining({ duration: 500 }),
          expect.any(Function)
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle progress value of 0', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { rerender } = renderHook(
        ({ value }) => useProgressAnimation(value),
        { initialProps: { value: 100 } }
      );
      
      rerender({ value: 0 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          0,
          expect.any(Object),
          expect.any(Function)
        );
      });
    });

    it('should handle progress value of 100', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { rerender } = renderHook(
        ({ value }) => useProgressAnimation(value),
        { initialProps: { value: 0 } }
      );
      
      rerender({ value: 100 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          100,
          expect.any(Object),
          expect.any(Function)
        );
      });
    });

    it('should handle decimal progress values', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { rerender } = renderHook(
        ({ value }) => useProgressAnimation(value),
        { initialProps: { value: 0 } }
      );
      
      rerender({ value: 33.33 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          33.33,
          expect.any(Object),
          expect.any(Function)
        );
      });
    });

    it('should handle negative values', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { rerender } = renderHook(
        ({ value }) => useProgressAnimation(value),
        { initialProps: { value: 0 } }
      );
      
      rerender({ value: -10 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          -10,
          expect.any(Object),
          expect.any(Function)
        );
      });
    });

    it('should handle values greater than 100', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { rerender } = renderHook(
        ({ value }) => useProgressAnimation(value),
        { initialProps: { value: 0 } }
      );
      
      rerender({ value: 150 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          150,
          expect.any(Object),
          expect.any(Function)
        );
      });
    });
  });

  describe('Multiple Value Changes', () => {
    it('should handle rapid value changes', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { rerender } = renderHook(
        ({ value }) => useProgressAnimation(value),
        { initialProps: { value: 0 } }
      );
      
      rerender({ value: 25 });
      rerender({ value: 50 });
      rerender({ value: 75 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          75,
          expect.any(Object),
          expect.any(Function)
        );
      });
    });

    it('should animate from old value to new value', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { result, rerender } = renderHook(
        ({ value }) => useProgressAnimation(value),
        { initialProps: { value: 25 } }
      );
      
      // Initial value should be 0 (always starts at 0)
      expect(result.current.animatedValue.value).toBe(0);
      
      // Change to 75
      rerender({ value: 75 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          75,
          expect.any(Object),
          expect.any(Function)
        );
      });
    });

    it('should handle backward progress (decreasing values)', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { rerender } = renderHook(
        ({ value }) => useProgressAnimation(value),
        { initialProps: { value: 100 } }
      );
      
      rerender({ value: 50 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          50,
          expect.any(Object),
          expect.any(Function)
        );
      });
    });
  });

  describe('Timing Configuration', () => {
    it('should use timing animation (not spring)', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { rerender } = renderHook(
        ({ value }) => useProgressAnimation(value),
        { initialProps: { value: 0 } }
      );
      
      rerender({ value: 50 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalled();
      });
    });

    it('should pass duration in timing config', async () => {
      const { withTiming } = require('react-native-reanimated');
      const { rerender } = renderHook(
        ({ value }) => useProgressAnimation(value, 400),
        { initialProps: { value: 0 } }
      );
      
      rerender({ value: 60 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          60,
          expect.objectContaining({ duration: 400 }),
          expect.any(Function)
        );
      });
    });
  });

  describe('Requirements Validation', () => {
    it('should validate Requirement 7.2: Progress Animation Triggers', async () => {
      // When progress changes, animation should be triggered from old to new value
      const { withTiming } = require('react-native-reanimated');
      const { rerender } = renderHook(
        ({ value }) => useProgressAnimation(value),
        { initialProps: { value: 30 } }
      );
      
      rerender({ value: 70 });
      
      await waitFor(() => {
        expect(withTiming).toHaveBeenCalledWith(
          70,
          expect.any(Object),
          expect.any(Function)
        );
      });
    });

    it('should validate Requirement 9.1: Smooth Transitions', () => {
      // The hook provides smooth transitions using timing animation
      const { result } = renderHook(() => useProgressAnimation(50));
      
      expect(result.current.animatedValue).toBeDefined();
      expect(result.current.isAnimating).toBeDefined();
    });

    it('should return SharedValue for use with Reanimated', () => {
      const { result } = renderHook(() => useProgressAnimation(50));
      
      // SharedValue should have a value property
      expect(result.current.animatedValue).toHaveProperty('value');
    });

    it('should return isAnimating state for UI feedback', () => {
      const { result } = renderHook(() => useProgressAnimation(50));
      
      expect(typeof result.current.isAnimating).toBe('boolean');
    });
  });
});
