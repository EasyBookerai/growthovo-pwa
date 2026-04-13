/**
 * Tests for scoreQuiz — onboardingQuizService
 *
 * Covers:
 *  - Unit tests: all-same-pillar, clear winner, tie-break by first appearance
 *  - Property 1: primary pillar is the most frequent answer
 *  - Property 2: tie-break resolves to first-seen pillar
 *
 * Feature: growthovo-features-v3
 * Validates: Requirements 1.6, 1.7
 */

import * as fc from 'fast-check';
import { scoreQuiz } from '../services/onboardingQuizService';
import { PillarKey } from '../types';

const ALL_PILLARS: PillarKey[] = ['mind', 'discipline', 'communication', 'money', 'relationships'];

// ─── Arbitrary helpers ────────────────────────────────────────────────────────

/** Generates a random PillarKey */
const pillarArb = fc.constantFrom(...ALL_PILLARS);

/** Generates a PillarKey[] of exactly length 5 */
const fiveAnswersArb = fc.array(pillarArb, { minLength: 5, maxLength: 5 });

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe('scoreQuiz — unit tests', () => {
  it('all same pillar → primary and secondary both equal that pillar', () => {
    const answers: PillarKey[] = ['mind', 'mind', 'mind', 'mind', 'mind'];
    const { primary, secondary } = scoreQuiz(answers);
    expect(primary).toBe('mind');
    expect(secondary).toBe('mind');
  });

  it('clear winner → primary is the most frequent pillar', () => {
    // discipline appears 3 times, mind 2 times
    const answers: PillarKey[] = ['discipline', 'mind', 'discipline', 'mind', 'discipline'];
    const { primary } = scoreQuiz(answers);
    expect(primary).toBe('discipline');
  });

  it('clear winner → secondary is the second-most frequent pillar', () => {
    const answers: PillarKey[] = ['discipline', 'mind', 'discipline', 'mind', 'discipline'];
    const { secondary } = scoreQuiz(answers);
    expect(secondary).toBe('mind');
  });

  it('tie → primary is the pillar that appeared first in the sequence', () => {
    // mind appears at index 0, discipline at index 1 — both appear twice
    // relationships appears once
    const answers: PillarKey[] = ['mind', 'discipline', 'mind', 'discipline', 'relationships'];
    const { primary } = scoreQuiz(answers);
    expect(primary).toBe('mind');
  });

  it('tie → when second pillar appears first, it wins the tie-break', () => {
    // discipline appears at index 0, mind at index 1 — both appear twice
    const answers: PillarKey[] = ['discipline', 'mind', 'discipline', 'mind', 'relationships'];
    const { primary } = scoreQuiz(answers);
    expect(primary).toBe('discipline');
  });

  it('all five different pillars → primary is the first one seen (all tied at 1)', () => {
    const answers: PillarKey[] = ['money', 'mind', 'discipline', 'communication', 'relationships'];
    const { primary } = scoreQuiz(answers);
    expect(primary).toBe('money');
  });
});

// ─── Property 1 ───────────────────────────────────────────────────────────────
// "Quiz scoring primary pillar is the most frequent answer"
// Tag: Feature: growthovo-features-v3, Property 1
// Validates: Requirements 1.6, 1.7

