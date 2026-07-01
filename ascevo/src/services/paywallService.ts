/**
 * Paywall Service — enforces free tier limits across the app.
 * Stores limit counters in localStorage/AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPremiumUser } from './growthovoExperienceService';

const PREFIX = '@growthovo:limits:';

export const LIMIT_KEYS = {
  rexMessages: `${PREFIX}rex_messages`,
  speakingSessions: `${PREFIX}speaking_sessions`,
  capsules: `${PREFIX}capsules`,
} as const;

// Free tier limits
export const FREE_LIMITS = {
  rexMessagesPerDay: 10,
  speakingSessionsPerDay: 2,
  capsulesTotal: 1,
  lessonsPerPillar: 2, // First 2 lessons per pillar are free
} as const;

interface DailyLimit {
  count: number;
  date: string; // YYYY-MM-DD
}

/**
 * Get today's date key
 */
function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get or initialize daily limit
 */
async function getDailyLimit(key: string): Promise<DailyLimit> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return { count: 0, date: todayKey() };
    
    const data: DailyLimit = JSON.parse(raw);
    
    // Reset if date changed
    if (data.date !== todayKey()) {
      return { count: 0, date: todayKey() };
    }
    
    return data;
  } catch {
    return { count: 0, date: todayKey() };
  }
}

/**
 * Set daily limit
 */
async function setDailyLimit(key: string, limit: DailyLimit): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(limit));
  } catch (e) {
    console.error('Failed to save limit:', e);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REX CHAT LIMITS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if user can send Rex message
 */
export async function canSendRexMessage(): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const premium = await isPremiumUser();
  
  if (premium) {
    return { allowed: true, remaining: 999, limit: 999 };
  }
  
  const data = await getDailyLimit(LIMIT_KEYS.rexMessages);
  const remaining = FREE_LIMITS.rexMessagesPerDay - data.count;
  
  return {
    allowed: data.count < FREE_LIMITS.rexMessagesPerDay,
    remaining: Math.max(0, remaining),
    limit: FREE_LIMITS.rexMessagesPerDay,
  };
}

/**
 * Increment Rex message count
 */
export async function incrementRexMessageCount(): Promise<void> {
  const premium = await isPremiumUser();
  if (premium) return;
  
  const data = await getDailyLimit(LIMIT_KEYS.rexMessages);
  data.count += 1;
  await setDailyLimit(LIMIT_KEYS.rexMessages, data);
}

/**
 * Get Rex messages remaining today
 */
export async function getRexMessagesRemaining(): Promise<{ remaining: number; total: number }> {
  const premium = await isPremiumUser();
  
  if (premium) {
    return { remaining: 999, total: 999 };
  }
  
  const data = await getDailyLimit(LIMIT_KEYS.rexMessages);
  const remaining = FREE_LIMITS.rexMessagesPerDay - data.count;
  
  return {
    remaining: Math.max(0, remaining),
    total: FREE_LIMITS.rexMessagesPerDay,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUBLIC SPEAKING LIMITS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if user can start speaking session
 */
export async function canStartSpeakingSession(): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const premium = await isPremiumUser();
  
  if (premium) {
    return { allowed: true, remaining: 999, limit: 999 };
  }
  
  const data = await getDailyLimit(LIMIT_KEYS.speakingSessions);
  const remaining = FREE_LIMITS.speakingSessionsPerDay - data.count;
  
  return {
    allowed: data.count < FREE_LIMITS.speakingSessionsPerDay,
    remaining: Math.max(0, remaining),
    limit: FREE_LIMITS.speakingSessionsPerDay,
  };
}

/**
 * Increment speaking session count
 */
export async function incrementSpeakingSessionCount(): Promise<void> {
  const premium = await isPremiumUser();
  if (premium) return;
  
  const data = await getDailyLimit(LIMIT_KEYS.speakingSessions);
  data.count += 1;
  await setDailyLimit(LIMIT_KEYS.speakingSessions, data);
}

/**
 * Get speaking sessions remaining today
 */
export async function getSpeakingSessionsRemaining(): Promise<{ remaining: number; total: number }> {
  const premium = await isPremiumUser();
  
  if (premium) {
    return { remaining: 999, total: 999 };
  }
  
  const data = await getDailyLimit(LIMIT_KEYS.speakingSessions);
  const remaining = FREE_LIMITS.speakingSessionsPerDay - data.count;
  
  return {
    remaining: Math.max(0, remaining),
    total: FREE_LIMITS.speakingSessionsPerDay,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIME CAPSULE LIMITS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if user can create capsule
 */
export async function canCreateCapsule(currentCapsuleCount: number): Promise<{ allowed: boolean; limit: number }> {
  const premium = await isPremiumUser();
  
  if (premium) {
    return { allowed: true, limit: 12 };
  }
  
  return {
    allowed: currentCapsuleCount < FREE_LIMITS.capsulesTotal,
    limit: FREE_LIMITS.capsulesTotal,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LESSON LIMITS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if a lesson is locked (lessons 3-15 are locked for free users)
 */
export async function isLessonLocked(lessonIndex: number): Promise<boolean> {
  const premium = await isPremiumUser();
  
  if (premium) return false;
  
  // First 2 lessons (index 0 and 1) are free
  return lessonIndex >= 2;
}

/**
 * Get locked lesson indexes for a pillar
 */
export async function getLockedLessons(totalLessons: number): Promise<number[]> {
  const premium = await isPremiumUser();
  
  if (premium) return [];
  
  // Lock lessons starting from index 2 (3rd lesson)
  const locked: number[] = [];
  for (let i = 2; i < totalLessons; i++) {
    locked.push(i);
  }
  
  return locked;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COUNTER DISPLAY HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get counter color based on remaining count
 */
export function getCounterColor(remaining: number, total: number): 'green' | 'amber' | 'red' {
  const ratio = remaining / total;
  
  if (ratio >= 0.6) return 'green'; // 60%+ remaining
  if (ratio >= 0.3) return 'amber'; // 30-60% remaining
  return 'red'; // < 30% remaining
}

/**
 * Format counter text
 */
export function formatCounter(remaining: number, total: number): string {
  return `${remaining} / ${total}`;
}

/**
 * Check if counter should be shown
 */
export async function shouldShowCounter(): Promise<boolean> {
  return !(await isPremiumUser());
}
