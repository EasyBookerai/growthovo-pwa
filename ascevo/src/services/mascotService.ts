/**
 * Mascot Service
 * 
 * Handles all mascot-related business logic and API calls
 */

import { supabase } from './supabaseClient';
import {
  MascotStatus,
  MascotEvolutionEvent,
  MascotEvolutionHistory,
  MascotStage,
  UserMascotProgress,
} from '../types/mascot';

/**
 * Get the current user's mascot status
 */
export async function getUserMascotStatus(
  userId: string
): Promise<MascotStatus | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_mascot_status', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching mascot status:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Transform snake_case to camelCase
    const status: MascotStatus = {
      stageId: data[0].stage_id,
      stageName: data[0].stage_name,
      stageDescription: data[0].stage_description,
      currentLevel: data[0].current_level,
      totalXP: data[0].total_xp,
      xpForNextLevel: data[0].xp_for_next_level,
      xpForNextStage: data[0].xp_for_next_stage,
      nextStageLevel: data[0].next_stage_level,
      lastEvolutionAt: data[0].last_evolution_at,
    };

    return status;
  } catch (err) {
    console.error('Unexpected error in getUserMascotStatus:', err);
    return null;
  }
}

/**
 * Get user's mascot evolution history
 */
export async function getMascotEvolutionHistory(
  userId: string
): Promise<MascotEvolutionHistory[]> {
  try {
    const { data, error } = await supabase
      .from('mascot_evolution_history')
      .select('*')
      .eq('user_id', userId)
      .order('evolved_at', { ascending: false });

    if (error) {
      console.error('Error fetching evolution history:', error);
      return [];
    }

    return (data || []).map((record) => ({
      id: record.id,
      userId: record.user_id,
      fromStage: record.from_stage,
      toStage: record.to_stage,
      xpAtEvolution: record.xp_at_evolution,
      levelAtEvolution: record.level_at_evolution,
      evolvedAt: record.evolved_at,
    }));
  } catch (err) {
    console.error('Unexpected error in getMascotEvolutionHistory:', err);
    return [];
  }
}

/**
 * Subscribe to mascot progress changes (real-time)
 */
export function subscribeMascotProgress(
  userId: string,
  callback: (progress: UserMascotProgress | null) => void
) {
  const subscription = supabase
    .channel(`mascot_progress:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_mascot_progress',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) {
          const progress: UserMascotProgress = {
            userId: payload.new.user_id,
            currentStage: payload.new.current_stage,
            totalXP: payload.new.total_xp,
            currentLevel: payload.new.current_level,
            lastEvolutionAt: payload.new.last_evolution_at,
            createdAt: payload.new.created_at,
            updatedAt: payload.new.updated_at,
          };
          callback(progress);
        }
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Subscribe to mascot evolutions (real-time)
 * Triggers callback when user's mascot evolves
 */
export function subscribeMascotEvolutions(
  userId: string,
  callback: (evolution: MascotEvolutionHistory) => void
) {
  const subscription = supabase
    .channel(`mascot_evolution:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mascot_evolution_history',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) {
          const evolution: MascotEvolutionHistory = {
            id: payload.new.id,
            userId: payload.new.user_id,
            fromStage: payload.new.from_stage,
            toStage: payload.new.to_stage,
            xpAtEvolution: payload.new.xp_at_evolution,
            levelAtEvolution: payload.new.level_at_evolution,
            evolvedAt: payload.new.evolved_at,
          };
          callback(evolution);
        }
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Manually trigger mascot progression update
 * (Usually not needed as it's triggered automatically via database trigger)
 */
export async function updateMascotProgression(
  userId: string,
  xpGained: number
): Promise<MascotEvolutionEvent | null> {
  try {
    const { data, error } = await supabase.rpc('update_mascot_progression', {
      p_user_id: userId,
      p_xp_gained: xpGained,
    });

    if (error) {
      console.error('Error updating mascot progression:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const result: MascotEvolutionEvent = {
      newStage: data[0].new_stage,
      newLevel: data[0].new_level,
      newXP: data[0].new_xp,
      evolved: data[0].evolved,
      previousStage: data[0].previous_stage,
    };

    return result;
  } catch (err) {
    console.error('Unexpected error in updateMascotProgression:', err);
    return null;
  }
}

/**
 * Get mascot progress percentage to next stage
 */
export function calculateStageProgress(status: MascotStatus): number {
  if (status.xpForNextStage === 0) {
    // Already at max stage
    return 100;
  }

  // Calculate what percentage of XP is earned towards next stage
  const totalXPNeeded = status.xpForNextStage + status.totalXP;
  const progress = (status.totalXP / totalXPNeeded) * 100;

  return Math.min(100, Math.max(0, progress));
}

/**
 * Get display text for mascot stage
 */
export function getStageName(stage: MascotStage): string {
  const names: Record<MascotStage, string> = {
    [MascotStage.EGG]: 'Egg',
    [MascotStage.HATCHLING]: 'Hatchling',
    [MascotStage.JUVENILE]: 'Juvenile Griffin',
    [MascotStage.MASTER]: 'Master Griffin',
  };

  return names[stage] || 'Unknown';
}

/**
 * Check if user can evolve to next stage
 */
export function canEvolve(status: MascotStatus): boolean {
  return (
    status.stageId < MascotStage.MASTER &&
    status.currentLevel >= status.nextStageLevel
  );
}
