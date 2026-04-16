import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DailyGoalCard from '../DailyGoalCard';
import { DailyGoal } from '../../../types';

describe('DailyGoalCard', () => {
  const mockGoal: DailyGoal = {
    id: 'goal-1',
    userId: 'user-1',
    goalType: 'complete_lessons',
    targetValue: 3,
    currentValue: 1,
    xpReward: 50,
    difficulty: 'medium',
    date: '2025-01-15',
    createdAt: '2025-01-15T00:00:00Z',
  };

  describe('Rendering', () => {
    it('should render goal title correctly', () => {
      const { getByText } = render(
        <DailyGoalCard goal={mockGoal} progress={0.33} />
      );
      
      expect(getByText('Complete Lessons')).toBeTruthy();
    });

    it('should render goal description with progress', () => {
      const { getByText } = render(
        <DailyGoalCard goal={mockGoal} progress={0.33} />
      );
      
      expect(getByText(/Complete 3 lessons \(1\/3\)/)).toBeTruthy();
    });

    it('should render XP reward', () => {
      const { getByText } = render(
        <DailyGoalCard goal={mockGoal} progress={0.33} />
      );
      
      expect(getByText('+50 XP')).toBeTruthy();
    });

    it('should render difficulty badge', () => {
      const { getByText } = render(
        <DailyGoalCard goal={mockGoal} progress={0.33} />
      );
      
      expect(getByText('MEDIUM')).toBeTruthy();
    });

    it('should render progress percentage when not completed', () => {
      const { getByText } = render(
        <DailyGoalCard goal={mockGoal} progress={0.33} />
      );
      
      expect(getByText('33%')).toBeTruthy();
    });

    it('should render checkmark when completed', () => {
      const { getByText, queryByText } = render(
        <DailyGoalCard goal={mockGoal} progress={1} />
      );
      
      expect(getByText('✓')).toBeTruthy();
      expect(queryByText('100%')).toBeNull();
    });
  });

  describe('Difficulty Levels', () => {
    it('should render easy difficulty badge', () => {
      const easyGoal = { ...mockGoal, difficulty: 'easy' as const };
      const { getByText } = render(
        <DailyGoalCard goal={easyGoal} progress={0.5} />
      );
      
      expect(getByText('EASY')).toBeTruthy();
    });

    it('should render hard difficulty badge', () => {
      const hardGoal = { ...mockGoal, difficulty: 'hard' as const };
      const { getByText } = render(
        <DailyGoalCard goal={hardGoal} progress={0.5} />
      );
      
      expect(getByText('HARD')).toBeTruthy();
    });
  });

  describe('Goal Types', () => {
    it('should render earn_xp goal correctly', () => {
      const xpGoal: DailyGoal = {
        ...mockGoal,
        goalType: 'earn_xp',
        targetValue: 100,
        currentValue: 50,
      };
      const { getByText } = render(
        <DailyGoalCard goal={xpGoal} progress={0.5} />
      );
      
      expect(getByText('Earn XP')).toBeTruthy();
      expect(getByText(/Earn 100 XP today \(50\/100\)/)).toBeTruthy();
    });

    it('should render complete_challenges goal correctly', () => {
      const challengeGoal: DailyGoal = {
        ...mockGoal,
        goalType: 'complete_challenges',
        targetValue: 2,
        currentValue: 1,
      };
      const { getByText } = render(
        <DailyGoalCard goal={challengeGoal} progress={0.5} />
      );
      
      expect(getByText('Complete Challenges')).toBeTruthy();
      expect(getByText(/Complete 2 challenges \(1\/2\)/)).toBeTruthy();
    });

    it('should render morning_checkin goal correctly', () => {
      const checkinGoal: DailyGoal = {
        ...mockGoal,
        goalType: 'morning_checkin',
        targetValue: 1,
        currentValue: 0,
      };
      const { getByText } = render(
        <DailyGoalCard goal={checkinGoal} progress={0} />
      );
      
      expect(getByText('Morning Check-in')).toBeTruthy();
      expect(getByText('Complete your morning check-in')).toBeTruthy();
    });

    it('should render evening_debrief goal correctly', () => {
      const debriefGoal: DailyGoal = {
        ...mockGoal,
        goalType: 'evening_debrief',
        targetValue: 1,
        currentValue: 0,
      };
      const { getByText } = render(
        <DailyGoalCard goal={debriefGoal} progress={0} />
      );
      
      expect(getByText('Evening Debrief')).toBeTruthy();
      expect(getByText('Complete your evening debrief')).toBeTruthy();
    });

    it('should render speaking_session goal correctly', () => {
      const speakingGoal: DailyGoal = {
        ...mockGoal,
        goalType: 'speaking_session',
        targetValue: 2,
        currentValue: 1,
      };
      const { getByText } = render(
        <DailyGoalCard goal={speakingGoal} progress={0.5} />
      );
      
      expect(getByText('Speaking Session')).toBeTruthy();
      expect(getByText(/Complete 2 speaking sessions \(1\/2\)/)).toBeTruthy();
    });
  });

  describe('Progress States', () => {
    it('should show 0% for no progress', () => {
      const { getByText } = render(
        <DailyGoalCard goal={mockGoal} progress={0} />
      );
      
      expect(getByText('0%')).toBeTruthy();
    });

    it('should show 50% for half progress', () => {
      const { getByText } = render(
        <DailyGoalCard goal={mockGoal} progress={0.5} />
      );
      
      expect(getByText('50%')).toBeTruthy();
    });

    it('should show 75% for three-quarters progress', () => {
      const { getByText } = render(
        <DailyGoalCard goal={mockGoal} progress={0.75} />
      );
      
      expect(getByText('75%')).toBeTruthy();
    });

    it('should show checkmark for 100% progress', () => {
      const { getByText } = render(
        <DailyGoalCard goal={mockGoal} progress={1} />
      );
      
      expect(getByText('✓')).toBeTruthy();
    });

    it('should handle progress values over 1', () => {
      const { getByText } = render(
        <DailyGoalCard goal={mockGoal} progress={1.5} />
      );
      
      // Should clamp to 100%
      expect(getByText('✓')).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <DailyGoalCard goal={mockGoal} progress={0.5} onPress={onPress} />
      );
      
      const button = getByRole('button');
      fireEvent.press(button);
      
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not be pressable when onPress is not provided', () => {
      const { queryByRole } = render(
        <DailyGoalCard goal={mockGoal} progress={0.5} />
      );
      
      expect(queryByRole('button')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label for incomplete goal', () => {
      const { getByRole } = render(
        <DailyGoalCard
          goal={mockGoal}
          progress={0.33}
          onPress={() => {}}
        />
      );
      
      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toContain('Complete Lessons goal');
      expect(button.props.accessibilityLabel).toContain('33% complete');
    });

    it('should have correct accessibility label for completed goal', () => {
      const { getByRole } = render(
        <DailyGoalCard
          goal={mockGoal}
          progress={1}
          onPress={() => {}}
        />
      );
      
      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toContain('completed');
    });

    it('should have accessibility hint', () => {
      const { getByRole } = render(
        <DailyGoalCard
          goal={mockGoal}
          progress={0.5}
          onPress={() => {}}
        />
      );
      
      const button = getByRole('button');
      expect(button.props.accessibilityHint).toBe('Tap to view goal details');
    });
  });

  describe('Edge Cases', () => {
    it('should handle singular lesson count', () => {
      const singleLessonGoal: DailyGoal = {
        ...mockGoal,
        targetValue: 1,
        currentValue: 0,
      };
      const { getByText } = render(
        <DailyGoalCard goal={singleLessonGoal} progress={0} />
      );
      
      expect(getByText(/Complete 1 lesson \(0\/1\)/)).toBeTruthy();
    });

    it('should handle unknown goal type', () => {
      const unknownGoal: DailyGoal = {
        ...mockGoal,
        goalType: 'unknown_goal_type',
      };
      const { getByText } = render(
        <DailyGoalCard goal={unknownGoal} progress={0.5} />
      );
      
      // Should capitalize and format unknown goal types
      expect(getByText('Unknown Goal Type')).toBeTruthy();
    });

    it('should handle negative progress', () => {
      const { getByText } = render(
        <DailyGoalCard goal={mockGoal} progress={-0.5} />
      );
      
      // Should clamp to 0%
      expect(getByText('0%')).toBeTruthy();
    });
  });
});
