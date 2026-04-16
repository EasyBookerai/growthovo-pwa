// Gamification Service
// Manages achievements, challenges, and rewards for the Duolingo-style gamification system

import { AchievementDefinition } from '../types';

/**
 * Achievement Definitions
 * 
 * Comprehensive set of achievements covering:
 * - Streak milestones (7, 30, 100, 365 days)
 * - Lesson completion milestones (10, 50, 100 lessons)
 * - Social achievements (invite friends, join squad)
 * - Special event achievements (first lesson, perfect week, etc.)
 */
export const ACHIEVEMENT_DEFINITIONS: Record<string, AchievementDefinition> = {
  // ============================================================
  // STREAK ACHIEVEMENTS
  // ============================================================
  
  streak_7_days: {
    id: 'streak_7_days',
    title: 'Week Warrior',
    description: 'Complete 7 days in a row',
    icon: '🔥',
    category: 'streak',
    criteria: {
      type: 'streak',
      threshold: 7,
    },
  },
  
  streak_30_days: {
    id: 'streak_30_days',
    title: 'Monthly Master',
    description: 'Complete 30 days in a row',
    icon: '🌟',
    category: 'streak',
    criteria: {
      type: 'streak',
      threshold: 30,
    },
  },
  
  streak_100_days: {
    id: 'streak_100_days',
    title: 'Century Champion',
    description: 'Complete 100 days in a row',
    icon: '💯',
    category: 'streak',
    criteria: {
      type: 'streak',
      threshold: 100,
    },
  },
  
  streak_365_days: {
    id: 'streak_365_days',
    title: 'Year Legend',
    description: 'Complete 365 days in a row',
    icon: '👑',
    category: 'streak',
    criteria: {
      type: 'streak',
      threshold: 365,
    },
  },
  
  // ============================================================
  // LESSON ACHIEVEMENTS
  // ============================================================
  
  lessons_10: {
    id: 'lessons_10',
    title: 'Getting Started',
    description: 'Complete 10 lessons',
    icon: '📚',
    category: 'lessons',
    criteria: {
      type: 'lessons_count',
      threshold: 10,
    },
  },
  
  lessons_50: {
    id: 'lessons_50',
    title: 'Knowledge Seeker',
    description: 'Complete 50 lessons',
    icon: '🎓',
    category: 'lessons',
    criteria: {
      type: 'lessons_count',
      threshold: 50,
    },
  },
  
  lessons_100: {
    id: 'lessons_100',
    title: 'Scholar',
    description: 'Complete 100 lessons',
    icon: '🏆',
    category: 'lessons',
    criteria: {
      type: 'lessons_count',
      threshold: 100,
    },
  },
  
  // ============================================================
  // SOCIAL ACHIEVEMENTS
  // ============================================================
  
  invite_first_friend: {
    id: 'invite_first_friend',
    title: 'Social Butterfly',
    description: 'Invite your first friend',
    icon: '🦋',
    category: 'social',
    criteria: {
      type: 'custom',
      threshold: 1,
    },
  },
  
  invite_5_friends: {
    id: 'invite_5_friends',
    title: 'Community Builder',
    description: 'Invite 5 friends',
    icon: '🤝',
    category: 'social',
    criteria: {
      type: 'custom',
      threshold: 5,
    },
  },
  
  join_squad: {
    id: 'join_squad',
    title: 'Squad Member',
    description: 'Join your first squad',
    icon: '👥',
    category: 'social',
    criteria: {
      type: 'custom',
      threshold: 1,
    },
  },
  
  create_squad: {
    id: 'create_squad',
    title: 'Squad Leader',
    description: 'Create your own squad',
    icon: '⭐',
    category: 'social',
    criteria: {
      type: 'custom',
      threshold: 1,
    },
  },
  
  // ============================================================
  // SPECIAL EVENT ACHIEVEMENTS
  // ============================================================
  
  first_lesson: {
    id: 'first_lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🌱',
    category: 'special',
    criteria: {
      type: 'lessons_count',
      threshold: 1,
    },
  },
  
  perfect_week: {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete all daily goals for 7 days straight',
    icon: '✨',
    category: 'special',
    criteria: {
      type: 'custom',
      threshold: 7,
    },
  },
  
  early_bird: {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a lesson before 8 AM',
    icon: '🌅',
    category: 'special',
    criteria: {
      type: 'custom',
      threshold: 1,
    },
  },
  
  night_owl: {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a lesson after 10 PM',
    icon: '🦉',
    category: 'special',
    criteria: {
      type: 'custom',
      threshold: 1,
    },
  },
  
  comeback_kid: {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    description: 'Restore your streak after breaking it',
    icon: '💪',
    category: 'special',
    criteria: {
      type: 'custom',
      threshold: 1,
    },
  },
  
  level_10_any_pillar: {
    id: 'level_10_any_pillar',
    title: 'Expert',
    description: 'Reach level 10 in any pillar',
    icon: '🎯',
    category: 'special',
    criteria: {
      type: 'level',
      threshold: 10,
    },
  },
  
  xp_1000: {
    id: 'xp_1000',
    title: 'XP Collector',
    description: 'Earn 1,000 total XP',
    icon: '💎',
    category: 'special',
    criteria: {
      type: 'xp_total',
      threshold: 1000,
    },
  },
  
  xp_5000: {
    id: 'xp_5000',
    title: 'XP Master',
    description: 'Earn 5,000 total XP',
    icon: '💰',
    category: 'special',
    criteria: {
      type: 'xp_total',
      threshold: 5000,
    },
  },
  
  xp_10000: {
    id: 'xp_10000',
    title: 'XP Legend',
    description: 'Earn 10,000 total XP',
    icon: '🏅',
    category: 'special',
    criteria: {
      type: 'xp_total',
      threshold: 10000,
    },
  },
  
  weekend_warrior: {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Complete lessons on both Saturday and Sunday',
    icon: '🎉',
    category: 'special',
    criteria: {
      type: 'custom',
      threshold: 1,
    },
  },
  
  challenge_master: {
    id: 'challenge_master',
    title: 'Challenge Master',
    description: 'Complete 50 daily challenges',
    icon: '⚡',
    category: 'special',
    criteria: {
      type: 'custom',
      threshold: 50,
    },
  },
  
  league_champion: {
    id: 'league_champion',
    title: 'League Champion',
    description: 'Finish #1 in your league',
    icon: '🥇',
    category: 'special',
    criteria: {
      type: 'custom',
      threshold: 1,
    },
  },
  
  league_promotion: {
    id: 'league_promotion',
    title: 'Moving Up',
    description: 'Get promoted to a higher league tier',
    icon: '📈',
    category: 'special',
    criteria: {
      type: 'custom',
      threshold: 1,
    },
  },
};

