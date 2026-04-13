/**
 * Property-Based Tests — Memory Extraction Upper Bound
 *
 * Tests the parseExtractedMemories validation logic replicated from the
 * extract-memories Edge Function (growthovo/supabase/functions/extract-memories/index.ts).
 *
 * Since the Edge Function runs in Deno and cannot be imported directly, we
 * replicate the pure parsing/validation logic here and test it in isolation.
 *
 * Covers:
 *   Property 10: Memory extraction upper bound — extracted count is always ≤ 3
 *
 * Validates: Requirements 14.1
 */

import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Replicated validation logic from the Edge Function
// (growthovo/supabase/functions/extract-memories/index.ts)
// ---------------------------------------------------------------------------

const VALID_TYPES = new Set(['goal', 'struggle', 'win', 'pattern', 'promise', 'person']);

function parseExtractedMemories(
  raw: string
): Array<{ memory_type: string; content: string; importance_score: number }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const memories = [];
  for (const item of parsed) {
    if (typeof item !== 'object' || item === null) continue;
    if (
      typeof (item as Record<string, unknown>).memory_type !== 'string' ||
      typeof (item as Record<string, unknown>).content !== 'string' ||
      typeof (item as Record<string, unknown>).importance_score !== 'number'
    )
      continue;
    const typed = item as { memory_type: string; content: string; importance_score: number };
    if (!VALID_TYPES.has(typed.memory_type)) continue;
    const score = Math.round(typed.importance_score);
    if (score < 1 || score > 10) continue;
    memories.push({
      memory_type: typed.memory_type,
      content: typed.content.trim(),
      importance_score: score,
    });
    if (memories.length >= 3) break;
  }
  return memories;
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const MEMORY_TYPES = ['goal', 'struggle', 'win', 'pattern', 'promise', 'person'] as const;

/** A single valid memory object. */
const arbValidMemoryObject = fc.record({
  memory_type: fc.constantFrom(...MEMORY_TYPES),
  content: fc.string({ minLength: 1, maxLength: 200 }),
  importance_score: fc.integer({ min: 1, max: 10 }),
});

/** A single invalid memory object (wrong type, missing fields, bad score, etc.). */
const arbInvalidMemoryObject = fc.oneof(
  // invalid memory_type
  fc.record({
    memory_type: fc.string().filter((s) => !VALID_TYPES.has(s)),
    content: fc.string({ minLength: 1 }),
    importance_score: fc.integer({ min: 1, max: 10 }),
  }),
  // importance_score out of range
  fc.record({
    memory_type: fc.constantFrom(...MEMORY_TYPES),
    content: fc.string({ minLength: 1 }),
    importance_score: fc.oneof(fc.integer({ min: 11, max: 100 }), fc.integer({ min: -100, max: 0 })),
  }),
  // missing required field
  fc.record({
    memory_type: fc.constantFrom(...MEMORY_TYPES),
    content: fc.string({ minLength: 1 }),
    // no importance_score
  }),
  // null entry
  fc.constant(null),
  // non-object entry
  fc.oneof(fc.string(), fc.integer(), fc.boolean())
);

/** Array mixing valid and invalid entries, serialised to JSON. */
const arbMixedJsonArray = fc
  .array(fc.oneof(arbValidMemoryObject, arbInvalidMemoryObject), { minLength: 0, maxLength: 20 })
  .map((arr) => JSON.stringify(arr));

/** Array of only valid entries, serialised to JSON. */
const arbValidJsonArray = fc
  .array(arbValidMemoryObject, { minLength: 0, maxLength: 20 })
  .map((arr) => JSON.stringify(arr));

// ---------------------------------------------------------------------------
// Property 10: Memory extraction upper bound
// Validates: Requirements 14.1
// ---------------------------------------------------------------------------

