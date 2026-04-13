/**
 * Property-Based Tests — Partner Service
 *
 * Uses fast-check to verify correctness properties of partnerService.ts
 * pure functions: generateInviteMessage and determineComparisonWinner.
 *
 * Covers:
 *   Property 13a: Winner is always one of the two user IDs
 *   Property 13b: Same inputs always produce the same winner (determinism)
 *   Property 13c: Winner has >= challenges than the loser (or >= streak if tied)
 *   Property 16:  generateInviteMessage always includes both the pillar and the invite link
 *
 * Validates: Requirements 21.2
 */

import * as fc from 'fast-check';
import {
  generateInviteMessage,
  determineComparisonWinner,
} from '../services/partnerService';
import type { PartnerWeekStats } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const arbNonEmptyString = fc.string({ minLength: 1, maxLength: 50 });

/** Arbitrary that generates a valid PartnerWeekStats object. */
const arbPartnerWeekStats = (userId?: string) =>
  fc.record<PartnerWeekStats>({
    userId: userId !== undefined ? fc.constant(userId) : fc.uuid(),
    name: arbNonEmptyString,
    challengesCompleted: fc.integer({ min: 0, max: 100 }),
    currentStreak: fc.integer({ min: 0, max: 365 }),
    sosEventsCount: fc.integer({ min: 0, max: 50 }),
  });

/** Arbitrary that generates a pair of PartnerWeekStats with distinct user IDs. */
const arbStatsPair = fc
  .tuple(fc.uuid(), fc.uuid())
  .filter(([a, b]) => a !== b)
  .chain(([userIdA, userIdB]) =>
    fc.tuple(arbPartnerWeekStats(userIdA), arbPartnerWeekStats(userIdB))
  );

