/**
 * Property-Based Tests — Report Service
 *
 * Uses fast-check to verify correctness properties of reportService.ts.
 *
 * Covers:
 *   Property 14: Weekly report idempotency
 *     Calling getOrGenerateWeeklyReport twice with the same userId+weekStart
 *     must return identical numbers_json, pattern_analysis, verdict_text,
 *     and next_week_focus_json.
 *
 * Also covers unit tests for pure fallback helpers:
 *   - getReportFallbackVerdict() returns a non-empty string
 *   - getReportFallbackPatternAnalysis() returns a non-empty string
 *
 * Validates: Requirements 22.5
 */

import * as fc from 'fast-check';
import {
  getOrGenerateWeeklyReport,
  getReportFallbackVerdict,
  getReportFallbackPatternAnalysis,
} from '../services/reportService';
import type { WeeklyRexReport, WeeklyReportNumbers, NextWeekFocus, SOSType } from '../types';

// ---------------------------------------------------------------------------
// Mock supabaseClient
// ---------------------------------------------------------------------------
jest.mock('../services/supabaseClient');
import { supabase } from '../services/supabaseClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SOS_TYPES: SOSType[] = [
  'anxiety_spike',
  'about_to_react',
  'zero_motivation',
  'hard_conversation',
  'habit_urge',
  'overwhelmed',
];

function makeSosByType(counts: number[]): Record<SOSType, number> {
  return Object.fromEntries(SOS_TYPES.map((t, i) => [t, counts[i] ?? 0])) as Record<SOSType, number>;
}

function makeReport(userId: string, weekStart: string): WeeklyRexReport {
  const numbers: WeeklyReportNumbers = {
    lessonsCompleted: 3,
    challengesDone: 5,
    challengesMissed: 2,
    sosByType: makeSosByType([1, 0, 2, 0, 1, 0]),
    morningCheckinStreak: 6,
    eveningDebriefRate: 0.71,
    xpEarned: 340,
  };
  const focus: NextWeekFocus = {
    pillar: 'Discipline',
    habit: 'Cold shower every morning',
    challengeToDoDifferently: 'Start the hardest task before checking your phone',
  };
  return {
    id: 'report-id-1',
    userId,
    weekStart,
    numbersJson: numbers,
    patternAnalysis: 'You start strong but fade mid-week.\nSOS spikes on Wednesday.\nMorning check-ins are your most consistent habit.',
    verdictText: 'Solid week. You showed up. Now raise the bar.',
    audioUrl: null,
    nextWeekFocusJson: focus,
    createdAt: '2024-01-07T20:00:00Z',
  };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** ISO date string in YYYY-MM-DD format for a Monday */
const arbWeekStart = fc.date({
  min: new Date('2023-01-02'),
  max: new Date('2025-12-29'),
}).map((d) => {
  // Snap to Monday
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
});

const arbUserId = fc.uuid();

// ---------------------------------------------------------------------------
// Property 14: Weekly report idempotency
// Validates: Requirements 22.5
// ---------------------------------------------------------------------------
describe('Property 14: Weekly report idempotency', () => {
  /**
   * Strategy:
   * - First call: supabase.from().select() returns null (no cache) → Edge Function invoked
   * - Second call: supabase.from().select() returns the cached report → Edge Function NOT invoked
   * Both calls must return identical data for the four key fields.
   */
  it('returns identical report data on two calls for the same userId+weekStart', async () => {
    await fc.assert(
      fc.asyncProperty(arbUserId, arbWeekStart, async (userId, weekStart) => {
        const report = makeReport(userId, weekStart);

        // Map the report to the raw DB row shape that mapRowToReport expects
        const dbRow = {
          id: report.id,
          user_id: report.userId,
          week_start: report.weekStart,
          numbers_json: report.numbersJson,
          pattern_analysis: report.patternAnalysis,
          verdict_text: report.verdictText,
          audio_url: report.audioUrl,
          next_week_focus_json: report.nextWeekFocusJson,
          created_at: report.createdAt,
        };

        // Build chainable mock for supabase.from('weekly_rex_reports')
        let callCount = 0;
        const maybeSingleMock = jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            // First call: no cached report
            return Promise.resolve({ data: null, error: null });
          }
          // Second call: cached report exists
          return Promise.resolve({ data: dbRow, error: null });
        });

        const chainable = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: maybeSingleMock,
        };

        (supabase.from as jest.Mock).mockReturnValue(chainable);

        // Edge Function returns the generated report on first call
        (supabase.functions.invoke as jest.Mock).mockResolvedValue({
          data: report,
          error: null,
        });

        const result1 = await getOrGenerateWeeklyReport(userId, weekStart);
        const result2 = await getOrGenerateWeeklyReport(userId, weekStart);

        // Assert the four key idempotency fields are identical
        return (
          JSON.stringify(result1.numbersJson) === JSON.stringify(result2.numbersJson) &&
          result1.patternAnalysis === result2.patternAnalysis &&
          result1.verdictText === result2.verdictText &&
          JSON.stringify(result1.nextWeekFocusJson) === JSON.stringify(result2.nextWeekFocusJson)
        );
      }),
      { numRuns: 50 }
    );
  });

  it('does not invoke the Edge Function on the second call when cache exists', async () => {
    await fc.assert(
      fc.asyncProperty(arbUserId, arbWeekStart, async (userId, weekStart) => {
        const report = makeReport(userId, weekStart);
        const dbRow = {
          id: report.id,
          user_id: report.userId,
          week_start: report.weekStart,
          numbers_json: report.numbersJson,
          pattern_analysis: report.patternAnalysis,
          verdict_text: report.verdictText,
          audio_url: report.audioUrl,
          next_week_focus_json: report.nextWeekFocusJson,
          created_at: report.createdAt,
        };

        let callCount = 0;
        const maybeSingleMock = jest.fn().mockImplementation(() => {
          callCount++;
          return callCount === 1
            ? Promise.resolve({ data: null, error: null })
            : Promise.resolve({ data: dbRow, error: null });
        });

        const chainable = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: maybeSingleMock,
        };

        (supabase.from as jest.Mock).mockReturnValue(chainable);

        const invokeMock = jest.fn().mockResolvedValue({ data: report, error: null });
        (supabase.functions.invoke as jest.Mock) = invokeMock;

        await getOrGenerateWeeklyReport(userId, weekStart);
        await getOrGenerateWeeklyReport(userId, weekStart);

        // Edge Function should only be called once (on the first call)
        return invokeMock.mock.calls.length === 1;
      }),
      { numRuns: 50 }
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests — getReportFallbackVerdict
// ---------------------------------------------------------------------------
describe('getReportFallbackVerdict — unit tests', () => {
  it('returns a non-empty string', () => {
    const verdict = getReportFallbackVerdict();
    expect(typeof verdict).toBe('string');
    expect(verdict.length).toBeGreaterThan(0);
  });

  it('always returns a non-empty string across multiple calls', () => {
    for (let i = 0; i < 20; i++) {
      const verdict = getReportFallbackVerdict();
      expect(verdict.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Unit tests — getReportFallbackPatternAnalysis
// ---------------------------------------------------------------------------
describe('getReportFallbackPatternAnalysis — unit tests', () => {
  it('returns a non-empty string', () => {
    const analysis = getReportFallbackPatternAnalysis();
    expect(typeof analysis).toBe('string');
    expect(analysis.length).toBeGreaterThan(0);
  });

  it('always returns a non-empty string across multiple calls', () => {
    for (let i = 0; i < 20; i++) {
      const analysis = getReportFallbackPatternAnalysis();
      expect(analysis.length).toBeGreaterThan(0);
    }
  });
});
