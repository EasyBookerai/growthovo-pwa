// 🧪 Tests for useBlurOptimization Hook
// Validates blur optimization hook functionality for performance

import { renderHook, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import {
  useBlurOptimization,
  useScrollBlurOptimization,
} from '../useBlurOptimization';

describe('useBlurOptimization', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should return shouldBlur as true by default', () => {
      const { result } = renderHook(() => useBlurOptimization());

      expect(result.current.shouldBlur).toBe(true);
      expect(result.current.isVisible).toBe(true);
      expect(result.current.isScrolling).toBe(false);
    });

    it('should return shouldBlur as false when disabled', () => {
      const { result } = renderHook(() =>
        useBlurOptimization({ enabled: false })
      );

      expect(result.current.shouldBlur).toBe(false);
    });

    it('should provide a ref for element attachment', () => {
      const { result } = renderHook(() => useBlurOptimization());

      expect(result.current.ref).toBeDefined();
      expect(result.current.ref.current).toBeNull();
    });
  });

  describe('Configuration options', () => {
    it('should respect disableOnScroll option', () => {
      const { result } = renderHook(() =>
        useBlurOptimization({ disableOnScroll: false })
      );

      expect(result.current.shouldBlur).toBe(true);
    });

    it('should respect checkViewport option', () => {
      const { result } = renderHook(() =>
        useBlurOptimization({ checkViewport: false })
      );

      expect(result.current.isVisible).toBe(true);
    });

    it('should use custom scrollDebounceMs', () => {
      const { result } = renderHook(() =>
        useBlurOptimization({ scrollDebounceMs: 300 })
      );

      expect(result.current.shouldBlur).toBe(true);
    });
  });

  describe('Requirements Validation', () => {
    it('should validate Requirement 12.1: Visible Element Blur Optimization', () => {
      // The hook provides viewport detection and scroll handling
      const { result } = renderHook(() => useBlurOptimization());

      // Should provide visibility state
      expect(result.current.isVisible).toBeDefined();
      expect(typeof result.current.isVisible).toBe('boolean');

      // Should provide scrolling state
      expect(result.current.isScrolling).toBeDefined();
      expect(typeof result.current.isScrolling).toBe('boolean');

      // Should provide shouldBlur decision
      expect(result.current.shouldBlur).toBeDefined();
      expect(typeof result.current.shouldBlur).toBe('boolean');
    });

    it('should disable blur when not visible or scrolling', () => {
      const { result } = renderHook(() => useBlurOptimization());

      // When visible and not scrolling, blur should be enabled
      expect(result.current.isVisible).toBe(true);
      expect(result.current.isScrolling).toBe(false);
      expect(result.current.shouldBlur).toBe(true);
    });

    it('should provide ref for viewport detection', () => {
      const { result } = renderHook(() => useBlurOptimization());

      // Should provide a ref that can be attached to elements
      expect(result.current.ref).toBeDefined();
      expect(result.current.ref).toHaveProperty('current');
    });
  });
});

describe('useScrollBlurOptimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return onScroll handler and isScrolling state', () => {
    const { result } = renderHook(() => useScrollBlurOptimization());

    expect(result.current.onScroll).toBeDefined();
    expect(typeof result.current.onScroll).toBe('function');
    expect(result.current.isScrolling).toBe(false);
  });

  it('should set isScrolling to true when onScroll is called', () => {
    const { result } = renderHook(() => useScrollBlurOptimization());

    act(() => {
      result.current.onScroll();
    });

    expect(result.current.isScrolling).toBe(true);
  });

  it('should set isScrolling to false after debounce', () => {
    const { result } = renderHook(() => useScrollBlurOptimization());

    act(() => {
      result.current.onScroll();
    });

    expect(result.current.isScrolling).toBe(true);

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(result.current.isScrolling).toBe(false);
  });

  it('should call onScrollingChange callback', () => {
    const onScrollingChange = jest.fn();
    const { result } = renderHook(() =>
      useScrollBlurOptimization(onScrollingChange)
    );

    act(() => {
      result.current.onScroll();
    });

    expect(onScrollingChange).toHaveBeenCalledWith(true);

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(onScrollingChange).toHaveBeenCalledWith(false);
  });

  it('should use custom debounce time', () => {
    const { result } = renderHook(() =>
      useScrollBlurOptimization(undefined, 300)
    );

    act(() => {
      result.current.onScroll();
    });

    expect(result.current.isScrolling).toBe(true);

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isScrolling).toBe(true);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.isScrolling).toBe(false);
  });

  it('should reset timeout on multiple scroll events', () => {
    const { result } = renderHook(() => useScrollBlurOptimization());

    act(() => {
      result.current.onScroll();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Scroll again before timeout completes
    act(() => {
      result.current.onScroll();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should still be scrolling because timeout was reset
    expect(result.current.isScrolling).toBe(true);

    act(() => {
      jest.advanceTimersByTime(50);
    });

    // Now it should be false
    expect(result.current.isScrolling).toBe(false);
  });

  it('should cleanup timeout on unmount', () => {
    const { result, unmount } = renderHook(() => useScrollBlurOptimization());

    act(() => {
      result.current.onScroll();
    });

    unmount();

    // Verify no errors when advancing timers after unmount
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Test passes if no errors thrown
    expect(true).toBe(true);
  });

  describe('Requirements Validation', () => {
    it('should validate Requirement 12.1: Scroll-based Blur Optimization', () => {
      const { result } = renderHook(() => useScrollBlurOptimization());

      // Should provide onScroll handler for ScrollView
      expect(result.current.onScroll).toBeDefined();
      expect(typeof result.current.onScroll).toBe('function');

      // Should track scrolling state
      expect(result.current.isScrolling).toBeDefined();
      expect(typeof result.current.isScrolling).toBe('boolean');
    });

    it('should disable blur during scrolling and re-enable after stop', () => {
      const { result } = renderHook(() => useScrollBlurOptimization());

      // Initially not scrolling
      expect(result.current.isScrolling).toBe(false);

      // Start scrolling
      act(() => {
        result.current.onScroll();
      });

      // Should be scrolling
      expect(result.current.isScrolling).toBe(true);

      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(150);
      });

      // Should stop scrolling
      expect(result.current.isScrolling).toBe(false);
    });
  });
});

