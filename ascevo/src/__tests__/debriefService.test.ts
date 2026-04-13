/**
 * Property-Based Tests — debriefService: validateMinWordCount
 *
 * Uses fast-check to verify Property 12: Word count validation.
 *
 * Properties:
 *   12a: For any string and minWords, result matches manual word count comparison
 *   12b: Empty string always returns false for minWords > 0
 *   12c: All-whitespace string always returns false for minWords > 0
 *   12d: String with exactly minWords words returns true
 *   12e: String with minWords-1 words returns false
 *
 * **Validates: Requirements 17.4, 17.5**
 */

import * as fc from 'fast-check';
import { validateMinWordCount } from '../services/debriefService';

// ---------------------------------------------------------------------------
// Helper: manual word count matching the implementation
// ---------------------------------------------------------------------------
function manualWordCount(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

/** Build a string of exactly n words separated by single spaces. */
function buildWords(n: number): string {
  return Array.from({ length: n }, (_, i) => `word${i}`).join(' ');
}

// ---------------------------------------------------------------------------
// Property 12a: Result matches manual word count comparison
// Validates: Requirements 17.4, 17.5
// ---------------------------------------------------------------------------
describe('Property 12a: result matches manual word count comparison', () => {
  it('for any string and minWords, validateMinWordCount matches manual count', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer({ min: 0, max: 20 }),
        (text, minWords) => {
          const expected = manualWordCount(text) >= minWords;
          return validateMinWordCount(text, minWords) === expected;
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 12b: Empty string always returns false for minWords > 0
// Validates: Requirements 17.4, 17.5
// ---------------------------------------------------------------------------
describe('Property 12b: empty string returns false for minWords > 0', () => {
  it('validateMinWordCount("", n) === false for any n > 0', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (minWords) => {
        return validateMinWordCount('', minWords) === false;
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 12c: All-whitespace string always returns false for minWords > 0
// Validates: Requirements 17.4, 17.5
// ---------------------------------------------------------------------------
describe('Property 12c: all-whitespace string returns false for minWords > 0', () => {
  it('validateMinWordCount(whitespace, n) === false for any n > 0', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r')).filter((s) => s.length > 0),
        fc.integer({ min: 1, max: 50 }),
        (whitespace, minWords) => {
          return validateMinWordCount(whitespace, minWords) === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 12d: String with exactly minWords words returns true
// Validates: Requirements 17.4, 17.5
// ---------------------------------------------------------------------------
describe('Property 12d: string with exactly minWords words returns true', () => {
  it('validateMinWordCount(buildWords(n), n) === true', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 30 }), (minWords) => {
        const text = buildWords(minWords);
        return validateMinWordCount(text, minWords) === true;
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 12e: String with minWords-1 words returns false
// Validates: Requirements 17.4, 17.5
// ---------------------------------------------------------------------------
describe('Property 12e: string with minWords-1 words returns false', () => {
  it('validateMinWordCount(buildWords(n-1), n) === false for n >= 1', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 30 }), (minWords) => {
        const text = buildWords(minWords - 1); // 0 words when minWords=1
        return validateMinWordCount(text, minWords) === false;
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests — concrete edge cases
// ---------------------------------------------------------------------------
describe('validateMinWordCount — unit tests', () => {
  it('empty string with minWords=0 returns true', () => {
    expect(validateMinWordCount('', 0)).toBe(true);
  });

  it('empty string with minWords=1 returns false', () => {
    expect(validateMinWordCount('', 1)).toBe(false);
  });

  it('single word satisfies minWords=1', () => {
    expect(validateMinWordCount('hello', 1)).toBe(true);
  });

  it('single word does not satisfy minWords=2', () => {
    expect(validateMinWordCount('hello', 2)).toBe(false);
  });

  it('leading/trailing whitespace is ignored', () => {
    expect(validateMinWordCount('  hello world  ', 2)).toBe(true);
  });

  it('multiple spaces between words count as one separator', () => {
    expect(validateMinWordCount('hello   world', 2)).toBe(true);
  });

  it('tabs and newlines count as whitespace separators', () => {
    expect(validateMinWordCount('hello\tworld\nfoo', 3)).toBe(true);
  });

  it('exactly 10 words satisfies minWords=10', () => {
    const text = 'one two three four five six seven eight nine ten';
    expect(validateMinWordCount(text, 10)).toBe(true);
  });

  it('9 words does not satisfy minWords=10', () => {
    const text = 'one two three four five six seven eight nine';
    expect(validateMinWordCount(text, 10)).toBe(false);
  });

  it('all-whitespace string with minWords=1 returns false', () => {
    expect(validateMinWordCount('     ', 1)).toBe(false);
  });

  it('minWords=0 always returns true for any string', () => {
    expect(validateMinWordCount('', 0)).toBe(true);
    expect(validateMinWordCount('hello', 0)).toBe(true);
    expect(validateMinWordCount('   ', 0)).toBe(true);
  });
});
