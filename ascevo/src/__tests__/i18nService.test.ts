/**
 * Tests — i18n Service (resolveLanguage) + Locale Utilities
 *
 * Covers:
 *   Property 1: resolveLanguage always returns a supported language
 *   Property 2: Unknown locales fall back to 'en'
 *   Property 6: resolveLanguage is idempotent on valid codes
 *   Property 7: Locale formatting produces non-empty output
 *   Unit tests for specific examples
 */

import * as fc from 'fast-check';
import { resolveLanguage, SUPPORTED_LANGUAGES } from '../services/i18nService';
import { formatDate, formatNumber } from '../services/localeUtils';

// ---------------------------------------------------------------------------
// Unit tests — resolveLanguage
// ---------------------------------------------------------------------------

describe('resolveLanguage — unit tests', () => {
  it('ro-RO → ro', () => expect(resolveLanguage('ro-RO')).toBe('ro'));
  it('en-US → en', () => expect(resolveLanguage('en-US')).toBe('en'));
  it('de-DE → de', () => expect(resolveLanguage('de-DE')).toBe('de'));
  it('fr-FR → fr', () => expect(resolveLanguage('fr-FR')).toBe('fr'));
  it('es-ES → es', () => expect(resolveLanguage('es-ES')).toBe('es'));
  it('pt-PT → pt', () => expect(resolveLanguage('pt-PT')).toBe('pt'));
  it('nl-NL → nl', () => expect(resolveLanguage('nl-NL')).toBe('nl'));
  it('it-IT → it', () => expect(resolveLanguage('it-IT')).toBe('it'));
  it('zh-CN → en (unsupported fallback)', () => expect(resolveLanguage('zh-CN')).toBe('en'));
  it('ja → en (unsupported fallback)', () => expect(resolveLanguage('ja')).toBe('en'));
  it('empty string → en', () => expect(resolveLanguage('')).toBe('en'));
  it('bare code en → en', () => expect(resolveLanguage('en')).toBe('en'));
  it('bare code de → de', () => expect(resolveLanguage('de')).toBe('de'));
});

// ---------------------------------------------------------------------------
// Property 1: resolveLanguage always returns a supported language
// Validates: Requirements 1.1, 1.2
// ---------------------------------------------------------------------------
describe('Property 1: resolveLanguage always returns a supported language', () => {
  it('for any string input, result is always in SUPPORTED_LANGUAGES', () => {
    fc.assert(
      fc.property(fc.string(), (locale) => {
        const result = resolveLanguage(locale);
        return SUPPORTED_LANGUAGES.includes(result);
      }),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Unknown locales fall back to 'en'
// Validates: Requirements 1.2
// ---------------------------------------------------------------------------
describe('Property 2: Unknown locales fall back to en', () => {
  // Generate strings that don't start with any supported language prefix
  const unsupportedLocale = fc.string().filter((s) => {
    const lower = s.toLowerCase();
    const prefix = lower.split('-')[0].split('_')[0];
    return !SUPPORTED_LANGUAGES.includes(prefix as any) && !SUPPORTED_LANGUAGES.includes(lower as any);
  });

  it('unsupported locale strings always resolve to en', () => {
    fc.assert(
      fc.property(unsupportedLocale, (locale) => {
        return resolveLanguage(locale) === 'en';
      }),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: resolveLanguage is idempotent on valid codes
// Validates: Requirements 1.1
// ---------------------------------------------------------------------------
describe('Property 6: resolveLanguage is idempotent on valid codes', () => {
  it('resolveLanguage(code) === code for all supported codes', () => {
    for (const code of SUPPORTED_LANGUAGES) {
      expect(resolveLanguage(code)).toBe(code);
    }
  });
});

// ---------------------------------------------------------------------------
// Unit tests — formatDate / formatNumber
// ---------------------------------------------------------------------------

describe('formatDate — unit tests', () => {
  it('returns non-empty for valid ISO date + de', () =>
    expect(formatDate('2024-01-15', 'de')).not.toBe(''));
  it('returns non-empty for valid ISO date + en', () =>
    expect(formatDate('2024-01-15', 'en')).not.toBe(''));
  it('returns empty string for invalid date', () =>
    expect(formatDate('not-a-date', 'en')).toBe(''));
  it('returns empty string for empty input', () =>
    expect(formatDate('', 'en')).toBe(''));
});

describe('formatNumber — unit tests', () => {
  it('returns non-empty for integer + en', () =>
    expect(formatNumber(1000, 'en')).not.toBe(''));
  it('returns non-empty for decimal + de', () =>
    expect(formatNumber(1000.5, 'de')).not.toBe(''));
  it('returns empty string for Infinity', () =>
    expect(formatNumber(Infinity, 'en')).toBe(''));
  it('returns empty string for NaN', () =>
    expect(formatNumber(NaN, 'en')).toBe(''));
  it('returns non-empty for 0', () =>
    expect(formatNumber(0, 'en')).not.toBe(''));
});

// ---------------------------------------------------------------------------
// Property 7: Locale formatting produces non-empty output
// Validates: Requirements 9.1, 9.2
// ---------------------------------------------------------------------------
describe('Property 7: Locale formatting produces non-empty output', () => {
  // Generate valid ISO date strings (YYYY-MM-DD)
  const isoDate = fc
    .tuple(
      fc.integer({ min: 2000, max: 2099 }),
      fc.integer({ min: 1, max: 12 }),
      fc.integer({ min: 1, max: 28 }) // safe day range for all months
    )
    .map(([y, m, d]) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);

  // Generate finite numbers
  const finiteNumber = fc.float({ noNaN: true, noDefaultInfinity: true });

  it('formatDate returns non-empty for any valid ISO date and any supported language', () => {
    fc.assert(
      fc.property(isoDate, fc.constantFrom(...SUPPORTED_LANGUAGES), (date, lang) => {
        const result = formatDate(date, lang);
        return result.length > 0;
      }),
      { numRuns: 200 }
    );
  });

  it('formatNumber returns non-empty for any finite number and any supported language', () => {
    fc.assert(
      fc.property(finiteNumber, fc.constantFrom(...SUPPORTED_LANGUAGES), (value, lang) => {
        const result = formatNumber(value, lang);
        return result.length > 0;
      }),
      { numRuns: 200 }
    );
  });
});
