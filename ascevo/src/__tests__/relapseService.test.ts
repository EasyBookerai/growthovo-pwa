/**
 * Tests for relapseService pure functions
 *
 * Covers:
 *  - Unit tests: calculateRestoredStreak, canUseComebackChallenge
 *  - Property 5: Streak restoration is always 50% rounded down
 *  - Property 6: Comeback challenge cooldown enforcement
 *
 * Feature: growthovo-features-v3
 * Validates: Requirements 5.6, 5.8
 */

import * as fc from 'fast-check';
import { calculateRestoredStreak, canUseComebackChallenge } from '../services/relapseService';

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe('calculateRestoredStreak — unit tests', () => {
  it('restores streak to exactly 50% rounded down', () => {
    expect(calculateRestoredStreak(0)).toBe(0);
    expect(calculateRestoredStreak(1)).toBe(0);
    expect(calculateRestoredStreak(2)).toBe(1);
    expect(calculateRestoredStreak(3)).toBe(1);
    expect(calculateRestoredStreak(4)).toBe(2);
    expect(calculateRestoredStreak(5)).toBe(2);
    expect(calculateRestoredStreak(10)).toBe(5);
    expect(calculateRestoredStreak(15)).toBe(7);
    expect(calculateRestoredStreak(100)).toBe(50);
  });
});

describe('canUseComebackChallenge — unit tests', () => {
  it('returns true when comebackUsedAt is null', () => {
    expect(canUseComebackChallenge(null)).toBe(true);
  });

  it('returns false when used less than 30 days ago', () => {
    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
    expect(canUseComebackChallenge(twentyDaysAgo)).toBe(false);
  });

  it('returns true when used exactly 30 days ago', () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    expect(canUseComebackChallenge(thirtyDaysAgo)).toBe(true);
  });

  it('returns true when used more than 30 days ago', () => {
    const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
    expect(canUseComebackChallenge(fortyDaysAgo)).toBe(true);
  });
});

// ─── Property 5 ───────────────────────────────────────────────────────────────
// "Streak restoration is always 50% rounded down"
// Tag: Feature: growthovo-features-v3, Property 5
// Validates: Requirements 5.6

describe('Property 5: Streak restoration is always 50% rounded down', () => {
  it('for any positive integer, restored streak is exactly floor(original / 2)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10000 }), (original) => {
        const restored = calculateRestoredStreak(original);
        const expected = Math.floor(original / 2);
        return restored === expected;
      }),
      { numRuns: 100 }
    );
  });

  it('restored streak is always less than or equal to original streak', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10000 }), (original) => {
        const restored = calculateRestoredStreak(original);
        return restored <= original;
      }),
      { numRuns: 100 }
    );
  });

  it('restored streak is always at least half of original (rounded down)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10000 }), (original) => {
        const restored = calculateRestoredStreak(original);
        const halfRoundedDown = Math.floor(original / 2);
        return restored === halfRoundedDown;
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 6 ───────────────────────────────────────────────────────────────
// "Comeback challenge cooldown enforcement"
// Tag: Feature: growthovo-features-v3, Property 6
// Validates: Requirements 5.8

describe('Property 6: Comeback challenge cooldown enforcement', () => {
  it('always returns true for null comebackUsedAt', () => {
    fc.assert(
      fc.property(fc.constant(null), (comebackUsedAt) => {
        return canUseComebackChallenge(comebackUsedAt) === true;
      }),
      { numRuns: 100 }
    );
  });

  it('returns false for any timestamp less than 30 days ago', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 29 }), // days ago (1-29)
        (daysAgo) => {
          const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
          return canUseComebackChallenge(timestamp) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns true for any timestamp 30 or more days ago', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 30, max: 365 }), // days ago (30-365)
        (daysAgo) => {
          const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
          return canUseComebackChallenge(timestamp) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('cooldown boundary is exactly 30 days', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }), // hours within the 30th day
        fc.integer({ min: 0, max: 59 }), // minutes
        fc.integer({ min: 0, max: 59 }), // seconds
        (hours, minutes, seconds) => {
          // Exactly 30 days minus some hours/minutes/seconds (should return false)
          const almostThirtyDays = 30 * 24 * 60 * 60 * 1000 - (hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000);
          const timestampBefore = new Date(Date.now() - almostThirtyDays).toISOString();
          
          // Exactly 30 days plus some hours/minutes/seconds (should return true)
          const overThirtyDays = 30 * 24 * 60 * 60 * 1000 + (hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000);
          const timestampAfter = new Date(Date.now() - overThirtyDays).toISOString();
          
          return canUseComebackChallenge(timestampBefore) === false && 
                 canUseComebackChallenge(timestampAfter) === true;
        }
      ),
      { numRuns: 100 }
    );
  });
});