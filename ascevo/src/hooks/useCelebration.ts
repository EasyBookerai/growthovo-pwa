// 🎉 useCelebration Hook
// Manages celebration queue and sequential playback
// Ensures celebrations play one at a time with skip/fast-forward support

import { useState, useCallback, useRef, useEffect } from 'react';
import { CelebrationData } from '../services/animationService';

/**
 * Celebration type for triggering celebrations
 */
export type CelebrationType = 'lesson_complete' | 'level_up' | 'streak_milestone' | 'achievement';

/**
 * Return type for useCelebration hook
 */
export interface UseCelebrationReturn {
  trigger: (type: CelebrationType, data: Omit<CelebrationData, 'type'>) => void;
  isPlaying: boolean;
  queue: CelebrationData[];
  skip: () => void;
  fastForward: () => void;
  currentCelebration: CelebrationData | null;
}

/**
 * 🎯 useCelebration Hook
 * 
 * Manages celebration state and sequencing for achievement celebrations.
 * Queues multiple celebrations and plays them sequentially (one at a time).
 * Supports skip and fast-forward functionality.
 * 
 * @returns Object with trigger function, isPlaying state, queue, skip, fastForward, and currentCelebration
 * 
 * @example
 * ```tsx
 * const { trigger, isPlaying, currentCelebration, skip } = useCelebration();
 * 
 * // Trigger a celebration
 * trigger('lesson_complete', {
 *   title: 'Lesson Complete!',
 *   xpEarned: 50,
 * });
 * 
 * // Render celebration modal
 * {currentCelebration && (
 *   <CelebrationModal
 *     visible={isPlaying}
 *     data={currentCelebration}
 *     onSkip={skip}
 *   />
 * )}
 * ```
 * 
 * @example Multiple celebrations
 * ```tsx
 * // These will queue and play sequentially
 * trigger('lesson_complete', { title: 'Lesson Done!', xpEarned: 50 });
 * trigger('level_up', { title: 'Level Up!', newLevel: 5 });
 * trigger('achievement', { title: 'Achievement Unlocked!' });
 * ```
 * 
 * **Validates: Requirements 6.3, 6.5**
 */
export function useCelebration(): UseCelebrationReturn {
  // Queue of pending celebrations
  const [queue, setQueue] = useState<CelebrationData[]>([]);
  
  // Currently playing celebration
  const [currentCelebration, setCurrentCelebration] = useState<CelebrationData | null>(null);
  
  // Is a celebration currently playing
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Ref to track if we should auto-play next celebration
  const autoPlayRef = useRef(true);
  
  // Ref to store timeout for auto-dismiss
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Trigger a new celebration
   * Adds celebration to queue and starts playback if not already playing
   */
  const trigger = useCallback((type: CelebrationType, data: Omit<CelebrationData, 'type'>) => {
    const celebration: CelebrationData = {
      type,
      ...data,
    };
    
    setQueue((prevQueue) => [...prevQueue, celebration]);
  }, []);

  /**
   * Skip current celebration
   * Immediately moves to next celebration in queue
   */
  const skip = useCallback(() => {
    if (!isPlaying) return;
    
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Move to next celebration by setting isPlaying to false
    // This will trigger the useEffect to play the next one
    setIsPlaying(false);
    setCurrentCelebration(null);
  }, [isPlaying]);

  /**
   * Fast-forward current celebration
   * Skips animations but still shows the celebration briefly
   */
  const fastForward = useCallback(() => {
    if (!isPlaying) return;
    
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Show celebration briefly (500ms) then move to next
    timeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      setCurrentCelebration(null);
    }, 500);
  }, [isPlaying]);

  /**
   * Play next celebration from queue
   * Automatically called when queue changes and not currently playing
   */
  useEffect(() => {
    // If already playing or queue is empty, do nothing
    if (isPlaying || queue.length === 0) {
      return;
    }
    
    // Get next celebration from queue
    const [nextCelebration, ...remainingQueue] = queue;
    
    // Update state
    setQueue(remainingQueue);
    setCurrentCelebration(nextCelebration);
    setIsPlaying(true);
    
    // Auto-dismiss after duration based on intensity
    const intensity = nextCelebration.intensity || 'medium';
    const duration = intensity === 'high' ? 4000 : intensity === 'medium' ? 3000 : 2000;
    
    timeoutRef.current = setTimeout(() => {
      if (autoPlayRef.current) {
        setIsPlaying(false);
        setCurrentCelebration(null);
      }
    }, duration);
  }, [queue, isPlaying]);
  
  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return {
    trigger,
    isPlaying,
    queue,
    skip,
    fastForward,
    currentCelebration,
  };
}
