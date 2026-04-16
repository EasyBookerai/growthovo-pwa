// 🎯 Accessibility Helpers for Gamification Components
// Provides consistent accessibility labels and hints

import type { Achievement, DailyGoal, AchievementDefinition } from '../../types';

/**
 * Get accessibility label for achievement badge
 */
export function getAchievementAccessibilityLabel(
  achievement: AchievementDefinition,
  unlocked: boolean,
  unlockedAt?: string
): string {
  if (unlocked) {
    const unlockedDate = unlockedAt
      ? new Date(unlockedAt).toLocaleDateString()
      : 'recently';
    return `${achievement.title}, unlocked ${unlockedDate}. ${achievement.description}`;
  }
  
  return `${achievement.title}, locked. ${achievement.description}. Tap to view unlock requirements.`;
}

/**
 * Get accessibility hint for achievement badge
 */
export function getAchievementAccessibilityHint(unlocked: boolean): string {
  if (unlocked) {
    return 'Tap to view achievement details and unlock date';
  }
  return 'Tap to view how to unlock this achievement';
}

/**
 * Get accessibility label for daily goal card
 */
export function getDailyGoalAccessibilityLabel(goal: DailyGoal): string {
  const progress = Math.round((goal.currentValue / goal.targetValue) * 100);
  const completed = goal.completedAt ? 'completed' : 'in progress';
  
  return `${goal.title}, ${completed}, ${progress}% complete. ${goal.currentValue} of ${goal.targetValue}. Rewards ${goal.xpReward} XP. Difficulty: ${goal.difficulty}.`;
}

/**
 * Get accessibility hint for daily goal card
 */
export function getDailyGoalAccessibilityHint(goal: DailyGoal): string {
  if (goal.completedAt) {
    return 'Goal completed. Tap to view details.';
  }
  return 'Tap to view goal details and track progress';
}

/**
 * Get accessibility label for leaderboard entry
 */
export function getLeaderboardEntryAccessibilityLabel(
  rank: number,
  username: string,
  weeklyXp: number,
  isCurrentUser: boolean
): string {
  const userPrefix = isCurrentUser ? 'You are' : `${username} is`;
  return `${userPrefix} rank ${rank} with ${weeklyXp} XP this week`;
}

/**
 * Get accessibility label for celebration modal
 */
export function getCelebrationAccessibilityLabel(
  type: string,
  xpEarned?: number,
  newLevel?: number,
  streakMilestone?: number
): string {
  switch (type) {
    case 'lesson_complete':
      return `Lesson complete! You earned ${xpEarned || 0} XP.`;
    case 'level_up':
      return `Level up! You reached level ${newLevel || 0}.`;
    case 'streak_milestone':
      return `Streak milestone! You reached ${streakMilestone || 0} days.`;
    case 'achievement':
      return 'Achievement unlocked!';
    default:
      return 'Celebration';
  }
}

/**
 * Get accessibility label for progress ring
 */
export function getProgressRingAccessibilityLabel(
  progress: number,
  label?: string
): string {
  const percentage = Math.round(progress * 100);
  const labelText = label ? `${label}, ` : '';
  return `${labelText}${percentage}% complete`;
}

/**
 * Format XP value for screen readers
 */
export function formatXPForAccessibility(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)} thousand XP`;
  }
  return `${xp} XP`;
}

/**
 * Format streak count for screen readers
 */
export function formatStreakForAccessibility(streak: number): string {
  if (streak === 0) {
    return 'No active streak';
  }
  if (streak === 1) {
    return '1 day streak';
  }
  return `${streak} day streak`;
}

/**
 * Get accessibility announcement for milestone
 */
export function getMilestoneAnnouncement(milestone: number): string {
  return `Congratulations! You've reached a ${milestone} day streak milestone!`;
}

/**
 * Get accessibility label for difficulty badge
 */
export function getDifficultyAccessibilityLabel(
  difficulty: 'easy' | 'medium' | 'hard'
): string {
  const descriptions = {
    easy: 'Easy difficulty, suitable for beginners',
    medium: 'Medium difficulty, moderate challenge',
    hard: 'Hard difficulty, advanced challenge',
  };
  return descriptions[difficulty];
}

/**
 * Get accessibility label for category filter
 */
export function getCategoryAccessibilityLabel(
  category: string,
  isSelected: boolean
): string {
  const state = isSelected ? 'selected' : 'not selected';
  return `${category} category, ${state}`;
}

/**
 * Get accessibility hint for category filter
 */
export function getCategoryAccessibilityHint(): string {
  return 'Tap to filter achievements by this category';
}
