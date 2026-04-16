import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export interface BlurOptimizationConfig {
  /**
   * Whether to disable blur during scrolling
   * @default true
   */
  disableOnScroll?: boolean;

  /**
   * Delay in ms before re-enabling blur after scrolling stops
   * @default 150
   */
  scrollDebounceMs?: number;

  /**
   * Whether to check if element is in viewport
   * @default true
   */
  checkViewport?: boolean;

  /**
   * Whether blur optimization is enabled
   * @default true
   */
  enabled?: boolean;
}

export interface BlurOptimizationResult {
  /**
   * Whether blur should be applied
   */
  shouldBlur: boolean;

  /**
   * Whether the element is currently visible in viewport
   */
  isVisible: boolean;

  /**
   * Whether scrolling is currently happening
   */
  isScrolling: boolean;

  /**
   * Ref to attach to the element for viewport detection
   */
  ref: React.RefObject<any>;
}

/**
 * Hook for optimizing blur rendering performance
 * 
 * Features:
 * - Viewport detection: Only apply blur to visible elements
 * - Scroll detection: Disable blur during scrolling
 * - Automatic re-enable: Re-enable blur when scrolling stops
 * 
 * @param config - Configuration options
 * @returns Blur optimization state and ref
 */
export function useBlurOptimization(
  config: BlurOptimizationConfig = {}
): BlurOptimizationResult {
  const {
    disableOnScroll = true,
    scrollDebounceMs = 150,
    checkViewport = true,
    enabled = true,
  } = config;

  const elementRef = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll events
  useEffect(() => {
    if (!enabled || !disableOnScroll) {
      return;
    }

    const handleScroll = () => {
      // Set scrolling state
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set timeout to re-enable blur after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, scrollDebounceMs);
    };

    // Platform-specific scroll listener setup
    if (Platform.OS === 'web') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }

    // For React Native, scroll events are handled by ScrollView's onScroll prop
    // This hook provides the state, and components should pass onScroll handlers
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [enabled, disableOnScroll, scrollDebounceMs]);

  // Handle viewport detection
  useEffect(() => {
    if (!enabled || !checkViewport || Platform.OS !== 'web') {
      setIsVisible(true);
      return;
    }

    const element = elementRef.current;
    if (!element) {
      return;
    }

    // Check if IntersectionObserver is available (not available in some test environments)
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    // Use Intersection Observer for efficient viewport detection
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        // Consider element visible when at least 10% is in viewport
        threshold: 0.1,
        // Add some margin to start loading slightly before element enters viewport
        rootMargin: '50px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [enabled, checkViewport]);

  // Determine if blur should be applied
  const shouldBlur = enabled && isVisible && !isScrolling;

  return {
    shouldBlur,
    isVisible,
    isScrolling,
    ref: elementRef,
  };
}

/**
 * Hook for handling scroll events in React Native ScrollView
 * 
 * This provides a callback that can be passed to ScrollView's onScroll prop
 * to trigger blur optimization during scrolling.
 * 
 * @param onScrollingChange - Callback when scrolling state changes
 * @param debounceMs - Delay before considering scroll stopped
 * @returns onScroll handler for ScrollView
 */
export function useScrollBlurOptimization(
  onScrollingChange?: (isScrolling: boolean) => void,
  debounceMs: number = 150
) {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleScroll = () => {
    if (!isScrolling) {
      setIsScrolling(true);
      onScrollingChange?.(true);
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set timeout to detect scroll stop
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      onScrollingChange?.(false);
    }, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    onScroll: handleScroll,
    isScrolling,
  };
}
