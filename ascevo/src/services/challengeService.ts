import { supabase } from './supabaseClient';
import { awardXP } from './progressService';
import { XP_AWARDS } from '../types';
import type { Challenge, ChallengeCompletion } from '../types';

// ─── Get Today's Challenge ────────────────────────────────────────────────────
// Returns the challenge for the most recently completed lesson today,
// or the next lesson's challenge if none completed today.

export async function getTodayChallenge(userId: string): Promise<Challenge | null> {
  // Find the most recently completed lesson
  const { data: progress } = await supabase
    .from('user_progress')
    .select('lesson_id, completed_at')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!progress) return null;

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('lesson_id', progress.lesson_id)
    .maybeSingle();

  if (!challenge) return null;
  return { id: challenge.id, lessonId: challenge.lesson_id, description: challenge.description };
}

// ─── Submit Check-in ──────────────────────────────────────────────────────────
// Enforces one submission per user per calendar day.
// Returns the completion record and XP awarded.

export async function submitCheckIn(
  userId: string,
  challengeId: string,
  completed: boolean,
  proofPhotoUrl?: string
): Promise<{ completion: ChallengeCompletion; xpAwarded: number }> {
  const today = new Date().toISOString().split('T')[0];

  // Check for existing submission today
  const { data: existing } = await supabase
    .from('challenge_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .gte('completed_at', `${today}T00:00:00.000Z`)
    .lt('completed_at', `${today}T23:59:59.999Z`)
    .maybeSingle();

  if (existing) {
    throw new Error('You have already checked in for this challenge today.');
  }

  // Determine XP
  const xpAwarded = completed ? XP_AWARDS.CHECKIN_POSITIVE : XP_AWARDS.CHECKIN_NEGATIVE;

  const { data, error } = await supabase
    .from('challenge_completions')
    .insert({
      user_id: userId,
      challenge_id: challengeId,
      completed,
      proof_photo_url: proofPhotoUrl ?? null,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error('Failed to submit check-in.');

  await awardXP(userId, xpAwarded, completed ? 'challenge' : 'checkin', challengeId);

  const completion: ChallengeCompletion = {
    id: data.id,
    userId: data.user_id,
    challengeId: data.challenge_id,
    completed: data.completed,
    proofPhotoUrl: data.proof_photo_url,
    rexResponse: data.rex_response,
    completedAt: data.completed_at,
  };

  return { completion, xpAwarded };
}

// ─── Get Today's Completion ───────────────────────────────────────────────────

export async function getTodayCompletion(userId: string, challengeId: string): Promise<ChallengeCompletion | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('challenge_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .gte('completed_at', `${today}T00:00:00.000Z`)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    challengeId: data.challenge_id,
    completed: data.completed,
    proofPhotoUrl: data.proof_photo_url,
    rexResponse: data.rex_response,
    completedAt: data.completed_at,
  };
}

// ─── Save Rex Response to Completion ─────────────────────────────────────────

export async function saveRexResponse(completionId: string, rexResponse: string): Promise<void> {
  await supabase
    .from('challenge_completions')
    .update({ rex_response: rexResponse })
    .eq('id', completionId);
}

// ─── Get Hardest Challenge for Pillar ────────────────────────────────────────
// Returns the challenge from the highest display_order lesson in the pillar

export async function getHardestChallengeForPillar(pillarKey: string): Promise<Challenge | null> {
  const { data } = await supabase
    .from('challenges')
    .select(`
      id,
      lesson_id,
      description,
      lessons!inner(
        id,
        display_order,
        units!inner(
          pillar_id,
          pillars!inner(
            name
          )
        )
      )
    `)
    .eq('lessons.units.pillars.name', pillarKey)
    .order('lessons.display_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  
  return {
    id: data.id,
    lessonId: data.lesson_id,
    description: data.description,
  };
}
