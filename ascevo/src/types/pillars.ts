/**
 * Premium Pillars Experience - Type Definitions
 * 
 * This file contains TypeScript interfaces and types for the XP-based
 * progression system across 6 life pillars.
 */

/**
 * Valid pillar keys for the premium experience
 */
export type PremiumPillarKey = 
  | 'mental-health'
  | 'relationships'
  | 'career'
  | 'fitness'
  | 'finance'
  | 'hobbies';

/**
 * Pillar progress tracking
 * 
 * Stores XP, level, completed lessons, and challenge state for a single pillar.
 * 
 * Invariants:
 * - xp >= 0
 * - level = floor(xp / 500) + 1
 * - 1 <= level <= 10
 * - completedLessons.length <= 4
 * - streak >= 0
 * - challengeCompletedToday resets daily
 */
export interface PillarProgress {
  pillarKey: PremiumPillarKey;
  xp: number;
  level: number;
  completedLessons: string[];
  streak: number;
  lastActivityDate: string;
  challengeCompletedToday: boolean;
  challengeCompletionDate: string | null;
}

/**
 * Global progress across all pillars
 * 
 * Aggregates total XP and level from all pillars.
 * 
 * Invariants:
 * - totalXP >= 0
 * - totalLevel = floor(totalXP / 100) + 1 (AppContext formula)
 * - currentStreak >= 0
 */
export interface GlobalProgress {
  totalXP: number;
  totalLevel: number;
  currentStreak: number;
  lastCheckInDate: string;
}

/**
 * Lesson content structure
 * 
 * Contains educational content for a single lesson.
 * 
 * Invariants:
 * - paragraphs total 150-250 words
 * - keyTakeaway < 20 words
 */
export interface LessonContent {
  paragraphs: string[];
  keyTakeaway: string;
}

/**
 * Lesson data model
 * 
 * Represents a single lesson within a pillar.
 */
export interface LessonData {
  id: string;
  pillarKey: PremiumPillarKey;
  number: number;
  title: string;
  duration: string;
  difficulty: string;
  content: LessonContent;
}

/**
 * Completed lessons tracking
 * 
 * Stores list of completed lesson IDs.
 * 
 * Invariants:
 * - lessonIds contains unique lesson IDs
 * - lessonIds.length <= 24 (max 4 lessons × 6 pillars)
 */
export interface CompletedLessons {
  lessonIds: string[];
  lastUpdated: string;
}

/**
 * Pillar display data
 * 
 * Visual and metadata for pillar cards.
 */
export interface PillarData {
  id: string;
  key: PremiumPillarKey;
  emoji: string;
  name: string;
  accentColor: string;
}

/**
 * Valid pillar keys array for validation
 */
export const VALID_PILLARS: PremiumPillarKey[] = [
  'mental-health',
  'relationships',
  'career',
  'fitness',
  'finance',
  'hobbies',
];

/**
 * Pillar accent colors mapping
 */
export const PILLAR_COLORS: Record<PremiumPillarKey, string> = {
  'mental-health': '#A78BFA',
  'relationships': '#F472B6',
  'career': '#60A5FA',
  'fitness': '#34D399',
  'finance': '#FBBF24',
  'hobbies': '#F87171',
};

/**
 * XP awards for different actions
 */
export const PREMIUM_XP_AWARDS = {
  LESSON_COMPLETE: 50,
  DAILY_CHALLENGE: 30,
} as const;

/**
 * XP per level constant
 */
export const XP_PER_LEVEL = 500;

/**
 * Maximum level
 */
export const MAX_LEVEL = 10;
