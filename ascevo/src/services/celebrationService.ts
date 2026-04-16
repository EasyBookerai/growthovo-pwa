// 🎉 Celebration Service
// Manages celebration triggers and history tracking
// Stores celebration events in the database for analytics

import { supabase } from './supabaseClient';
import type { CelebrationData } from './animationService';

/**
 * Store a celebration event in the celebration_history table
 * 
 * This function persists celebration events to the database for analytics
 * and tracking purposes. It does not throw errors to avoid blocking the
 * main flow if celebration logging fails.
 * 
 * @param userId - The user ID who triggered the celebration
 * @param celebrationData - The celebration data to store
 */
export async function storeCelebrationEvent(
  userId: string,
  celebrationData: CelebrationData
): Promise<void> {
  try {
    const { error } = await supabase
      .from('celebration_history')
      .insert({
        user_id: userId,
        celebration_type: celebrationData.type,
        data: celebrationData,
      });
    
    if (error) {
      console.error('Failed to store celebration event:', error);
      // Don't throw - celebration logging is non-critical
    }
  } catch (err) {
    console.error('Error storing celebration event:', err);
    // Don't throw - celebration logging is non-critical
  }
}

/**
 * Get celebration history for a user
 * 
 * Fetches all celebration events for analytics and display purposes.
 * 
 * @param userId - The user ID to fetch celebrations for
 * @param limit - Maximum number of celebrations to fetch (default: 50)
 * @returns Array of celebration events
 */
export async function getCelebrationHistory(
  userId: string,
  limit: number = 50
): Promise<Array<{
  id: string;
  userId: string;
  celebrationType: string;
  data: CelebrationData;
  triggeredAt: string;
}>> {
  const { data, error } = await supabase
    .from('celebration_history')
    .select('*')
    .eq('user_id', userId)
    .order('triggered_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    throw new Error(`Failed to fetch celebration history: ${error.message}`);
  }
  
  return (data ?? []).map(row => ({
    id: row.id,
    userId: row.user_id,
    celebrationType: row.celebration_type,
    data: row.data,
    triggeredAt: row.triggered_at,
  }));
}

/**
 * Get celebration count by type for a user
 * 
 * Returns statistics about how many celebrations of each type
 * the user has triggered.
 * 
 * @param userId - The user ID to get stats for
 * @returns Object mapping celebration type to count
 */
export async function getCelebrationStats(
  userId: string
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('celebration_history')
    .select('celebration_type')
    .eq('user_id', userId);
  
  if (error) {
    throw new Error(`Failed to fetch celebration stats: ${error.message}`);
  }
  
  const stats: Record<string, number> = {};
  (data ?? []).forEach(row => {
    const type = row.celebration_type;
    stats[type] = (stats[type] || 0) + 1;
  });
  
  return stats;
}
