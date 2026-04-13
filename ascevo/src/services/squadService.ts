import { supabase } from './supabaseClient';
import type { Squad, SquadMember } from '../types';

const MAX_SQUAD_SIZE = 5;

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── Create Squad ─────────────────────────────────────────────────────────────

export async function createSquad(userId: string, pillarId: string, name: string): Promise<Squad> {
  const inviteCode = generateInviteCode();

  const { data: squad, error } = await supabase
    .from('squads')
    .insert({ name, pillar_id: pillarId, invite_code: inviteCode })
    .select()
    .single();

  if (error) throw new Error('Failed to create squad.');

  // Add creator as first member
  await supabase.from('squad_members').insert({
    squad_id: squad.id,
    user_id: userId,
  });

  return {
    id: squad.id,
    name: squad.name,
    pillarId: squad.pillar_id,
    inviteCode: squad.invite_code,
    createdAt: squad.created_at,
  };
}

// ─── Join Squad ───────────────────────────────────────────────────────────────

export async function joinSquad(userId: string, inviteCode: string): Promise<Squad> {
  // Find squad by invite code
  const { data: squad, error } = await supabase
    .from('squads')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single();

  if (error || !squad) throw new Error('Invalid invite code. Check it and try again.');

  // Check member count
  const { count } = await supabase
    .from('squad_members')
    .select('*', { count: 'exact', head: true })
    .eq('squad_id', squad.id);

  if ((count ?? 0) >= MAX_SQUAD_SIZE) {
    throw new Error('This squad is full (max 5 members).');
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('squad_members')
    .select('id')
    .eq('squad_id', squad.id)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) throw new Error('You are already in this squad.');

  await supabase.from('squad_members').insert({ squad_id: squad.id, user_id: userId });

  return {
    id: squad.id,
    name: squad.name,
    pillarId: squad.pillar_id,
    inviteCode: squad.invite_code,
    createdAt: squad.created_at,
  };
}

// ─── Get Squad Members ────────────────────────────────────────────────────────

export async function getSquadMembers(squadId: string): Promise<SquadMember[]> {
  const { data, error } = await supabase
    .from('squad_members')
    .select(`
      id, user_id, joined_at,
      users(username, avatar_url),
      streaks(current_streak)
    `)
    .eq('squad_id', squadId);

  if (error) throw new Error('Failed to fetch squad members.');

  // Get weekly XP for each member from league_members
  const members = await Promise.all(
    (data ?? []).map(async (m: any) => {
      const { data: league } = await supabase
        .from('league_members')
        .select('weekly_xp')
        .eq('user_id', m.user_id)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        id: m.id,
        squadId,
        userId: m.user_id,
        username: m.users?.username ?? 'Unknown',
        avatarUrl: m.users?.avatar_url,
        currentStreak: m.streaks?.current_streak ?? 0,
        weeklyXp: league?.weekly_xp ?? 0,
        joinedAt: m.joined_at,
      } as SquadMember;
    })
  );

  return members.sort((a, b) => b.weeklyXp - a.weeklyXp);
}

// ─── Get User's Squad ─────────────────────────────────────────────────────────

export async function getUserSquad(userId: string): Promise<Squad | null> {
  const { data } = await supabase
    .from('squad_members')
    .select('squads(*)')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data?.squads) return null;
  const s = data.squads as any;
  return { id: s.id, name: s.name, pillarId: s.pillar_id, inviteCode: s.invite_code, createdAt: s.created_at };
}

// ─── Pure helper (for tests) ──────────────────────────────────────────────────

export function canJoinSquad(currentMemberCount: number): boolean {
  return currentMemberCount < MAX_SQUAD_SIZE;
}
