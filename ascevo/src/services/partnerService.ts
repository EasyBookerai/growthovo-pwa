import { supabase } from './supabaseClient';
import type {
  AccountabilityPair,
  MessageType,
  PartnerComparisonReport,
  PartnerWeekStats,
} from '../types';

// ─── Get Active Pair ──────────────────────────────────────────────────────────

export async function getActivePair(userId: string): Promise<AccountabilityPair | null> {
  const { data, error } = await supabase
    .from('accountability_pairs')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .maybeSingle();

  if (error) throw new Error('Failed to fetch active pair.');
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    partnerId: data.partner_id,
    pillar: data.pillar,
    active: data.active,
    createdAt: data.created_at,
  };
}

// ─── Create Pair ──────────────────────────────────────────────────────────────

export async function createPair(
  userId: string,
  partnerId: string,
  pillar: string
): Promise<AccountabilityPair> {
  const { data, error } = await supabase
    .from('accountability_pairs')
    .insert({ user_id: userId, partner_id: partnerId, pillar, active: true })
    .select()
    .single();

  if (error) throw new Error('Failed to create accountability pair.');

  return {
    id: data.id,
    userId: data.user_id,
    partnerId: data.partner_id,
    pillar: data.pillar,
    active: data.active,
    createdAt: data.created_at,
  };
}

// ─── Deactivate Pair ──────────────────────────────────────────────────────────

export async function deactivatePair(pairId: string): Promise<void> {
  const { error } = await supabase
    .from('accountability_pairs')
    .update({ active: false })
    .eq('id', pairId);

  if (error) throw new Error('Failed to deactivate pair.');
}

// ─── Get Partner Check-In Status ──────────────────────────────────────────────

export async function getPartnerCheckinStatus(
  _pairId: string,
  partnerId: string
): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('briefing_viewed_at')
    .eq('user_id', partnerId)
    .eq('date', today)
    .maybeSingle();

  if (error) throw new Error('Failed to fetch partner check-in status.');

  return data?.briefing_viewed_at != null;
}

// ─── Send Partner Message ─────────────────────────────────────────────────────

export async function sendPartnerMessage(
  pairId: string,
  senderId: string,
  message: string,
  type: MessageType
): Promise<void> {
  const { error } = await supabase.from('partner_messages').insert({
    pair_id: pairId,
    sender_id: senderId,
    message,
    message_type: type,
  });

  if (error) throw new Error('Failed to send partner message.');
}

// ─── Generate Invite Message (pure) ──────────────────────────────────────────

export function generateInviteMessage(pillar: string, inviteLink: string): string {
  return `I'm using GROWTHOVO to work on ${pillar}. I need you to hold me accountable. Download the app: ${inviteLink}`;
}

// ─── Determine Comparison Winner (pure) ──────────────────────────────────────

export function determineComparisonWinner(
  userStats: PartnerWeekStats,
  partnerStats: PartnerWeekStats
): string {
  if (userStats.challengesCompleted !== partnerStats.challengesCompleted) {
    return userStats.challengesCompleted > partnerStats.challengesCompleted
      ? userStats.userId
      : partnerStats.userId;
  }

  if (userStats.currentStreak !== partnerStats.currentStreak) {
    return userStats.currentStreak > partnerStats.currentStreak
      ? userStats.userId
      : partnerStats.userId;
  }

  // Still tied — user wins by default
  return userStats.userId;
}

// ─── Subscribe to Partner Check-In Status (Realtime + polling fallback) ──────

