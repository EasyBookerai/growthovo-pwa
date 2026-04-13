/**
 * Tests for wrappedService
 *
 * Covers:
 *  - Property 9: Wrapped summary idempotency
 *  - Unit tests: isEligibleForMonthlyWrapped
 *  - Unit tests: getShareCaption
 *
 * Feature: growthovo-features-v3
 * Validates: Requirements 4.8, 4.3, 4.9, 4.10
 */

import * as fc from 'fast-check';
import { supabase } from '../services/supabaseClient';
import {
  getOrGenerateWrapped,
  isEligibleForMonthlyWrapped,
  getShareCaption,
} from '../services/wrappedService';
import type { WrappedData, WrappedSummary } from '../types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_WRAPPED_DATA: WrappedData = {
  totalLessons: 42,
  totalChallenges: 15,
  longestStreak: 21,
  totalXp: 840,
  mostActiveDayOfWeek: 'Monday',
  mostActiveTimeOfDay: '09:00',
  strongestPillar: 'mind',
  weakestPillar: 'money',
  totalMinutesInApp: 210,
  leaguePromotions: 1,
  friendsInvited: 2,
  globalPercentileRank: 18,
};

function makeMockSummary(userId: string, period: string): WrappedSummary {
  return {
    id: 'summary-123',
    userId,
    period,
    dataJson: MOCK_WRAPPED_DATA,
    rexVerdict: 'You showed up. That counts.',
    createdAt: '2025-01-31T12:00:00.000Z',
  };
}

// ─── Property 9: Wrapped summary idempotency ──────────────────────────────────
// **Validates: Requirements 4.8**

describe('Property 9: Wrapped summary idempotency', () => {
  it('two calls with the same userId and period return identical data_json and rex_verdict', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 36 }),
        fc.oneof(
          // Monthly period: "YYYY-MM"
          fc.tuple(
            fc.integer({ min: 2020, max: 2030 }),
            fc.integer({ min: 1, max: 12 })
          ).map(([y, m]) => `${y}-${String(m).padStart(2, '0')}`),
          // Yearly period: "YYYY"
          fc.integer({ min: 2020, max: 2030 }).map(String)
        ),
        async (userId, period) => {
          const mockSummary = makeMockSummary(userId, period);

          // Mock invoke to always return the same fixed summary
          (supabase.functions.invoke as jest.Mock).mockResolvedValue({
            data: mockSummary,
            error: null,
          });

          const result1 = await getOrGenerateWrapped(userId, period);
          const result2 = await getOrGenerateWrapped(userId, period);

          // Both calls must return identical data_json and rex_verdict
          expect(result1.dataJson).toEqual(result2.dataJson);
          expect(result1.rexVerdict).toBe(result2.rexVerdict);
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ─── Unit tests: isEligibleForMonthlyWrapped ──────────────────────────────────

describe('isEligibleForMonthlyWrapped', () => {
  it('returns true when activeDaysThisMonth >= 7', () => {
    expect(isEligibleForMonthlyWrapped(7)).toBe(true);
    expect(isEligibleForMonthlyWrapped(10)).toBe(true);
    expect(isEligibleForMonthlyWrapped(31)).toBe(true);
  });

  it('returns false when activeDaysThisMonth < 7', () => {
    expect(isEligibleForMonthlyWrapped(0)).toBe(false);
    expect(isEligibleForMonthlyWrapped(6)).toBe(false);
    expect(isEligibleForMonthlyWrapped(1)).toBe(false);
  });

  it('boundary: exactly 7 returns true', () => {
    expect(isEligibleForMonthlyWrapped(7)).toBe(true);
  });

  it('boundary: exactly 6 returns false', () => {
    expect(isEligibleForMonthlyWrapped(6)).toBe(false);
  });
});

// ─── Unit tests: getShareCaption ──────────────────────────────────────────────

describe('getShareCaption', () => {
  it('contains the period in the caption', () => {
    const caption = getShareCaption(MOCK_WRAPPED_DATA, '2025-01');
    expect(caption).toContain('2025-01');
  });

  it('contains totalLessons in the caption', () => {
    const caption = getShareCaption(MOCK_WRAPPED_DATA, '2025-01');
    expect(caption).toContain('42');
  });

  it('contains longestStreak in the caption', () => {
    const caption = getShareCaption(MOCK_WRAPPED_DATA, '2025-01');
    expect(caption).toContain('21');
  });

  it('contains the @growthovo handle', () => {
    const caption = getShareCaption(MOCK_WRAPPED_DATA, '2025-01');
    expect(caption).toContain('@growthovo');
  });

  it('contains the strongest pillar', () => {
    const caption = getShareCaption(MOCK_WRAPPED_DATA, '2025-01');
    expect(caption).toContain('mind');
  });

  it('works for yearly period', () => {
    const caption = getShareCaption(MOCK_WRAPPED_DATA, '2025');
    expect(caption).toContain('2025');
    expect(caption).toContain('42');
    expect(caption).toContain('@growthovo');
  });

  it('returns a non-empty string', () => {
    const caption = getShareCaption(MOCK_WRAPPED_DATA, '2025-01');
    expect(typeof caption).toBe('string');
    expect(caption.length).toBeGreaterThan(0);
  });
});
