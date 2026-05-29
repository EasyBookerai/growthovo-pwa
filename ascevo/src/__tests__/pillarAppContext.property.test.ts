/**
 * Property-Based Tests for AppContext Synchronization
 * 
 * Tests universal properties that should hold true for XP synchronization
 * between the Pillars screen and AppContext.
 * 
 * Feature: premium-pillars-experience
 * Property 8: AppContext Synchronization
 * Validates: Requirements 17.1
 */

import fc from 'fast-check';
import {
  completeLesson,
} from '../services/pillarLessonService';
import {
  completeDailyChallenge,
  awardXP,
} from '../services/pillarChallengeService';
import {
  loadPillarProgress,
  savePillarProgress,
  loadCompletedLessons,
  saveCompletedLessons,
  loadGlobalXP,
  saveGlobalXP,
  getCurrentDate,
  createDefaultProgress,
} from '../services/pillarStorageService';
import type { PremiumPillarKey } from '../types/pillars';
import { PREMIUM_XP_AWARDS } from '../types/pillars';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock pillarStorageService
jest.mock('../services/pillarStorageService', () => {
  const actual = jest.requireActual('../services/pillarStorageService');
  const mockGetCurrentDate = jest.fn(() => '2024-01-15');
  
  return {
    ...actual,
    loadPillarProgress: jest.fn(),
    savePillarProgress: jest.fn(),
    loadCompletedLessons: jest.fn(),
    saveCompletedLessons: jest.fn(),
    loadGlobalXP: jest.fn(),
    saveGlobalXP: jest.fn(),
    getCurrentDate: mockGetCurrentDate,
    shouldResetDailyChallenge: jest.fn((progress) => {
      if (!progress.challengeCompletedToday) {
        return false;
      }
      const today = mockGetCurrentDate();
      const lastDate = progress.challengeCompletionDate;
      return lastDate !== null && lastDate !== today;
    }),
  };
});

const mockLoadPillarProgress = loadPillarProgress as jest.MockedFunction<typeof loadPillarProgress>;
const mockSavePillarProgress = savePillarProgress as jest.MockedFunction<typeof savePillarProgress>;
const mockLoadCompletedLessons = loadCompletedLessons as jest.MockedFunction<typeof loadCompletedLessons>;
const mockSaveCompletedLessons = saveCompletedLessons as jest.MockedFunction<typeof saveCompletedLessons>;
const mockLoadGlobalXP = loadGlobalXP as jest.MockedFunction<typeof loadGlobalXP>;
const mockSaveGlobalXP = saveGlobalXP as jest.MockedFunction<typeof saveGlobalXP>;
const mockGetCurrentDate = getCurrentDate as jest.MockedFunction<typeof getCurrentDate>;