describe('Property 1: primary pillar is the most frequent answer', () => {
  it('for any 5-answer sequence, primary has count >= all other pillars (tie-break by first appearance)', () => {
    fc.assert(
      fc.property(fiveAnswersArb, (answers) => {
        const { primary } = scoreQuiz(answers);

        // Count occurrences of each pillar
        const counts = new Map<PillarKey, number>();
        const firstSeen = new Map<PillarKey, number>();
        answers.forEach((p, i) => {
          counts.set(p, (counts.get(p) ?? 0) + 1);
          if (!firstSeen.has(p)) firstSeen.set(p, i);
        });

        const primaryCount = counts.get(primary) ?? 0;
        const primaryFirstSeen = firstSeen.get(primary) ?? 99;

        // For every other pillar, primary must beat it on count OR on first-seen (if tied)
        for (const [pillar, count] of counts.entries()) {
          if (pillar === primary) continue;
          if (count > primaryCount) return false; // another pillar has strictly more — fail
          if (count === primaryCount) {
            // Tie: primary must have appeared earlier
            const otherFirstSeen = firstSeen.get(pillar) ?? 99;
            if (otherFirstSeen < primaryFirstSeen) return false;
          }
        }
        return true;
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 2 ───────────────────────────────────────────────────────────────
// "Quiz scoring tie-break by first appearance"
// Tag: Feature: growthovo-features-v3, Property 2
// Validates: Requirements 1.7

describe('Property 2: tie-break resolves to first-seen pillar', () => {
  /**
   * Generator: produces a 5-answer sequence where exactly two pillars are tied
   * for the highest count.
   *
   * Strategy:
   *  - Pick two distinct pillars A and B
   *  - Pick a tie count k in {1, 2} (so total answers for A+B = 2k ≤ 4, leaving room for filler)
   *  - Decide which one appears first (A or B)
   *  - Build the sequence so A and B each appear k times, with the "first" one at index 0
   *  - Fill remaining slots with a third pillar that appears fewer than k times
   */
  const tiedSequenceArb = fc
    .tuple(
      // Two distinct pillars
      fc.integer({ min: 0, max: 4 }),
      fc.integer({ min: 0, max: 3 }),
      // Tie count: 1 or 2
      fc.integer({ min: 1, max: 2 }),
      // Which comes first: 0 = pillarA, 1 = pillarB
      fc.boolean(),
      // Filler pillar index offset (1..2 away from pillarB index, wrapping)
      fc.integer({ min: 1, max: 2 }),
    )
    .map(([aIdx, bOffset, tieCount, bFirst, fillerOffset]) => {
      const pillarA = ALL_PILLARS[aIdx];
      const bIdx = (aIdx + bOffset + 1) % 5; // ensure bIdx !== aIdx
      const pillarB = ALL_PILLARS[bIdx];
      const fillerIdx = (bIdx + fillerOffset) % 5;
      const pillarFiller =
        ALL_PILLARS[fillerIdx] === pillarA || ALL_PILLARS[fillerIdx] === pillarB
          ? ALL_PILLARS[(fillerIdx + 1) % 5]
          : ALL_PILLARS[fillerIdx];

      // Build sequence: first-seen pillar goes at index 0
      const first = bFirst ? pillarB : pillarA;
      const second = bFirst ? pillarA : pillarB;

      // Interleave: first, second, first, second, filler (for tieCount=2)
      // or: first, second, filler, filler, filler (for tieCount=1, but filler < 1 so only 1 filler)
      let seq: PillarKey[];
      if (tieCount === 2) {
        // 2+2+1 = 5
        seq = [first, second, first, second, pillarFiller];
      } else {
        // tieCount === 1: 1+1+3 filler, but filler must be < 1 — impossible with 3 fillers
        // Use 1+1+1 filler (3 total) but that makes filler count=3 > tie count=1
        // So use a different filler that appears 0 times: just use a unique third pillar once
        // Actually for tieCount=1 we need filler to appear 0 times, so only 3 slots total
        // Pad with two more distinct pillars that each appear once (< tieCount is impossible for 1)
        // Simplest: tieCount=1 means each of A and B appears once, remaining 3 are all different
        // Use three distinct fillers (or repeat filler but keep < 1 — impossible)
        // → just use tieCount=1 with 3 unique filler slots each appearing once
        // That means filler also appears once = tied three-way. Skip this and use tieCount=2 only.
        // To keep it simple, force tieCount=2 by using the same structure:
        seq = [first, second, first, second, pillarFiller];
      }

      return { seq, expectedPrimary: first };
    });

  it('for any tied sequence, primary is the pillar that appeared first', () => {
    fc.assert(
      fc.property(tiedSequenceArb, ({ seq, expectedPrimary }) => {
        const { primary } = scoreQuiz(seq);
        return primary === expectedPrimary;
      }),
      { numRuns: 100 },
    );
  });
});
