import { supabase } from './supabaseClient';
import type { League, LeagueMember } from '../types';

const MAX_LEAGUE_SIZE = 20;

// ─── Assign User to League ────────────────────────────────────────────────────
// Finds an existing league for the current week with < 20 members, or creates one.

export async function assignUserToLeague(userId: string): Promise<string> {
  const today = new Date();
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);

  // Check if already in a league this week
  const { data: existing } = await supabase
    .from('league_members')
    .select('league_id, leagues!inner(week_start)')
    .eq('user_id', userId)
    .eq('leagues.week_start', weekStart)
    .maybeSingle();

  if (existing) return existing.league_id;

  // Find a league with space
  const { data: leagues } = await supabase
    .from('leagues')
    .select('id, league_members(count)')
    .eq('week_start', weekStart)
    .limit(50);

  let leagueId: string | null = null;

  for (const league of leagues ?? []) {
    const count = (league.league_members as any)?.[0]?.count ?? 0;
    if (count < MAX_LEAGUE_SIZE) {
      leagueId = league.id;
      break;
    }
  }

  // Create new league if none found
  if (!leagueId) {
    const { data: newLeague, error } = await supabase
      .from('leagues')
      .insert({ tier: 1, week_start: weekStart, week_end: weekEnd })
      .select('id')
      .single();

    if (error) throw new Error('Failed to create league.');
    leagueId = newLeague.id;
  }

  // Add user to league
  await supabase.from('league_members').insert({
    league_id: leagueId,
    user_id: userId,
    weekly_xp: 0,
  });

  return leagueId;
}

// ─── Get League Rankings ──────────────────────────────────────────────────────
// Returns members sorted by weekly XP with unique ranks.

export async function getLeagueRankings(leagueId: string): Promise<LeagueMember[]> {
  const { data, error } = await supabase
    .from('league_members')
    .select('id, user_id, weekly_xp, rank, users(username, avatar_url)')
    .eq('league_id', leagueId)
    .order('weekly_xp', { ascending: false });

  if (error) throw new Error('Failed to fetch league rankings.');

  return (data ?? []).map((m: any, index: number) => ({
    id: m.id,
    leagueId,
    userId: m.user_id,
    username: m.users?.username ?? 'Unknown',
    avatarUrl: m.users?.avatar_url,
    weeklyXp: m.weekly_xp,
    rank: index + 1, // Assign rank based on sorted position
  }));
}

// ─── Update Weekly XP ─────────────────────────────────────────────────────────

export async function updateWeeklyXP(userId: string, amount: number): Promise<void> {
  const today = new Date();
  const weekStart = getWeekStart(today);

  const { data: membership } = await supabase
    .from('league_members')
    .select('id, weekly_xp, leagues!inner(week_start)')
    .eq('user_id', userId)
    .eq('leagues.week_start', weekStart)
    .maybeSingle();

  if (!membership) return; // Not in a league yet

  await supabase
    .from('league_members')
    .update({ weekly_xp: membership.weekly_xp + amount })
    .eq('id', membership.id);
}

// ─── Process Weekly Reset ─────────────────────────────────────────────────────
// Promotes top 5, relegates bottom 5. Called by a scheduled Supabase function.

export async function processWeeklyReset(leagueId: string): Promise<void> {
  const members = await getLeagueRankings(leagueId);
  if (members.length === 0) return;

  // Update ranks in DB
  await Promise.all(
    members.map((m, i) =>
      supabase.from('league_members').update({ rank: i + 1 }).eq('id', m.id)
    )
  );
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

export function rankMembers(members: { userId: string; weeklyXp: number }[]): LeagueMember[] {
  const sorted = [...members].sort((a, b) => b.weeklyXp - a.weeklyXp);
  return sorted.map((m, i) => ({
    id: m.userId,
    leagueId: '',
    userId: m.userId,
    username: '',
    weeklyXp: m.weeklyXp,
    rank: i + 1,
  }));
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function getWeekEnd(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Sunday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}
