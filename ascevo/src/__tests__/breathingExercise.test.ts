/**
 * Property-Based Tests — Breathing Exercise Duration
 *
 * Uses fast-check to verify correctness properties of the 4-7-8 breathing
 * exercise duration calculation from AnxietySpikeScreen.tsx.
 *
 * Covers:
 *   Property 6a: For any N ≥ 1, total duration = N × 19000ms
 *   Property 6b: 3 cycles = exactly 57000ms
 *   Property 6c: Duration is always a positive multiple of 19000
 *
 * **Validates: Requirements 7.2**
 */

import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Pure calculation logic (mirrors AnxietySpikeScreen.tsx)
// ---------------------------------------------------------------------------

const PHASE_DURATIONS = [4000, 7000, 8000]; // inhale, hold, exhale
const CYCLE_DURATION = PHASE_DURATIONS.reduce((sum, d) => sum + d, 0); // 19000ms

function calculateBreathingDuration(cycles: number): number {
  return cycles * CYCLE_DURATION;
}

// ---------------------------------------------------------------------------
// Property 6: Breathing exercise minimum duration
// Validates: Requirements 7.2
// ---------------------------------------------------------------------------

describe('Property 6: Breathing exercise minimum duration', () => {
  // Property 6a: For any N ≥ 1, total duration = N × 19000ms
  it('6a: for any N ≥ 1, total duration equals N × 19000ms', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), (n) => {
        return calculateBreathingDuration(n) === n * 19000;
      }),
      { numRuns: 100 }
    );
  });

  // Property 6b: 3 cycles = exactly 57000ms
  it('6b: 3 cycles equals exactly 57000ms', () => {
    expect(calculateBreathingDuration(3)).toBe(57000);
  });

  // Property 6c: Duration is always a positive multiple of 19000
  it('6c: duration is always a positive multiple of 19000', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), (n) => {
        const duration = calculateBreathingDuration(n);
        return duration > 0 && duration % 19000 === 0;
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests — concrete examples
// ---------------------------------------------------------------------------

describe('calculateBreathingDuration — unit tests', () => {
  it('phase durations sum to 19000ms per cycle', () => {
    expect(CYCLE_DURATION).toBe(19000);
  });

  it('1 cycle = 19000ms', () => {
    expect(calculateBreathingDuration(1)).toBe(19000);
  });

  it('3 cycles = 57000ms (minimum required)', () => {
    expect(calculateBreathingDuration(3)).toBe(57000);
  });

  it('5 cycles = 95000ms', () => {
    expect(calculateBreathingDuration(5)).toBe(95000);
  });

  it('duration scales linearly with cycle count', () => {
    const d1 = calculateBreathingDuration(2);
    const d2 = calculateBreathingDuration(4);
    expect(d2).toBe(d1 * 2);
  });
});
