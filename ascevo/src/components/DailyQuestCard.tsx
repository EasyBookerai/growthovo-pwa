import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';
import { triggerHaptic } from '../services/webThemeService';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  xpReward: number;
  gemReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
}

interface Props {
  quest: DailyQuest;
  onPress?: () => void;
  onClaim?: () => void;
}

/**
 * Daily quest card component
 * Shows progress toward daily goals
 * Clear micro-goals create sense of achievement
 */
export default function DailyQuestCard({ quest, onPress, onClaim }: Props) {
  const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);
  const isComplete = quest.progress >= quest.target;

  const difficultyColors = {
    easy: '#16A34A',
    medium: '#F59E0B',
    hard: '#EF4444',
  };

  const difficultyColor = difficultyColors[quest.difficulty];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isComplete && styles.containerComplete,
        quest.completed && styles.containerClaimed,
      ]}
      onPress={() => {
        triggerHaptic('light');
        onPress?.();
      }}
      disabled={quest.completed}
      activeOpacity={0.8}
    >
      {/* Difficulty badge */}
      <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
        <Text style={styles.difficultyText}>{quest.difficulty.toUpperCase()}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{quest.title}</Text>
        <Text style={styles.description}>{quest.description}</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: isComplete ? colors.success : colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {quest.progress}/{quest.target}
          </Text>
        </View>

        {/* Rewards */}
        <View style={styles.rewardsRow}>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>+{quest.xpReward} XP</Text>
          </View>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>💎 {quest.gemReward}</Text>
          </View>
        </View>
      </View>

      {/* Claim button or status */}
      {quest.completed ? (
        <View style={styles.claimedBadge}>
          <Text style={styles.claimedText}>✓ Claimed</Text>
        </View>
      ) : isComplete ? (
        <TouchableOpacity
          style={styles.claimButton}
          onPress={(e) => {
            e.stopPropagation();
            triggerHaptic('medium');
            onClaim?.();
          }}
        >
          <Text style={styles.claimButtonText}>Claim</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  containerComplete: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  containerClaimed: {
    opacity: 0.6,
  },
  difficultyBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  difficultyText: {
    ...typography.caption,
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    paddingRight: 60,
  },
  title: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  rewardBadge: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  rewardText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  claimButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  claimButtonText: {
    ...typography.bodyBold,
    color: '#fff',
    fontSize: 14,
  },
  claimedBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.success + '20',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  claimedText: {
    ...typography.bodyBold,
    color: colors.success,
    fontSize: 14,
  },
});
