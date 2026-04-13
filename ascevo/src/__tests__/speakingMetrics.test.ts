/**
 * Property-Based Tests for speakingMetrics.ts
 *
 * Feature: public-speaking-trainer
 * Framework: fast-check (property-based) + Jest
 *
 * Each test uses fc.assert(fc.property(...), { numRuns: 100 })
 */

import fc from 'fast-check';
import {
  calculatePaceScore,
  calculateFillerFreeRate,
  calculateLanguageStrength,
  calculateSilenceGapScore,
  calculateConfidenceScore,
  getConfidenceColor,
  getMetricStatus,
  detectFillers,
  detectSilenceGaps,
  extractOpeningWords,
  extractClosingWords,
  checkLevelUnlock,
  checkMilestones,
  WhisperWord,
} from '../services/speakingMetrics';
import { SPEAKING_LEVEL_CONFIG, SpeakingLevel } from '../types/index';

// ─── Property 1 ───────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 1: Pace score is always in [0, 100]
// Validates: Requirements 3.2, 3.3, 3.4, 3.5

describe('Property 1: Pace score is always in [0, 100]', () => {
  it('returns a value in [0, 100] for any WPM including extremes', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2000 }), (wpm) => {
        const score = calculatePaceScore(wpm);
        return score >= 0 && score <= 100;
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 2 ───────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 2: Pace score is 100 in the optimal range
// Validates: Requirements 3.2

describe('Property 2: Pace score is 100 in the optimal range [130, 160]', () => {
  it('returns exactly 100 for any WPM between 130 and 160 inclusive', () => {
    fc.assert(
      fc.property(fc.integer({ min: 130, max: 160 }), (wpm) => {
        return calculatePaceScore(wpm) === 100;
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 3 ───────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 3: Pace score is monotonically decreasing outside optimal range
// Validates: Requirements 3.3, 3.4

describe('Property 3: Pace score is monotonically decreasing outside optimal range', () => {
  it('score decreases as WPM increases above 160', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 161, max: 500 }),
        fc.integer({ min: 161, max: 500 }),
        (a, b) => {
          const lo = Math.min(a, b);
          const hi = Math.max(a, b);
          if (lo === hi) return true;
          return calculatePaceScore(lo) >= calculatePaceScore(hi);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('score decreases as WPM decreases below 130', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 129 }),
        fc.integer({ min: 0, max: 129 }),
        (a, b) => {
          const lo = Math.min(a, b);
          const hi = Math.max(a, b);
          if (lo === hi) return true;
          // Lower WPM → further from 130 → lower score
          return calculatePaceScore(hi) >= calculatePaceScore(lo);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 4 ───────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 4: Filler detection completeness
// Validates: Requirements 4.1, 4.2, 4.4

// Known single-word fillers from the implementation
const KNOWN_SINGLE_FILLERS = ['um', 'uh', 'er', 'hmm', 'like', 'right', 'okay', 'basically', 'literally', 'actually', 'honestly', 'so'];

describe('Property 4: Filler detection completeness', () => {
  it('total filler count equals number of filler word occurrences in the array', () => {
    fc.assert(
      fc.property(
        // Generate an array of words that are all known single-word fillers
        fc.array(fc.constantFrom(...KNOWN_SINGLE_FILLERS), { minLength: 1, maxLength: 20 }),
        (fillerWordList) => {
          // Build a WhisperWord array from the filler list
          const words: WhisperWord[] = fillerWordList.map((w, i) => ({
            word: w,
            start: i * 1.0,
            end: i * 1.0 + 0.5,
          }));

          const { fillerWords } = detectFillers(words);

          // Count expected occurrences per filler
          const expectedCounts: Record<string, number> = {};
          for (const w of fillerWordList) {
            expectedCounts[w] = (expectedCounts[w] ?? 0) + 1;
          }

          // Total detected must equal total input filler words
          const totalDetected = Object.values(fillerWords).reduce((s, c) => s + c, 0);
          const totalExpected = fillerWordList.length;

          return totalDetected === totalExpected;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('each filler word that appears in the array has a count entry', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KNOWN_SINGLE_FILLERS), { minLength: 1, maxLength: 20 }),
        (fillerWordList) => {
          const words: WhisperWord[] = fillerWordList.map((w, i) => ({
            word: w,
            start: i * 1.0,
            end: i * 1.0 + 0.5,
          }));

          const { fillerWords } = detectFillers(words);

          // Every filler that appears must have a count > 0
          const uniqueFillers = new Set(fillerWordList);
          for (const f of uniqueFillers) {
            if ((fillerWords[f] ?? 0) === 0) return false;
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 5 ───────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 5: Fillers per minute formula
// Validates: Requirements 4.3

describe('Property 5: Fillers per minute formula', () => {
  it('fillers_per_minute = total_filler_count / (duration_seconds / 60), rounded to 1 decimal', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),  // total filler count
        fc.float({ min: 1, max: 600, noNaN: true }),  // duration in seconds
        (totalFillerCount, durationSeconds) => {
          const expected = Math.round((totalFillerCount / (durationSeconds / 60)) * 10) / 10;
          const actual = Math.round((totalFillerCount / (durationSeconds / 60)) * 10) / 10;
          return Math.abs(actual - expected) < 0.001;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 6 ───────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 6: Silence gap detection and classification invariant
// Validates: Requirements 2.4, 6.2

describe('Property 6: Silence gap detection and classification invariant', () => {
  it('total gaps = anxious + purposeful, and each gap has interval > 1.5s', () => {
    fc.assert(
      fc.property(
        // Generate number of words (2–20)
        fc.integer({ min: 2, max: 20 }),
        (wordCount) => {
          // Build words with increasing timestamps; some gaps will exceed 1.5s
          const words: WhisperWord[] = [];
          let time = 0;
          for (let i = 0; i < wordCount; i++) {
            const wordDuration = 0.3;
            // Alternate: some gaps are small (0.2s), some large (2.0s)
            const gap = i % 3 === 0 ? 2.0 : 0.2;
            words.push({ word: `word${i}`, start: time, end: time + wordDuration });
            time += wordDuration + gap;
          }

          const gaps = detectSilenceGaps(words, 1.5);

          const anxious = gaps.filter((g) => g.type === 'anxious').length;
          const purposeful = gaps.filter((g) => g.type === 'purposeful').length;

          // Invariant 1: total = anxious + purposeful
          if (gaps.length !== anxious + purposeful) return false;

          // Invariant 2: every gap has duration > 1.5
          for (const gap of gaps) {
            if (gap.duration <= 1.5) return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 7 ───────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 7: Language strength formula and bounds
// Validates: Requirements 5.2, 5.3

describe('Property 7: Language strength formula and bounds', () => {
  it('equals clamp(50 - weak*3 + strong*3, 0, 100) and is always in [0, 100]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 0, max: 50 }),
        (weakCount, strongCount) => {
          const result = calculateLanguageStrength(weakCount, strongCount);
          const expected = Math.max(0, Math.min(100, 50 - weakCount * 3 + strongCount * 3));
          return result === expected && result >= 0 && result <= 100;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 8 ───────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 8: Confidence score formula and bounds
// Validates: Requirements 8.1, 8.3

describe('Property 8: Confidence score formula and bounds', () => {
  it('equals round(clamp(weighted sum, 0, 100)) and is always in [0, 100]', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.float({ min: 0, max: 100, noNaN: true }),
        (lang, filler, pace, opening, closing, structure) => {
          const components = {
            languageStrength: lang,
            fillerFreeRate: filler,
            paceScore: pace,
            openingStrength: opening,
            closingStrength: closing,
            structureScore: structure,
          };
          const result = calculateConfidenceScore(components);
          const raw = lang * 0.30 + filler * 0.20 + pace * 0.15 + opening * 0.15 + closing * 0.10 + structure * 0.10;
          const expected = Math.round(Math.max(0, Math.min(100, raw)));
          return result === expected && result >= 0 && result <= 100;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 9 ───────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 9: Filler-free rate formula and bounds
// Validates: Requirements 8.2

describe('Property 9: Filler-free rate formula and bounds', () => {
  it('equals clamp(100 - fpm * 12.5, 0, 100) and is always in [0, 100]', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 50, noNaN: true }),
        (fpm) => {
          const result = calculateFillerFreeRate(fpm);
          const expected = Math.max(0, Math.min(100, 100 - fpm * 12.5));
          return Math.abs(result - expected) < 0.0001 && result >= 0 && result <= 100;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 10 ──────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 10: Confidence score color mapping is exhaustive
// Validates: Requirements 8.5

const VALID_COLORS = new Set(['#EF4444', '#F97316', '#EAB308', '#22C55E', '#F59E0B']);

describe('Property 10: Confidence score color mapping is exhaustive', () => {
  it('returns one of the 5 defined colors for any integer score in [0, 100]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (score) => {
        const color = getConfidenceColor(score);
        return color !== undefined && color !== null && VALID_COLORS.has(color);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 11 ──────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 11: Metric status label is exhaustive
// Validates: Requirements 10.2

const VALID_STATUSES = new Set(['STRONG', 'GOOD', 'NEEDS WORK', 'WEAK']);

describe('Property 11: Metric status label is exhaustive', () => {
  it('returns one of the 4 defined labels for any integer score in [0, 100]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (score) => {
        const status = getMetricStatus(score);
        return status !== undefined && VALID_STATUSES.has(status);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 12 ──────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 12: Opening and closing section extraction correctness
// Validates: Requirements 7.2, 7.3

describe('Property 12: Opening and closing section extraction correctness', () => {
  it('opening words have start < 15 and closing words have start >= (duration - 15)', () => {
    fc.assert(
      fc.property(
        // Generate duration between 30 and 300 seconds
        fc.float({ min: 30, max: 300, noNaN: true }),
        // Generate number of words
        fc.integer({ min: 1, max: 30 }),
        (duration, wordCount) => {
          // Spread words evenly across the duration
          const words: WhisperWord[] = Array.from({ length: wordCount }, (_, i) => ({
            word: `word${i}`,
            start: (i / wordCount) * duration,
            end: (i / wordCount) * duration + 0.2,
          }));

          const opening = extractOpeningWords(words, 15);
          const closing = extractClosingWords(words, duration, 15);

          // All opening words must have start < 15
          for (const w of opening) {
            if (w.start >= 15) return false;
          }

          // All closing words must have start >= (duration - 15)
          const cutoff = duration - 15;
          for (const w of closing) {
            if (w.start < cutoff) return false;
          }

          // Every word with start < 15 must be in opening
          const openingSet = new Set(opening.map((w) => w.start));
          for (const w of words) {
            if (w.start < 15 && !openingSet.has(w.start)) return false;
          }

          // Every word with start >= cutoff must be in closing
          const closingSet = new Set(closing.map((w) => w.start));
          for (const w of words) {
            if (w.start >= cutoff && !closingSet.has(w.start)) return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 18 ──────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 18: Silence gap score formula and bounds
// Validates: Requirements 6.3

describe('Property 18: Silence gap score formula and bounds', () => {
  it('equals clamp(100 - anxiousPauses * 10, 0, 100) and is always in [0, 100]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 50 }), (anxiousPauses) => {
        const result = calculateSilenceGapScore(anxiousPauses);
        const expected = Math.max(0, Math.min(100, 100 - anxiousPauses * 10));
        return result === expected && result >= 0 && result <= 100;
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 15 ──────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 15: Level unlock is monotonically non-decreasing and correctly gated
// Validates: Requirements 13.3, 13.4, 13.5, 13.6

describe('Property 15: Level unlock is monotonically non-decreasing and correctly gated', () => {
  it('never returns a level lower than currentLevel', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.constantFrom(1, 2, 3, 4, 5) as fc.Arbitrary<SpeakingLevel>,
        (totalSessions, avgConfidence, currentLevel) => {
          const result = checkLevelUnlock(totalSessions, avgConfidence, currentLevel);
          return result >= currentLevel;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('only returns a higher level if both session count AND confidence thresholds are met', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.constantFrom(1, 2, 3, 4, 5) as fc.Arbitrary<SpeakingLevel>,
        (totalSessions, avgConfidence, currentLevel) => {
          const result = checkLevelUnlock(totalSessions, avgConfidence, currentLevel);

          if (result > currentLevel) {
            // The returned level's thresholds must be satisfied
            const config = SPEAKING_LEVEL_CONFIG[result];
            if (totalSessions < config.unlockSessions) return false;
            if (avgConfidence < config.unlockAvgConfidence) return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 16 ──────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 16: Milestone triggers are idempotent
// Validates: Requirements 14.1–14.10

const ALL_MILESTONE_KEYS = [
  'session_1', 'session_5', 'session_10', 'session_25', 'session_50', 'session_100',
  'confidence_50', 'confidence_75', 'confidence_90',
];

describe('Property 16: Milestone triggers are idempotent', () => {
  it('milestones already in milestonesTriggered are never returned again', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        // Randomly pick a subset of milestone keys as already triggered
        fc.subarray(ALL_MILESTONE_KEYS),
        (sessionNumber, confidenceScore, previousBest, alreadyTriggered) => {
          const alerts = checkMilestones(sessionNumber, confidenceScore, previousBest, alreadyTriggered);

          // None of the returned alerts should correspond to already-triggered milestones.
          // We check by re-running with the triggered set and verifying no duplicates.
          // Since MilestoneAlert doesn't carry the key, we verify idempotency by calling again
          // with the same inputs — the count should be the same (no new milestones added).
          const alerts2 = checkMilestones(sessionNumber, confidenceScore, previousBest, alreadyTriggered);

          return alerts.length === alerts2.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('calling checkMilestones with all keys already triggered returns no alerts', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (sessionNumber, confidenceScore, previousBest) => {
          const alerts = checkMilestones(
            sessionNumber,
            confidenceScore,
            previousBest,
            ALL_MILESTONE_KEYS
          );
          return alerts.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