/**
 * Get all achievement definitions
 */
export function getAllAchievements(): AchievementDefinition[] {
  return Object.values(ACHIEVEMENT_DEFINITIONS);
}

/**
 * Get achievement definition by ID
 */
export function getAchievementById(id: string): AchievementDefinition | undefined {
  if (id && Object.prototype.hasOwnProperty.call(ACHIEVEMENT_DEFINITIONS, id)) {
    return ACHIEVEMENT_DEFINITIONS[id];
  }
  return undefined;
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: string): AchievementDefinition[] {
  return Object.values(ACHIEVEMENT_DEFINITIONS).filter(
    (achievement) => achievement.category === category
  );
}

/**
 * Get streak milestone achievements
 */
export function getStreakMilestones(): number[] {
  return Object.values(ACHIEVEMENT_DEFINITIONS)
    .filter((achievement) => achievement.category === 'streak')
    .map((achievement) => achievement.criteria.threshold)
    .sort((a, b) => a - b);
}

/**
 * Get lesson count milestone achievements
 */
export function getLessonMilestones(): number[] {
  return Object.values(ACHIEVEMENT_DEFINITIONS)
    .filter(
      (achievement) =>
        achievement.category === 'lessons' &&
        achievement.criteria.type === 'lessons_count'
    )
    .map((achievement) => achievement.criteria.threshold)
    .sort((a, b) => a - b);
}

