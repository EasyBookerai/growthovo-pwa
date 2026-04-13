import AsyncStorage from '@react-native-async-storage/async-storage';
import { WidgetData, PillarKey } from '../types';
import { supabase } from './supabaseClient';

const WIDGET_STORAGE_KEY = '@growthovo_widget_data';

// ─── Rex Daily Lines (7 entries, rotate by dayOfYear % 7) ────────────────────

const REX_DAILY_LINES = [
  'Day {X}. Still here. That\'s more than most.',
  '{X} days. Rex is watching. Don\'t stop now.',
  'You\'ve shown up {X} days straight. Keep the chain.',
  '{X} days in. The work is working.',
  'Streak: {X}. Rex approves. Barely.',
  '{X} days. You\'re building something real.',
  'Day {X}. Consistency is the only cheat code.',
];

// ─── getRexDailyLine ──────────────────────────────────────────────────────────

export function getRexDailyLine(streak: number): string {
  const now = Date.now();
  const startOfYear = new Date(new Date().getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % 7;
  return REX_DAILY_LINES[index].replace('{X}', String(streak));
}

// ─── isWidgetDataStale ────────────────────────────────────────────────────────

export function isWidgetDataStale(data: WidgetData): boolean {
  const age = Date.now() - new Date(data.updatedAt).getTime();
  return age > 24 * 60 * 60 * 1000;
}

// ─── syncWidgetData ───────────────────────────────────────────────────────────

export async function syncWidgetData(userId: string): Promise<void> {
  // Fetch streak
  const { data: streakData } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single();

  // Fetch total XP (sum of xp_transactions)
  const { data: xpData } = await supabase
    .from('xp_transactions')
    .select('amount')
    .eq('user_id', userId);

  const xp = xpData ? xpData.reduce((sum: number, row: { amount: number }) => sum + row.amount, 0) : 0;

  // Fetch hearts count
  const { data: heartsData } = await supabase
    .from('hearts')
    .select('count')
    .eq('user_id', userId)
    .single();

  // Fetch latest challenge title
  const { data: challengeData } = await supabase
    .from('challenges')
    .select('description')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Fetch league rank
  const { data: leagueData } = await supabase
    .from('league_members')
    .select('rank')
    .eq('user_id', userId)
    .single();

  // Fetch primary pillar from users table
  const { data: userData } = await supabase
    .from('users')
    .select('primary_pillar')
    .eq('id', userId)
    .single();

  const streak = streakData?.current_streak ?? 0;
  const hearts = heartsData?.count ?? 0;
  const challengeTitle = challengeData?.description ?? '';
  const leaguePosition = leagueData?.rank ?? 0;
  const primaryPillar: PillarKey = (userData?.primary_pillar as PillarKey) ?? 'mind';

  const widgetData: WidgetData = {
    streak,
    xp,
    hearts,
    challengeTitle,
    leaguePosition,
    primaryPillar,
    rexDailyLine: getRexDailyLine(streak),
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(widgetData));
}
