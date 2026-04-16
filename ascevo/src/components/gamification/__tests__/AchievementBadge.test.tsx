import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AchievementBadge from '../AchievementBadge';
import { AchievementDefinition } from '../../../types';

describe('AchievementBadge', () => {
  const mockAchievement: AchievementDefinition = {
    id: 'streak_7',
    title: '7 Day Warrior',
    description: 'Complete 7 days in a row',
    icon: '🔥',
    category: 'streak',
    criteria: {
      type: 'streak',
      threshold: 7,
    },
  };

  describe('Unlocked State', () => {
    it('should render unlocked badge with full color and icon', () => {
      const { getByText } = render(
        <AchievementBadge achievement={mockAchievement} unlocked={true} />
      );

      expect(getByText('🔥')).toBeTruthy();
      expect(getByText('7 Day Warrior')).toBeTruthy();
    });

    it('should not show lock icon when unlocked', () => {
      const { queryByText } = render(
        <AchievementBadge achievement={mockAchievement} unlocked={true} />
      );

      expect(queryByText('🔒')).toBeNull();
    });

    it('should not show unlock requirements when unlocked', () => {
      const { queryByText } = render(
        <AchievementBadge achievement={mockAchievement} unlocked={true} />
      );

      expect(queryByText(/Reach 7 day streak/)).toBeNull();
    });
  });

  describe('Locked State', () => {
    it('should render locked badge as silhouette with lock icon', () => {
      const { getByText, queryByText } = render(
        <AchievementBadge achievement={mockAchievement} unlocked={false} />
      );

      expect(getByText('🔒')).toBeTruthy();
      expect(queryByText('🔥')).toBeNull();
    });

    it('should display unlock requirements for locked badges', () => {
      const { getByText } = render(
        <AchievementBadge achievement={mockAchievement} unlocked={false} />
      );

      expect(getByText('Reach 7 day streak')).toBeTruthy();
    });

    it('should show title for locked badges', () => {
      const { getByText } = render(
        <AchievementBadge achievement={mockAchievement} unlocked={false} />
      );

      expect(getByText('7 Day Warrior')).toBeTruthy();
    });
  });

  describe('Size Variants', () => {
    it('should render small size variant', () => {
      const { getByText } = render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={true}
          size="small"
        />
      );

      // Small variant should show icon but not title
      expect(getByText('🔥')).toBeTruthy();
    });

    it('should render medium size variant with title', () => {
      const { getByText } = render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={true}
          size="medium"
        />
      );

      expect(getByText('🔥')).toBeTruthy();
      expect(getByText('7 Day Warrior')).toBeTruthy();
    });

    it('should render large size variant with category badge', () => {
      const { getByText } = render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={true}
          size="large"
        />
      );

      expect(getByText('🔥')).toBeTruthy();
      expect(getByText('7 Day Warrior')).toBeTruthy();
      expect(getByText('STREAK')).toBeTruthy();
    });

    it('should not show title in small variant', () => {
      const { queryByText } = render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={true}
          size="small"
        />
      );

      expect(queryByText('7 Day Warrior')).toBeNull();
    });

    it('should not show requirements in small locked variant', () => {
      const { queryByText } = render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={false}
          size="small"
        />
      );

      expect(queryByText(/Reach 7 day streak/)).toBeNull();
    });
  });

  describe('Achievement Categories', () => {
    it('should render streak category achievement', () => {
      const streakAchievement: AchievementDefinition = {
        ...mockAchievement,
        category: 'streak',
      };

      const { getByText } = render(
        <AchievementBadge
          achievement={streakAchievement}
          unlocked={true}
          size="large"
        />
      );

      expect(getByText('STREAK')).toBeTruthy();
    });

    it('should render lessons category achievement', () => {
      const lessonsAchievement: AchievementDefinition = {
        ...mockAchievement,
        category: 'lessons',
        icon: '📚',
      };

      const { getByText } = render(
        <AchievementBadge
          achievement={lessonsAchievement}
          unlocked={true}
          size="large"
        />
      );

      expect(getByText('LESSONS')).toBeTruthy();
    });

    it('should render social category achievement', () => {
      const socialAchievement: AchievementDefinition = {
        ...mockAchievement,
        category: 'social',
        icon: '👥',
      };

      const { getByText } = render(
        <AchievementBadge
          achievement={socialAchievement}
          unlocked={true}
          size="large"
        />
      );

      expect(getByText('SOCIAL')).toBeTruthy();
    });

    it('should render special category achievement', () => {
      const specialAchievement: AchievementDefinition = {
        ...mockAchievement,
        category: 'special',
        icon: '⭐',
      };

      const { getByText } = render(
        <AchievementBadge
          achievement={specialAchievement}
          unlocked={true}
          size="large"
        />
      );

      expect(getByText('SPECIAL')).toBeTruthy();
    });
  });

  describe('Unlock Requirements Display', () => {
    it('should display streak requirement correctly', () => {
      const achievement: AchievementDefinition = {
        ...mockAchievement,
        criteria: { type: 'streak', threshold: 30 },
      };

      const { getByText } = render(
        <AchievementBadge achievement={achievement} unlocked={false} />
      );

      expect(getByText('Reach 30 day streak')).toBeTruthy();
    });

    it('should display XP total requirement correctly', () => {
      const achievement: AchievementDefinition = {
        ...mockAchievement,
        criteria: { type: 'xp_total', threshold: 1000 },
      };

      const { getByText } = render(
        <AchievementBadge achievement={achievement} unlocked={false} />
      );

      expect(getByText('Earn 1000 total XP')).toBeTruthy();
    });

    it('should display lessons count requirement correctly', () => {
      const achievement: AchievementDefinition = {
        ...mockAchievement,
        criteria: { type: 'lessons_count', threshold: 50 },
      };

      const { getByText } = render(
        <AchievementBadge achievement={achievement} unlocked={false} />
      );

      expect(getByText('Complete 50 lessons')).toBeTruthy();
    });

    it('should display level requirement correctly', () => {
      const achievement: AchievementDefinition = {
        ...mockAchievement,
        criteria: { type: 'level', threshold: 10 },
      };

      const { getByText } = render(
        <AchievementBadge achievement={achievement} unlocked={false} />
      );

      expect(getByText('Reach level 10')).toBeTruthy();
    });

    it('should display custom requirement using description', () => {
      const achievement: AchievementDefinition = {
        ...mockAchievement,
        description: 'Join a squad and complete 5 challenges',
        criteria: { type: 'custom', threshold: 1 },
      };

      const { getByText } = render(
        <AchievementBadge achievement={achievement} unlocked={false} />
      );

      expect(getByText('Join a squad and complete 5 challenges')).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('should call onPress when badge is pressed', () => {
      const onPress = jest.fn();

      const { getByRole } = render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={true}
          onPress={onPress}
        />
      );

      const button = getByRole('button');
      fireEvent.press(button);

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not be pressable when onPress is not provided', () => {
      const { queryByRole } = render(
        <AchievementBadge achievement={mockAchievement} unlocked={true} />
      );

      expect(queryByRole('button')).toBeNull();
    });

    it('should have correct accessibility label for unlocked badge', () => {
      const { getByLabelText } = render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={true}
          onPress={() => {}}
        />
      );

      expect(getByLabelText('7 Day Warrior achievement, unlocked')).toBeTruthy();
    });

    it('should have correct accessibility label for locked badge', () => {
      const { getByLabelText } = render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={false}
          onPress={() => {}}
        />
      );

      expect(getByLabelText('7 Day Warrior achievement, locked')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle achievement with very long title', () => {
      const longTitleAchievement: AchievementDefinition = {
        ...mockAchievement,
        title: 'This is a very long achievement title that should be truncated',
      };

      const { getByText } = render(
        <AchievementBadge achievement={longTitleAchievement} unlocked={true} />
      );

      expect(getByText('This is a very long achievement title that should be truncated')).toBeTruthy();
    });

    it('should handle achievement with no icon', () => {
      const noIconAchievement: AchievementDefinition = {
        ...mockAchievement,
        icon: '',
      };

      const { getByText } = render(
        <AchievementBadge achievement={noIconAchievement} unlocked={true} />
      );

      // Should still render the title even without an icon
      expect(getByText('7 Day Warrior')).toBeTruthy();
    });

    it('should handle achievement with threshold of 0', () => {
      const zeroThresholdAchievement: AchievementDefinition = {
        ...mockAchievement,
        criteria: { type: 'streak', threshold: 0 },
      };

      const { getByText } = render(
        <AchievementBadge achievement={zeroThresholdAchievement} unlocked={false} />
      );

      expect(getByText('Reach 0 day streak')).toBeTruthy();
    });
  });
});
