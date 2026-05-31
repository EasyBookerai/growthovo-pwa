/**
 * Growthovo World-Class Experience — local persistence & helpers.
 * Uses AsyncStorage (React Native) with in-memory fallback.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PillarKey } from '../types';

const PREFIX = '@growthovo:';

export const KEYS = {
  onboardingComplete: `${PREFIX}onboarding_complete`,
  selectedPillars: `${PREFIX}selected_pillars`,
  timeCommitment: `${PREFIX}time_commitment`,
  userName: `${PREFIX}user_name`,
  avatarColor: `${PREFIX}avatar_color`,
  isPremium: `${PREFIX}is_premium`,
  notificationPrefs: `${PREFIX}notification_prefs`,
  appearance: `${PREFIX}appearance`,
  timeCapsules: `${PREFIX}time_capsules`,
  tomorrowReminder: `${PREFIX}tomorrow_reminder`,
  morningBriefingDate: `${PREFIX}morning_briefing_date`,
  eveningDebriefDate: `${PREFIX}evening_debrief_date`,
  streakFreezes: `${PREFIX}streak_freezes`,
  lastCheckInDate: `${PREFIX}last_check_in_date`,
  streakCount: `${PREFIX}streak_count`,
  weeklyXp: `${PREFIX}weekly_xp`,
  weeklyLessons: `${PREFIX}weekly_lessons`,
  weeklyMoods: `${PREFIX}weekly_moods`,
  wrappedDismissedWeek: `${PREFIX}wrapped_dismissed_week`,
  squadReactions: `${PREFIX}squad_reactions`,
  rexMessagesUsed: `${PREFIX}rex_messages_used`,
  speakingSessionsUsed: `${PREFIX}speaking_sessions_used`,
  yesterdayActivity: `${PREFIX}yesterday_activity`,
  dailyIntention: `${PREFIX}daily_intention`,
} as const;

export interface NotificationPrefs {
  morning: boolean;
  evening: boolean;
  streak: boolean;
  league: boolean;
}

export interface TimeCapsuleRecord {
  id: string;
  letter: string;
  promise: string;
  createdAt: string;
  unlockAt: string;
  opened: boolean;
}

export interface YesterdayActivity {
  xp: number;
  lessons: number;
  mood: string | null;
}

const memoryStore = new Map<string, string>();

async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    memoryStore.set(key, value);
  }
}

async function getJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setJson(key: string, value: unknown): Promise<void> {
  await setItem(key, JSON.stringify(value));
}

export function isBeforeNoon(): boolean {
  return new Date().getHours() < 12;
}

export function isAfter6PM(): boolean {
  return new Date().getHours() >= 18;
}

export function isMonday(): boolean {
  return new Date().getDay() === 1;
}

export function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function weekKey(): string {
  const d = new Date();
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay() + 1);
  return start.toISOString().split('T')[0];
}

const MOTIVATIONAL_QUOTES = [
  'Small steps today become big wins tomorrow.',
  'You do not have to be perfect — you have to show up.',
  'Discipline is choosing what you want most over what you want now.',
  'Your future self is cheering for you right now.',
  'Progress, not perfection.',
  'One focused hour beats a distracted day.',
  'You are building a life you will be proud of.',
  'Courage is feeling the fear and doing it anyway.',
  'Rest is part of the work — honor your energy.',
  'Every expert was once a beginner who refused to quit.',
  'Your habits are votes for the person you are becoming.',
  'Clarity comes from action, not thought alone.',
  'Be patient with yourself — growth takes time.',
  'What you do today shapes who you are tomorrow.',
  'You have survived 100% of your hardest days.',
  'Focus on the next right step, not the whole staircase.',
  'Your mindset is the foundation of everything else.',
  'Celebrate how far you have come, not only how far to go.',
  'Consistency beats intensity every time.',
  'You are allowed to start again as many times as you need.',
];

export function getDailyQuote(): string {
  const day = new Date().getDate();
  return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length];
}

export async function getUserName(): Promise<string> {
  return (await getItem(KEYS.userName)) ?? 'Champion';
}

export async function getSelectedPillars(): Promise<PillarKey[]> {
  const raw = await getJson<string[]>(KEYS.selectedPillars, []);
  return raw.filter((p): p is PillarKey =>
    ['mind', 'discipline', 'communication', 'money', 'relationships'].includes(p)
  );
}

export async function isPremiumUser(): Promise<boolean> {
  return (await getItem(KEYS.isPremium)) === 'true';
}

export async function setPremiumUser(value: boolean): Promise<void> {
  await setItem(KEYS.isPremium, value ? 'true' : 'false');
}

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  return getJson(KEYS.notificationPrefs, {
    morning: true,
    evening: true,
    streak: true,
    league: true,
  });
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  await setJson(KEYS.notificationPrefs, prefs);
}

export async function getStreakFreezes(): Promise<number> {
  const n = parseInt((await getItem(KEYS.streakFreezes)) ?? '0', 10);
  return Number.isFinite(n) ? Math.min(2, Math.max(0, n)) : 0;
}

export async function setStreakFreezes(count: number): Promise<void> {
  await setItem(KEYS.streakFreezes, String(Math.min(2, Math.max(0, count))));
}

export async function getStreakCount(): Promise<number> {
  const n = parseInt((await getItem(KEYS.streakCount)) ?? '0', 10);
  return Number.isFinite(n) ? n : 0;
}

export async function setStreakCount(count: number): Promise<void> {
  await setItem(KEYS.streakCount, String(count));
}

export async function recordDailyCheckIn(): Promise<{ streak: number; freezeUsed: boolean; milestone: number | null }> {
  const today = todayKey();
  const last = await getItem(KEYS.lastCheckInDate);
  let streak = await getStreakCount();
  let freezeUsed = false;
  let milestone: number | null = null;

  if (last === today) {
    return { streak, freezeUsed, milestone };
  }

  if (!last) {
    streak = 1;
  } else {
    const lastDate = new Date(last);
    const todayDate = new Date(today);
    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000);

    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      const freezes = await getStreakFreezes();
      if (freezes > 0) {
        await setStreakFreezes(freezes - 1);
        freezeUsed = true;
      } else {
        streak = 1;
      }
    }
  }

  await setItem(KEYS.lastCheckInDate, today);
  await setStreakCount(streak);

  if (streak > 0 && streak % 7 === 0) {
    const freezes = await getStreakFreezes();
    if (freezes < 2) await setStreakFreezes(freezes + 1);
  }

  if ([3, 7, 14, 30].includes(streak)) milestone = streak;

  return { streak, freezeUsed, milestone };
}

export async function getYesterdayActivity(): Promise<YesterdayActivity> {
  return getJson(KEYS.yesterdayActivity, { xp: 0, lessons: 0, mood: null });
}

export async function saveYesterdayActivity(activity: YesterdayActivity): Promise<void> {
  await setJson(KEYS.yesterdayActivity, activity);
}

export async function addWeeklyXp(amount: number): Promise<void> {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = days[new Date().getDay()];
  const weekly = await getJson<Record<string, number>>(KEYS.weeklyXp, {});
  weekly[day] = (weekly[day] ?? 0) + amount;
  await setJson(KEYS.weeklyXp, weekly);
}

export async function getWeeklyXp(): Promise<Record<string, number>> {
  return getJson(KEYS.weeklyXp, {});
}

export async function getTimeCapsules(): Promise<TimeCapsuleRecord[]> {
  return getJson(KEYS.timeCapsules, []);
}

export async function saveTimeCapsule(capsule: TimeCapsuleRecord): Promise<void> {
  const list = await getTimeCapsules();
  list.push(capsule);
  await setJson(KEYS.timeCapsules, list);
}

export async function markCapsuleOpened(id: string): Promise<void> {
  const list = await getTimeCapsules();
  await setJson(
    KEYS.timeCapsules,
    list.map((c) => (c.id === id ? { ...c, opened: true } : c))
  );
}

export async function isMorningBriefingDoneToday(): Promise<boolean> {
  return (await getItem(KEYS.morningBriefingDate)) === todayKey();
}

export async function markMorningBriefingDone(): Promise<void> {
  await setItem(KEYS.morningBriefingDate, todayKey());
}

export async function isEveningDebriefDoneToday(): Promise<boolean> {
  return (await getItem(KEYS.eveningDebriefDate)) === todayKey();
}

export async function markEveningDebriefDone(): Promise<void> {
  await setItem(KEYS.eveningDebriefDate, todayKey());
}

export async function getRexMessagesRemaining(): Promise<number> {
  if (await isPremiumUser()) return 999;
  const used = parseInt((await getItem(KEYS.rexMessagesUsed)) ?? '0', 10);
  return Math.max(0, 10 - used);
}

export async function incrementRexMessages(): Promise<number> {
  if (await isPremiumUser()) return 999;
  const used = parseInt((await getItem(KEYS.rexMessagesUsed)) ?? '0', 10) + 1;
  await setItem(KEYS.rexMessagesUsed, String(used));
  return Math.max(0, 10 - used);
}

export function timeCommitmentToMinutes(commitment: string): number {
  if (commitment.startsWith('5')) return 5;
  if (commitment.startsWith('10')) return 10;
  if (commitment.startsWith('20')) return 20;
  return 30;
}

export async function saveNewOnboardingToSupabase(
  userId: string,
  data: {
    pillars: string[];
    timeCommitment: string;
    userName: string;
    avatarColor: string;
  }
): Promise<void> {
  const { supabase } = await import('./supabaseClient');
  const valid = data.pillars.filter((p): p is PillarKey =>
    ['mind', 'discipline', 'communication', 'money', 'relationships'].includes(p)
  );
  const primary = valid[0] ?? 'discipline';
  const secondary = valid[1] ?? valid[0] ?? 'mind';

  const { error } = await supabase
    .from('users')
    .update({
      username: data.userName.trim() || 'Champion',
      primary_pillar: primary,
      secondary_pillar: secondary,
      daily_goal_minutes: timeCommitmentToMinutes(data.timeCommitment),
      onboarding_complete: true,
    })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

export function generateRexMorningMessage(opts: {
  name: string;
  streak: number;
  yesterdayMood: string | null;
  dayOfWeek: number;
}): string {
  const parts: string[] = [];
  if (opts.streak > 7) parts.push("You're on fire!");
  if (opts.yesterdayMood === 'negative' || opts.yesterdayMood === 'low') {
    parts.push('Yesterday was tough — today is a fresh page. I believe in you.');
  }
  if (opts.dayOfWeek === 1) parts.push('New week, new energy. Let us make it count.');
  if (opts.dayOfWeek === 5) parts.push('Friday — celebrate how far you have come this week.');
  parts.push(`${opts.name}, you have got this. Start small, stay consistent.`);
  return parts.join(' ');
}

export async function saveDailyIntention(intention: string): Promise<void> {
  await setJson(KEYS.dailyIntention, intention);
}

export async function saveTomorrowReminder(text: string): Promise<void> {
  await setItem(KEYS.tomorrowReminder, text);
}

export const STREAK_MILESTONES: Record<number, { title: string; bonusXp: number }> = {
  3: { title: "🔥 You're on fire!", bonusXp: 0 },
  7: { title: '⚡ One week strong!', bonusXp: 100 },
  14: { title: '💎 Two weeks! Legendary.', bonusXp: 250 },
  30: { title: "👑 30 days. You're unstoppable.", bonusXp: 500 },
};
