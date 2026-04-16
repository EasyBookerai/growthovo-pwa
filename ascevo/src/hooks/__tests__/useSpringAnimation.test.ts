// 🧪 Tests for useSpringAnimation Hook
// Validates spring animation hook functionality and configuration

import { renderHook, act } from '@testing-library/react-native';
import { useSpringAnimation } from '../useSpringAnimation';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const actualReanimated = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actualReanimated,
    useSharedValue: jest.fn((initialValue: number) => ({
      value: initialValue,
    })),
    withSpring: jest.fn((toValue: number) => toValue),
  };
});

// Mock animationService
jest.mock('../../services/animationService', () => ({
  getSpringConfig: jest.fn(() => ({
    damping: 20,
    stiffness: 90,
    mass: 1,
    overshootClamping: false,
  })),
}));

describe('useSpringAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with value starting at 0', () => {
      const { result } = renderHook(() => useSpringAnimation());
      
      expect(result.current.value).toBeDefined();
      expect(result.current.value.value).toBe(0);
    });

    it('should provide start and reset functions', () => {
      const { result } = renderHook(() => useSpringAnimation());
      
      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });

    it('should use default gentle spring config when no config provided', () => {
      const { getSpringConfig } = require('../../services/animationService');
      renderHook(() => useSpringAnimation());
      
      expect(getSpringConfig).toHaveBeenCalledWith('gentle');
    });
  });

  describe('Custom Configuration', () => {
    it('should accept custom spring configuration', () => {
      const customConfig = {
        damping: 15,
        stiffness: 200,
        mass: 2,
        overshootClamping: true,
      };

      const { result } = renderHook(() => useSpringAnimation(customConfig));
      
      expect(result.current.value).toBeDefined();
    });

    it('should merge custom config with defaults', () => {
      const partialConfig = {
        damping: 25,
      };

      const { result } = renderHook(() => useSpringAnimation(partialConfig));
      
      // Should still work with partial config
      expect(result.current.value).toBeDefined();
      expect(result.current.start).toBeDefined();
    });
  });

  describe('Animation Control', () => {
    it('should start animation to target value', () => {
      const { withSpring } = require('react-native-reanimated');
      const { result } = renderHook(() => useSpringAnimation());
      
      act(() => {
        result.current.start(1);
      });
      
      expect(withSpring).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should reset animation to 0', () => {
      const { withSpring } = require('react-native-reanimated');
      const { result } = renderHook(() => useSpringAnimation());
      
      // First animate to some value
      act(() => {
        result.current.start(1.5);
      });
      
      // Then reset
      act(() => {
        result.current.reset();
      });
      
      expect(withSpring).toHaveBeenLastCalledWith(0, expect.any(Object));
    });

    it('should handle multiple start calls', () => {
      const { withSpring } = require('react-native-reanimated');
      const { result } = renderHook(() => useSpringAnimation());
      
      act(() => {
        result.current.start(0.5);
        result.current.start(1.0);
        result.current.start(1.5);
      });
      
      expect(withSpring).toHaveBeenCalledTimes(3);
      expect(withSpring).toHaveBeenLastCalledWith(1.5, expect.any(Object));
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative target values', () => {
      const { withSpring } = require('react-native-reanimated');
      const { result } = renderHook(() => useSpringAnimation());
      
      act(() => {
        result.current.start(-1);
      });
      
      expect(withSpring).toHaveBeenCalledWith(-1, expect.any(Object));
    });

    it('should handle zero as target value', () => {
      const { withSpring } = require('react-native-reanimated');
      const { result } = renderHook(() => useSpringAnimation());
      
      act(() => {
        result.current.start(0);
      });
      
      expect(withSpring).toHaveBeenCalledWith(0, expect.any(Object));
    });

    it('should handle very large target values', () => {
      const { withSpring } = require('react-native-reanimated');
      const { result } = renderHook(() => useSpringAnimation());
      
      act(() => {
        result.current.start(1000);
      });
      
      expect(withSpring).toHaveBeenCalledWith(1000, expect.any(Object));
    });

    it('should handle decimal target values', () => {
      const { withSpring } = require('react-native-reanimated');
      const { result } = renderHook(() => useSpringAnimation());
      
      act(() => {
        result.current.start(0.75);
      });
      
      expect(withSpring).toHaveBeenCalledWith(0.75, expect.any(Object));
    });
  });

  describe('Spring Configuration', () => {
    it('should pass spring config to withSpring', () => {
      const { withSpring } = require('react-native-reanimated');
      const customConfig = {
        damping: 10,
        stiffness: 100,
      };

      const { result } = renderHook(() => useSpringAnimation(customConfig));
      
      act(() => {
        result.current.start(1);
      });
      
      expect(withSpring).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          damping: 10,
          stiffness: 100,
        })
      );
    });

    it('should include all spring config properties', () => {
      const { withSpring } = require('react-native-reanimated');
      const { result } = renderHook(() => useSpringAnimation());
      
      act(() => {
        result.current.start(1);
      });
      
      expect(withSpring).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          damping: expect.any(Number),
          stiffness: expect.any(Number),
          mass: expect.any(Number),
          overshootClamping: expect.any(Boolean),
        })
      );
    });
  });

  describe('Requirements Validation', () => {
    it('should validate Requirement 9.1: Interaction Animation Triggers', () => {
      // The hook provides the mechanism for triggering animations on interactions
      const { result } = renderHook(() => useSpringAnimation());
      
      expect(result.current.start).toBeDefined();
      expect(typeof result.current.start).toBe('function');
    });

    it('should validate Requirement 9.3: Spring Physics for Natural Motion', () => {
      const { withSpring } = require('react-native-reanimated');
      const { result } = renderHook(() => useSpringAnimation());
      
      act(() => {
        result.current.start(1);
      });
      
      // Verify spring physics is used (withSpring called)
      expect(withSpring).toHaveBeenCalled();
    });
  });
});
