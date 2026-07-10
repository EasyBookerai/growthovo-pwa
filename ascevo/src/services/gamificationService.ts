/**
 * Gamification Service
 * Handles XP, leveling, achievements, and rewards
 * 
 * Core psychology: Instant gratification + Clear progress + Surprise rewards
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@growthovo_gamification:';

export const GAMIFICATION_KEYS = {
  level: `${PREFIX}level`,
  totalXp: `${PREFIX}total_xp`,
  currentXp: `${PREFIX}current_xp`,
  unlockedAchievements: `${PREFIX}achievements`,
  lastLevelUpDate: `${PREFIX}last_level_up`,
} as const;

// XP Sources - carefully tuned for addictive dopamine hits
export const XP_REWARDS = {
  lesson_complete: 25,
  lesson_perfect: 35, // Bonus for 100% score
  daily_checkin: 10,
  speaking_session: 30,
  rex_conversation: 5,
  time_capsule: 20,
  mood_checkin: 5,
  streak_milestone: 50, // Base, multiplied by streak
  invite_friend: 100,
  quest_easy: 15,
  quest_medium: 25,
  quest_hard: 50,
} as const;

// Level curve: 100 * level^1.5
// Level 1→2: 100 XP
// Level 5→6: 1,118 XP
// Level 10→11: 3,162 XP
// Level 20→21: 8,944 XP
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Level perks - unlocked at specific levels
export const LEVEL_PERKS: Record<number, string[]> = {
  5: ['Unlock streak freeze (1 per week)'],
  10: ['Unlock weekly wrapped', 'Profile customization'],
  15: ['Unlock squad feature', 'Advanced analytics'],
  20: ['Unlock time capsules', 'Premium themes preview'],
  25: ['Custom themes (Premium)', 'Priority support'],
  30: ['Advanced analytics (Premium)', 'Exclusive badges'],
};

export interface GamificationStats {
  level: number;
  totalXp: number;
  currentXp: number; // XP toward next level
  nextLevelXp: number;
  progress: number; // 0-1
  unlockedAchievements: string[];
}

export async function getGamificationStats(): Promise<GamificationStats> {
  const [levelStr, totalXpStr, currentXpStr, achievementsStr] = await Promise.all([
    AsyncStorage.getItem(GAMIFICATION_KEYS.level),
    AsyncStorage.getItem(GAMIFICATION_KEYS.totalXp),
    AsyncStorage.getItem(GAMIFICATION_KEYS.currentXp),
    AsyncStorage.getItem(GAMIFICATION_KEYS.unlockedAchievements),
  ]);

  const level = parseInt(levelStr || '1', 10);
  const totalXp = parseInt(totalXpStr || '0', 10);
  const currentXp = parseInt(currentXpStr || '0', 10);
  const unlockedAchievements = achievementsStr ? JSON.parse(achievementsStr) : [];

  const nextLevelXp = getXPForLevel(level + 1);
  const progress = currentXp / nextLevelXp;

  return {
    level,
    totalXp,
    currentXp,
    nextLevelXp,
    progress,
    unlockedAchievements,
  };
}

export interface XPGainResult {
  xpGained: number;
  leveledUp: boolean;
  newLevel?: number;
  perksUnlocked?: string[];
  totalXp: number;
  currentXp: number;
  progress: number;
}

/**
 * Award XP to user
 * Returns result with level up information
 * 
 * CRITICAL: This is the core dopamine loop
 * Every action → XP → Progress → Level up → Rewards
 */
export async function awardXP(
  amount: number,
  source: keyof typeof XP_REWARDS
): Promise<XPGainResult> {
  const stats = await getGamificationStats();

  const newTotalXp = stats.totalXp + amount;
  const newCurrentXp = stats.currentXp + amount;

  let leveledUp = false;
  let newLevel = stats.level;
  let perksUnlocked: string[] | undefined;

  // Check for level up
  if (newCurrentXp >= stats.nextLevelXp) {
    leveledUp = true;
    newLevel = stats.level + 1;

    // Calculate overflow XP for next level
    const overflow = newCurrentXp - stats.nextLevelXp;
    const nextLevelXp = getXPForLevel(newLevel + 1);

    await Promise.all([
      AsyncStorage.setItem(GAMIFICATION_KEYS.level, String(newLevel)),
      AsyncStorage.setItem(GAMIFICATION_KEYS.totalXp, String(newTotalXp)),
      AsyncStorage.setItem(GAMIFICATION_KEYS.currentXp, String(overflow)),
      AsyncStorage.setItem(GAMIFICATION_KEYS.lastLevelUpDate, new Date().toISOString()),
    ]);

    // Check for perks
    if (LEVEL_PERKS[newLevel]) {
      perksUnlocked = LEVEL_PERKS[newLevel];
    }

    return {
      xpGained: amount,
      leveledUp: true,
      newLevel,
      perksUnlocked,
      totalXp: newTotalXp,
      currentXp: overflow,
      progress: overflow / nextLevelXp,
    };
  }

  // No level up
  await Promise.all([
    AsyncStorage.setItem(GAMIFICATION_KEYS.totalXp, String(newTotalXp)),
    AsyncStorage.setItem(GAMIFICATION_KEYS.currentXp, String(newCurrentXp)),
  ]);

  return {
    xpGained: amount,
    leveledUp: false,
    totalXp: newTotalXp,
    currentXp: newCurrentXp,
    progress: newCurrentXp / stats.nextLevelXp,
  };
}

