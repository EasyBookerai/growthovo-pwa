// 🧪 Animation Service Tests
// Unit tests for animation configurations, haptic feedback, and accessibility

import {
  ANIMATION_CONFIGS,
  triggerHaptic,
  isReducedMotionEnabled,
  createCelebrationSequence,
  getSpringConfig,
  getTimingDuration,
  setAnimationsEnabled,
  areAnimationsEnabled,
  CelebrationData,
} from '../services/animationService';
import { Platform, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

// Use manual mock
jest.mock('expo-haptics');

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios),
}));

describe('animationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ANIMATION_CONFIGS', () => {
    it('should have spring configurations with correct properties', () => {
      expect(ANIMATION_CONFIGS.spring.gentle).toEqual({
        damping: 20,
        stiffness: 90,
        mass: 1,
        overshootClamping: false,
      });

      expect(ANIMATION_CONFIGS.spring.bouncy).toEqual({
        damping: 10,
        stiffness: 100,
        mass: 1,
        overshootClamping: false,
      });

      expect(ANIMATION_CONFIGS.spring.stiff).toEqual({
        damping: 15,
        stiffness: 200,
        mass: 1,
        overshootClamping: false,
      });
    });

    it('should have timing configurations', () => {
      expect(ANIMATION_CONFIGS.timing.fast).toBe(200);
      expect(ANIMATION_CONFIGS.timing.normal).toBe(300);
      expect(ANIMATION_CONFIGS.timing.slow).toBe(500);
    });

    it('should have progressive timing values', () => {
      expect(ANIMATION_CONFIGS.timing.fast).toBeLessThan(ANIMATION_CONFIGS.timing.normal);
      expect(ANIMATION_CONFIGS.timing.normal).toBeLessThan(ANIMATION_CONFIGS.timing.slow);
    });
  });

  describe('triggerHaptic', () => {
    it('should trigger light haptic feedback', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      
      await triggerHaptic('light');
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should trigger medium haptic feedback', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      
      await triggerHaptic('medium');
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    it('should trigger heavy haptic feedback', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      
      await triggerHaptic('heavy');
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });

    it('should trigger success notification haptic', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      
      await triggerHaptic('success');
      
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('should trigger warning notification haptic', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      
      await triggerHaptic('warning');
      
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
    });

    it('should trigger error notification haptic', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      
      await triggerHaptic('error');
      
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });

    it('should not trigger haptic when reduced motion is enabled', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
      
      await triggerHaptic('medium');
      
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    });

    it('should not trigger haptic on web platform', async () => {
      (Platform as any).OS = 'web';
      
      await triggerHaptic('light');
      
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
      
      // Reset platform
      (Platform as any).OS = 'ios';
    });

    it('should handle haptic errors gracefully', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(new Error('Haptic unavailable'));
      
      // Should not throw
      await expect(triggerHaptic('light')).resolves.toBeUndefined();
    });
  });

  describe('isReducedMotionEnabled', () => {
    it('should return false when reduced motion is disabled', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      
      const result = await isReducedMotionEnabled();
      
      expect(result).toBe(false);
    });

    it('should return true when reduced motion is enabled', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
      
      const result = await isReducedMotionEnabled();
      
      expect(result).toBe(true);
    });

    it('should check media query on web platform', async () => {
      (Platform as any).OS = 'web';
      
      const mockMatchMedia = jest.fn().mockReturnValue({ matches: true });
      (global as any).window = { matchMedia: mockMatchMedia };
      
      const result = await isReducedMotionEnabled();
      
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
      expect(result).toBe(true);
      
      // Cleanup
      delete (global as any).window;
      (Platform as any).OS = 'ios';
    });

    it('should return false if accessibility check fails', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockRejectedValue(
        new Error('Not available')
      );
      
      const result = await isReducedMotionEnabled();
      
      expect(result).toBe(false);
    });
  });

  describe('createCelebrationSequence', () => {
    it('should create sequence for single celebration', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      
      const celebrations: CelebrationData[] = [
        {
          type: 'lesson_complete',
          title: 'Lesson Complete!',
          xpEarned: 50,
          intensity: 'medium',
        },
      ];
      
      const sequence = await createCelebrationSequence(celebrations);
      
      expect(sequence.steps.length).toBeGreaterThan(0);
      expect(sequence.totalDuration).toBeGreaterThan(0);
      expect(sequence.steps).toContainEqual(
        expect.objectContaining({ action: 'fade' })
      );
      expect(sequence.steps).toContainEqual(
        expect.objectContaining({ action: 'scale' })
      );
      expect(sequence.steps).toContainEqual(
        expect.objectContaining({ action: 'haptic' })
      );
      expect(sequence.steps).toContainEqual(
        expect.objectContaining({ action: 'confetti' })
      );
    });

    it('should create sequence for multiple celebrations', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      
      const celebrations: CelebrationData[] = [
        {
          type: 'lesson_complete',
          title: 'Lesson Complete!',
          xpEarned: 50,
        },
        {
          type: 'level_up',
          title: 'Level Up!',
          newLevel: 5,
        },
      ];
      
      const sequence = await createCelebrationSequence(celebrations);
      
      expect(sequence.steps.length).toBeGreaterThan(4); // More than one celebration
      expect(sequence.totalDuration).toBeGreaterThan(1000);
    });

    it('should simplify sequence when reduced motion is enabled', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
      
      const celebrations: CelebrationData[] = [
        {
          type: 'achievement',
          title: 'Achievement Unlocked!',
          intensity: 'high',
        },
      ];
      
      const sequence = await createCelebrationSequence(celebrations);
      
      // Should have fade and haptic, but no scale or confetti
      expect(sequence.steps).toContainEqual(
        expect.objectContaining({ action: 'fade' })
      );
      expect(sequence.steps).toContainEqual(
        expect.objectContaining({ action: 'haptic' })
      );
      
      // Should not have scale when reduced motion
      const scaleSteps = sequence.steps.filter(s => s.action === 'scale');
      expect(scaleSteps.length).toBe(0);
      
      // Confetti duration should be 0
      const confettiSteps = sequence.steps.filter(s => s.action === 'confetti');
      confettiSteps.forEach(step => {
        expect(step.duration).toBe(0);
      });
    });

    it('should use high intensity for high intensity celebrations', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      
      const celebrations: CelebrationData[] = [
        {
          type: 'streak_milestone',
          title: '100 Day Streak!',
          streakMilestone: 100,
          intensity: 'high',
        },
      ];
      
      const sequence = await createCelebrationSequence(celebrations);
      
      const confettiStep = sequence.steps.find(s => s.action === 'confetti');
      expect(confettiStep?.duration).toBe(2000); // High intensity = 2s confetti
      
      const hapticStep = sequence.steps.find(s => s.action === 'haptic');
      expect(hapticStep?.params?.type).toBe('success');
    });

    it('should default to medium intensity if not specified', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      
      const celebrations: CelebrationData[] = [
        {
          type: 'lesson_complete',
          title: 'Done!',
        },
      ];
      
      const sequence = await createCelebrationSequence(celebrations);
      
      const confettiStep = sequence.steps.find(s => s.action === 'confetti');
      expect(confettiStep?.duration).toBe(1000); // Medium intensity = 1s confetti
    });
  });

  describe('getSpringConfig', () => {
    it('should return gentle spring config', () => {
      const config = getSpringConfig('gentle');
      expect(config).toEqual(ANIMATION_CONFIGS.spring.gentle);
    });

    it('should return bouncy spring config', () => {
      const config = getSpringConfig('bouncy');
      expect(config).toEqual(ANIMATION_CONFIGS.spring.bouncy);
    });

    it('should return stiff spring config', () => {
      const config = getSpringConfig('stiff');
      expect(config).toEqual(ANIMATION_CONFIGS.spring.stiff);
    });
  });

  describe('getTimingDuration', () => {
    it('should return fast timing duration', () => {
      const duration = getTimingDuration('fast');
      expect(duration).toBe(200);
    });

    it('should return normal timing duration', () => {
      const duration = getTimingDuration('normal');
      expect(duration).toBe(300);
    });

    it('should return slow timing duration', () => {
      const duration = getTimingDuration('slow');
      expect(duration).toBe(500);
    });
  });

  describe('animations enabled state', () => {
    it('should set and get animations enabled state', () => {
      setAnimationsEnabled(false);
      expect(areAnimationsEnabled()).toBe(false);
      
      setAnimationsEnabled(true);
      expect(areAnimationsEnabled()).toBe(true);
    });

    it('should default to enabled', () => {
      // Reset to default
      setAnimationsEnabled(true);
      expect(areAnimationsEnabled()).toBe(true);
    });
  });
});
