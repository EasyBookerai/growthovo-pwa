// 🧪 CelebrationModal Component Tests
// Tests for celebration modal with glassmorphism and confetti animations

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CelebrationModal from '../CelebrationModal';
import { CelebrationData } from '../../../services/animationService';
import { AchievementDefinition } from '../../../types';
import * as animationService from '../../../services/animationService';

// Mock dependencies
jest.mock('react-native-confetti-cannon', () => 'ConfettiCannon');
jest.mock('../../glass/GlassModal', () => {
  const { View } = require('react-native');
  return function GlassModal({ visible, children, onClose }: any) {
    return visible ? <View testID="glass-modal">{children}</View> : null;
  };
});

jest.mock('../../../services/animationService', () => ({
  ...jest.requireActual('../../../services/animationService'),
  triggerHaptic: jest.fn(),
  isReducedMotionEnabled: jest.fn().mockResolvedValue(false),
}));

jest.mock('../../../services/themeService', () => ({
  getResolvedTheme: jest.fn(() => ({
    text: '#000000',
    textSecondary: '#666666',
    cardBackground: '#FFFFFF',
  })),
}));

describe('CelebrationModal', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should render when visible', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
      };

      const { getByText, getByTestId } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(getByTestId('glass-modal')).toBeTruthy();
      expect(getByText('Lesson Complete!')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
      };

      const { queryByTestId } = render(
        <CelebrationModal visible={false} data={data} onComplete={mockOnComplete} />
      );

      expect(queryByTestId('glass-modal')).toBeNull();
    });

    it('should display subtitle when provided', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
        subtitle: 'Great work!',
      };

      const { getByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(getByText('Great work!')).toBeTruthy();
    });
  });

  describe('Celebration Types', () => {
    it('should display correct icon for lesson_complete', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
      };

      const { getByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(getByText('✅')).toBeTruthy();
    });

    it('should display correct icon for level_up', () => {
      const data: CelebrationData = {
        type: 'level_up',
        title: 'Level Up!',
      };

      const { getByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(getByText('⬆️')).toBeTruthy();
    });

    it('should display correct icon for streak_milestone', () => {
      const data: CelebrationData = {
        type: 'streak_milestone',
        title: 'Streak Milestone!',
      };

      const { getByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(getByText('🔥')).toBeTruthy();
    });

    it('should display correct icon for achievement', () => {
      const data: CelebrationData = {
        type: 'achievement',
        title: 'Achievement Unlocked!',
      };

      const { getByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(getByText('🏆')).toBeTruthy();
    });
  });

  describe('XP Display', () => {
    it('should display XP earned when provided', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
        xpEarned: 50,
      };

      const { getByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(getByText('XP Earned')).toBeTruthy();
      // Initial value is 0, will animate up
      expect(getByText(/\+\d+/)).toBeTruthy();
    });

    it('should animate XP counter to final value', async () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
        xpEarned: 100,
      };

      const { getByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      // Fast-forward timers to complete animation
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(getByText('+100')).toBeTruthy();
      });
    });

    it('should not display XP section when xpEarned is undefined', () => {
      const data: CelebrationData = {
        type: 'achievement',
        title: 'Achievement Unlocked!',
      };

      const { queryByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(queryByText('XP Earned')).toBeNull();
    });
  });

  describe('Level Display', () => {
    it('should display new level when provided', () => {
      const data: CelebrationData = {
        type: 'level_up',
        title: 'Level Up!',
        newLevel: 5,
      };

      const { getByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(getByText('New Level')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
    });

    it('should not display level section when newLevel is undefined', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
      };

      const { queryByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(queryByText('New Level')).toBeNull();
    });
  });

  describe('Streak Milestone Display', () => {
    it('should display streak milestone when provided', () => {
      const data: CelebrationData = {
        type: 'streak_milestone',
        title: 'Streak Milestone!',
        streakMilestone: 30,
      };

      const { getByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(getByText('30 Day Streak!')).toBeTruthy();
    });

    it('should not display streak section when streakMilestone is undefined', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
      };

      const { queryByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(queryByText(/Day Streak!/)).toBeNull();
    });
  });

  describe('Achievements Display', () => {
    it('should display unlocked achievements', () => {
      const achievementDefinitions: AchievementDefinition[] = [
        {
          id: 'streak_7',
          title: '7 Day Streak',
          description: 'Complete 7 days in a row',
          icon: '🔥',
          category: 'streak',
          criteria: { type: 'streak', threshold: 7 },
        },
      ];

      const data: CelebrationData = {
        type: 'achievement',
        title: 'Achievement Unlocked!',
        achievements: [{ id: 'streak_7', title: '7 Day Streak', icon: '🔥' }],
      };

      const { getByText } = render(
        <CelebrationModal
          visible={true}
          data={data}
          onComplete={mockOnComplete}
          achievementDefinitions={achievementDefinitions}
        />
      );

      expect(getByText('Achievements Unlocked')).toBeTruthy();
      expect(getByText('7 Day Streak')).toBeTruthy();
    });

    it('should display multiple achievements', () => {
      const data: CelebrationData = {
        type: 'achievement',
        title: 'Multiple Achievements!',
        achievements: [
          { id: 'achievement_1', title: 'First Achievement', icon: '🏆' },
          { id: 'achievement_2', title: 'Second Achievement', icon: '⭐' },
        ],
      };

      const { getByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(getByText('First Achievement')).toBeTruthy();
      expect(getByText('Second Achievement')).toBeTruthy();
    });

    it('should not display achievements section when empty', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
      };

      const { queryByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(queryByText('Achievements Unlocked')).toBeNull();
    });
  });

  describe('Skip Functionality', () => {
    it('should call onComplete when skip button is pressed', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
      };

      const { getByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      const skipButton = getByText('Skip');
      fireEvent.press(skipButton);

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('should have proper accessibility labels for skip button', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
      };

      const { getByLabelText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(getByLabelText('Skip celebration')).toBeTruthy();
    });
  });

  describe('Auto-dismiss Timer', () => {
    it('should auto-dismiss after default delay', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
        intensity: 'medium',
      };

      render(<CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />);

      // Default medium intensity = 3000ms
      jest.advanceTimersByTime(3000);

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('should auto-dismiss after high intensity delay', () => {
      const data: CelebrationData = {
        type: 'level_up',
        title: 'Level Up!',
        intensity: 'high',
      };

      render(<CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />);

      // High intensity = 4000ms
      jest.advanceTimersByTime(4000);

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('should auto-dismiss after low intensity delay', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
        intensity: 'low',
      };

      render(<CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />);

      // Low intensity = 2000ms
      jest.advanceTimersByTime(2000);

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('should use custom auto-dismiss delay when provided', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
      };

      render(
        <CelebrationModal
          visible={true}
          data={data}
          onComplete={mockOnComplete}
          autoDismissDelay={5000}
        />
      );

      jest.advanceTimersByTime(5000);

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('should clear timer when skip is pressed', () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
      };

      const { getByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      // Press skip before auto-dismiss
      jest.advanceTimersByTime(1000);
      fireEvent.press(getByText('Skip'));

      expect(mockOnComplete).toHaveBeenCalledTimes(1);

      // Advance past auto-dismiss time
      jest.advanceTimersByTime(3000);

      // Should still only be called once
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic feedback on mount', async () => {
      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
        intensity: 'medium',
      };

      render(<CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />);

      await waitFor(() => {
        expect(animationService.triggerHaptic).toHaveBeenCalledWith('medium');
      });
    });

    it('should trigger success haptic for high intensity', async () => {
      const data: CelebrationData = {
        type: 'level_up',
        title: 'Level Up!',
        intensity: 'high',
      };

      render(<CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />);

      await waitFor(() => {
        expect(animationService.triggerHaptic).toHaveBeenCalledWith('success');
      });
    });
  });

  describe('Reduced Motion', () => {
    it('should respect reduced motion preference', async () => {
      (animationService.isReducedMotionEnabled as jest.Mock).mockResolvedValue(true);

      const data: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
        xpEarned: 50,
      };

      render(<CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />);

      // Component should still render but with reduced animations
      await waitFor(() => {
        expect(animationService.isReducedMotionEnabled).toHaveBeenCalled();
      });
    });
  });

  describe('Complete Celebration Data', () => {
    it('should display all celebration data when provided', () => {
      const data: CelebrationData = {
        type: 'level_up',
        title: 'Amazing Progress!',
        subtitle: 'You are on fire!',
        xpEarned: 150,
        newLevel: 10,
        streakMilestone: 30,
        achievements: [
          { id: 'achievement_1', title: 'Master Learner', icon: '🎓' },
        ],
        intensity: 'high',
      };

      const { getByText } = render(
        <CelebrationModal visible={true} data={data} onComplete={mockOnComplete} />
      );

      expect(getByText('Amazing Progress!')).toBeTruthy();
      expect(getByText('You are on fire!')).toBeTruthy();
      expect(getByText('XP Earned')).toBeTruthy();
      expect(getByText('New Level')).toBeTruthy();
      expect(getByText('10')).toBeTruthy();
      expect(getByText('30 Day Streak!')).toBeTruthy();
      expect(getByText('Achievements Unlocked')).toBeTruthy();
      expect(getByText('Master Learner')).toBeTruthy();
    });
  });
});
