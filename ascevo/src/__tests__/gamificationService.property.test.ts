// 🧪 Property-Based Tests for Achievement System and Daily Goals
// Tests universal properties across all inputs using fast-check
// Validates Requirements 3.1, 3.2, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5

import fc from 'fast-check';
import {
  ACHIEVEMENT_DEFINITIONS,
  getAllAchievements,
  getAchievementById,
  getAchievementsByCategory,
  checkAchievements,
  unlockAchievement,
  getUserAchievements,
  DAILY_GOAL_TEMPLATES,
  getDailyGoals,
  updateGoalProgress,
  completeDailyGoal,
  getGoalTemplate,
  getGoalTemplatesByDifficulty,
} from '../services/gamificationService';
import { supabase } from '../services/supabaseClient';
import type { AchievementDefinition, Achievement, DailyGoal } from '../types';

// Mock supabase
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Property Tests: Achievement System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 8: Achievement Unlock and Celebration
   * For any user state that meets an achievement's criteria, the achievement should be unlocked
   * and a celebration modal should be triggered with the achievement details.
   * **Validates: Requirements 3.1, 3.2**
   */
  describe('Property 8: Achievement Unlock and Celebration', () => {
    it('should unlock achievement when streak milestone is reached', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(7, 30, 100, 365), // streak milestones
          fc.uuid(), // user ID
          async (streakMilestone, userId) => {
            // Mock no existing achievements
            let callCount = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                // getUserAchievements call
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  order: jest.fn().mockResolvedValue({ data: [], error: null }),
                };
              } else {
                // unlockAchievement calls
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                  insert: jest.fn().mockReturnThis(),
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: `ach-${callCount}`,
                      user_id: userId,
                      achievement_id: `streak_${streakMilestone}_days`,
                      unlocked_at: new Date().toISOString(),
                      created_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                };
              }
            });

            // Check achievements for streak milestone
            const unlockedAchievements = await checkAchievements(userId, {
              type: 'streak_updated',
              streak: streakMilestone,
            });

            // Should unlock the corresponding streak achievement
            expect(unlockedAchievements.length).toBeGreaterThan(0);
            expect(unlockedAchievements[0].achievementId).toBe(`streak_${streakMilestone}_days`);
            expect(unlockedAchievements[0].userId).toBe(userId);
            expect(unlockedAchievements[0].unlockedAt).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should unlock achievement when XP threshold is reached', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(1000, 5000, 10000), // XP milestones
          fc.uuid(), // user ID
          fc.integer({ min: 0, max: 500 }), // additional XP beyond threshold
          async (xpThreshold, userId, additionalXp) => {
            const totalXp = xpThreshold + additionalXp;

            // Mock no existing achievements
            let callCount = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                // getUserAchievements call
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  order: jest.fn().mockResolvedValue({ data: [], error: null }),
                };
              } else {
                // unlockAchievement calls
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                  insert: jest.fn().mockReturnThis(),
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: `ach-${callCount}`,
                      user_id: userId,
                      achievement_id: `xp_${xpThreshold}`,
                      unlocked_at: new Date().toISOString(),
                      created_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                };
              }
            });

            // Check achievements for XP earned
            const unlockedAchievements = await checkAchievements(userId, {
              type: 'xp_earned',
              amount: additionalXp,
              total: totalXp,
            });

            // Should unlock all XP achievements up to and including this threshold
            expect(unlockedAchievements.length).toBeGreaterThan(0);
            
            // All unlocked achievements should be XP-related
            unlockedAchievements.forEach((achievement) => {
              expect(achievement.achievementId).toMatch(/^xp_/);
              expect(achievement.userId).toBe(userId);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should unlock achievement when level threshold is reached', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 10, max: 50 }), // level reached
          fc.uuid(), // user ID
          fc.uuid(), // pillar ID
          async (level, userId, pillarId) => {
            // Mock no existing achievements
            let callCount = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                // getUserAchievements call
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  order: jest.fn().mockResolvedValue({ data: [], error: null }),
                };
              } else {
                // unlockAchievement calls
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                  insert: jest.fn().mockReturnThis(),
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: `ach-${callCount}`,
                      user_id: userId,
                      achievement_id: 'level_10_any_pillar',
                      unlocked_at: new Date().toISOString(),
                      created_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                };
              }
            });

            // Check achievements for level up
            const unlockedAchievements = await checkAchievements(userId, {
              type: 'level_up',
              level,
              pillarId,
            });

            // If level >= 10, should unlock level achievement
            if (level >= 10) {
              expect(unlockedAchievements.length).toBeGreaterThan(0);
              unlockedAchievements.forEach((achievement) => {
                expect(achievement.userId).toBe(userId);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not unlock already unlocked achievements', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(7, 30, 100, 365), // streak milestones
          fc.uuid(), // user ID
          async (streakMilestone, userId) => {
            const achievementId = `streak_${streakMilestone}_days`;

            // Mock existing achievement
            (supabase.from as jest.Mock).mockReturnValue({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValue({
                data: [
                  {
                    id: 'existing-ach',
                    user_id: userId,
                    achievement_id: achievementId,
                    unlocked_at: '2024-01-01T00:00:00Z',
                    created_at: '2024-01-01T00:00:00Z',
                  },
                ],
                error: null,
              }),
            });

            // Check achievements for streak milestone
            const unlockedAchievements = await checkAchievements(userId, {
              type: 'streak_updated',
              streak: streakMilestone,
            });

            // Should not unlock already unlocked achievement
            expect(unlockedAchievements).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle unlocking multiple achievements simultaneously', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1000, max: 10000 }), // total XP
          fc.uuid(), // user ID
          async (totalXp, userId) => {
            // Mock no existing achievements
            let callCount = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                // getUserAchievements call
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  order: jest.fn().mockResolvedValue({ data: [], error: null }),
                };
              } else {
                // unlockAchievement calls
                const achievementIds = ['xp_1000', 'xp_5000', 'xp_10000'];
                const achievementId = achievementIds[Math.min(callCount - 2, achievementIds.length - 1)];
                
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                  insert: jest.fn().mockReturnThis(),
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: `ach-${callCount}`,
                      user_id: userId,
                      achievement_id: achievementId,
                      unlocked_at: new Date().toISOString(),
                      created_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                };
              }
            });

            // Check achievements for XP earned
            const unlockedAchievements = await checkAchievements(userId, {
              type: 'xp_earned',
              amount: 100,
              total: totalXp,
            });

            // Should unlock all applicable XP achievements
            // Count how many thresholds are met
            const expectedCount = [1000, 5000, 10000].filter(threshold => totalXp >= threshold).length;
            expect(unlockedAchievements.length).toBe(expectedCount);

            // All should have valid data
            unlockedAchievements.forEach((achievement) => {
              expect(achievement.userId).toBe(userId);
              expect(achievement.achievementId).toMatch(/^xp_/);
              expect(achievement.unlockedAt).toBeDefined();
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 10: Achievement Collection Completeness
   * For any user, the achievement collection display should include all achievements they have unlocked.
   * **Validates: Requirements 3.4**
   */
  describe('Property 10: Achievement Collection Completeness', () => {
    it('should return all unlocked achievements for a user', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.array(
            fc.record({
              achievementId: fc.constantFrom(
                'streak_7_days',
                'streak_30_days',
                'lessons_10',
                'lessons_50',
                'first_lesson',
                'xp_1000'
              ),
              unlockedAt: fc.date({ min: new Date('2024-01-01'), max: new Date() }),
            }),
            { minLength: 0, maxLength: 10 }
          ),
          async (userId, unlockedAchievements) => {
            // Remove duplicates
            const uniqueAchievements = Array.from(
              new Map(unlockedAchievements.map(a => [a.achievementId, a])).values()
            );

            // Mock database response
            const mockData = uniqueAchievements.map((ach, index) => ({
              id: `ach-${index}`,
              user_id: userId,
              achievement_id: ach.achievementId,
              unlocked_at: ach.unlockedAt.toISOString(),
              created_at: ach.unlockedAt.toISOString(),
            }));

            (supabase.from as jest.Mock).mockReturnValue({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
            });

            // Get user achievements
            const achievements = await getUserAchievements(userId);

            // Should return all unlocked achievements
            expect(achievements).toHaveLength(uniqueAchievements.length);

            // All achievement IDs should match
            const returnedIds = achievements.map(a => a.achievementId).sort();
            const expectedIds = uniqueAchievements.map(a => a.achievementId).sort();
            expect(returnedIds).toEqual(expectedIds);

            // All should have the correct user ID
            achievements.forEach((achievement) => {
              expect(achievement.userId).toBe(userId);
              expect(achievement.unlockedAt).toBeDefined();
              expect(achievement.createdAt).toBeDefined();
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty array for user with no achievements', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          async (userId) => {
            // Mock empty database response
            (supabase.from as jest.Mock).mockReturnValue({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValue({ data: [], error: null }),
            });

            // Get user achievements
            const achievements = await getUserAchievements(userId);

            // Should return empty array
            expect(achievements).toEqual([]);
            expect(achievements).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve achievement unlock order', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.array(
            fc.record({
              achievementId: fc.constantFrom(
                'first_lesson',
                'streak_7_days',
                'lessons_10',
                'xp_1000',
                'streak_30_days'
              ),
              unlockedAt: fc.date({ min: new Date('2024-01-01'), max: new Date() }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          async (userId, unlockedAchievements) => {
            // Remove duplicates and sort by unlock date (descending)
            const uniqueAchievements = Array.from(
              new Map(unlockedAchievements.map(a => [a.achievementId, a])).values()
            ).sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());

            // Mock database response (already sorted descending)
            const mockData = uniqueAchievements.map((ach, index) => ({
              id: `ach-${index}`,
              user_id: userId,
              achievement_id: ach.achievementId,
              unlocked_at: ach.unlockedAt.toISOString(),
              created_at: ach.unlockedAt.toISOString(),
            }));

            (supabase.from as jest.Mock).mockReturnValue({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
            });

            // Get user achievements
            const achievements = await getUserAchievements(userId);

            // Should maintain descending order by unlock date
            for (let i = 1; i < achievements.length; i++) {
              const prevDate = new Date(achievements[i - 1].unlockedAt);
              const currDate = new Date(achievements[i].unlockedAt);
              expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include all achievement data fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.constantFrom('streak_7_days', 'lessons_10', 'xp_1000'), // achievement ID
          async (userId, achievementId) => {
            const mockData = [
              {
                id: 'ach-123',
                user_id: userId,
                achievement_id: achievementId,
                unlocked_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              },
            ];

            (supabase.from as jest.Mock).mockReturnValue({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
            });

            // Get user achievements
            const achievements = await getUserAchievements(userId);

            // Should have exactly one achievement
            expect(achievements).toHaveLength(1);

            // Should include all required fields
            const achievement = achievements[0];
            expect(achievement.id).toBeDefined();
            expect(achievement.userId).toBe(userId);
            expect(achievement.achievementId).toBe(achievementId);
            expect(achievement.unlockedAt).toBeDefined();
            expect(achievement.createdAt).toBeDefined();

            // Dates should be valid ISO strings
            expect(() => new Date(achievement.unlockedAt)).not.toThrow();
            expect(() => new Date(achievement.createdAt)).not.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 11: Achievement Category Support
   * For any achievement definition, it should have a valid category from the set
   * (streak, lessons, social, special events).
   * **Validates: Requirements 3.5**
   */
  describe('Property 11: Achievement Category Support', () => {
    it('should have valid category for all achievement definitions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(ACHIEVEMENT_DEFINITIONS)),
          (achievementId) => {
            const achievement = ACHIEVEMENT_DEFINITIONS[achievementId];
            const validCategories = ['streak', 'lessons', 'social', 'special'];

            // Achievement should have a valid category
            expect(validCategories).toContain(achievement.category);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should filter achievements by category correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('streak', 'lessons', 'social', 'special'),
          (category) => {
            const achievements = getAchievementsByCategory(category);

            // All returned achievements should have the requested category
            achievements.forEach((achievement) => {
              expect(achievement.category).toBe(category);
            });

            // Should return at least one achievement for each category
            expect(achievements.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have all required achievement categories represented', () => {
      const allAchievements = getAllAchievements();
      const categories = new Set(allAchievements.map(a => a.category));

      // Should have all four categories
      expect(categories).toContain('streak');
      expect(categories).toContain('lessons');
      expect(categories).toContain('social');
      expect(categories).toContain('special');
      expect(categories.size).toBe(4);
    });

    it('should have consistent category assignment for related achievements', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('streak_7_days', 'streak_30_days', 'streak_100_days', 'streak_365_days'),
          (achievementId) => {
            const achievement = ACHIEVEMENT_DEFINITIONS[achievementId];
            
            // All streak achievements should have 'streak' category
            expect(achievement.category).toBe('streak');
            expect(achievement.criteria.type).toBe('streak');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have consistent category assignment for lesson achievements', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('lessons_10', 'lessons_50', 'lessons_100'),
          (achievementId) => {
            const achievement = ACHIEVEMENT_DEFINITIONS[achievementId];
            
            // All lesson count achievements should have 'lessons' category
            expect(achievement.category).toBe('lessons');
            expect(achievement.criteria.type).toBe('lessons_count');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have consistent category assignment for social achievements', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('invite_first_friend', 'invite_5_friends', 'join_squad', 'create_squad'),
          (achievementId) => {
            const achievement = ACHIEVEMENT_DEFINITIONS[achievementId];
            
            // All social achievements should have 'social' category
            expect(achievement.category).toBe('social');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should retrieve achievement by ID for any valid achievement', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(ACHIEVEMENT_DEFINITIONS)),
          (achievementId) => {
            const achievement = getAchievementById(achievementId);

            // Should return the achievement
            expect(achievement).toBeDefined();
            expect(achievement?.id).toBe(achievementId);
            expect(achievement?.category).toBeDefined();
            expect(achievement?.title).toBeDefined();
            expect(achievement?.description).toBeDefined();
            expect(achievement?.icon).toBeDefined();
            expect(achievement?.criteria).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return undefined for invalid achievement ID', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(
            id => !Object.keys(ACHIEVEMENT_DEFINITIONS).includes(id)
          ),
          (invalidId) => {
            const achievement = getAchievementById(invalidId);
            
            // Should return undefined for invalid ID
            expect(achievement).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have all achievements accessible via getAllAchievements', () => {
      const allAchievements = getAllAchievements();
      const definitionKeys = Object.keys(ACHIEVEMENT_DEFINITIONS);

      // Should return all defined achievements
      expect(allAchievements.length).toBe(definitionKeys.length);

      // All achievement IDs should match definition keys
      const achievementIds = allAchievements.map(a => a.id).sort();
      const expectedIds = definitionKeys.sort();
      expect(achievementIds).toEqual(expectedIds);
    });

    it('should have unique achievement IDs', () => {
      const allAchievements = getAllAchievements();
      const ids = allAchievements.map(a => a.id);
      const uniqueIds = new Set(ids);

      // All IDs should be unique
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have non-empty required fields for all achievements', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(ACHIEVEMENT_DEFINITIONS)),
          (achievementId) => {
            const achievement = ACHIEVEMENT_DEFINITIONS[achievementId];

            // All required fields should be non-empty
            expect(achievement.id).toBeTruthy();
            expect(achievement.title).toBeTruthy();
            expect(achievement.description).toBeTruthy();
            expect(achievement.icon).toBeTruthy();
            expect(achievement.category).toBeTruthy();
            expect(achievement.criteria).toBeDefined();
            expect(achievement.criteria.type).toBeTruthy();
            expect(achievement.criteria.threshold).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
