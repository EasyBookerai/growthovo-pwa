import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import DailyGoalCard from './DailyGoalCard';
import { DailyGoal } from '../../types';
import { spacing } from '../../theme';

/**
 * Example usage of DailyGoalCard component
 * 
 * This file demonstrates various states and configurations
 * of the DailyGoalCard component.
 */
export default function DailyGoalCardExample() {
  // Example goals with different states
  const goals: Array<{ goal: DailyGoal; progress: number }> = [
    // Easy goal - Not started
    {
      goal: {
        id: '1',
        userId: 'user-1',
        goalType: 'morning_checkin',
        targetValue: 1,
        currentValue: 0,
        xpReward: 10,
        difficulty: 'easy',
        date: '2025-01-15',
        createdAt: '2025-01-15T00:00:00Z',
      },
      progress: 0,
    },
    // Medium goal - In progress (25%)
    {
      goal: {
        id: '2',
        userId: 'user-1',
        goalType: 'complete_lessons',
        targetValue: 4,
        currentValue: 1,
        xpReward: 50,
        difficulty: 'medium',
        date: '2025-01-15',
        createdAt: '2025-01-15T00:00:00Z',
      },
      progress: 0.25,
    },
    // Medium goal - Half complete (50%)
    {
      goal: {
        id: '3',
        userId: 'user-1',
        goalType: 'earn_xp',
        targetValue: 100,
        currentValue: 50,
        xpReward: 30,
        difficulty: 'medium',
        date: '2025-01-15',
        createdAt: '2025-01-15T00:00:00Z',
      },
      progress: 0.5,
    },
    // Hard goal - Almost complete (75%)
    {
      goal: {
        id: '4',
        userId: 'user-1',
        goalType: 'complete_challenges',
        targetValue: 4,
        currentValue: 3,
        xpReward: 80,
        difficulty: 'hard',
        date: '2025-01-15',
        createdAt: '2025-01-15T00:00:00Z',
      },
      progress: 0.75,
    },
    // Easy goal - Completed
    {
      goal: {
        id: '5',
        userId: 'user-1',
        goalType: 'evening_debrief',
        targetValue: 1,
        currentValue: 1,
        xpReward: 15,
        difficulty: 'easy',
        date: '2025-01-15',
        completedAt: '2025-01-15T20:00:00Z',
        createdAt: '2025-01-15T00:00:00Z',
      },
      progress: 1,
    },
    // Hard goal - Completed
    {
      goal: {
        id: '6',
        userId: 'user-1',
        goalType: 'speaking_session',
        targetValue: 2,
        currentValue: 2,
        xpReward: 100,
        difficulty: 'hard',
        date: '2025-01-15',
        completedAt: '2025-01-15T18:30:00Z',
        createdAt: '2025-01-15T00:00:00Z',
      },
      progress: 1,
    },
  ];

  const handleGoalPress = (goalId: string) => {
    console.log('Goal pressed:', goalId);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {goals.map(({ goal, progress }) => (
        <View key={goal.id} style={styles.cardWrapper}>
          <DailyGoalCard
            goal={goal}
            progress={progress}
            onPress={() => handleGoalPress(goal.id)}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: spacing.md,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
});