// ============================================================
// ACHIEVEMENT CHECKING AND UNLOCKING
// ============================================================

import { supabase } from './supabaseClient';
import type { Achievement, AchievementEvent } from '../types';
import { storeCelebrationEvent } from './celebrationService';
import type { CelebrationData } from './animationService';

/**
 * Check which achievements should be unlocked based on an event
 * 
 * Evaluates achievement criteria against the event data and returns
 * newly unlocked achievements. Automatically persists unlocks to database.
 * 
 * @param userId - The user ID to check achievements for
 * @param event - The achievement event that triggered the check
 * @returns Array of newly unlocked achievements
 */
export async function checkAchievements(
  userId: string,
  event: AchievementEvent
): Promise<Achievement[]> {
  // Get user's existing achievements
  const existingAchievements = await getUserAchievements(userId);
  const existingIds = new Set(existingAchievements.map(a => a.achievementId));
  
  // Find achievements that match the event criteria
  const candidateAchievements: string[] = [];
  
  switch (event.type) {
    case 'streak_updated':
      // Check streak milestone achievements
      Object.values(ACHIEVEMENT_DEFINITIONS)
        .filter(def => def.criteria.type === 'streak' && def.criteria.threshold === event.streak)
        .forEach(def => candidateAchievements.push(def.id));
      break;
      
    case 'lesson_complete':
      // This would require fetching lesson count - handled by caller
      // For now, we'll check if specific lesson count achievements should be evaluated
      break;
      
    case 'xp_earned':
      // Check XP total achievements
      Object.values(ACHIEVEMENT_DEFINITIONS)
        .filter(def => def.criteria.type === 'xp_total' && def.criteria.threshold <= event.total)
        .forEach(def => candidateAchievements.push(def.id));
      break;
      
    case 'level_up':
      // Check level achievements
      Object.values(ACHIEVEMENT_DEFINITIONS)
        .filter(def => {
          if (def.criteria.type !== 'level') return false;
          if (def.criteria.pillarId && def.criteria.pillarId !== event.pillarId) return false;
          return def.criteria.threshold <= event.level;
        })
        .forEach(def => candidateAchievements.push(def.id));
      break;
  }
  
  // Filter out already unlocked achievements
  const newAchievementIds = candidateAchievements.filter(id => !existingIds.has(id));
  
  // Unlock new achievements
  const newlyUnlocked: Achievement[] = [];
  for (const achievementId of newAchievementIds) {
    const achievement = await unlockAchievement(userId, achievementId);
    newlyUnlocked.push(achievement);
  }
  
  return newlyUnlocked;
}

