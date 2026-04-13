import { supabase } from './supabaseClient';
import * as Linking from 'expo-linking';

// ─── Generate Invite Link ─────────────────────────────────────────────────────

export function generateInviteLink(userId: string): string {
  return Linking.createURL('invite', { queryParams: { ref: userId } });
}

// ─── Accept Friend Invite ─────────────────────────────────────────────────────
// Creates bidirectional friendship rows.

export async function acceptFriendInvite(userId: string, friendId: string): Promise<void> {
  if (userId === friendId) throw new Error('You cannot add yourself as a friend.');

  // Check if already friends
  const { data: existing } = await supabase
    .from('friends')
    .select('id')
    .eq('user_id', userId)
    .eq('friend_id', friendId)
    .maybeSingle();

  if (existing) return; // Already friends

  // Insert both directions
  const { error } = await supabase.from('friends').insert([
    { user_id: userId, friend_id: friendId },
    { user_id: friendId, friend_id: userId },
  ]);

  if (error) throw new Error('Failed to add friend.');
}

// ─── Get Friends Streaks ──────────────────────────────────────────────────────

export async function getFriendsStreaks(userId: string): Promise<
  { friendId: string; username: string; avatarUrl?: string; currentStreak: number }[]
> {
  const { data, error } = await supabase
    .from('friends')
    .select(`
      friend_id,
      users!friends_friend_id_fkey(username, avatar_url),
      streaks!inner(current_streak)
    `)
    .eq('user_id', userId);

  if (error) throw new Error('Failed to fetch friend streaks.');

  return (data ?? []).map((f: any) => ({
    friendId: f.friend_id,
    username: f.users?.username ?? 'Unknown',
    avatarUrl: f.users?.avatar_url,
    currentStreak: f.streaks?.current_streak ?? 0,
  }));
}

// ─── Subscribe to Friend Streaks (Realtime) ───────────────────────────────────

export function subscribeFriendStreaks(
  userId: string,
  friendIds: string[],
  onUpdate: () => void
) {
  if (friendIds.length === 0) return null;

  return supabase
    .channel(`friend-streaks-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'streaks',
        filter: `user_id=in.(${friendIds.join(',')})`,
      },
      onUpdate
    )
    .subscribe();
}