describe('Property Tests: AppContext Synchronization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentDate.mockReturnValue('2024-01-15');
  });

  /**
   * Property 8: AppContext Synchronization
   * 
   * **Validates: Requirements 17.1**
   * 
   * For any XP award in the Pillars screen, the XP value SHALL be propagated
   * to AppContext, and AppContext.xp SHALL reflect the new total XP value.
   * 
   * This property tests:
   * 1. Any XP award propagates to AppContext via callback
   * 2. AppContext callback is called with correct XP amount
   * 3. Synchronization works for lesson completions (50 XP)
   * 4. Synchronization works for challenge completions (30 XP)
   * 5. Synchronization works across all 6 pillars
   * 6. AppContext.xp matches sum of all pillar XP
   */
  describe('Property 8: AppContext Synchronization', () => {
    it('should propagate any XP award to AppContext callback', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Test across all 6 pillars
          fc.constantFrom<PremiumPillarKey>(
            'mental-health',
            'relationships',
            'career',
            'fitness',
            'finance',
            'hobbies'
          ),
          // Test with various XP amounts (lesson: 50, challenge: 30, or custom)
          fc.constantFrom(
            PREMIUM_XP_AWARDS.LESSON_COMPLETE,
            PREMIUM_XP_AWARDS.DAILY_CHALLENGE,
            10, 20, 25, 40, 60, 75, 100
          ),
          // Test with various starting XP values
          fc.integer({ min: 0, max: 4999 }),
          async (pillarKey, xpAmount, startingXP) => {
            // Setup: Create progress with starting XP
            const progress = createDefaultProgress(pillarKey);
            progress.xp = startingXP;
            progress.level = Math.floor(startingXP / 500) + 1;

            // Mock storage
            mockLoadPillarProgress.mockResolvedValue(progress);
            mockLoadGlobalXP.mockResolvedValue(1000);

            // Track AppContext sync callback
            const mockAppContextSync = jest.fn(async (amount: number) => {
              // Simulate successful AppContext update
              return Promise.resolve();
            });

            // Execute: Award XP with AppContext sync callback
            await awardXP(pillarKey, xpAmount, mockAppContextSync);

            // Verify: AppContext callback was called with correct amount
            expect(mockAppContextSync).toHaveBeenCalledTimes(1);
            expect(mockAppContextSync).toHaveBeenCalledWith(xpAmount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should propagate lesson completion XP (50) to AppContext', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Test across all 6 pillars
          fc.constantFrom<PremiumPillarKey>(
            'mental-health',
            'relationships',
            'career',
            'fitness',
            'finance',
            'hobbies'
          ),
          // Test all 4 lesson numbers
          fc.integer({ min: 1, max: 4 }),
          // Test with various starting XP values
          fc.integer({ min: 0, max: 4999 }),
          async (pillarKey, lessonNumber, startingXP) => {
            const lessonId = `${pillarKey}-lesson-${lessonNumber}`;

            // Setup
            const progress = createDefaultProgress(pillarKey);
            progress.xp = startingXP;
            progress.level = Math.floor(startingXP / 500) + 1;
            progress.completedLessons = [];

            const completedLessons = {
              lessonIds: [],
              lastUpdated: new Date().toISOString(),
            };

            mockLoadPillarProgress.mockResolvedValue(progress);
            mockLoadCompletedLessons.mockResolvedValue(completedLessons);
            mockLoadGlobalXP.mockResolvedValue(1000);

            // Track AppContext sync
            const mockAppContextSync = jest.fn(async (amount: number) => {
              return Promise.resolve();
            });

            // Execute: Complete lesson with AppContext sync
            await completeLesson(pillarKey, lessonId, mockAppContextSync);

            // Verify: AppContext was updated with exactly 50 XP
            expect(mockAppContextSync).toHaveBeenCalledTimes(1);
            expect(mockAppContextSync).toHaveBeenCalledWith(50);
            expect(mockAppContextSync).toHaveBeenCalledWith(PREMIUM_XP_AWARDS.LESSON_COMPLETE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should propagate challenge completion XP (30) to AppContext', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Test across all 6 pillars
          fc.constantFrom<PremiumPillarKey>(
            'mental-health',
            'relationships',
            'career',
            'fitness',
            'finance',
            'hobbies'
          ),
          // Test with various starting XP values
          fc.integer({ min: 0, max: 4999 }),
          async (pillarKey, startingXP) => {
            // Setup
            const progress = createDefaultProgress(pillarKey);
            progress.xp = startingXP;
            progress.level = Math.floor(startingXP / 500) + 1;
            progress.challengeCompletedToday = false;
            progress.challengeCompletionDate = null;

            mockLoadPillarProgress.mockResolvedValue(progress);
            mockLoadGlobalXP.mockResolvedValue(1000);

            // Track AppContext sync
            const mockAppContextSync = jest.fn(async (amount: number) => {
              return Promise.resolve();
            });

            // Execute: Complete challenge with AppContext sync
            await completeDailyChallenge(pillarKey, mockAppContextSync);

            // Verify: AppContext was updated with exactly 30 XP
            expect(mockAppContextSync).toHaveBeenCalledTimes(1);
            expect(mockAppContextSync).toHaveBeenCalledWith(30);
            expect(mockAppContextSync).toHaveBeenCalledWith(PREMIUM_XP_AWARDS.DAILY_CHALLENGE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accumulate XP correctly across multiple awards to AppContext', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Test a single pillar
          fc.constantFrom<PremiumPillarKey>('mental-health'),
          // Test with a sequence of XP awards
          fc.array(
            fc.constantFrom(
              PREMIUM_XP_AWARDS.LESSON_COMPLETE,
              PREMIUM_XP_AWARDS.DAILY_CHALLENGE
            ),
            { minLength: 1, maxLength: 5 }
          ),
          async (pillarKey, xpAmounts) => {
            let currentXP = 0;
            let appContextXP = 0;

            // Track all AppContext sync calls
            const mockAppContextSync = jest.fn(async (amount: number) => {
              appContextXP += amount;
              return Promise.resolve();
            });

            // Award XP multiple times
            for (const xpAmount of xpAmounts) {
              const progress = createDefaultProgress(pillarKey);
              progress.xp = currentXP;
              progress.level = Math.floor(currentXP / 500) + 1;

              mockLoadPillarProgress.mockResolvedValue(progress);
              mockLoadGlobalXP.mockResolvedValue(1000);

              mockSavePillarProgress.mockImplementation(async (key, prog) => {
                currentXP = prog.xp;
              });

              await awardXP(pillarKey, xpAmount, mockAppContextSync);
            }

            // Verify: AppContext received all XP awards
            expect(mockAppContextSync).toHaveBeenCalledTimes(xpAmounts.length);

            // Verify: Total XP in AppContext matches sum of all awards
            const expectedTotal = xpAmounts.reduce((sum, amount) => sum + amount, 0);
            expect(appContextXP).toBe(expectedTotal);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should sync XP across all 6 pillars to AppContext', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate XP amounts for all 6 pillars
          fc.record({
            'mental-health': fc.integer({ min: 0, max: 200 }),
            'relationships': fc.integer({ min: 0, max: 200 }),
            'career': fc.integer({ min: 0, max: 200 }),
            'fitness': fc.integer({ min: 0, max: 200 }),
            'finance': fc.integer({ min: 0, max: 200 }),
            'hobbies': fc.integer({ min: 0, max: 200 }),
          }),
          async (pillarXPAmounts) => {
            let appContextXP = 0;

            // Track AppContext sync
            const mockAppContextSync = jest.fn(async (amount: number) => {
              appContextXP += amount;
              return Promise.resolve();
            });

            // Award XP to each pillar
            const pillars: PremiumPillarKey[] = [
              'mental-health',
              'relationships',
              'career',
              'fitness',
              'finance',
              'hobbies',
            ];

            for (const pillarKey of pillars) {
              const xpAmount = pillarXPAmounts[pillarKey];
              
              if (xpAmount > 0) {
                const progress = createDefaultProgress(pillarKey);
                progress.xp = 0;
                progress.level = 1;

                mockLoadPillarProgress.mockResolvedValue(progress);
                mockLoadGlobalXP.mockResolvedValue(1000);

                await awardXP(pillarKey, xpAmount, mockAppContextSync);
              }
            }

            // Verify: AppContext XP matches sum of all pillar XP
            const expectedTotal = Object.values(pillarXPAmounts).reduce(
              (sum, amount) => sum + amount,
              0
            );
            expect(appContextXP).toBe(expectedTotal);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle AppContext sync callback being optional', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<PremiumPillarKey>(
            'mental-health',
            'relationships',
            'career',
            'fitness',
            'finance',
            'hobbies'
          ),
          fc.integer({ min: 10, max: 100 }),
          fc.integer({ min: 0, max: 4999 }),
          async (pillarKey, xpAmount, startingXP) => {
            // Setup
            const progress = createDefaultProgress(pillarKey);
            progress.xp = startingXP;
            progress.level = Math.floor(startingXP / 500) + 1;

            mockLoadPillarProgress.mockResolvedValue(progress);
            mockLoadGlobalXP.mockResolvedValue(1000);

            let savedXP = startingXP;
            mockSavePillarProgress.mockImplementation(async (key, prog) => {
              savedXP = prog.xp;
            });

            // Execute: Award XP WITHOUT AppContext sync callback
            await awardXP(pillarKey, xpAmount);

            // Verify: XP is still awarded locally even without AppContext sync
            expect(savedXP).toBe(startingXP + xpAmount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should continue with optimistic update if AppContext sync fails with network error', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<PremiumPillarKey>(
            'mental-health',
            'relationships',
            'career',
            'fitness',
            'finance',
            'hobbies'
          ),
          fc.integer({ min: 10, max: 100 }),
          fc.integer({ min: 0, max: 4999 }),
          async (pillarKey, xpAmount, startingXP) => {
            // Setup
            const progress = createDefaultProgress(pillarKey);
            progress.xp = startingXP;
            progress.level = Math.floor(startingXP / 500) + 1;

            mockLoadPillarProgress.mockResolvedValue(progress);
            mockLoadGlobalXP.mockResolvedValue(1000);

            let savedXP = startingXP;
            mockSavePillarProgress.mockImplementation(async (key, prog) => {
              savedXP = prog.xp;
            });

            // Mock AppContext sync failure (network error)
            const mockAppContextSync = jest.fn(async () => {
              throw new Error('network error: Failed to save');
            });

            // Execute: Award XP with failing AppContext sync
            await awardXP(pillarKey, xpAmount, mockAppContextSync);

            // Verify: Local XP is still updated (optimistic update)
            expect(savedXP).toBe(startingXP + xpAmount);

            // Verify: AppContext sync was attempted
            expect(mockAppContextSync).toHaveBeenCalledWith(xpAmount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should rollback local state if AppContext sync fails with unexpected error', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<PremiumPillarKey>(
            'mental-health',
            'relationships',
            'career',
            'fitness',
            'finance',
            'hobbies'
          ),
          fc.integer({ min: 10, max: 100 }),
          fc.integer({ min: 0, max: 4999 }),
          async (pillarKey, xpAmount, startingXP) => {
            // Setup
            const progress = createDefaultProgress(pillarKey);
            progress.xp = startingXP;
            progress.level = Math.floor(startingXP / 500) + 1;

            mockLoadPillarProgress.mockResolvedValue(progress);
            mockLoadGlobalXP.mockResolvedValue(1000);

            let savedXP = startingXP;
            let saveCount = 0;
            mockSavePillarProgress.mockImplementation(async (key, prog) => {
              savedXP = prog.xp;
              saveCount++;
            });

            // Mock AppContext sync failure (unexpected error)
            const mockAppContextSync = jest.fn(async () => {
              throw new Error('Unexpected database error');
            });

            // Execute: Award XP with failing AppContext sync
            try {
              await awardXP(pillarKey, xpAmount, mockAppContextSync);
              // Should throw, so fail if we reach here
              expect(true).toBe(false);
            } catch (error) {
              // Expected to throw
              expect(error).toBeDefined();
            }

            // Verify: Local state was rolled back to original value
            expect(savedXP).toBe(startingXP);

            // Verify: savePillarProgress was called twice (optimistic + rollback)
            expect(saveCount).toBe(2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain consistency between pillar XP and AppContext XP', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Test with a sequence of mixed actions
          fc.array(
            fc.record({
              pillar: fc.constantFrom<PremiumPillarKey>(
                'mental-health',
                'relationships',
                'career',
                'fitness',
                'finance',
                'hobbies'
              ),
              action: fc.constantFrom<'lesson' | 'challenge'>('lesson', 'challenge'),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (actions) => {
            // Track pillar XP and AppContext XP
            const pillarXP: Record<PremiumPillarKey, number> = {
              'mental-health': 0,
              'relationships': 0,
              'career': 0,
              'fitness': 0,
              'finance': 0,
              'hobbies': 0,
            };
            let appContextXP = 0;

            // Mock AppContext sync
            const mockAppContextSync = jest.fn(async (amount: number) => {
              appContextXP += amount;
              return Promise.resolve();
            });

            // Execute all actions
            for (const { pillar, action } of actions) {
              const xpAmount = action === 'lesson' 
                ? PREMIUM_XP_AWARDS.LESSON_COMPLETE 
                : PREMIUM_XP_AWARDS.DAILY_CHALLENGE;

              const progress = createDefaultProgress(pillar);
              progress.xp = pillarXP[pillar];
              progress.level = Math.floor(pillarXP[pillar] / 500) + 1;

              if (action === 'challenge') {
                progress.challengeCompletedToday = false;
              }

              mockLoadPillarProgress.mockResolvedValue(progress);
              mockLoadGlobalXP.mockResolvedValue(1000);

              mockSavePillarProgress.mockImplementation(async (key, prog) => {
                pillarXP[pillar] = prog.xp;
              });

              if (action === 'lesson') {
                const lessonId = `${pillar}-lesson-1`;
                const completedLessons = {
                  lessonIds: [],
                  lastUpdated: new Date().toISOString(),
                };
                mockLoadCompletedLessons.mockResolvedValue(completedLessons);
                await completeLesson(pillar, lessonId, mockAppContextSync);
              } else {
                await completeDailyChallenge(pillar, mockAppContextSync);
              }
            }

            // Verify: AppContext XP matches sum of all pillar XP
            const totalPillarXP = Object.values(pillarXP).reduce(
              (sum, xp) => sum + xp,
              0
            );
            expect(appContextXP).toBe(totalPillarXP);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