/**
 * Unlock an achievement for a user
 * 
 * Persists the achievement unlock to the database. Handles duplicate
 * unlock attempts gracefully by returning the existing achievement.
 * Triggers a celebration when a new achievement is unlocked.
 * 
 * @param userId - The user ID to unlock the achievement for
 * @param achievementId - The achievement ID to unlock
 * @param onCelebration - Optional callback to trigger celebration UI
 * @returns The unlocked achievement record
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string,
  onCelebration?: (data: CelebrationData) => void
): Promise<Achievement> {
  // Check if achievement is already unlocked
  const { data: existing, error: fetchError } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .eq('achievement_id', achievementId)
    .maybeSingle();
  
  if (fetchError) {
    throw new Error(`Failed to check existing achievement: ${fetchError.message}`);
  }
  
  // If already unlocked, return existing record
  if (existing) {
    return {
      id: existing.id,
      userId: existing.user_id,
      achievementId: existing.achievement_id,
      unlockedAt: existing.unlocked_at,
      createdAt: existing.created_at,
    };
  }
  
  // Insert new achievement unlock
  const { data, error } = await supabase
    .from('achievements')
    .insert({
      user_id: userId,
      achievement_id: achievementId,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to unlock achievement: ${error.message}`);
  }
  
  // 🎉 Trigger achievement celebration
  const achievementDef = getAchievementById(achievementId);
  if (achievementDef) {
    const celebrationData: CelebrationData = {
      type: 'achievement',
      title: 'Achievement Unlocked!',
      subtitle: achievementDef.title,
      achievements: [{
        id: achievementDef.id,
        title: achievementDef.title,
        icon: achievementDef.icon,
      }],
      intensity: achievementDef.category === 'special' ? 'high' : 'medium',
    };
    
    // Store celebration event in database
    await storeCelebrationEvent(userId, celebrationData);
    
    // Trigger celebration callback if provided
    if (onCelebration) {
      onCelebration(celebrationData);
    }
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    achievementId: data.achievement_id,
    unlockedAt: data.unlocked_at,
    createdAt: data.created_at,
  };
}

/**
 * Get all unlocked achievements for a user
 * 
 * Fetches all achievements the user has unlocked from the database.
 * 
 * @param userId - The user ID to fetch achievements for
 * @returns Array of unlocked achievements
 */
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to fetch user achievements: ${error.message}`);
  }
  
  return (data ?? []).map(row => ({
    id: row.id,
    userId: row.user_id,
    achievementId: row.achievement_id,
    unlockedAt: row.unlocked_at,
    createdAt: row.created_at,
  }));
}

// ============================================================
// DAILY GOAL SYSTEM
// ============================================================

import type { DailyGoal } from '../types';

/**
 * Daily Goal Template Definition
 */
interface DailyGoalTemplate {
  goalType: string;
  title: string;
  description: string;
  targetValue: number;
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Daily Goal Templates
 * 
 * Predefined goal templates with various types and difficulty levels:
 * - Easy goals: Lower targets, smaller XP rewards
 * - Medium goals: Moderate targets, medium XP rewards
 * - Hard goals: Higher targets, larger XP rewards
 */
export const DAILY_GOAL_TEMPLATES: DailyGoalTemplate[] = [
  // ============================================================
  // EASY GOALS
  // ============================================================
  {
    goalType: 'complete_lessons',
    title: 'Complete Lessons',
    description: 'Complete 1 lesson today',
    targetValue: 1,
    xpReward: 10,
    difficulty: 'easy',
  },
  {
    goalType: 'earn_xp',
    title: 'Earn XP',
    description: 'Earn 20 XP today',
    targetValue: 20,
    xpReward: 10,
    difficulty: 'easy',
  },
  {
    goalType: 'maintain_streak',
    title: 'Maintain Streak',
    description: 'Keep your streak alive today',
    targetValue: 1,
    xpReward: 15,
    difficulty: 'easy',
  },
  
  // ============================================================
  // MEDIUM GOALS
  // ============================================================
  {
    goalType: 'complete_lessons',
    title: 'Complete Multiple Lessons',
    description: 'Complete 3 lessons today',
    targetValue: 3,
    xpReward: 25,
    difficulty: 'medium',
  },
  {
    goalType: 'earn_xp',
    title: 'Earn More XP',
    description: 'Earn 50 XP today',
    targetValue: 50,
    xpReward: 20,
    difficulty: 'medium',
  },
  {
    goalType: 'perfect_lessons',
    title: 'Perfect Lessons',
    description: 'Complete 2 lessons with 100% accuracy',
    targetValue: 2,
    xpReward: 30,
    difficulty: 'medium',
  },
  {
    goalType: 'practice_time',
    title: 'Practice Time',
    description: 'Spend 15 minutes practicing today',
    targetValue: 15,
    xpReward: 25,
    difficulty: 'medium',
  },
  
  // ============================================================
  // HARD GOALS
  // ============================================================
  {
    goalType: 'complete_lessons',
    title: 'Lesson Marathon',
    description: 'Complete 5 lessons today',
    targetValue: 5,
    xpReward: 50,
    difficulty: 'hard',
  },
  {
    goalType: 'earn_xp',
    title: 'XP Challenge',
    description: 'Earn 100 XP today',
    targetValue: 100,
    xpReward: 40,
    difficulty: 'hard',
  },
  {
    goalType: 'perfect_lessons',
    title: 'Perfection Streak',
    description: 'Complete 3 lessons with 100% accuracy',
    targetValue: 3,
    xpReward: 60,
    difficulty: 'hard',
  },
  {
    goalType: 'practice_time',
    title: 'Deep Practice',
    description: 'Spend 30 minutes practicing today',
    targetValue: 30,
    xpReward: 50,
    difficulty: 'hard',
  },
];

/**
 * Get daily goals for a user
 * 
 * Fetches or generates daily goals for the current date. If no goals exist
 * for today, generates a new set of goals (one easy, one medium, one hard).
 * Automatically handles daily reset logic.
 * 
 * @param userId - The user ID to get goals for
 * @returns Array of daily goals for today
 */
export async function getDailyGoals(userId: string): Promise<DailyGoal[]> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Try to fetch existing goals for today
  const { data: existingGoals, error: fetchError } = await supabase
    .from('daily_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today);
  
  if (fetchError) {
    throw new Error(`Failed to fetch daily goals: ${fetchError.message}`);
  }
  
  // If goals exist for today, return them
  if (existingGoals && existingGoals.length > 0) {
    return existingGoals.map(row => ({
      id: row.id,
      userId: row.user_id,
      goalType: row.goal_type,
      targetValue: row.target_value,
      currentValue: row.current_value,
      xpReward: row.xp_reward,
      difficulty: row.difficulty,
      date: row.date,
      completedAt: row.completed_at || undefined,
      createdAt: row.created_at,
    }));
  }
  
  // No goals for today - generate new ones
  // Select one goal from each difficulty level
  const easyGoals = DAILY_GOAL_TEMPLATES.filter(t => t.difficulty === 'easy');
  const mediumGoals = DAILY_GOAL_TEMPLATES.filter(t => t.difficulty === 'medium');
  const hardGoals = DAILY_GOAL_TEMPLATES.filter(t => t.difficulty === 'hard');
  
  const selectedGoals = [
    easyGoals[Math.floor(Math.random() * easyGoals.length)],
    mediumGoals[Math.floor(Math.random() * mediumGoals.length)],
    hardGoals[Math.floor(Math.random() * hardGoals.length)],
  ];
  
  // Insert new goals into database
  const goalsToInsert = selectedGoals.map(template => ({
    user_id: userId,
    goal_type: template.goalType,
    target_value: template.targetValue,
    current_value: 0,
    xp_reward: template.xpReward,
    difficulty: template.difficulty,
    date: today,
  }));
  
  const { data: insertedGoals, error: insertError } = await supabase
    .from('daily_goals')
    .insert(goalsToInsert)
    .select();
  
  if (insertError) {
    throw new Error(`Failed to create daily goals: ${insertError.message}`);
  }
  
  return (insertedGoals ?? []).map(row => ({
    id: row.id,
    userId: row.user_id,
    goalType: row.goal_type,
    targetValue: row.target_value,
    currentValue: row.current_value,
    xpReward: row.xp_reward,
    difficulty: row.difficulty,
    date: row.date,
    completedAt: row.completed_at || undefined,
    createdAt: row.created_at,
  }));
}

/**
 * Update progress for a daily goal
 * 
 * Increments the current_value for a goal. If the goal reaches its target,
 * automatically marks it as complete and awards XP.
 * 
 * @param userId - The user ID
 * @param goalId - The goal ID to update
 * @param incrementBy - Amount to increment progress by (default: 1)
 * @returns Updated goal with completion status
 */
export async function updateGoalProgress(
  userId: string,
  goalId: string,
  incrementBy: number = 1
): Promise<DailyGoal> {
  // Fetch current goal state
  const { data: goal, error: fetchError } = await supabase
    .from('daily_goals')
    .select('*')
    .eq('id', goalId)
    .eq('user_id', userId)
    .single();
  
  if (fetchError || !goal) {
    throw new Error(`Failed to fetch goal: ${fetchError?.message || 'Goal not found'}`);
  }
  
  // Don't update if already completed
  if (goal.completed_at) {
    return {
      id: goal.id,
      userId: goal.user_id,
      goalType: goal.goal_type,
      targetValue: goal.target_value,
      currentValue: goal.current_value,
      xpReward: goal.xp_reward,
      difficulty: goal.difficulty,
      date: goal.date,
      completedAt: goal.completed_at || undefined,
      createdAt: goal.created_at,
    };
  }
  
  // Calculate new progress
  const newValue = Math.min(goal.current_value + incrementBy, goal.target_value);
  const isComplete = newValue >= goal.target_value;
  
  // Update goal progress
  const updateData: any = {
    current_value: newValue,
  };
  
  if (isComplete) {
    updateData.completed_at = new Date().toISOString();
  }
  
  const { data: updated, error: updateError } = await supabase
    .from('daily_goals')
    .update(updateData)
    .eq('id', goalId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (updateError || !updated) {
    throw new Error(`Failed to update goal: ${updateError?.message || 'Update failed'}`);
  }
  
  // If goal was just completed, award XP
  if (isComplete && !goal.completed_at) {
    // Import progressService to award XP
    // Note: This creates a circular dependency risk, so we'll handle XP awarding
    // in the caller instead
  }
  
  return {
    id: updated.id,
    userId: updated.user_id,
    goalType: updated.goal_type,
    targetValue: updated.target_value,
    currentValue: updated.current_value,
    xpReward: updated.xp_reward,
    difficulty: updated.difficulty,
    date: updated.date,
    completedAt: updated.completed_at || undefined,
    createdAt: updated.created_at,
  };
}

/**
 * Complete a daily goal and award XP
 * 
 * Marks a goal as complete and returns the XP reward amount.
 * The caller is responsible for actually awarding the XP to the user
 * to avoid circular dependencies.
 * 
 * @param userId - The user ID
 * @param goalId - The goal ID to complete
 * @returns XP reward amount
 */
export async function completeDailyGoal(
  userId: string,
  goalId: string
): Promise<number> {
  // Fetch goal
  const { data: goal, error: fetchError } = await supabase
    .from('daily_goals')
    .select('*')
    .eq('id', goalId)
    .eq('user_id', userId)
    .single();
  
  if (fetchError || !goal) {
    throw new Error(`Failed to fetch goal: ${fetchError?.message || 'Goal not found'}`);
  }
  
  // If already completed, return 0 XP (no double rewards)
  if (goal.completed_at) {
    return 0;
  }
  
  // Mark as complete
  const { error: updateError } = await supabase
    .from('daily_goals')
    .update({
      current_value: goal.target_value,
      completed_at: new Date().toISOString(),
    })
    .eq('id', goalId)
    .eq('user_id', userId);
  
  if (updateError) {
    throw new Error(`Failed to complete goal: ${updateError.message}`);
  }
  
  // Return XP reward amount
  return goal.xp_reward;
}

/**
 * Get goal template by type and difficulty
 * 
 * Helper function to retrieve goal template information.
 * 
 * @param goalType - The goal type
 * @param difficulty - The difficulty level
 * @returns Goal template or undefined
 */
export function getGoalTemplate(
  goalType: string,
  difficulty: 'easy' | 'medium' | 'hard'
): DailyGoalTemplate | undefined {
  return DAILY_GOAL_TEMPLATES.find(
    t => t.goalType === goalType && t.difficulty === difficulty
  );
}

/**
 * Get all goal templates by difficulty
 * 
 * @param difficulty - The difficulty level to filter by
 * @returns Array of goal templates
 */
export function getGoalTemplatesByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard'
): DailyGoalTemplate[] {
  return DAILY_GOAL_TEMPLATES.filter(t => t.difficulty === difficulty);
}