// Achievement definitions
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'lessons' | 'streaks' | 'speaking' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: {
    type: string;
    count: number;
  };
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Lessons
  {
    id: 'first_lesson',
    name: 'First Step',
    description: 'Complete your first lesson',
    icon: '📚',
    category: 'lessons',
    rarity: 'common',
    requirement: { type: 'lessons_completed', count: 1 },
    xpReward: 10,
  },
  {
    id: 'lesson_10',
    name: 'Learning Streak',
    description: 'Complete 10 lessons',
    icon: '🎓',
    category: 'lessons',
    rarity: 'common',
    requirement: { type: 'lessons_completed', count: 10 },
    xpReward: 50,
  },
  {
    id: 'lesson_50',
    name: 'Knowledge Seeker',
    description: 'Complete 50 lessons',
    icon: '📖',
    category: 'lessons',
    rarity: 'rare',
    requirement: { type: 'lessons_completed', count: 50 },
    xpReward: 200,
  },
  {
    id: 'lesson_100',
    name: 'Master Learner',
    description: 'Complete 100 lessons',
    icon: '🏆',
    category: 'lessons',
    rarity: 'epic',
    requirement: { type: 'lessons_completed', count: 100 },
    xpReward: 500,
  },

  // Streaks
  {
    id: 'streak_3',
    name: 'On Fire',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streaks',
    rarity: 'common',
    requirement: { type: 'streak_days', count: 3 },
    xpReward: 25,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    category: 'streaks',
    rarity: 'common',
    requirement: { type: 'streak_days', count: 7 },
    xpReward: 100,
  },
  {
    id: 'streak_30',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    category: 'streaks',
    rarity: 'rare',
    requirement: { type: 'streak_days', count: 30 },
    xpReward: 500,
  },
  {
    id: 'streak_100',
    name: 'Centurion',
    description: 'Maintain a 100-day streak',
    icon: '🌟',
    category: 'streaks',
    rarity: 'legendary',
    requirement: { type: 'streak_days', count: 100 },
    xpReward: 2000,
  },

  // Speaking
  {
    id: 'first_speech',
    name: 'Finding Your Voice',
    description: 'Complete your first speaking session',
    icon: '🎤',
    category: 'speaking',
    rarity: 'common',
    requirement: { type: 'speaking_sessions', count: 1 },
    xpReward: 20,
  },
  {
    id: 'speaker_10',
    name: 'Confident Speaker',
    description: 'Complete 10 speaking sessions',
    icon: '🗣️',
    category: 'speaking',
    rarity: 'rare',
    requirement: { type: 'speaking_sessions', count: 10 },
    xpReward: 100,
  },

  // Social
  {
    id: 'squad_join',
    name: 'Team Player',
    description: 'Join your first squad',
    icon: '👥',
    category: 'social',
    rarity: 'common',
    requirement: { type: 'squad_joined', count: 1 },
    xpReward: 20,
  },
  {
    id: 'friend_invite',
    name: 'Motivator',
    description: 'Invite 5 friends to Growthovo',
    icon: '📨',
    category: 'social',
    rarity: 'rare',
    requirement: { type: 'friends_invited', count: 5 },
    xpReward: 500,
  },

  // Special
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete check-in before 8 AM, 5 times',
    icon: '🌅',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'early_checkins', count: 5 },
    xpReward: 50,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete check-in after 10 PM, 5 times',
    icon: '🦉',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'late_checkins', count: 5 },
    xpReward: 50,
  },
];

/**
 * Check if achievement should be unlocked
 * Returns achievement if unlocked, null otherwise
 */
export async function checkAchievement(
  achievementId: string,
  userProgress: Record<string, number>
): Promise<Achievement | null> {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return null;

  const stats = await getGamificationStats();
  if (stats.unlockedAchievements.includes(achievementId)) {
    return null; // Already unlocked
  }

  const progressValue = userProgress[achievement.requirement.type] || 0;
  if (progressValue >= achievement.requirement.count) {
    // Unlock achievement
    const unlocked = [...stats.unlockedAchievements, achievementId];
    await AsyncStorage.setItem(
      GAMIFICATION_KEYS.unlockedAchievements,
      JSON.stringify(unlocked)
    );

    // Award XP
    await awardXP(achievement.xpReward, 'quest_medium');

    return achievement;
  }

  return null;
}

/**
 * Get rarity color for achievements and badges
 */
export function getRarityColor(rarity: Achievement['rarity']): string {
  const colors = {
    common: '#6B7280',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
  };
  return colors[rarity];
}
