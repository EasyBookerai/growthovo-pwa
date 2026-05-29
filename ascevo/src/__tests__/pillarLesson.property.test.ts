/**
 * Property-Based Tests for Lesson Completion XP Award
 * 
 * Tests universal properties that should hold true across all pillars
 * and all lesson numbers for the lesson completion system.
 * 
 * Feature: premium-pillars-experience
 * Property 4: Lesson Completion XP Award
 * Validates: Requirements 15.2
 */

import fc from 'fast-check';
import {
  completeLesson,
} from '../services/pillarLessonService';
import {
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
  };
});

const mockLoadPillarProgress = loadPillarProgress as jest.MockedFunction<typeof loadPillarProgress>;
const mockSavePillarProgress = savePillarProgress as jest.MockedFunction<typeof savePillarProgress>;
const mockLoadCompletedLessons = loadCompletedLessons as jest.MockedFunction<typeof loadCompletedLessons>;
const mockSaveCompletedLessons = saveCompletedLessons as jest.MockedFunction<typeof saveCompletedLessons>;
const mockLoadGlobalXP = loadGlobalXP as jest.MockedFunction<typeof loadGlobalXP>;
const mockSaveGlobalXP = saveGlobalXP as jest.MockedFunction<typeof saveGlobalXP>;
const mockGetCurrentDate = getCurrentDate as jest.MockedFunction<typeof getCurrentDate>;