describe('Property 10: Memory extraction upper bound', () => {
  it('extracted count is always ≤ 3 for any JSON input', () => {
    fc.assert(
      fc.property(arbMixedJsonArray, (raw) => {
        const result = parseExtractedMemories(raw);
        return result.length <= 3;
      }),
      { numRuns: 200 }
    );
  });

  it('extracted count is always ≤ 3 for arrays of only valid entries', () => {
    fc.assert(
      fc.property(arbValidJsonArray, (raw) => {
        const result = parseExtractedMemories(raw);
        return result.length <= 3;
      }),
      { numRuns: 200 }
    );
  });

  it('extracted count is always ≤ 3 for arbitrary string inputs', () => {
    fc.assert(
      fc.property(fc.string(), (raw) => {
        const result = parseExtractedMemories(raw);
        return result.length <= 3;
      }),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests — concrete examples
// ---------------------------------------------------------------------------

describe('parseExtractedMemories — unit tests', () => {
  it('empty array input → 0 extracted', () => {
    expect(parseExtractedMemories('[]')).toHaveLength(0);
  });

  it('invalid JSON → 0 extracted', () => {
    expect(parseExtractedMemories('not json')).toHaveLength(0);
    expect(parseExtractedMemories('{}')).toHaveLength(0);
    expect(parseExtractedMemories('')).toHaveLength(0);
    expect(parseExtractedMemories('null')).toHaveLength(0);
  });

  it('array with 10 valid entries → exactly 3 extracted', () => {
    const entries = Array.from({ length: 10 }, (_, i) => ({
      memory_type: MEMORY_TYPES[i % MEMORY_TYPES.length],
      content: `memory content ${i}`,
      importance_score: (i % 10) + 1,
    }));
    const result = parseExtractedMemories(JSON.stringify(entries));
    expect(result).toHaveLength(3);
  });

  it('array with invalid memory_types → filtered out', () => {
    const entries = [
      { memory_type: 'invalid_type', content: 'some content', importance_score: 5 },
      { memory_type: 'unknown', content: 'other content', importance_score: 7 },
      { memory_type: 'goal', content: 'valid entry', importance_score: 8 },
    ];
    const result = parseExtractedMemories(JSON.stringify(entries));
    expect(result).toHaveLength(1);
    expect(result[0].memory_type).toBe('goal');
  });

  it('array with importance_score outside [1,10] → filtered out', () => {
    const entries = [
      { memory_type: 'goal', content: 'score too high', importance_score: 11 },
      { memory_type: 'win', content: 'score too low', importance_score: 0 },
      { memory_type: 'struggle', content: 'negative score', importance_score: -1 },
      { memory_type: 'pattern', content: 'valid score', importance_score: 5 },
    ];
    const result = parseExtractedMemories(JSON.stringify(entries));
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('valid score');
  });

  it('importance_score is rounded to nearest integer', () => {
    const entries = [{ memory_type: 'goal', content: 'rounded score', importance_score: 4.7 }];
    const result = parseExtractedMemories(JSON.stringify(entries));
    expect(result).toHaveLength(1);
    expect(result[0].importance_score).toBe(5);
  });

  it('content is trimmed of whitespace', () => {
    const entries = [{ memory_type: 'goal', content: '  padded content  ', importance_score: 5 }];
    const result = parseExtractedMemories(JSON.stringify(entries));
    expect(result[0].content).toBe('padded content');
  });

  it('all six valid memory_types are accepted', () => {
    const entries = MEMORY_TYPES.map((t, i) => ({
      memory_type: t,
      content: `content for ${t}`,
      importance_score: i + 1,
    }));
    // Only first 3 will be returned due to cap
    const result = parseExtractedMemories(JSON.stringify(entries));
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.memory_type)).toEqual(['goal', 'struggle', 'win']);
  });

  it('non-object entries in array are skipped', () => {
    const raw = JSON.stringify([
      null,
      42,
      'a string',
      true,
      { memory_type: 'goal', content: 'valid', importance_score: 5 },
    ]);
    const result = parseExtractedMemories(raw);
    expect(result).toHaveLength(1);
    expect(result[0].memory_type).toBe('goal');
  });
});
