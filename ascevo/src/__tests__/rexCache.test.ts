/**
 * Property-Based Tests — Rex Cache Service
 *
 * Uses fast-check to verify correctness properties of rexCache.ts.
 *
 * Covers:
 *   Property 1: Streak bracket is exhaustive and non-overlapping
 *   Property 2: Cache key determinism
 *   Property 3: Cache key sensitivity to inputs
 *   Property 4: Rex cache key is language-sensitive
 */

import * as fc from 'fast-check';
import { getStreakBracket, computeCacheKey } from '../services/rexCache';
import { SUPPORTED_LANGUAGES } from '../services/i18nService';
import type { SupportedLanguage } from '../services/i18nService';

const VALID_BRACKETS = ['1-7', '8-30', '31-100', '100+'] as const;

// ---------------------------------------------------------------------------
// Property 1: Streak bracket is exhaustive and non-overlapping
// Validates: Requirements 5.4
// ---------------------------------------------------------------------------
describe('Property 1: Streak bracket is exhaustive and non-overlapping', () => {
  it('always returns a valid bracket for any non-negative integer', () => {
    fc.assert(
      fc.property(fc.nat(), (n) => {
        const bracket = getStreakBracket(n);
        return VALID_BRACKETS.includes(bracket);
      }),
      { numRuns: 25 }
    );
  });

  it('boundary: 0 → 1-7', () => expect(getStreakBracket(0)).toBe('1-7'));
  it('boundary: 7 → 1-7', () => expect(getStreakBracket(7)).toBe('1-7'));
  it('boundary: 8 → 8-30', () => expect(getStreakBracket(8)).toBe('8-30'));
  it('boundary: 30 → 8-30', () => expect(getStreakBracket(30)).toBe('8-30'));
  it('boundary: 31 → 31-100', () => expect(getStreakBracket(31)).toBe('31-100'));
  it('boundary: 100 → 31-100', () => expect(getStreakBracket(100)).toBe('31-100'));
  it('boundary: 101 → 100+', () => expect(getStreakBracket(101)).toBe('100+'));
});

// ---------------------------------------------------------------------------
// Property 2: Cache key determinism
// Validates: Requirements 5.1
// ---------------------------------------------------------------------------
describe('Property 2: Cache key determinism', () => {
  it('same inputs always produce the same cache key', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.boolean(),
        fc.nat(),
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        (text, completed, streak, lang) => {
          const k1 = computeCacheKey(text, completed, streak, lang as SupportedLanguage);
          const k2 = computeCacheKey(text, completed, streak, lang as SupportedLanguage);
          return k1 === k2;
        }
      ),
      { numRuns: 25 }
    );
  });

  it('returns a 64-character hex string (SHA-256)', () => {
    const key = computeCacheKey('cold shower', true, 5, 'en');
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });
});

// ---------------------------------------------------------------------------
// Property 3: Cache key sensitivity to inputs
// Validates: Requirements 5.1
// ---------------------------------------------------------------------------
describe('Property 3: Cache key sensitivity to inputs', () => {
  it('different inputs produce different keys', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.boolean(),
        fc.nat(),
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        fc.string(),
        fc.boolean(),
        fc.nat(),
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        (t1, c1, s1, l1, t2, c2, s2, l2) => {
          fc.pre(
            t1 !== t2 ||
              c1 !== c2 ||
              getStreakBracket(s1) !== getStreakBracket(s2) ||
              l1 !== l2
          );
          const k1 = computeCacheKey(t1, c1, s1, l1 as SupportedLanguage);
          const k2 = computeCacheKey(t2, c2, s2, l2 as SupportedLanguage);
          return k1 !== k2;
        }
      ),
      { numRuns: 25 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4: Rex cache key is language-sensitive
// Validates: Requirements 8.2, 6.3
// ---------------------------------------------------------------------------
describe('Property 4: Rex cache key is language-sensitive', () => {
  it('same (challengeText, completed, streakBracket) but different languages produce different keys', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.boolean(),
        fc.nat(),
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        (text, completed, streak, lang1, lang2) => {
          fc.pre(lang1 !== lang2);
          const k1 = computeCacheKey(text, completed, streak, lang1 as SupportedLanguage);
          const k2 = computeCacheKey(text, completed, streak, lang2 as SupportedLanguage);
          return k1 !== k2;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('specific example: same inputs, en vs de → different keys', () => {
    const k1 = computeCacheKey('cold shower', true, 5, 'en');
    const k2 = computeCacheKey('cold shower', true, 5, 'de');
    expect(k1).not.toBe(k2);
  });

  it('specific example: same inputs, ro vs nl → different keys', () => {
    const k1 = computeCacheKey('read 10 pages', false, 14, 'ro');
    const k2 = computeCacheKey('read 10 pages', false, 14, 'nl');
    expect(k1).not.toBe(k2);
  });
});