describe('Property Tests: Lesson Completion XP Award', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentDate.mockReturnValue('2024-01-15');
  });

  /**
   * Property 4: Lesson Completion XP Award
   * 
   * **Validates: Requirements 15.2**
   * 
   * For any lesson completion event, the system SHALL award exactly 50 XP
   * to the user, and the user's total XP SHALL increase by exactly 50.
   * 
   * This property tests:
   * 1. Lesson completion awards exactly 50 XP (not 49, not 51)
   * 2. XP award is consistent across all 6 pillars
   * 3. XP award is consistent across all 4 lesson numbers per pillar
   * 4. XP award is consistent regardless of starting XP value
   * 5. Global XP increases by exactly 50
   */
  describe('Property 4: Lesson Completion XP Award', () => {
    it('should award exactly 50 XP for completing any lesson across all pillars and lesson numbers', async () => {
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
          // Test across all 4 lesson numbers (1-4)
          fc.integer({ min: 1, max: 4 }),
          // Test with various starting XP values (0 to 4999)
          fc.integer({ min: 0, max: 4999 }),
          // Test with various starting global XP values
          fc.integer({ min: 0, max: 10000 }),
          async (pillarKey, lessonNumber, startingXP, startingGlobalXP) => {
            // Generate lesson ID
            const lessonId = `${pillarKey}-lesson-${lessonNumber}`;

            // Setup: Create progress with starting XP
            const progress = createDefaultProgress(pillarKey);
            progress.xp = startingXP;
            progress.level = Math.floor(startingXP / 500) + 1;
            progress.completedLessons = []; // Lesson not yet completed

            // Setup: Create empty completed lessons list
            const completedLessons = {
              lessonIds: [],
              lastUpdated: new Date().toISOString(),
            };

            // Mock storage to return our test data
            mockLoadPillarProgress.mockResolvedValue(progress);
            mockLoadCompletedLessons.mockResolvedValue(completedLessons);
            mockLoadGlobalXP.mockResolvedValue(startingGlobalXP);

            // Track the saved values
            let savedPillarXP = startingXP;
            let savedGlobalXP = startingGlobalXP;
            let savedCompletedLessons: string[] = [];

            mockSavePillarProgress.mockImplementation(async (key, prog) => {
              savedPillarXP = prog.xp;
            });

            mockSaveCompletedLessons.mockImplementation(async (lessons) => {
              savedCompletedLessons = lessons.lessonIds;
            });

            mockSaveGlobalXP.mockImplementation(async (xp) => {
              savedGlobalXP = xp;
            });

            // Execute: Complete the lesson
            await completeLesson(pillarKey, lessonId);

            // Verify: Pillar XP increased by exactly 50
            const expectedPillarXP = startingXP + PREMIUM_XP_AWARDS.LESSON_COMPLETE;
            expect(savedPillarXP).toBe(expectedPillarXP);
            expect(savedPillarXP).toBe(startingXP + 50);

            // Verify: Global XP increased by exactly 50
            const expectedGlobalXP = startingGlobalXP + PREMIUM_XP_AWARDS.LESSON_COMPLETE;
            expect(savedGlobalXP).toBe(expectedGlobalXP);
            expect(savedGlobalXP).toBe(startingGlobalXP + 50);

            // Verify: XP award is exactly 50 (not 49, not 51)
            expect(savedPillarXP - startingXP).toBe(50);
            expect(savedGlobalXP - startingGlobalXP).toBe(50);

            // Verify: Lesson is marked as completed
            expect(savedCompletedLessons).toContain(lessonId);
          }
        ),
        { numRuns: 100 } // Run 100 iterations to test across input space
      );
    });

    it('should award exactly 50 XP regardless of level boundaries', async () => {
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
          // Test XP values near level boundaries (490-510, 990-1010, etc.)
          fc.integer({ min: 0, max: 9 }).chain((levelIndex) =>
            fc.integer({ min: -10, max: 10 }).map((offset) => {
              const boundary = levelIndex * 500;
              return Math.max(0, boundary + offset);
            })
          ),
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

            let savedPillarXP = startingXP;
            mockSavePillarProgress.mockImplementation(async (key, prog) => {
              savedPillarXP = prog.xp;
            });

            // Execute
            await completeLesson(pillarKey, lessonId);

            // Verify: Always awards exactly 50 XP, even at level boundaries
            expect(savedPillarXP - startingXP).toBe(50);
            expect(savedPillarXP).toBe(startingXP + PREMIUM_XP_AWARDS.LESSON_COMPLETE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain XP award consistency across completing all 4 lessons in a pillar', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Test a single pillar
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
            let currentXP = startingXP;
            let currentGlobalXP = 0;
            const completedLessonIds: string[] = [];

            // Complete all 4 lessons in sequence
            for (let lessonNumber = 1; lessonNumber <= 4; lessonNumber++) {
              const lessonId = `${pillarKey}-lesson-${lessonNumber}`;

              const progress = createDefaultProgress(pillarKey);
              progress.xp = currentXP;
              progress.level = Math.floor(currentXP / 500) + 1;
              progress.completedLessons = [...completedLessonIds];

              const completedLessons = {
                lessonIds: [...completedLessonIds],
                lastUpdated: new Date().toISOString(),
              };

              mockLoadPillarProgress.mockResolvedValue(progress);
              mockLoadCompletedLessons.mockResolvedValue(completedLessons);
              mockLoadGlobalXP.mockResolvedValue(currentGlobalXP);

              let savedXP = currentXP;
              mockSavePillarProgress.mockImplementation(async (key, prog) => {
                savedXP = prog.xp;
              });

              mockSaveCompletedLessons.mockImplementation(async (lessons) => {
                completedLessonIds.push(...lessons.lessonIds.filter(id => !completedLessonIds.includes(id)));
              });

              mockSaveGlobalXP.mockImplementation(async (xp) => {
                currentGlobalXP = xp;
              });

              await completeLesson(pillarKey, lessonId);

              // Verify: Each lesson completion awards exactly 50 XP
              expect(savedXP - currentXP).toBe(50);
              expect(savedXP).toBe(currentXP + PREMIUM_XP_AWARDS.LESSON_COMPLETE);

              // Update current XP for next iteration
              currentXP = savedXP;
            }

            // Verify: Total XP increase is exactly 200 (4 lessons × 50 XP)
            expect(currentXP - startingXP).toBe(200);
          }
        ),
        { numRuns: 50 } // Fewer runs since this tests sequences
      );
    });

    it('should award 50 XP using the LESSON_COMPLETE constant', async () => {
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
          fc.integer({ min: 1, max: 4 }),
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
            mockLoadGlobalXP.mockResolvedValue(500);

            let savedXP = startingXP;
            mockSavePillarProgress.mockImplementation(async (key, prog) => {
              savedXP = prog.xp;
            });

            // Execute: Complete lesson (which internally calls awardXP with LESSON_COMPLETE)
            await completeLesson(pillarKey, lessonId);

            // Verify: XP increased by exactly 50
            expect(savedXP).toBe(startingXP + 50);
            expect(PREMIUM_XP_AWARDS.LESSON_COMPLETE).toBe(50);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award exactly 50 XP when using awardXP directly with LESSON_COMPLETE', async () => {
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

            // Execute: Award XP directly (simulating what completeLesson does)
            await awardXP(pillarKey, PREMIUM_XP_AWARDS.LESSON_COMPLETE);

            // Verify: XP increased by exactly 50
            expect(savedXP).toBe(startingXP + 50);
            expect(PREMIUM_XP_AWARDS.LESSON_COMPLETE).toBe(50);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property: Lesson completion marks lesson as completed
   * 
   * This ensures that the lesson completion state is properly persisted
   * along with the XP award.
   */
  describe('Lesson Completion State', () => {
    it('should mark lesson as completed when awarding 50 XP', async () => {
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
          fc.integer({ min: 1, max: 4 }),
          fc.integer({ min: 0, max: 4999 }),
          async (pillarKey, lessonNumber, startingXP) => {
            const lessonId = `${pillarKey}-lesson-${lessonNumber}`;

            // Setup
            const progress = createDefaultProgress(pillarKey);
            progress.xp = startingXP;
            progress.completedLessons = [];

            const completedLessons = {
              lessonIds: [],
              lastUpdated: new Date().toISOString(),
            };

            mockLoadPillarProgress.mockResolvedValue(progress);
            mockLoadCompletedLessons.mockResolvedValue(completedLessons);
            mockLoadGlobalXP.mockResolvedValue(1000);

            let savedCompletedLessons: string[] = [];
            let savedPillarCompletedLessons: string[] = [];

            mockSaveCompletedLessons.mockImplementation(async (lessons) => {
              savedCompletedLessons = lessons.lessonIds;
            });

            mockSavePillarProgress.mockImplementation(async (key, prog) => {
              savedPillarCompletedLessons = prog.completedLessons;
            });

            // Execute
            await completeLesson(pillarKey, lessonId);

            // Verify: Lesson is marked as completed in both storage locations
            expect(savedCompletedLessons).toContain(lessonId);
            expect(savedPillarCompletedLessons).toContain(lessonId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update last activity date when completing lesson', async () => {
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
          fc.integer({ min: 1, max: 4 }),
          async (pillarKey, lessonNumber) => {
            const lessonId = `${pillarKey}-lesson-${lessonNumber}`;

            // Setup
            const progress = createDefaultProgress(pillarKey);
            progress.lastActivityDate = '2024-01-01'; // Old date

            const completedLessons = {
              lessonIds: [],
              lastUpdated: new Date().toISOString(),
            };

            mockLoadPillarProgress.mockResolvedValue(progress);
            mockLoadCompletedLessons.mockResolvedValue(completedLessons);
            mockLoadGlobalXP.mockResolvedValue(1000);

            let savedLastActivityDate = '';
            mockSavePillarProgress.mockImplementation(async (key, prog) => {
              savedLastActivityDate = prog.lastActivityDate;
            });

            // Execute
            await completeLesson(pillarKey, lessonId);

            // Verify: Last activity date is updated to current date
            expect(savedLastActivityDate).toBe('2024-01-15');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
