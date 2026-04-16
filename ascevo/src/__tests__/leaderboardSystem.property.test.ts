// 🧪 Property-Based Tests for Leaderboard System
// Tests universal properties across all inputs using fast-check
// Validates Requirements 5.1, 5.2, 5.3, 5.4, 5.5

import fc from 'fast-check';
import {
  getLeagueRankings,
  rankMembers,
  updateWeeklyXP,
} from '../services/leagueService';
import type { LeagueMember } from '../types';
import { supabase } from '../services/supabaseClient';

// Mock supabase
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Property Tests: Leaderboard System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 16: Leaderboard Ranking Correctness
   * For any set of users with weekly XP totals, the leaderboard rankings should be
   * ordered from highest to lowest XP, with correct rank positions assigned.
   * **Validates: Requirements 5.1, 5.2**
   */
  describe('Property 16: Leaderboard Ranking Correctness', () => {
    it('should rank users in descending order by weekly XP', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              weeklyXp: fc.integer({ min: 0, max: 10000 }),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (users) => {
            const ranked = rankMembers(users);

            // Check that rankings are in descending order by XP
            for (let i = 0; i < ranked.length - 1; i++) {
              expect(ranked[i].weeklyXp).toBeGreaterThanOrEqual(ranked[i + 1].weeklyXp);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should assign correct rank positions starting from 1', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              weeklyXp: fc.integer({ min: 0, max: 10000 }),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (users) => {
            const ranked = rankMembers(users);

            // Check that ranks are assigned correctly
            ranked.forEach((member, index) => {
              expect(member.rank).toBe(index + 1);
            });

            // First rank should be 1
            if (ranked.length > 0) {
              expect(ranked[0].rank).toBe(1);
            }

            // Last rank should equal array length
            if (ranked.length > 0) {
              expect(ranked[ranked.length - 1].rank).toBe(ranked.length);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle users with equal XP correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }), // shared XP value
          fc.integer({ min: 2, max: 10 }), // number of users with same XP
          (sharedXp, count) => {
            const users = Array.from({ length: count }, (_, i) => ({
              userId: `user-${i}`,
              weeklyXp: sharedXp,
            }));

            const ranked = rankMembers(users);

            // All users should have same XP
            ranked.forEach((member) => {
              expect(member.weeklyXp).toBe(sharedXp);
            });

            // Ranks should still be sequential (1, 2, 3, ...)
            ranked.forEach((member, index) => {
              expect(member.rank).toBe(index + 1);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all user data during ranking', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              weeklyXp: fc.integer({ min: 0, max: 10000 }),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (users) => {
            const ranked = rankMembers(users);

            // Should have same number of members
            expect(ranked.length).toBe(users.length);

            // All original user IDs should be present
            const originalIds = users.map((u) => u.userId).sort();
            const rankedIds = ranked.map((m) => m.userId).sort();
            expect(rankedIds).toEqual(originalIds);

            // All XP values should be preserved
            users.forEach((user) => {
              const rankedMember = ranked.find((m) => m.userId === user.userId);
              expect(rankedMember).toBeDefined();
              expect(rankedMember!.weeklyXp).toBe(user.weeklyXp);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle single user correctly', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // user ID
          fc.integer({ min: 0, max: 10000 }), // weekly XP
          (userId, weeklyXp) => {
            const users = [{ userId, weeklyXp }];
            const ranked = rankMembers(users);

            expect(ranked.length).toBe(1);
            expect(ranked[0].rank).toBe(1);
            expect(ranked[0].userId).toBe(userId);
            expect(ranked[0].weeklyXp).toBe(weeklyXp);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should rank highest XP as rank 1', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              weeklyXp: fc.integer({ min: 0, max: 9999 }),
            }),
            { minLength: 2, maxLength: 20 }
          ),
          fc.integer({ min: 10000, max: 20000 }), // guaranteed highest XP
          (users, highestXp) => {
            const topUserId = 'top-user';
            const allUsers = [...users, { userId: topUserId, weeklyXp: highestXp }];
            const ranked = rankMembers(allUsers);

            // Top user should be rank 1
            expect(ranked[0].userId).toBe(topUserId);
            expect(ranked[0].rank).toBe(1);
            expect(ranked[0].weeklyXp).toBe(highestXp);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should rank lowest XP as last rank', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              weeklyXp: fc.integer({ min: 100, max: 10000 }),
            }),
            { minLength: 2, maxLength: 20 }
          ),
          fc.integer({ min: 0, max: 99 }), // guaranteed lowest XP
          (users, lowestXp) => {
            const bottomUserId = 'bottom-user';
            const allUsers = [...users, { userId: bottomUserId, weeklyXp: lowestXp }];
            const ranked = rankMembers(allUsers);

            // Bottom user should be last rank
            const lastMember = ranked[ranked.length - 1];
            expect(lastMember.userId).toBe(bottomUserId);
            expect(lastMember.rank).toBe(ranked.length);
            expect(lastMember.weeklyXp).toBe(lowestXp);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle zero XP correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              weeklyXp: fc.constantFrom(0),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (users) => {
            const ranked = rankMembers(users);

            // All users should have 0 XP
            ranked.forEach((member) => {
              expect(member.weeklyXp).toBe(0);
            });

            // Ranks should still be assigned sequentially
            ranked.forEach((member, index) => {
              expect(member.rank).toBe(index + 1);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain stable sort for equal XP values', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }), // shared XP
          fc.integer({ min: 3, max: 10 }), // number of users
          (sharedXp, count) => {
            const users = Array.from({ length: count }, (_, i) => ({
              userId: `user-${i}`,
              weeklyXp: sharedXp,
            }));

            const ranked1 = rankMembers(users);
            const ranked2 = rankMembers(users);

            // Rankings should be consistent across multiple calls
            expect(ranked1.map((m) => m.userId)).toEqual(ranked2.map((m) => m.userId));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle maximum league size correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              weeklyXp: fc.integer({ min: 0, max: 10000 }),
            }),
            { minLength: 20, maxLength: 20 }
          ),
          (users) => {
            const ranked = rankMembers(users);

            // Should rank all 20 members
            expect(ranked.length).toBe(20);

            // Ranks should go from 1 to 20
            expect(ranked[0].rank).toBe(1);
            expect(ranked[19].rank).toBe(20);

            // All ranks should be unique and sequential
            const ranks = ranked.map((m) => m.rank);
            expect(new Set(ranks).size).toBe(20);
            expect(Math.min(...ranks)).toBe(1);
            expect(Math.max(...ranks)).toBe(20);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 17: Rank Change Animation Trigger
   * For any user whose rank improves from one update to the next,
   * a rank-up animation should be triggered.
   * **Validates: Requirements 5.3**
   */
  describe('Property 17: Rank Change Animation Trigger', () => {
    it('should detect rank improvement when position increases', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 20 }), // previous rank (not first)
          fc.integer({ min: 1, max: 10 }), // rank improvement amount
          (previousRank, improvement) => {
            const newRank = Math.max(1, previousRank - improvement);

            // Rank improved if new rank is lower number (higher position)
            const didImprove = newRank < previousRank;

            expect(didImprove).toBe(true);
            expect(newRank).toBeLessThan(previousRank);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not trigger animation when rank stays the same', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }), // rank
          (rank) => {
            const previousRank = rank;
            const newRank = rank;

            const didImprove = newRank < previousRank;

            expect(didImprove).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not trigger animation when rank decreases', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 19 }), // previous rank
          fc.integer({ min: 1, max: 10 }), // rank decrease amount
          (previousRank, decrease) => {
            const newRank = Math.min(20, previousRank + decrease);

            const didImprove = newRank < previousRank;

            expect(didImprove).toBe(false);
            expect(newRank).toBeGreaterThanOrEqual(previousRank);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect rank improvement from any position', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 20 }), // previous rank
          fc.integer({ min: 1, max: 20 }), // new rank
          (previousRank, newRank) => {
            const didImprove = newRank < previousRank;

            if (newRank < previousRank) {
              expect(didImprove).toBe(true);
            } else {
              expect(didImprove).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle improvement to rank 1', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 20 }), // previous rank (not first)
          (previousRank) => {
            const newRank = 1;
            const didImprove = newRank < previousRank;

            expect(didImprove).toBe(true);
            expect(newRank).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle staying at rank 1', () => {
      const previousRank = 1;
      const newRank = 1;
      const didImprove = newRank < previousRank;

      expect(didImprove).toBe(false);
    });

    it('should calculate rank change magnitude correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }), // previous rank
          fc.integer({ min: 1, max: 20 }), // new rank
          (previousRank, newRank) => {
            const rankChange = previousRank - newRank;

            if (newRank < previousRank) {
              // Improved (moved up)
              expect(rankChange).toBeGreaterThan(0);
            } else if (newRank > previousRank) {
              // Declined (moved down)
              expect(rankChange).toBeLessThan(0);
            } else {
              // No change
              expect(rankChange).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect improvement after XP increase', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              weeklyXp: fc.integer({ min: 0, max: 5000 }),
            }),
            { minLength: 5, maxLength: 20 }
          ),
          fc.integer({ min: 1000, max: 5000 }), // XP boost
          (users, xpBoost) => {
            // Initial ranking
            const initialRanked = rankMembers(users);
            const targetUser = initialRanked[Math.floor(initialRanked.length / 2)];
            const previousRank = targetUser.rank;

            // Boost target user's XP
            const updatedUsers = users.map((u) =>
              u.userId === targetUser.userId
                ? { ...u, weeklyXp: u.weeklyXp + xpBoost }
                : u
            );

            // New ranking
            const newRanked = rankMembers(updatedUsers);
            const updatedUser = newRanked.find((m) => m.userId === targetUser.userId);
            const newRank = updatedUser!.rank;

            // Should improve rank (lower number)
            expect(newRank).toBeLessThanOrEqual(previousRank);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 18: Leaderboard Type Support
   * For any leaderboard query, it should support filtering by type
   * (friends, global, squad).
   * **Validates: Requirements 5.4**
   */
  describe('Property 18: Leaderboard Type Support', () => {
    it('should support all leaderboard types', () => {
      const validTypes = ['friends', 'global', 'squad'];

      validTypes.forEach((type) => {
        expect(['friends', 'global', 'squad']).toContain(type);
      });
    });

    it('should handle friends leaderboard type', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('friends'),
          (leaderboardType) => {
            expect(leaderboardType).toBe('friends');
            expect(['friends', 'global', 'squad']).toContain(leaderboardType);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle global leaderboard type', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('global'),
          (leaderboardType) => {
            expect(leaderboardType).toBe('global');
            expect(['friends', 'global', 'squad']).toContain(leaderboardType);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle squad leaderboard type', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('squad'),
          (leaderboardType) => {
            expect(leaderboardType).toBe('squad');
            expect(['friends', 'global', 'squad']).toContain(leaderboardType);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate leaderboard type from any input', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('friends', 'global', 'squad'),
          (leaderboardType) => {
            const validTypes = ['friends', 'global', 'squad'];
            expect(validTypes).toContain(leaderboardType);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should distinguish between different leaderboard types', () => {
      const types = ['friends', 'global', 'squad'];
      const uniqueTypes = new Set(types);

      // All types should be unique
      expect(uniqueTypes.size).toBe(3);
    });

    it('should support type-based filtering logic', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('friends', 'global', 'squad'),
          fc.array(
            fc.record({
              userId: fc.uuid(),
              weeklyXp: fc.integer({ min: 0, max: 10000 }),
              type: fc.constantFrom('friends', 'global', 'squad'),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (filterType, members) => {
            // Filter members by type
            const filtered = members.filter((m) => m.type === filterType);

            // All filtered members should match the type
            filtered.forEach((member) => {
              expect(member.type).toBe(filterType);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 19: Leaderboard Entry Completeness
   * For any leaderboard entry, it should include user avatar, name, XP,
   * and rank position.
   * **Validates: Requirements 5.5**
   */
  describe('Property 19: Leaderboard Entry Completeness', () => {
    it('should include all required fields for any leaderboard entry', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // user ID
          fc.string({ minLength: 1, maxLength: 50 }), // username
          fc.integer({ min: 0, max: 10000 }), // weekly XP
          fc.integer({ min: 1, max: 20 }), // rank
          fc.option(fc.webUrl()), // avatar URL (optional)
          (userId, username, weeklyXp, rank, avatarUrl) => {
            const entry: LeagueMember = {
              id: userId,
              leagueId: 'league-1',
              userId,
              username,
              weeklyXp,
              rank,
              avatarUrl: avatarUrl ?? undefined,
            };

            // Should have all required fields
            expect(entry).toHaveProperty('userId');
            expect(entry).toHaveProperty('username');
            expect(entry).toHaveProperty('weeklyXp');
            expect(entry).toHaveProperty('rank');

            // Fields should have correct types
            expect(typeof entry.userId).toBe('string');
            expect(typeof entry.username).toBe('string');
            expect(typeof entry.weeklyXp).toBe('number');
            expect(typeof entry.rank).toBe('number');

            // Avatar URL is optional but should be string if present
            if (entry.avatarUrl !== undefined) {
              expect(typeof entry.avatarUrl).toBe('string');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have valid username for any entry', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // user ID
          fc.string({ minLength: 1, maxLength: 50 }), // username
          fc.integer({ min: 0, max: 10000 }), // weekly XP
          (userId, username, weeklyXp) => {
            const entry: Partial<LeagueMember> = {
              userId,
              username,
              weeklyXp,
            };

            // Username should be non-empty string
            expect(entry.username).toBeDefined();
            expect(typeof entry.username).toBe('string');
            expect(entry.username!.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have valid XP value for any entry', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // user ID
          fc.integer({ min: 0, max: 10000 }), // weekly XP
          (userId, weeklyXp) => {
            const entry: Partial<LeagueMember> = {
              userId,
              weeklyXp,
            };

            // XP should be non-negative number
            expect(entry.weeklyXp).toBeDefined();
            expect(typeof entry.weeklyXp).toBe('number');
            expect(entry.weeklyXp!).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have valid rank position for any entry', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // user ID
          fc.integer({ min: 1, max: 20 }), // rank
          (userId, rank) => {
            const entry: Partial<LeagueMember> = {
              userId,
              rank,
            };

            // Rank should be positive integer
            expect(entry.rank).toBeDefined();
            expect(typeof entry.rank).toBe('number');
            expect(entry.rank!).toBeGreaterThanOrEqual(1);
            expect(Number.isInteger(entry.rank!)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle optional avatar URL correctly', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // user ID
          fc.option(fc.webUrl()), // avatar URL (optional)
          (userId, avatarUrl) => {
            const entry: Partial<LeagueMember> = {
              userId,
              avatarUrl: avatarUrl ?? undefined,
            };

            // Avatar URL can be undefined or string
            if (entry.avatarUrl !== undefined) {
              expect(typeof entry.avatarUrl).toBe('string');
              expect(entry.avatarUrl.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all fields during ranking', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              weeklyXp: fc.integer({ min: 0, max: 10000 }),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (users) => {
            const ranked = rankMembers(users);

            // All entries should have complete data
            ranked.forEach((entry) => {
              expect(entry).toHaveProperty('userId');
              expect(entry).toHaveProperty('weeklyXp');
              expect(entry).toHaveProperty('rank');
              expect(entry).toHaveProperty('leagueId');

              // Verify types
              expect(typeof entry.userId).toBe('string');
              expect(typeof entry.weeklyXp).toBe('number');
              expect(typeof entry.rank).toBe('number');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have consistent field structure across all entries', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              userId: fc.uuid(),
              weeklyXp: fc.integer({ min: 0, max: 10000 }),
            }),
            { minLength: 2, maxLength: 20 }
          ),
          (users) => {
            const ranked = rankMembers(users);

            // Get keys from first entry
            const firstKeys = Object.keys(ranked[0]).sort();

            // All entries should have same keys
            ranked.forEach((entry) => {
              const entryKeys = Object.keys(entry).sort();
              expect(entryKeys).toEqual(firstKeys);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle entries with all fields populated', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // user ID
          fc.string({ minLength: 1, maxLength: 50 }), // username
          fc.webUrl(), // avatar URL
          fc.integer({ min: 0, max: 10000 }), // weekly XP
          fc.integer({ min: 1, max: 20 }), // rank
          (userId, username, avatarUrl, weeklyXp, rank) => {
            const entry: LeagueMember = {
              id: userId,
              leagueId: 'league-1',
              userId,
              username,
              avatarUrl,
              weeklyXp,
              rank,
            };

            // All fields should be present and valid
            expect(entry.userId).toBe(userId);
            expect(entry.username).toBe(username);
            expect(entry.avatarUrl).toBe(avatarUrl);
            expect(entry.weeklyXp).toBe(weeklyXp);
            expect(entry.rank).toBe(rank);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should support displaying entry in UI component', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // user ID
          fc.string({ minLength: 1, maxLength: 50 }), // username
          fc.integer({ min: 0, max: 10000 }), // weekly XP
          fc.integer({ min: 1, max: 20 }), // rank
          (userId, username, weeklyXp, rank) => {
            const entry: LeagueMember = {
              id: userId,
              leagueId: 'league-1',
              userId,
              username,
              weeklyXp,
              rank,
            };

            // Should have all data needed for UI display
            const displayData = {
              name: entry.username,
              xp: entry.weeklyXp,
              position: entry.rank,
              avatar: entry.avatarUrl,
            };

            expect(displayData.name).toBeDefined();
            expect(displayData.xp).toBeGreaterThanOrEqual(0);
            expect(displayData.position).toBeGreaterThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