export function subscribeToPartnerCheckin(
  partnerId: string,
  onCheckin: (checkedIn: boolean) => void
): () => void {
  // Subscribe to daily_checkins changes for the partner
  const channel = supabase
    .channel(`partner-checkin-${partnerId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'daily_checkins',
      filter: `user_id=eq.${partnerId}`,
    }, (payload) => {
      const checkedIn = payload.new?.briefing_viewed_at != null;
      onCheckin(checkedIn);
    })
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'daily_checkins',
      filter: `user_id=eq.${partnerId}`,
    }, (payload) => {
      const checkedIn = payload.new?.briefing_viewed_at != null;
      onCheckin(checkedIn);
    })
    .subscribe();

  // Fallback polling every 60 seconds if Realtime disconnects
  const pollInterval = setInterval(async () => {
    try {
      const checkedIn = await getPartnerCheckinStatus('', partnerId);
      onCheckin(checkedIn);
    } catch {
      // Silently ignore polling errors
    }
  }, 60000);

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
    clearInterval(pollInterval);
  };
}

// ─── Generate Weekly Comparison ───────────────────────────────────────────────

export async function generateWeeklyComparison(
  pairId: string
): Promise<PartnerComparisonReport> {
  // Fetch the pair record
  const { data: pair, error: pairError } = await supabase
    .from('accountability_pairs')
    .select('*')
    .eq('id', pairId)
    .single();

  if (pairError || !pair) throw new Error('Pair not found.');

  // Determine current week start (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysToMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  // Fetch user names from profiles
  const { data: profiles } = await supabase
    .from('users')
    .select('id, username')
    .in('id', [pair.user_id, pair.partner_id]);

  const nameMap: Record<string, string> = {};
  (profiles ?? []).forEach((p: { id: string; username: string }) => {
    nameMap[p.id] = p.username;
  });

  // Aggregate challenge completions for both users this week
  const { data: completions } = await supabase
    .from('challenge_completions')
    .select('user_id')
    .in('user_id', [pair.user_id, pair.partner_id])
    .eq('completed', true)
    .gte('completed_at', weekStartStr);

  const completionCounts: Record<string, number> = {
    [pair.user_id]: 0,
    [pair.partner_id]: 0,
  };
  (completions ?? []).forEach((c: { user_id: string }) => {
    if (completionCounts[c.user_id] !== undefined) {
      completionCounts[c.user_id]++;
    }
  });

  // Fetch current streaks for both users
  const { data: streaks } = await supabase
    .from('streaks')
    .select('user_id, current_streak')
    .in('user_id', [pair.user_id, pair.partner_id]);

  const streakMap: Record<string, number> = {
    [pair.user_id]: 0,
    [pair.partner_id]: 0,
  };
  (streaks ?? []).forEach((s: { user_id: string; current_streak: number }) => {
    if (streakMap[s.user_id] !== undefined) {
      streakMap[s.user_id] = s.current_streak;
    }
  });

  // Fetch SOS event counts for both users this week
  const { data: sosEvents } = await supabase
    .from('sos_events')
    .select('user_id')
    .in('user_id', [pair.user_id, pair.partner_id])
    .gte('timestamp', weekStartStr);

  const sosCounts: Record<string, number> = {
    [pair.user_id]: 0,
    [pair.partner_id]: 0,
  };
  (sosEvents ?? []).forEach((e: { user_id: string }) => {
    if (sosCounts[e.user_id] !== undefined) {
      sosCounts[e.user_id]++;
    }
  });

  const userStats: PartnerWeekStats = {
    userId: pair.user_id,
    name: nameMap[pair.user_id] ?? 'You',
    challengesCompleted: completionCounts[pair.user_id],
    currentStreak: streakMap[pair.user_id],
    sosEventsCount: sosCounts[pair.user_id],
  };

  const partnerStats: PartnerWeekStats = {
    userId: pair.partner_id,
    name: nameMap[pair.partner_id] ?? 'Partner',
    challengesCompleted: completionCounts[pair.partner_id],
    currentStreak: streakMap[pair.partner_id],
    sosEventsCount: sosCounts[pair.partner_id],
  };

  const winnerId = determineComparisonWinner(userStats, partnerStats);
  const winnerName = winnerId === userStats.userId ? userStats.name : partnerStats.name;

  const notificationText =
    `Week recap: ${userStats.name} ${userStats.challengesCompleted} challenges vs ` +
    `${partnerStats.name} ${partnerStats.challengesCompleted} challenges. ` +
    `${winnerName} wins this week.`;

  return {
    weekStart: weekStartStr,
    userStats,
    partnerStats,
    winnerId,
    notificationText,
  };
}
