/**
 * Property-Based Tests for speakingService.ts
 *
 * Feature: public-speaking-trainer
 * Framework: fast-check (property-based) + Jest
 *
 * Tests pure helper functions only — no DB calls.
 */

import fc from 'fast-check';
import { computePersonalBest, computeRollingAvg7 } from '../services/speakingService';

// ─── Property 13 ──────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 13: Personal best is the maximum of all session scores
// Validates: Requirements 11.3

describe('Property 13: Personal best is the maximum of all session scores', () => {
  it('computePersonalBest equals Math.max of all scores for any non-empty sequence', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 50 }),
        (scores) => {
          const result = computePersonalBest(scores);
          const expected = Math.max(...scores);
          return result === expected;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('personal best is always >= every individual score in the sequence', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 50 }),
        (scores) => {
          const best = computePersonalBest(scores);
          return scores.every((s) => best >= s);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('personal best is always one of the values in the sequence', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 50 }),
        (scores) => {
          const best = computePersonalBest(scores);
          return scores.includes(best);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns 0 for an empty sequence', () => {
    expect(computePersonalBest([])).toBe(0);
  });
});

// ─── Property 14 ──────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 14: Rolling average uses last 7 sessions
// Validates: Requirements 11.2

describe('Property 14: Rolling average uses last 7 sessions', () => {
  it('avg_confidence_last_7 equals arithmetic mean of last min(7, n) scores', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 50 }),
        (scores) => {
          const result = computeRollingAvg7(scores);
          const last7 = scores.slice(-7);
          const expected = last7.reduce((sum, s) => sum + s, 0) / last7.length;
          return Math.abs(result - expected) < 0.0001;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('uses exactly min(7, total) sessions — not more', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 50 }),
        (scores) => {
          const windowSize = Math.min(7, scores.length);
          const last = scores.slice(-windowSize);
          const expected = last.reduce((sum, s) => sum + s, 0) / windowSize;
          const result = computeRollingAvg7(scores);
          return Math.abs(result - expected) < 0.0001;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rolling average is always in [0, 100] when all scores are in [0, 100]', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 50 }),
        (scores) => {
          const result = computeRollingAvg7(scores);
          return result >= 0 && result <= 100;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns 0 for an empty sequence', () => {
    expect(computeRollingAvg7([])).toBe(0);
  });

  it('with exactly 7 sessions, uses all of them', () => {
    const scores = [10, 20, 30, 40, 50, 60, 70];
    const expected = (10 + 20 + 30 + 40 + 50 + 60 + 70) / 7;
    expect(computeRollingAvg7(scores)).toBeCloseTo(expected, 4);
  });

  it('with more than 7 sessions, ignores earlier sessions', () => {
    // First 3 are 0, last 7 are 100 — avg should be 100
    const scores = [0, 0, 0, 100, 100, 100, 100, 100, 100, 100];
    expect(computeRollingAvg7(scores)).toBeCloseTo(100, 4);
  });
});
