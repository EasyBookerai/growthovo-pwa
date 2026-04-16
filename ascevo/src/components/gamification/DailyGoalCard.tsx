import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '../../theme';
import GlassCard from '../glass/GlassCard';
import ProgressRing from './ProgressRing';
import { DailyGoal } from '../../types';
import { getDailyGoalAccessibilityLabel, getDailyGoalAccessibilityHint } from './accessibility';
import { getDailyGoalCardWidth } from './responsive';

export interface DailyGoalCardProps {
  goal: DailyGoal;
  progress: number; // 0-1 (0% to 100%)
  onPress?: () => void;
}

/**
 * DailyGoalCard - Daily challenge progress card
 * 
 * Features:
 * - Display goal title, description, and difficulty badge
 * - Show progress ring with percentage
 * - Display XP reward
 * - Add completion checkmark animation
 * - Support onPress for goal details
 * 
 * Requirements: 4.1, 4.2, 4.3
 */
export default function DailyGoalCard({
  goal,
  progress,
  onPress,
}: DailyGoalCardProps) {
  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const isCompleted = clampedProgress >= 1;
  const progressPercentage = Math.round(clampedProgress * 100);
  
  // Animation for completion checkmark
  const checkmarkScale = useSharedValue(isCompleted ? 1 : 0);
  const checkmarkOpacity = useSharedValue(isCompleted ? 1 : 0);

  // Trigger checkmark animation when completed
  React.useEffect(() => {
    if (isCompleted) {
      checkmarkScale.value = withSequence(
        withSpring(1.3, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );
      checkmarkOpacity.value = withTiming(1, { duration: 300 });
    } else {
      checkmarkScale.value = withTiming(0, { duration: 200 });
      checkmarkOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isCompleted]);

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkOpacity.value,
  }));

  const difficultyColor = getDifficultyColor(goal.difficulty);
  const progressColor = getProgressColor(clampedProgress);

  const cardStyle: ViewStyle = {
    ...styles.card,
    width: getDailyGoalCardWidth(),
    ...(isCompleted ? styles.completedCard : {}),
  };

  const content = (
    <GlassCard
      intensity="medium"
      style={cardStyle}
      onPress={onPress}
      accessibilityLabel={getDailyGoalAccessibilityLabel(goal)}
      accessibilityHint={getDailyGoalAccessibilityHint(goal)}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityState={{ disabled: !onPress, checked: isCompleted }}
    >
      <View style={styles.container}>
        {/* Left side: Progress Ring */}
        <View style={styles.progressContainer}>
          <ProgressRing
            progress={clampedProgress}
            size={80}
            strokeWidth={6}
            color={progressColor}
            backgroundColor="rgba(255, 255, 255, 0.1)"
            animated={true}
          >
            {isCompleted ? (
              <Animated.View style={[styles.checkmarkContainer, checkmarkAnimatedStyle]}>
                <Text style={styles.checkmark}>✓</Text>
              </Animated.View>
            ) : (
              <Text style={styles.progressText}>{progressPercentage}%</Text>
            )}
          </ProgressRing>
        </View>

        {/* Right side: Goal Info */}
        <View style={styles.infoContainer}>
          {/* Difficulty Badge */}
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
            <Text style={styles.difficultyText}>
              {getDifficultyLabel(goal.difficulty)}
            </Text>
          </View>

          {/* Goal Title */}
          <Text style={styles.title} numberOfLines={2}>
            {getGoalTitle(goal.goalType)}
          </Text>

          {/* Goal Description */}
          <Text style={styles.description} numberOfLines={2}>
            {getGoalDescription(goal)}
          </Text>

          {/* XP Reward */}
          <View style={styles.xpContainer}>
            <Text style={styles.xpIcon}>⭐</Text>
            <Text style={styles.xpText}>+{goal.xpReward} XP</Text>
          </View>
        </View>
      </View>
    </GlassCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${getGoalTitle(goal.goalType)} goal, ${progressPercentage}% complete${isCompleted ? ', completed' : ''}`}
        accessibilityHint="Tap to view goal details"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

/**
 * Get color for difficulty level
 */
function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy':
      return colors.success;
    case 'medium':
      return colors.warning;
    case 'hard':
      return colors.error;
    default:
      return colors.info;
  }
}

/**
 * Get color for progress level
 */
function getProgressColor(progress: number): string {
  if (progress >= 1) {
    return colors.success; // Complete
  } else if (progress >= 0.5) {
    return colors.xpGold; // High progress
  } else if (progress >= 0.25) {
    return colors.warning; // Medium progress
  } else {
    return colors.info; // Low progress
  }
}

/**
 * Get human-readable difficulty label
 */
function getDifficultyLabel(difficulty: 'easy' | 'medium' | 'hard'): string {
  const labels: Record<'easy' | 'medium' | 'hard', string> = {
    easy: 'EASY',
    medium: 'MEDIUM',
    hard: 'HARD',
  };
  return labels[difficulty] || difficulty.toUpperCase();
}

/**
 * Get human-readable goal title from goal type
 */
function getGoalTitle(goalType: string): string {
  switch (goalType) {
    case 'complete_lessons':
      return 'Complete Lessons';
    case 'earn_xp':
      return 'Earn XP';
    case 'complete_challenges':
      return 'Complete Challenges';
    case 'maintain_streak':
      return 'Maintain Streak';
    case 'morning_checkin':
      return 'Morning Check-in';
    case 'evening_debrief':
      return 'Evening Debrief';
    case 'speaking_session':
      return 'Speaking Session';
    default:
      return goalType.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
  }
}

/**
 * Get human-readable goal description
 */
function getGoalDescription(goal: DailyGoal): string {
  const { goalType, targetValue, currentValue } = goal;
  
  switch (goalType) {
    case 'complete_lessons':
      return `Complete ${targetValue} lesson${targetValue > 1 ? 's' : ''} (${currentValue}/${targetValue})`;
    case 'earn_xp':
      return `Earn ${targetValue} XP today (${currentValue}/${targetValue})`;
    case 'complete_challenges':
      return `Complete ${targetValue} challenge${targetValue > 1 ? 's' : ''} (${currentValue}/${targetValue})`;
    case 'maintain_streak':
      return `Keep your streak alive today`;
    case 'morning_checkin':
      return `Complete your morning check-in`;
    case 'evening_debrief':
      return `Complete your evening debrief`;
    case 'speaking_session':
      return `Complete ${targetValue} speaking session${targetValue > 1 ? 's' : ''} (${currentValue}/${targetValue})`;
    default:
      return `Progress: ${currentValue}/${targetValue}`;
  }
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  completedCard: {
    borderColor: colors.success,
    borderWidth: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    marginRight: spacing.md,
  },
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 36,
    color: colors.success,
    fontWeight: '700',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  infoContainer: {
    flex: 1,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  difficultyText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text,
    fontWeight: '700',
  },
  title: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  xpText: {
    ...typography.smallBold,
    color: colors.xpGold,
  },
});
