/**
 * Property-Based Tests for Daily Challenge Completion
 * 
 * Tests universal properties that should hold true across all pillars
 * and all valid executions of the challenge completion system.
 * 
 * Feature: premium-pillars-experience
 * Property 5: Challenge Completion XP Award
 * Validates: Requirements 5.8
 */

import fc from 'fast-check';
import {
  completeDailyChallenge,
  awardXP,
} from '../services/pillarChallengeService';
import {
  loadPillarProgress,
  savePillarProgress,
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
const mockLoadGlobalXP = loadGlobalXP as jest.MockedFunction<typeof loadGlobalXP>;
const mockSaveGlobalXP = saveGlobalXP as jest.MockedFunction<typeof saveGlobalXP>;
const mockGetCurrentDate = getCurrentDate as jest.MockedFunction<typeof getCurrentDate>;

describe('Property Tests: Daily Challenge Completion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentDate.mockReturnValue('2024-01-15');
  });

  /**
   * Property 5: Challenge Completion XP Award
   * 
   * **Validates: Requirements 5.8**
   * 
   * For any daily challenge completion event, the system SHALL award exactly 30 XP
   * to the user, and the user's total XP SHALL increase by exactly 30.
   * 
   * This property tests:
   * 1. Challenge completion awards exactly 30 XP (not 29, not 31)
   * 2. XP award is consistent across all 6 pillars
   * 3. XP award is consistent regardless of starting XP value
   * 4. Global XP increases by exactly 30
   */
  describe('Property 5: Challenge Completion XP Award', () => {
    it('should award exactly 30 XP for completing any daily challenge', async () => {
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
          // Test with various starting XP values (0 to 4999)
          fc.integer({ min: 0, max: 4999 }),
          // Test with various starting global XP values
          fc.integer({ min: 0, max: 10000 }),
          async (pillarKey, startingXP, startingGlobalXP) => {
            // Setup: Create progress with starting XP
            const progress = createDefaultProgress(pillarKey);
            progress.xp = startingXP;
            progress.level = Math.floor(startingXP / 500) + 1;
            progress.challengeCompletedToday = false;
            progress.challengeCompletionDate = null;

            // Mock storage to return our test data
            mockLoadPillarProgress.mockResolvedValue(progress);
            mockLoadGlobalXP.mockResolvedValue(startingGlobalXP);

            // Track the saved values
            let savedPillarXP = startingXP;
            let savedGlobalXP = startingGlobalXP;

            mockSavePillarProgress.mockImplementation(async (key, prog) => {
              savedPillarXP = prog.xp;
            });

            mockSaveGlobalXP.mockImplementation(async (xp) => {
              savedGlobalXP = xp;
            });

            // Execute: Complete the daily challenge
            await completeDailyChallenge(pillarKey);

            // Verify: Pillar XP increased by exactly 30
            const expectedPillarXP = startingXP + PREMIUM_XP_AWARDS.DAILY_CHALLENGE;
            expect(savedPillarXP).toBe(expectedPillarXP);
            expect(savedPillarXP).toBe(startingXP + 30);

            // Verify: Global XP increased by exactly 30
            const expectedGlobalXP = startingGlobalXP + PREMIUM_XP_AWARDS.DAILY_CHALLENGE;
            expect(savedGlobalXP).toBe(expectedGlobalXP);
            expect(savedGlobalXP).toBe(startingGlobalXP + 30);

            // Verify: XP award is exactly 30 (not 29, not 31)
            expect(savedPillarXP - startingXP).toBe(30);
            expect(savedGlobalXP - startingGlobalXP).toBe(30);
          }
        ),
        { numRuns: 100 } // Run 100 iterations to test across input space
      );
    });

    it('should award exactly 30 XP regardless of level boundaries', async () => {
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
          // Test XP values near level boundaries (490-510, 990-1010, etc.)
          fc.integer({ min: 0, max: 9 }).chain((levelIndex) =>
            fc.integer({ min: -10, max: 10 }).map((offset) => {
              const boundary = levelIndex * 500;
              return Math.max(0, boundary + offset);
            })
          ),
          async (pillarKey, startingXP) => {
            // Setup
            const progress = createDefaultProgress(pillarKey);
            progress.xp = startingXP;
            progress.level = Math.floor(startingXP / 500) + 1;
            progress.challengeCompletedToday = false;

            mockLoadPillarProgress.mockResolvedValue(progress);
            mockLoadGlobalXP.mockResolvedValue(1000);

            let savedPillarXP = startingXP;
            mockSavePillarProgress.mockImplementation(async (key, prog) => {
              savedPillarXP = prog.xp;
            });

            // Execute
            await completeDailyChallenge(pillarKey);

            // Verify: Always awards exactly 30 XP, even at level boundaries
            expect(savedPillarXP - startingXP).toBe(30);
            expect(savedPillarXP).toBe(startingXP + PREMIUM_XP_AWARDS.DAILY_CHALLENGE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain XP award consistency across multiple completions on different days', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Test a single pillar
          fc.constantFrom<PremiumPillarKey>('mental-health'),
          // Test with a sequence of days (simulate multiple completions)
          fc.array(fc.integer({ min: 0, max: 4999 }), { minLength: 1, maxLength: 5 }),
          async (pillarKey, startingXPValues) => {
            let currentXP = 0;
            let currentGlobalXP = 0;

            // Simulate completing challenge on multiple different days
            for (let i = 0; i < startingXPValues.length; i++) {
              currentXP = startingXPValues[i];
              const dayOffset = i;

              const progress = createDefaultProgress(pillarKey);
              progress.xp = currentXP;
              progress.level = Math.floor(currentXP / 500) + 1;
              progress.challengeCompletedToday = false;

              mockLoadPillarProgress.mockResolvedValue(progress);
              mockLoadGlobalXP.mockResolvedValue(currentGlobalXP);
              mockGetCurrentDate.mockReturnValue(`2024-01-${15 + dayOffset}`);

              let savedXP = currentXP;
              mockSavePillarProgress.mockImplementation(async (key, prog) => {
                savedXP = prog.xp;
              });

              mockSaveGlobalXP.mockImplementation(async (xp) => {
                currentGlobalXP = xp;
              });

              await completeDailyChallenge(pillarKey);

              // Verify: Each completion awards exactly 30 XP
              expect(savedXP - currentXP).toBe(30);
              expect(savedXP).toBe(currentXP + PREMIUM_XP_AWARDS.DAILY_CHALLENGE);
            }
          }
        ),
        { numRuns: 50 } // Fewer runs since this tests sequences
      );
    });

    it('should award 30 XP using the awardXP function with DAILY_CHALLENGE constant', async () => {
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
          fc.integer({ min: 0, max: 4999 }),
          async (pillarKey, startingXP) => {
            // Setup
            const progress = createDefaultProgress(pillarKey);
            progress.xp = startingXP;
            progress.level = Math.floor(startingXP / 500) + 1;

            mockLoadPillarProgress.mockResolvedValue(progress);
            mockLoadGlobalXP.mockResolvedValue(500);

            let savedXP = startingXP;
            mockSavePillarProgress.mockImplementation(async (key, prog) => {
              savedXP = prog.xp;
            });

            // Execute: Award XP directly (simulating what completeDailyChallenge does)
            await awardXP(pillarKey, PREMIUM_XP_AWARDS.DAILY_CHALLENGE);

            // Verify: XP increased by exactly 30
            expect(savedXP).toBe(startingXP + 30);
            expect(PREMIUM_XP_AWARDS.DAILY_CHALLENGE).toBe(30);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property: Challenge completion marks challenge as completed
   * 
   * This ensures that the challenge completion state is properly persisted
   * along with the XP award.
   */
  describe('Challenge Completion State', () => {
    it('should mark challenge as completed when awarding 30 XP', async () => {
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
          fc.integer({ min: 0, max: 4999 }),
          async (pillarKey, startingXP) => {
            // Setup
            const progress = createDefaultProgress(pillarKey);
            progress.xp = startingXP;
            progress.challengeCompletedToday = false;
            progress.challengeCompletionDate = null;

            mockLoadPillarProgress.mockResolvedValue(progress);
            mockLoadGlobalXP.mockResolvedValue(1000);

            let challengeCompleted = false;
            let challengeDate: string | null = null;

            mockSavePillarProgress.mockImplementation(async (key, prog) => {
              challengeCompleted = prog.challengeCompletedToday;
              challengeDate = prog.challengeCompletionDate;
            });

            // Execute
            await completeDailyChallenge(pillarKey);

            // Verify: Challenge is marked as completed
            expect(challengeCompleted).toBe(true);
            expect(challengeDate).toBe('2024-01-15');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
