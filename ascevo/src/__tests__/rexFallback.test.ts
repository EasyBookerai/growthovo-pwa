/**
 * Tests — Rex Fallback Service
 *
 * Covers:
 *   Property 5: Fallback responses cover all languages
 *   Unit tests for specific language/type combinations
 */

import * as fc from 'fast-check';
import {
  getFallbackResponse,
  getCheckInFallback,
  getStreakWarningFallback,
  getWeeklySummaryFallback,
  type RexResponseType,
} from '../services/rexFallback';
import { SUPPORTED_LANGUAGES } from '../services/i18nService';
import type { SupportedLanguage } from '../services/i18nService';

const RESPONSE_TYPES: RexResponseType[] = [
  'checkin_success',
  'checkin_fail',
  'streak_warning',
  'weekly_summary',
];

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

describe('getFallbackResponse — unit tests', () => {
  it('returns non-empty string for en + checkin_success', () => {
    expect(getFallbackResponse('checkin_success', 'en')).toBeTruthy();
  });

  it('returns non-empty string for ro + checkin_fail', () => {
    expect(getFallbackResponse('checkin_fail', 'ro')).toBeTruthy();
  });

  it('returns non-empty string for de + streak_warning', () => {
    expect(getFallbackResponse('streak_warning', 'de', 14, 3)).toBeTruthy();
  });

  it('substitutes streakDays in streak_warning', () => {
    const result = getFallbackResponse('streak_warning', 'en', 42, 2);
    expect(result).toContain('42');
  });

  it('substitutes hoursLeft in streak_warning when template contains it', () => {
    // Run multiple times to hit a template that contains [hoursLeft]
    let found = false;
    for (let i = 0; i < 20; i++) {
      const result = getFallbackResponse('streak_warning', 'en', 10, 5);
      if (result.includes('5')) { found = true; break; }
    }
    expect(found).toBe(true);
  });
});

describe('Legacy API — backwards compatibility', () => {
  it('getCheckInFallback(true, 5) returns non-empty', () => {
    expect(getCheckInFallback(true, 5)).toBeTruthy();
  });

  it('getCheckInFallback(false, 3, "fr") returns non-empty', () => {
    expect(getCheckInFallback(false, 3, 'fr')).toBeTruthy();
  });

  it('getStreakWarningFallback(7, 2, "de") returns non-empty', () => {
    expect(getStreakWarningFallback(7, 2, 'de')).toBeTruthy();
  });

  it('getWeeklySummaryFallback("nl") returns non-empty', () => {
    expect(getWeeklySummaryFallback('nl')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Property 5: Fallback responses cover all languages
// Validates: Requirements 6.4, 6.5
// ---------------------------------------------------------------------------
describe('Property 5: Fallback responses cover all languages', () => {
  it('getFallbackResponse returns non-empty for every language × response type combination', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      for (const type of RESPONSE_TYPES) {
        const result = getFallbackResponse(type, lang as SupportedLanguage, 7, 3);
        expect(result.length).toBeGreaterThan(0);
      }
    }
  });

  it('fast-check: non-empty for any supported language and response type', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        fc.constantFrom(...RESPONSE_TYPES),
        fc.nat({ max: 365 }),
        fc.nat({ max: 23 }),
        (lang, type, streakDays, hoursLeft) => {
          const result = getFallbackResponse(type, lang as SupportedLanguage, streakDays, hoursLeft);
          return result.length > 0;
        }
      ),
      { numRuns: 200 }
    );
  });
});
