/**
 * Property-Based Tests — Rex Memory Service
 *
 * Uses fast-check to verify correctness properties of rexMemoryService.ts
 * pure functions: selectTopMemories and selectMemoryToEvict.
 *
 * Covers:
 *   Property 8:  Memory importance score invariant — all scores in [1,10]
 *   Property 9:  Memory cap enforcement — 200 entries + evict 1 + add 1 = 200
 *   Property 11: Memory selection ordering — selectTopMemories respects sort order
 *   Property 15: Memory eviction selects lowest importance then oldest
 *
 * Validates: Requirements 13.3, 13.7
 */

import * as fc from 'fast-check';
import { selectTopMemories, selectMemoryToEvict } from '../services/rexMemoryService';
import type { RexMemory, MemoryType } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MEMORY_TYPES: MemoryType[] = ['goal', 'struggle', 'win', 'pattern', 'promise', 'person'];

/** Arbitrary that generates a valid RexMemory with importanceScore in [1,10]. */
const arbRexMemory = fc.record<RexMemory>({
  id: fc.uuid(),
  userId: fc.uuid(),
  memoryType: fc.constantFrom(...MEMORY_TYPES),
  content: fc.string({ minLength: 1, maxLength: 200 }),
  importanceScore: fc.integer({ min: 1, max: 10 }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map((d) => d.toISOString()),
  lastReferencedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map((d) => d.toISOString()),
});

/** Arbitrary that generates a non-empty array of RexMemory entries. */
const arbMemoryArray = fc.array(arbRexMemory, { minLength: 1, maxLength: 50 });

/** Arbitrary that generates exactly 200 RexMemory entries. */
const arbMemoryArray200 = fc.array(arbRexMemory, { minLength: 200, maxLength: 200 });

// ---------------------------------------------------------------------------
// Property 8: Memory importance score invariant
// Validates: Requirements 13.3
// ---------------------------------------------------------------------------
describe('Property 8: Memory importance score invariant', () => {
  it('all generated importance scores are in [1, 10]', () => {
    fc.assert(
      fc.property(arbMemoryArray, (memories) => {
        return memories.every(
          (m) => Number.isInteger(m.importanceScore) && m.importanceScore >= 1 && m.importanceScore <= 10
        );
      }),
      { numRuns: 100 }
    );
  });

  it('selectTopMemories never returns entries with importanceScore outside [1, 10]', () => {
    fc.assert(
      fc.property(arbMemoryArray, fc.integer({ min: 1, max: 20 }), (memories, count) => {
        const top = selectTopMemories(memories, count);
        return top.every((m) => m.importanceScore >= 1 && m.importanceScore <= 10);
      }),
      { numRuns: 100 }
    );
  });

  it('selectMemoryToEvict never returns an entry with importanceScore outside [1, 10]', () => {
    fc.assert(
      fc.property(arbMemoryArray, (memories) => {
        const evicted = selectMemoryToEvict(memories);
        return evicted.importanceScore >= 1 && evicted.importanceScore <= 10;
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 9: Memory cap enforcement
// Validates: Requirements 13.7
// ---------------------------------------------------------------------------
describe('Property 9: Memory cap enforcement', () => {
  it('given 200 entries, evicting one and adding one keeps count at 200', () => {
    fc.assert(
      fc.property(arbMemoryArray200, arbRexMemory, (memories, newMemory) => {
        // Simulate the cap logic: evict one, then the new entry brings it back to 200
        const evicted = selectMemoryToEvict(memories);
        const afterEviction = memories.filter((m) => m.id !== evicted.id);
        const afterAdd = [...afterEviction, newMemory];
        return afterAdd.length === 200;
      }),
      { numRuns: 100 }
    );
  });

  it('evicting from 200 entries leaves exactly 199', () => {
    fc.assert(
      fc.property(arbMemoryArray200, (memories) => {
        const evicted = selectMemoryToEvict(memories);
        const remaining = memories.filter((m) => m.id !== evicted.id);
        return remaining.length === 199;
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 11: Memory selection ordering
// Validates: Requirements 13.7, 15.7
// ---------------------------------------------------------------------------
describe('Property 11: Memory selection ordering', () => {
  it('selectTopMemories returns entries sorted by importanceScore descending', () => {
    fc.assert(
      fc.property(arbMemoryArray, fc.integer({ min: 1, max: 20 }), (memories, count) => {
        const top = selectTopMemories(memories, count);
        for (let i = 0; i < top.length - 1; i++) {
          if (top[i].importanceScore < top[i + 1].importanceScore) return false;
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('when importanceScores are equal, selectTopMemories sorts by lastReferencedAt descending', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record<RexMemory>({
            id: fc.uuid(),
            userId: fc.uuid(),
            memoryType: fc.constantFrom(...MEMORY_TYPES),
            content: fc.string({ minLength: 1, maxLength: 100 }),
            importanceScore: fc.constant(5), // all same score
            createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map((d) => d.toISOString()),
            lastReferencedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map((d) => d.toISOString()),
          }),
          { minLength: 2, maxLength: 20 }
        ),
        fc.integer({ min: 1, max: 20 }),
        (memories, count) => {
          const top = selectTopMemories(memories, count);
          for (let i = 0; i < top.length - 1; i++) {
            const timeA = new Date(top[i].lastReferencedAt).getTime();
            const timeB = new Date(top[i + 1].lastReferencedAt).getTime();
            if (timeA < timeB) return false;
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('selectTopMemories returns at most count entries', () => {
    fc.assert(
      fc.property(arbMemoryArray, fc.integer({ min: 1, max: 20 }), (memories, count) => {
        const top = selectTopMemories(memories, count);
        return top.length <= count;
      }),
      { numRuns: 100 }
    );
  });

  it('selectTopMemories returns min(count, memories.length) entries', () => {
    fc.assert(
      fc.property(arbMemoryArray, fc.integer({ min: 1, max: 20 }), (memories, count) => {
        const top = selectTopMemories(memories, count);
        return top.length === Math.min(count, memories.length);
      }),
      { numRuns: 100 }
    );
  });

  it('selectTopMemories does not mutate the original array', () => {
    fc.assert(
      fc.property(arbMemoryArray, fc.integer({ min: 1, max: 20 }), (memories, count) => {
        const original = memories.map((m) => m.id);
        selectTopMemories(memories, count);
        const after = memories.map((m) => m.id);
        return original.every((id, i) => id === after[i]);
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 15: Memory eviction selects lowest importance then oldest
// Validates: Requirements 13.7
// ---------------------------------------------------------------------------
describe('Property 15: Memory eviction selects lowest importance then oldest', () => {
  it('evicted entry has the minimum importanceScore in the array', () => {
    fc.assert(
      fc.property(arbMemoryArray, (memories) => {
        const evicted = selectMemoryToEvict(memories);
        const minScore = Math.min(...memories.map((m) => m.importanceScore));
        return evicted.importanceScore === minScore;
      }),
      { numRuns: 100 }
    );
  });

  it('when multiple entries share the minimum score, evicted entry has the oldest lastReferencedAt', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record<RexMemory>({
            id: fc.uuid(),
            userId: fc.uuid(),
            memoryType: fc.constantFrom(...MEMORY_TYPES),
            content: fc.string({ minLength: 1, maxLength: 100 }),
            importanceScore: fc.constant(1), // all minimum score
            createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map((d) => d.toISOString()),
            lastReferencedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map((d) => d.toISOString()),
          }),
          { minLength: 2, maxLength: 20 }
        ),
        (memories) => {
          const evicted = selectMemoryToEvict(memories);
          const minTime = Math.min(...memories.map((m) => new Date(m.lastReferencedAt).getTime()));
          return new Date(evicted.lastReferencedAt).getTime() === minTime;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('evicted entry is always a member of the original array', () => {
    fc.assert(
      fc.property(arbMemoryArray, (memories) => {
        const evicted = selectMemoryToEvict(memories);
        return memories.some((m) => m.id === evicted.id);
      }),
      { numRuns: 100 }
    );
  });

  it('no remaining entry has a lower importanceScore than the evicted entry', () => {
    fc.assert(
      fc.property(arbMemoryArray, (memories) => {
        const evicted = selectMemoryToEvict(memories);
        const remaining = memories.filter((m) => m.id !== evicted.id);
        return remaining.every((m) => m.importanceScore >= evicted.importanceScore);
      }),
      { numRuns: 100 }
    );
  });

  it('selectMemoryToEvict does not mutate the original array', () => {
    fc.assert(
      fc.property(arbMemoryArray, (memories) => {
        const original = memories.map((m) => m.id);
        selectMemoryToEvict(memories);
        const after = memories.map((m) => m.id);
        return original.every((id, i) => id === after[i]);
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests — concrete examples
// ---------------------------------------------------------------------------
describe('selectTopMemories — unit tests', () => {
  const base = (overrides: Partial<RexMemory>): RexMemory => ({
    id: 'id-1',
    userId: 'user-1',
    memoryType: 'goal',
    content: 'test',
    importanceScore: 5,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastReferencedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  });

  it('returns empty array for empty input', () => {
    expect(selectTopMemories([], 5)).toEqual([]);
  });

  it('returns all entries when count >= length', () => {
    const memories = [base({ id: 'a' }), base({ id: 'b' })];
    expect(selectTopMemories(memories, 10)).toHaveLength(2);
  });

  it('sorts by importanceScore descending', () => {
    const memories = [
      base({ id: 'low', importanceScore: 2 }),
      base({ id: 'high', importanceScore: 9 }),
      base({ id: 'mid', importanceScore: 5 }),
    ];
    const top = selectTopMemories(memories, 3);
    expect(top[0].id).toBe('high');
    expect(top[1].id).toBe('mid');
    expect(top[2].id).toBe('low');
  });

  it('breaks ties by lastReferencedAt descending', () => {
    const memories = [
      base({ id: 'older', importanceScore: 5, lastReferencedAt: '2024-01-01T00:00:00.000Z' }),
      base({ id: 'newer', importanceScore: 5, lastReferencedAt: '2024-06-01T00:00:00.000Z' }),
    ];
    const top = selectTopMemories(memories, 2);
    expect(top[0].id).toBe('newer');
    expect(top[1].id).toBe('older');
  });
});

describe('selectMemoryToEvict — unit tests', () => {
  const base = (overrides: Partial<RexMemory>): RexMemory => ({
    id: 'id-1',
    userId: 'user-1',
    memoryType: 'goal',
    content: 'test',
    importanceScore: 5,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastReferencedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  });

  it('returns the single entry when array has one element', () => {
    const m = base({ id: 'only' });
    expect(selectMemoryToEvict([m]).id).toBe('only');
  });

  it('returns the entry with the lowest importanceScore', () => {
    const memories = [
      base({ id: 'low', importanceScore: 1 }),
      base({ id: 'high', importanceScore: 9 }),
    ];
    expect(selectMemoryToEvict(memories).id).toBe('low');
  });

  it('breaks ties by oldest lastReferencedAt', () => {
    const memories = [
      base({ id: 'newer', importanceScore: 1, lastReferencedAt: '2024-06-01T00:00:00.000Z' }),
      base({ id: 'oldest', importanceScore: 1, lastReferencedAt: '2024-01-01T00:00:00.000Z' }),
    ];
    expect(selectMemoryToEvict(memories).id).toBe('oldest');
  });
});
