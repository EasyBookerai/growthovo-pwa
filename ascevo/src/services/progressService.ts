import { supabase } from './supabaseClient';
import type { XPSource } from '../types';
import { PILLAR_LEVEL_THRESHOLDS, XP_AWARDS } from '../types';
import { storeCelebrationEvent } from './celebrationService';
import type { CelebrationData } from './animationService';

// ─── Award XP ─────────────────────────────────────────────────────────────────

export async function awardXP(
  userId: string,
  amount: number,
  source: XPSource,
  referenceId?: string,
  onCelebration?: (data: CelebrationData) => void
): Promise<void> {
  // Get pillar ID if this is a lesson-based XP award
  let pillarId: string | undefined;
  let previousXP = 0;
  
  if (source === 'lesson' && referenceId) {
    try {
      const { data: lesson } = await supabase
        .from('lessons')
        .select('units!inner(pillar_id)')
        .eq('id', referenceId)
        .single();
      
      if (lesson) {
        pillarId = (lesson.units as any).pillar_id;
        // Get previous XP for level-up check
        previousXP = await getPillarXP(userId, pillarId);
      }
    } catch (err) {
      // If we can't get pillar info, just skip level-up check
      console.warn('Could not fetch pillar info for level-up check:', err);
    }
  }
  
  const { error } = await supabase.from('xp_transactions').insert({
    user_id: userId,
    amount,
    source,
    reference_id: referenceId ?? null,
  });

  if (error) throw new Error('Failed to record XP transaction.');
  
  // 🎉 Check for level-up and trigger celebration
  if (pillarId) {
    try {
      const didLevelUp = await checkLevelUp(userId, pillarId, previousXP);
      
      if (didLevelUp) {
        const newLevel = await getPillarLevel(userId, pillarId);
        
        const celebrationData: CelebrationData = {
          type: 'level_up',
          title: 'Level Up!',
          subtitle: `You reached level ${newLevel}!`,
          newLevel,
          intensity: newLevel >= 10 ? 'high' : newLevel >= 5 ? 'medium' : 'low',
        };
        
        // Store celebration event in database
        await storeCelebrationEvent(userId, celebrationData);
        
        // Trigger celebration callback if provided
        if (onCelebration) {
          onCelebration(celebrationData);
        }
      }
    } catch (err) {
      // Don't fail the XP award if celebration fails
      console.warn('Could not trigger level-up celebration:', err);
    }
  }
}

// ─── Get Total XP ─────────────────────────────────────────────────────────────

export async function getTotalXP(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('xp_transactions')
    .select('amount')
    .eq('user_id', userId);

  if (error) throw new Error('Failed to fetch XP transactions.');
  return (data ?? []).reduce((sum, tx) => sum + tx.amount, 0);
}

// ─── Get Pillar XP ────────────────────────────────────────────────────────────
// XP earned from lessons within a specific pillar.

export async function getPillarXP(userId: string, pillarId: string): Promise<number> {
  // Get all lesson IDs in this pillar
  const { data: lessons, error: lessonError } = await supabase
    .from('lessons')
    .select('id, units!inner(pillar_id)')
    .eq('units.pillar_id', pillarId);

  if (lessonError) throw new Error('Failed to fetch pillar lessons.');

  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) return 0;

  // Sum XP from those lessons
  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .select('xp_earned')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);

  if (progressError) throw new Error('Failed to fetch pillar progress.');
  return (progress ?? []).reduce((sum, p) => sum + p.xp_earned, 0);
}

// ─── Get Pillar Level ─────────────────────────────────────────────────────────
// Returns level 1-10 based on XP in that pillar.

export async function getPillarLevel(userId: string, pillarId: string): Promise<number> {
  const xp = await getPillarXP(userId, pillarId);
  return calculateLevel(xp);
}

// ─── Check Level Up ───────────────────────────────────────────────────────────
// Returns true if the new XP amount crosses a level threshold.

export async function checkLevelUp(
  userId: string,
  pillarId: string,
  previousXP: number
): Promise<boolean> {
  const newXP = await getPillarXP(userId, pillarId);
  const previousLevel = calculateLevel(previousXP);
  const newLevel = calculateLevel(newXP);
  return newLevel > previousLevel;
}

// ─── Get All Pillar Levels ────────────────────────────────────────────────────
// Returns a map of pillarId → level for the spider chart.

export async function getAllPillarLevels(
  userId: string,
  pillarIds: string[]
): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  await Promise.all(
    pillarIds.map(async (id) => {
      results[id] = await getPillarLevel(userId, id);
    })
  );
  return results;
}

// ─── Pure helpers (used in tests without DB) ─────────────────────────────────

export function calculateLevel(xp: number): number {
  for (let level = PILLAR_LEVEL_THRESHOLDS.length - 1; level >= 0; level--) {
    if (xp >= PILLAR_LEVEL_THRESHOLDS[level]) return level + 1;
  }
  return 1;
}

export function xpForNextLevel(currentXP: number): { current: number; required: number; level: number } {
  const level = calculateLevel(currentXP);
  const nextThreshold = PILLAR_LEVEL_THRESHOLDS[level] ?? PILLAR_LEVEL_THRESHOLDS[PILLAR_LEVEL_THRESHOLDS.length - 1];
  return { current: currentXP, required: nextThreshold, level };
}

export function sumTransactions(amounts: number[]): number {
  return amounts.reduce((sum, a) => sum + a, 0);
}
