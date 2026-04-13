import { supabase } from './supabaseClient';
import { getTotalXP } from './progressService';
import { scheduleCapsuleUnlockNotification } from './notificationService';
import type { TimeCapsule, PillarKey } from '../types';

// ─── Create Time Capsule ──────────────────────────────────────────────────────

export async function createCapsule(
  userId: string,
  videoUri: string,
  promises: [string, string, string],
  primaryPillar: PillarKey,
  quizScores: Record<PillarKey, number>
): Promise<TimeCapsule> {
  const videoUrl = await uploadVideo(userId, videoUri);
  const startingXp = await getTotalXP(userId);

  const { data, error } = await supabase
    .from('time_capsules')
    .insert({
      user_id: userId,
      video_url: videoUrl,
      promise_1: promises[0],
      promise_2: promises[1],
      promise_3: promises[2],
      primary_pillar: primaryPillar,
      quiz_scores: quizScores,
      starting_xp: startingXp,
    })
    .select()
    .single();

  if (error) throw new Error('Failed to create time capsule.');

  const capsule = mapCapsule(data);
  await scheduleCapsuleUnlockNotification(capsule.createdAt);
  return capsule;
}

// ─── Upload Video to Storage ──────────────────────────────────────────────────

async function uploadVideo(userId: string, videoUri: string): Promise<string> {
  const ext = videoUri.split('.').pop() ?? 'mp4';
  const path = `capsules/${userId}/${Date.now()}.${ext}`;

  const response = await fetch(videoUri);
  const blob = await response.blob();

  const { error } = await supabase.storage.from('capsule-videos').upload(path, blob, { upsert: false });
  if (error) throw new Error('Failed to upload capsule video.');

  const { data } = supabase.storage.from('capsule-videos').getPublicUrl(path);
  return data.publicUrl;
}

// ─── Get Capsule Status ───────────────────────────────────────────────────────

export async function getCapsuleStatus(userId: string): Promise<{
  exists: boolean;
  daysRemaining: number;
  unlocked: boolean;
}> {
  const { data, error } = await supabase
    .from('time_capsules')
    .select('created_at, unlocked_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error('Failed to fetch capsule status.');
  if (!data) return { exists: false, daysRemaining: 0, unlocked: false };

  const unlockDate = new Date(new Date(data.created_at).getTime() + 90 * 24 * 60 * 60 * 1000);
  const daysRemaining = Math.max(0, Math.ceil((unlockDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

  return {
    exists: true,
    daysRemaining,
    unlocked: !!data.unlocked_at,
  };
}

// ─── Unlock Capsule ───────────────────────────────────────────────────────────

export async function unlockCapsule(userId: string): Promise<TimeCapsule> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('time_capsules')
    .update({ unlocked_at: now })
    .eq('user_id', userId)
    .is('unlocked_at', null)
    .select()
    .single();

  if (error) throw new Error('Failed to unlock capsule.');
  return mapCapsule(data);
}

// ─── Get Capsule Rex Reaction ─────────────────────────────────────────────────
// Pure function — 3 streak ranges

export function getCapsuleRexReaction(currentStreak: number): string {
  if (currentStreak > 60) return "You did it. I didn't doubt you. Much.";
  if (currentStreak >= 30) return "Not perfect. But you showed up more than most.";
  return "Watch the video. Then decide if day 91 is different.";
}

// ─── Map DB row → TimeCapsule ─────────────────────────────────────────────────

function mapCapsule(row: any): TimeCapsule {
  return {
    id: row.id,
    userId: row.user_id,
    videoUrl: row.video_url,
    promise1: row.promise_1,
    promise2: row.promise_2,
    promise3: row.promise_3,
    primaryPillar: row.primary_pillar,
    quizScores: row.quiz_scores,
    startingXp: row.starting_xp,
    createdAt: row.created_at,
    unlockedAt: row.unlocked_at ?? undefined,
  };
}