// 🧪 Property-Based Tests for XP System
// Tests universal properties across all inputs using fast-check
// Validates Requirements 2.1, 2.2, 2.3, 2.4, 2.5

import fc from 'fast-check';
import {
  calculateLevel,
  xpForNextLevel,
  awardXP,
  getTotalXP,
  getPillarXP,
  getPillarLevel,
  checkLevelUp,
} from '../services/progressService';
import { PILLAR_LEVEL_THRESHOLDS, XP_AWARDS } from '../types';
import type { XPSource } from '../types';
import { supabase } from '../services/supabaseClient';

// Mock supabase
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Property Tests: XP System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 4: XP Award Calculation
   * For any completed action, the XP awarded should match the predefined amount
   * for that action type and difficulty level.
   * **Validates: Requirements 2.1**
   */
  describe('Property 4: XP Award Calculation', () => {
    it('should award correct XP amount for lesson completion', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.uuid(), // lesson ID
          async (userId, lessonId) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            
            // Mock successful XP transaction insert
            const mockInsert = jest.fn().mockResolvedValue({ error: null });
            (supabase.from as jest.Mock).mockReturnValue({
              insert: mockInsert,
            });

            // Award XP for lesson completion
            await awardXP(userId, XP_AWARDS.LESSON_COMPLETE, 'lesson', lessonId);

            // Verify correct amount was recorded
            expect(supabase.from).toHaveBeenCalledWith('xp_transactions');
            expect(mockInsert).toHaveBeenCalledWith({
              user_id: userId,
              amount: XP_AWARDS.LESSON_COMPLETE,
              source: 'lesson',
              reference_id: lessonId,
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award correct XP amount for check-in actions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.constantFrom('CHECKIN_POSITIVE', 'CHECKIN_NEGATIVE', 'DAILY_CHECKIN'), // check-in type
          async (userId, checkinType) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            
            const expectedAmount = XP_AWARDS[checkinType as keyof typeof XP_AWARDS];

            // Mock successful XP transaction insert
            const mockInsert = jest.fn().mockResolvedValue({ error: null });
            (supabase.from as jest.Mock).mockReturnValue({
              insert: mockInsert,
            });

            // Award XP for check-in
            await awardXP(userId, expectedAmount, 'checkin');

            // Verify correct amount was recorded
            expect(mockInsert).toHaveBeenCalledWith({
              user_id: userId,
              amount: expectedAmount,
              source: 'checkin',
              reference_id: null,
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award correct XP amount for streak milestones', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.constantFrom('STREAK_7', 'STREAK_30', 'STREAK_100'), // streak milestone
          async (userId, streakType) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            
            const expectedAmount = XP_AWARDS[streakType as keyof typeof XP_AWARDS];

            // Mock successful XP transaction insert
            const mockInsert = jest.fn().mockResolvedValue({ error: null });
            (supabase.from as jest.Mock).mockReturnValue({
              insert: mockInsert,
            });

            // Award XP for streak milestone
            await awardXP(userId, expectedAmount, 'streak_milestone');

            // Verify correct amount was recorded
            expect(mockInsert).toHaveBeenCalledWith({
              user_id: userId,
              amount: expectedAmount,
              source: 'streak_milestone',
              reference_id: null,
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award correct XP amount for level-up bonus', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.uuid(), // pillar ID
          async (userId, pillarId) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            
            // Mock successful XP transaction insert
            const mockInsert = jest.fn().mockResolvedValue({ error: null });
            (supabase.from as jest.Mock).mockReturnValue({
              insert: mockInsert,
            });

            // Award XP for level-up
            await awardXP(userId, XP_AWARDS.LEVEL_UP, 'level_up', pillarId);

            // Verify correct amount was recorded
            expect(mockInsert).toHaveBeenCalledWith({
              user_id: userId,
              amount: XP_AWARDS.LEVEL_UP,
              source: 'level_up',
              reference_id: pillarId,
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award correct XP amount for morning briefing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.integer({ min: 1, max: 50 }), // arbitrary XP amount for briefing
          async (userId, xpAmount) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            
            // Mock successful XP transaction insert
            const mockInsert = jest.fn().mockResolvedValue({ error: null });
            (supabase.from as jest.Mock).mockReturnValue({
              insert: mockInsert,
            });

            // Award XP for morning briefing
            await awardXP(userId, xpAmount, 'morning_briefing');

            // Verify correct amount was recorded
            expect(mockInsert).toHaveBeenCalledWith({
              user_id: userId,
              amount: xpAmount,
              source: 'morning_briefing',
              reference_id: null,
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award correct XP amount for speaking sessions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.uuid(), // session ID
          fc.integer({ min: 10, max: 100 }), // XP amount based on performance
          async (userId, sessionId, xpAmount) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            
            // Mock successful XP transaction insert
            const mockInsert = jest.fn().mockResolvedValue({ error: null });
            (supabase.from as jest.Mock).mockReturnValue({
              insert: mockInsert,
            });

            // Award XP for speaking session
            await awardXP(userId, xpAmount, 'speaking_session', sessionId);

            // Verify correct amount was recorded
            expect(mockInsert).toHaveBeenCalledWith({
              user_id: userId,
              amount: xpAmount,
              source: 'speaking_session',
              reference_id: sessionId,
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle any valid XP source type', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.constantFrom<XPSource>(
            'lesson',
            'challenge',
            'checkin',
            'streak_milestone',
            'level_up',
            'morning_briefing',
            'speaking_session',
            'speaking_challenge'
          ),
          fc.integer({ min: 1, max: 500 }), // XP amount
          async (userId, source, amount) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            
            // Mock successful XP transaction insert
            const mockInsert = jest.fn().mockResolvedValue({ error: null });
            (supabase.from as jest.Mock).mockReturnValue({
              insert: mockInsert,
            });

            // Award XP
            await awardXP(userId, amount, source);

            // Verify transaction was recorded with correct source
            expect(mockInsert).toHaveBeenCalledWith(
              expect.objectContaining({
                user_id: userId,
                amount: amount,
                source: source,
              })
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: Level Progression
   * For any XP total that crosses a level threshold, the user's level should increment,
   * and a level-up celebration should be triggered.
   * **Validates: Requirements 2.2, 2.3**
   */
  describe('Property 5: Level Progression', () => {
    it('should increment level when XP crosses threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: PILLAR_LEVEL_THRESHOLDS.length - 2 }), // level index
          fc.integer({ min: 1, max: 100 }), // XP beyond threshold
          (levelIndex, extraXp) => {
            const threshold = PILLAR_LEVEL_THRESHOLDS[levelIndex];
            const nextThreshold = PILLAR_LEVEL_THRESHOLDS[levelIndex + 1];

            // XP just below threshold
            const xpBefore = Math.max(0, threshold - 1);
            const levelBefore = calculateLevel(xpBefore);

            // XP at or above next threshold
            const xpAfter = nextThreshold + extraXp;
            const levelAfter = calculateLevel(xpAfter);

            // Level should increment when crossing threshold
            expect(levelAfter).toBeGreaterThan(levelBefore);
            expect(levelAfter).toBeGreaterThanOrEqual(levelIndex + 2); // +2 because levels are 1-indexed
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect level-up when XP crosses threshold', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.uuid(), // pillar ID
          fc.integer({ min: 1, max: PILLAR_LEVEL_THRESHOLDS.length - 2 }), // level index (skip 0)
          fc.integer({ min: 1, max: 100 }), // XP beyond threshold
          async (userId, pillarId, levelIndex, extraXp) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            
            const threshold = PILLAR_LEVEL_THRESHOLDS[levelIndex];
            const previousXP = threshold - 50; // Below threshold
            const newXP = threshold + extraXp; // Above threshold

            // Mock getPillarXP to return new XP
            (supabase.from as jest.Mock).mockImplementation((table) => {
              if (table === 'lessons') {
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockResolvedValue({
                    data: [{ id: 'lesson-1', units: { pillar_id: pillarId } }],
                    error: null,
                  }),
                };
              } else if (table === 'user_progress') {
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  in: jest.fn().mockResolvedValue({
                    data: [{ xp_earned: newXP }],
                    error: null,
                  }),
                };
              }
            });

            // Check if level-up occurred
            const didLevelUp = await checkLevelUp(userId, pillarId, previousXP);

            // Should detect level-up
            expect(didLevelUp).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not detect level-up when XP stays within same level', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.uuid(), // pillar ID
          fc.integer({ min: 0, max: PILLAR_LEVEL_THRESHOLDS.length - 2 }), // level index
          async (userId, pillarId, levelIndex) => {
            const threshold = PILLAR_LEVEL_THRESHOLDS[levelIndex];
            const nextThreshold = PILLAR_LEVEL_THRESHOLDS[levelIndex + 1];
            
            // Both XP values within same level range
            const previousXP = threshold + 10;
            const newXP = threshold + 20;

            // Ensure we don't cross into next level
            if (newXP >= nextThreshold) return;

            // Mock getPillarXP to return new XP
            (supabase.from as jest.Mock).mockImplementation((table) => {
              if (table === 'lessons') {
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockResolvedValue({
                    data: [{ id: 'lesson-1', units: { pillar_id: pillarId } }],
                    error: null,
                  }),
                };
              } else if (table === 'user_progress') {
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  in: jest.fn().mockResolvedValue({
                    data: [{ xp_earned: newXP }],
                    error: null,
                  }),
                };
              }
            });

            // Check if level-up occurred
            const didLevelUp = await checkLevelUp(userId, pillarId, previousXP);

            // Should not detect level-up
            expect(didLevelUp).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate correct level for any XP amount', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }), // XP amount
          (xp) => {
            const level = calculateLevel(xp);

            // Level should be between 1 and max level
            expect(level).toBeGreaterThanOrEqual(1);
            expect(level).toBeLessThanOrEqual(PILLAR_LEVEL_THRESHOLDS.length);

            // Verify level is correct based on thresholds
            if (level === 1) {
              expect(xp).toBeLessThan(PILLAR_LEVEL_THRESHOLDS[1]);
            } else if (level <= PILLAR_LEVEL_THRESHOLDS.length) {
              const threshold = PILLAR_LEVEL_THRESHOLDS[level - 1];
              expect(xp).toBeGreaterThanOrEqual(threshold);
              
              if (level < PILLAR_LEVEL_THRESHOLDS.length) {
                const nextThreshold = PILLAR_LEVEL_THRESHOLDS[level];
                expect(xp).toBeLessThan(nextThreshold);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle XP at exact threshold boundaries', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: PILLAR_LEVEL_THRESHOLDS.length - 1 }), // threshold index
          (thresholdIndex) => {
            const exactXP = PILLAR_LEVEL_THRESHOLDS[thresholdIndex];
            const level = calculateLevel(exactXP);

            // At exact threshold, should be at that level
            expect(level).toBe(thresholdIndex + 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle maximum level cap correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }), // XP beyond max threshold
          (extraXp) => {
            const maxThreshold = PILLAR_LEVEL_THRESHOLDS[PILLAR_LEVEL_THRESHOLDS.length - 1];
            const xp = maxThreshold + extraXp;
            const level = calculateLevel(xp);

            // Should cap at maximum level
            expect(level).toBe(PILLAR_LEVEL_THRESHOLDS.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: XP Display Completeness
   * For any XP display component, it should show current XP, required XP for next level,
   * and current level.
   * **Validates: Requirements 2.4**
   */
  describe('Property 6: XP Display Completeness', () => {
    it('should return all required display fields for any XP amount', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }), // current XP
          (currentXP) => {
            const displayData = xpForNextLevel(currentXP);

            // Should include all required fields
            expect(displayData).toHaveProperty('current');
            expect(displayData).toHaveProperty('required');
            expect(displayData).toHaveProperty('level');

            // Current XP should match input
            expect(displayData.current).toBe(currentXP);

            // Level should be valid
            expect(displayData.level).toBeGreaterThanOrEqual(1);
            expect(displayData.level).toBeLessThanOrEqual(PILLAR_LEVEL_THRESHOLDS.length);

            // Required XP should be a valid threshold
            expect(displayData.required).toBeGreaterThanOrEqual(0);
            expect(PILLAR_LEVEL_THRESHOLDS).toContain(displayData.required);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should show correct required XP for next level', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: PILLAR_LEVEL_THRESHOLDS.length - 2 }), // level index
          fc.integer({ min: 0, max: 100 }), // XP within level
          (levelIndex, xpWithinLevel) => {
            const currentThreshold = PILLAR_LEVEL_THRESHOLDS[levelIndex];
            const nextThreshold = PILLAR_LEVEL_THRESHOLDS[levelIndex + 1];
            const currentXP = currentThreshold + xpWithinLevel;

            // Ensure we don't exceed next threshold
            if (currentXP >= nextThreshold) return;

            const displayData = xpForNextLevel(currentXP);

            // Required XP should be the next threshold
            expect(displayData.required).toBe(nextThreshold);
            expect(displayData.level).toBe(levelIndex + 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle max level display correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5000 }), // XP beyond max threshold
          (extraXp) => {
            const maxThreshold = PILLAR_LEVEL_THRESHOLDS[PILLAR_LEVEL_THRESHOLDS.length - 1];
            const currentXP = maxThreshold + extraXp;
            const displayData = xpForNextLevel(currentXP);

            // Should show max level
            expect(displayData.level).toBe(PILLAR_LEVEL_THRESHOLDS.length);
            
            // Required should be max threshold (no next level)
            expect(displayData.required).toBe(maxThreshold);
            
            // Current should match input
            expect(displayData.current).toBe(currentXP);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should show progress toward next level for any valid XP', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }), // current XP
          (currentXP) => {
            const displayData = xpForNextLevel(currentXP);

            // Current should never exceed required (for display purposes)
            // unless at max level
            if (displayData.level < PILLAR_LEVEL_THRESHOLDS.length) {
              expect(displayData.current).toBeLessThan(displayData.required);
            }

            // Progress percentage should be calculable
            const progress = (displayData.current / displayData.required) * 100;
            expect(progress).toBeGreaterThanOrEqual(0);
            expect(progress).toBeLessThanOrEqual(200); // Allow overflow for max level
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide consistent data for XP at threshold boundaries', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: PILLAR_LEVEL_THRESHOLDS.length - 2 }), // threshold index
          (thresholdIndex) => {
            const exactXP = PILLAR_LEVEL_THRESHOLDS[thresholdIndex];
            const displayData = xpForNextLevel(exactXP);

            // At exact threshold, should show current level
            expect(displayData.level).toBe(thresholdIndex + 1);
            expect(displayData.current).toBe(exactXP);

            // Required should be next threshold
            if (thresholdIndex + 1 < PILLAR_LEVEL_THRESHOLDS.length) {
              expect(displayData.required).toBe(PILLAR_LEVEL_THRESHOLDS[thresholdIndex + 1]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle zero XP correctly', () => {
      const displayData = xpForNextLevel(0);

      // Should show level 1
      expect(displayData.level).toBe(1);
      expect(displayData.current).toBe(0);
      
      // Required should be first threshold (level 2)
      expect(displayData.required).toBe(PILLAR_LEVEL_THRESHOLDS[1]);
    });

    it('should provide all fields needed for XPBar component', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }), // current XP
          (currentXP) => {
            const displayData = xpForNextLevel(currentXP);

            // XPBar component requires these exact fields
            expect(displayData).toEqual({
              current: expect.any(Number),
              required: expect.any(Number),
              level: expect.any(Number),
            });

            // All values should be non-negative
            expect(displayData.current).toBeGreaterThanOrEqual(0);
            expect(displayData.required).toBeGreaterThanOrEqual(0);
            expect(displayData.level).toBeGreaterThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 7: Progressive XP Scaling
   * For any level N in the level thresholds array, the XP required for level N+1
   * should be greater than the XP required for level N.
   * **Validates: Requirements 2.5**
   */
  describe('Property 7: Progressive XP Scaling', () => {
    it('should have strictly increasing XP requirements for each level', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: PILLAR_LEVEL_THRESHOLDS.length - 2 }), // level index
          (levelIndex) => {
            const currentThreshold = PILLAR_LEVEL_THRESHOLDS[levelIndex];
            const nextThreshold = PILLAR_LEVEL_THRESHOLDS[levelIndex + 1];

            // Next level should require more XP than current level
            expect(nextThreshold).toBeGreaterThan(currentThreshold);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have monotonically increasing thresholds across all levels', () => {
      // Check entire threshold array
      for (let i = 0; i < PILLAR_LEVEL_THRESHOLDS.length - 1; i++) {
        const current = PILLAR_LEVEL_THRESHOLDS[i];
        const next = PILLAR_LEVEL_THRESHOLDS[i + 1];
        
        expect(next).toBeGreaterThan(current);
      }
    });

    it('should have no duplicate threshold values', () => {
      const uniqueThresholds = new Set(PILLAR_LEVEL_THRESHOLDS);
      
      // All thresholds should be unique
      expect(uniqueThresholds.size).toBe(PILLAR_LEVEL_THRESHOLDS.length);
    });

    it('should start with zero XP for level 1', () => {
      // First threshold should be 0 (level 1 starts at 0 XP)
      expect(PILLAR_LEVEL_THRESHOLDS[0]).toBe(0);
    });

    it('should have positive XP requirements for all levels above 1', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: PILLAR_LEVEL_THRESHOLDS.length - 1 }), // level index (skip 0)
          (levelIndex) => {
            const threshold = PILLAR_LEVEL_THRESHOLDS[levelIndex];
            
            // All thresholds above level 1 should be positive
            expect(threshold).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have increasing XP gaps between consecutive levels', () => {
      // Calculate gaps between consecutive levels
      const gaps: number[] = [];
      for (let i = 1; i < PILLAR_LEVEL_THRESHOLDS.length; i++) {
        const gap = PILLAR_LEVEL_THRESHOLDS[i] - PILLAR_LEVEL_THRESHOLDS[i - 1];
        gaps.push(gap);
      }

      // All gaps should be positive
      gaps.forEach(gap => {
        expect(gap).toBeGreaterThan(0);
      });

      // Gaps should generally increase (progressive scaling)
      // Allow some flexibility for game design
      let increasingCount = 0;
      for (let i = 1; i < gaps.length; i++) {
        if (gaps[i] >= gaps[i - 1]) {
          increasingCount++;
        }
      }

      // At least 70% of gaps should be increasing or equal
      const increasingRatio = increasingCount / (gaps.length - 1);
      expect(increasingRatio).toBeGreaterThanOrEqual(0.7);
    });

    it('should have reasonable XP scaling for game balance', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: PILLAR_LEVEL_THRESHOLDS.length - 2 }), // level index
          (levelIndex) => {
            const currentThreshold = PILLAR_LEVEL_THRESHOLDS[levelIndex];
            const nextThreshold = PILLAR_LEVEL_THRESHOLDS[levelIndex + 1];
            const gap = nextThreshold - currentThreshold;

            // Gap should be reasonable (not too small, not too large)
            // Minimum gap of 50 XP between levels
            expect(gap).toBeGreaterThanOrEqual(50);
            
            // Maximum gap should not exceed 10x the previous threshold
            // (to prevent exponential explosion)
            expect(gap).toBeLessThanOrEqual(currentThreshold * 10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have correct number of level thresholds', () => {
      // Should have 11 thresholds (levels 1-11)
      // Level 1 starts at 0, level 2 at threshold[1], etc.
      expect(PILLAR_LEVEL_THRESHOLDS.length).toBe(11);
    });

    it('should maintain consistent scaling ratio across levels', () => {
      // Calculate scaling ratios between consecutive levels
      const ratios: number[] = [];
      for (let i = 2; i < PILLAR_LEVEL_THRESHOLDS.length; i++) {
        const current = PILLAR_LEVEL_THRESHOLDS[i];
        const previous = PILLAR_LEVEL_THRESHOLDS[i - 1];
        const ratio = current / previous;
        ratios.push(ratio);
      }

      // All ratios should be greater than 1 (increasing)
      ratios.forEach(ratio => {
        expect(ratio).toBeGreaterThan(1);
      });

      // Ratios should be relatively consistent (within reasonable range)
      const minRatio = Math.min(...ratios);
      const maxRatio = Math.max(...ratios);
      
      // Max ratio should not be more than 3x the min ratio
      // (indicates consistent scaling)
      expect(maxRatio / minRatio).toBeLessThanOrEqual(3);
    });

    it('should support calculating level for any XP within threshold range', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: PILLAR_LEVEL_THRESHOLDS.length - 2 }), // level index
          fc.integer({ min: 0, max: 1000 }), // XP offset within level
          (levelIndex, offset) => {
            const threshold = PILLAR_LEVEL_THRESHOLDS[levelIndex];
            const nextThreshold = PILLAR_LEVEL_THRESHOLDS[levelIndex + 1];
            
            // XP within this level range
            const xp = threshold + (offset % (nextThreshold - threshold));
            const level = calculateLevel(xp);

            // Should calculate correct level
            expect(level).toBe(levelIndex + 1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
