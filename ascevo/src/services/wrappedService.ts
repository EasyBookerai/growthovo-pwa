import { supabase } from './supabaseClient';
import type { WrappedData, WrappedPeriod, WrappedSummary } from '../types';

// ─── Get or Generate Wrapped ──────────────────────────────────────────────────

/**
 * Calls the generate-wrapped Edge Function to fetch or create a WrappedSummary.
 * The Edge Function is idempotent — calling it twice returns the same record.
 */
export async function getOrGenerateWrapped(
  userId: string,
  period: WrappedPeriod
): Promise<WrappedSummary> {
  const { data, error } = await supabase.functions.invoke('generate-wrapped', {
    body: { userId, period },
  });

  if (error) throw new Error(`Failed to generate wrapped: ${error.message}`);
  if (!data) throw new Error('No data returned from generate-wrapped');

  return data as WrappedSummary;
}

// ─── Eligibility Check ────────────────────────────────────────────────────────

/**
 * Returns true if the user has been active on at least 7 days this month.
 * Validates: Requirements 4.3
 */
export function isEligibleForMonthlyWrapped(activeDaysThisMonth: number): boolean {
  return activeDaysThisMonth >= 7;
}

// ─── Share Caption ────────────────────────────────────────────────────────────

/**
 * Returns a pre-written share caption for the Wrapped summary.
 * Validates: Requirements 4.9, 4.10
 */
export function getShareCaption(data: WrappedData, period: WrappedPeriod): string {
  return `My ${period} GROWTHOVO Wrapped: ${data.totalLessons} lessons, ${data.longestStreak} day streak, ${data.totalXp} XP. My strongest pillar: ${data.strongestPillar}. @growthovo`;
}