// ---------------------------------------------------------------------------
// Property 13a: Winner is always one of the two user IDs
// Validates: Requirements 21.2
// ---------------------------------------------------------------------------
describe('Property 13a: Winner is always one of the two user IDs', () => {
  it('determineComparisonWinner returns one of the two provided user IDs', () => {
    fc.assert(
      fc.property(arbStatsPair, ([userStats, partnerStats]) => {
        const winner = determineComparisonWinner(userStats, partnerStats);
        return winner === userStats.userId || winner === partnerStats.userId;
      }),
      { numRuns: 200 }
    );
  });

  it('winner is never an empty string or undefined', () => {
    fc.assert(
      fc.property(arbStatsPair, ([userStats, partnerStats]) => {
        const winner = determineComparisonWinner(userStats, partnerStats);
        return typeof winner === 'string' && winner.length > 0;
      }),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 13b: Same inputs always produce the same winner (determinism)
// Validates: Requirements 21.2
// ---------------------------------------------------------------------------
describe('Property 13b: determineComparisonWinner is deterministic', () => {
  it('calling with the same stats twice returns the same winner', () => {
    fc.assert(
      fc.property(arbStatsPair, ([userStats, partnerStats]) => {
        const winner1 = determineComparisonWinner(userStats, partnerStats);
        const winner2 = determineComparisonWinner(userStats, partnerStats);
        return winner1 === winner2;
      }),
      { numRuns: 200 }
    );
  });

  it('does not mutate the input stats objects', () => {
    fc.assert(
      fc.property(arbStatsPair, ([userStats, partnerStats]) => {
        const userCopy = { ...userStats };
        const partnerCopy = { ...partnerStats };
        determineComparisonWinner(userStats, partnerStats);
        return (
          userStats.userId === userCopy.userId &&
          userStats.challengesCompleted === userCopy.challengesCompleted &&
          userStats.currentStreak === userCopy.currentStreak &&
          partnerStats.userId === partnerCopy.userId &&
          partnerStats.challengesCompleted === partnerCopy.challengesCompleted &&
          partnerStats.currentStreak === partnerCopy.currentStreak
        );
      }),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 13c: Winner has >= challenges than the loser (or >= streak if tied)
// Validates: Requirements 21.2
// ---------------------------------------------------------------------------
describe('Property 13c: Winner has the higher challenges or streak tiebreak', () => {
  it('when challenges differ, the user with more challenges wins', () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.uuid(), fc.uuid())
          .filter(([a, b]) => a !== b)
          .chain(([userIdA, userIdB]) =>
            fc.tuple(
              fc.record<PartnerWeekStats>({
                userId: fc.constant(userIdA),
                name: arbNonEmptyString,
                challengesCompleted: fc.integer({ min: 6, max: 100 }),
                currentStreak: fc.integer({ min: 0, max: 365 }),
                sosEventsCount: fc.integer({ min: 0, max: 50 }),
              }),
              fc.record<PartnerWeekStats>({
                userId: fc.constant(userIdB),
                name: arbNonEmptyString,
                challengesCompleted: fc.integer({ min: 0, max: 5 }),
                currentStreak: fc.integer({ min: 0, max: 365 }),
                sosEventsCount: fc.integer({ min: 0, max: 50 }),
              })
            )
          ),
        ([userStats, partnerStats]) => {
          const winner = determineComparisonWinner(userStats, partnerStats);
          return winner === userStats.userId;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('when challenges are tied, the user with a higher streak wins', () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.uuid(), fc.uuid())
          .filter(([a, b]) => a !== b)
          .chain(([userIdA, userIdB]) =>
            fc.integer({ min: 0, max: 100 }).chain((sharedChallenges) =>
              fc.tuple(
                fc.record<PartnerWeekStats>({
                  userId: fc.constant(userIdA),
                  name: arbNonEmptyString,
                  challengesCompleted: fc.constant(sharedChallenges),
                  currentStreak: fc.integer({ min: 6, max: 365 }),
                  sosEventsCount: fc.integer({ min: 0, max: 50 }),
                }),
                fc.record<PartnerWeekStats>({
                  userId: fc.constant(userIdB),
                  name: arbNonEmptyString,
                  challengesCompleted: fc.constant(sharedChallenges),
                  currentStreak: fc.integer({ min: 0, max: 5 }),
                  sosEventsCount: fc.integer({ min: 0, max: 50 }),
                })
              )
            )
          ),
        ([userStats, partnerStats]) => {
          const winner = determineComparisonWinner(userStats, partnerStats);
          return winner === userStats.userId;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('when both challenges and streak are tied, userStats.userId wins by default', () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.uuid(), fc.uuid())
          .filter(([a, b]) => a !== b)
          .chain(([userIdA, userIdB]) =>
            fc.integer({ min: 0, max: 100 }).chain((sharedChallenges) =>
              fc.integer({ min: 0, max: 365 }).chain((sharedStreak) =>
                fc.tuple(
                  fc.record<PartnerWeekStats>({
                    userId: fc.constant(userIdA),
                    name: arbNonEmptyString,
                    challengesCompleted: fc.constant(sharedChallenges),
                    currentStreak: fc.constant(sharedStreak),
                    sosEventsCount: fc.integer({ min: 0, max: 50 }),
                  }),
                  fc.record<PartnerWeekStats>({
                    userId: fc.constant(userIdB),
                    name: arbNonEmptyString,
                    challengesCompleted: fc.constant(sharedChallenges),
                    currentStreak: fc.constant(sharedStreak),
                    sosEventsCount: fc.integer({ min: 0, max: 50 }),
                  })
                )
              )
            )
          ),
        ([userStats, partnerStats]) => {
          const winner = determineComparisonWinner(userStats, partnerStats);
          return winner === userStats.userId;
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 16: generateInviteMessage always includes both the pillar and the invite link
// Validates: Requirements 21.2 (partner comparison covers both users)
// ---------------------------------------------------------------------------
describe('Property 16: generateInviteMessage covers both pillar and invite link', () => {
  it('the generated message always contains the pillar string', () => {
    fc.assert(
      fc.property(arbNonEmptyString, arbNonEmptyString, (pillar, inviteLink) => {
        const message = generateInviteMessage(pillar, inviteLink);
        return message.includes(pillar);
      }),
      { numRuns: 200 }
    );
  });

  it('the generated message always contains the invite link', () => {
    fc.assert(
      fc.property(arbNonEmptyString, arbNonEmptyString, (pillar, inviteLink) => {
        const message = generateInviteMessage(pillar, inviteLink);
        return message.includes(inviteLink);
      }),
      { numRuns: 200 }
    );
  });

  it('the generated message is a non-empty string', () => {
    fc.assert(
      fc.property(arbNonEmptyString, arbNonEmptyString, (pillar, inviteLink) => {
        const message = generateInviteMessage(pillar, inviteLink);
        return typeof message === 'string' && message.length > 0;
      }),
      { numRuns: 200 }
    );
  });

  it('is deterministic — same inputs produce the same message', () => {
    fc.assert(
      fc.property(arbNonEmptyString, arbNonEmptyString, (pillar, inviteLink) => {
        const msg1 = generateInviteMessage(pillar, inviteLink);
        const msg2 = generateInviteMessage(pillar, inviteLink);
        return msg1 === msg2;
      }),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests — concrete examples
// ---------------------------------------------------------------------------
describe('generateInviteMessage — unit tests', () => {
  it('produces the expected message format', () => {
    const msg = generateInviteMessage('Mind', 'https://growthovo.app/invite/abc123');
    expect(msg).toBe(
      "I'm using GROWTHOVO to work on Mind. I need you to hold me accountable. Download the app: https://growthovo.app/invite/abc123"
    );
  });

  it('includes the pillar in the message', () => {
    const msg = generateInviteMessage('Discipline', 'https://link.example');
    expect(msg).toContain('Discipline');
  });

  it('includes the invite link in the message', () => {
    const msg = generateInviteMessage('Money', 'https://link.example/xyz');
    expect(msg).toContain('https://link.example/xyz');
  });
});

describe('determineComparisonWinner — unit tests', () => {
  const makeStats = (userId: string, challenges: number, streak: number): PartnerWeekStats => ({
    userId,
    name: userId,
    challengesCompleted: challenges,
    currentStreak: streak,
    sosEventsCount: 0,
  });

  it('returns the user with more challenges completed', () => {
    const user = makeStats('user-1', 10, 5);
    const partner = makeStats('partner-1', 7, 20);
    expect(determineComparisonWinner(user, partner)).toBe('user-1');
  });

  it('returns the partner when partner has more challenges', () => {
    const user = makeStats('user-1', 3, 30);
    const partner = makeStats('partner-1', 8, 1);
    expect(determineComparisonWinner(user, partner)).toBe('partner-1');
  });

  it('uses streak as tiebreak when challenges are equal', () => {
    const user = makeStats('user-1', 5, 10);
    const partner = makeStats('partner-1', 5, 20);
    expect(determineComparisonWinner(user, partner)).toBe('partner-1');
  });

  it('returns userStats.userId when fully tied', () => {
    const user = makeStats('user-1', 5, 10);
    const partner = makeStats('partner-1', 5, 10);
    expect(determineComparisonWinner(user, partner)).toBe('user-1');
  });

  it('handles zero values correctly', () => {
    const user = makeStats('user-1', 0, 0);
    const partner = makeStats('partner-1', 0, 0);
    expect(determineComparisonWinner(user, partner)).toBe('user-1');
  });
});
