/**
 * Property-Based Test: Lesson Completion Persistence Round-Trip
 * 
 * Feature: premium-pillars-experience
 * Property 6: Lesson Completion Persistence Round-Trip
 * 
 * **Validates: Requirements 18.1, 18.4**
 * 
 * This test validates that any completed lesson ID can be saved to localStorage
 * and retrieved correctly (round-trip persistence). It uses fast-check to generate
 * test cases covering multiple lessons across all pillars and verifies that the
 * persistence layer maintains data integrity.
 * 
 * Property Statement:
 * For any lesson that is marked complete, the lesson ID SHALL be persisted to
 * localStorage under key 'growthovo_completed_lessons', and when the screen reloads,
 * the lesson ID SHALL be retrieved and the lesson SHALL display as completed.
 */

import fc from 'fast-check';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveCompletedLessons,
  loadCompletedLessons,
} from '../services/pillarStorageService';
import type { CompletedLessons, PremiumPillarKey } from '../types/pillars';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('Property 6: Lesson Completion Persistence Round-Trip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup AsyncStorage mock to simulate real storage behavior
    const storage: Record<string, string> = {};
    
    (AsyncStorage.setItem as jest.Mock).mockImplementation(
      async (key: string, value: string) => {
        storage[key] = value;
      }
    );
    
    (AsyncStorage.getItem as jest.Mock).mockImplementation(
      async (key: string) => {
        return storage[key] || null;
      }
    );
    
    (AsyncStorage.removeItem as jest.Mock).mockImplementation(
      async (key: string) => {
        delete storage[key];
      }
    );
    
    (AsyncStorage.clear as jest.Mock).mockImplementation(async () => {
      Object.keys(storage).forEach(key => delete storage[key]);
    });
  });

  /**
   * Test that any single lesson ID can be persisted and retrieved correctly
   */
  it('should persist and retrieve any single lesson ID correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate pillar key
        fc.constantFrom<PremiumPillarKey>(
          'mental-health',
          'relationships',
          'career',
          'fitness',
          'finance',
          'hobbies'
        ),
        // Generate lesson number (1-4)
        fc.integer({ min: 1, max: 4 }),
        async (pillarKey, lessonNumber) => {
          // Construct lesson ID
          const lessonId = `${pillarKey}-lesson-${lessonNumber}`;
          
          // Create completed lessons object
          const completedLessons: CompletedLessons = {
            lessonIds: [lessonId],
            lastUpdated: new Date().toISOString(),
          };
          
          // Save to localStorage
          await saveCompletedLessons(completedLessons);
          
          // Reload from localStorage
          const reloadedLessons = await loadCompletedLessons();
          
          // Verify lesson ID is present
          expect(reloadedLessons.lessonIds).toContain(lessonId);
          expect(reloadedLessons.lessonIds).toHaveLength(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that multiple lesson IDs can be persisted and retrieved correctly
   */
  it('should persist and retrieve multiple lesson IDs correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of lesson IDs (1-24 lessons)
        fc.array(
          fc.record({
            pillarKey: fc.constantFrom<PremiumPillarKey>(
              'mental-health',
              'relationships',
              'career',
              'fitness',
              'finance',
              'hobbies'
            ),
            lessonNumber: fc.integer({ min: 1, max: 4 }),
          }),
          { minLength: 1, maxLength: 24 }
        ),
        async (lessonSpecs) => {
          // Construct lesson IDs and ensure uniqueness
          const lessonIds = Array.from(
            new Set(
              lessonSpecs.map(
                spec => `${spec.pillarKey}-lesson-${spec.lessonNumber}`
              )
            )
          );
          
          // Create completed lessons object
          const completedLessons: CompletedLessons = {
            lessonIds,
            lastUpdated: new Date().toISOString(),
          };
          
          // Save to localStorage
          await saveCompletedLessons(completedLessons);
          
          // Reload from localStorage
          const reloadedLessons = await loadCompletedLessons();
          
          // Verify all lesson IDs are present
          expect(reloadedLessons.lessonIds).toHaveLength(lessonIds.length);
          lessonIds.forEach(lessonId => {
            expect(reloadedLessons.lessonIds).toContain(lessonId);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that lesson IDs persist across multiple save/load cycles
   */
  it('should maintain lesson IDs across multiple save/load cycles', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate sequence of lesson ID additions
        fc.array(
          fc.record({
            pillarKey: fc.constantFrom<PremiumPillarKey>(
              'mental-health',
              'relationships',
              'career',
              'fitness',
              'finance',
              'hobbies'
            ),
            lessonNumber: fc.integer({ min: 1, max: 4 }),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        async (lessonSpecs) => {
          // Clear storage before this test iteration
          await AsyncStorage.clear();
          
          const allLessonIds: string[] = [];
          
          // Simulate multiple completion events
          for (const spec of lessonSpecs) {
            const lessonId = `${spec.pillarKey}-lesson-${spec.lessonNumber}`;
            
            // Load current state
            const currentLessons = await loadCompletedLessons();
            
            // Add new lesson if not already present
            if (!currentLessons.lessonIds.includes(lessonId)) {
              currentLessons.lessonIds.push(lessonId);
              allLessonIds.push(lessonId);
            }
            
            // Save updated state
            await saveCompletedLessons(currentLessons);
          }
          
          // Final reload
          const finalLessons = await loadCompletedLessons();
          
          // Verify all unique lesson IDs are present
          const uniqueLessonIds = Array.from(new Set(allLessonIds));
          expect(finalLessons.lessonIds).toHaveLength(uniqueLessonIds.length);
          uniqueLessonIds.forEach(lessonId => {
            expect(finalLessons.lessonIds).toContain(lessonId);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test that empty lesson list persists correctly
   */
  it('should persist and retrieve empty lesson list correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null), // No lessons
        async () => {
          // Create empty completed lessons object
          const completedLessons: CompletedLessons = {
            lessonIds: [],
            lastUpdated: new Date().toISOString(),
          };
          
          // Save to localStorage
          await saveCompletedLessons(completedLessons);
          
          // Reload from localStorage
          const reloadedLessons = await loadCompletedLessons();
          
          // Verify empty array
          expect(reloadedLessons.lessonIds).toHaveLength(0);
          expect(Array.isArray(reloadedLessons.lessonIds)).toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Test that lesson IDs maintain order after persistence
   */
  it('should maintain lesson ID order after persistence', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate ordered array of lesson IDs
        fc.array(
          fc.record({
            pillarKey: fc.constantFrom<PremiumPillarKey>(
              'mental-health',
              'relationships',
              'career',
              'fitness',
              'finance',
              'hobbies'
            ),
            lessonNumber: fc.integer({ min: 1, max: 4 }),
          }),
          { minLength: 1, maxLength: 24 }
        ),
        async (lessonSpecs) => {
          // Construct lesson IDs (keep duplicates for this test)
          const lessonIds = lessonSpecs.map(
            spec => `${spec.pillarKey}-lesson-${spec.lessonNumber}`
          );
          
          // Remove duplicates while maintaining order
          const uniqueLessonIds = Array.from(new Set(lessonIds));
          
          // Create completed lessons object
          const completedLessons: CompletedLessons = {
            lessonIds: uniqueLessonIds,
            lastUpdated: new Date().toISOString(),
          };
          
          // Save to localStorage
          await saveCompletedLessons(completedLessons);
          
          // Reload from localStorage
          const reloadedLessons = await loadCompletedLessons();
          
          // Verify order is maintained
          expect(reloadedLessons.lessonIds).toEqual(uniqueLessonIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that lastUpdated timestamp is preserved
   */
  it('should preserve lastUpdated timestamp after persistence', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate lesson IDs
        fc.array(
          fc.record({
            pillarKey: fc.constantFrom<PremiumPillarKey>(
              'mental-health',
              'relationships',
              'career',
              'fitness',
              'finance',
              'hobbies'
            ),
            lessonNumber: fc.integer({ min: 1, max: 4 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        // Generate timestamp
        fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
        async (lessonSpecs, timestamp) => {
          // Construct lesson IDs
          const lessonIds = Array.from(
            new Set(
              lessonSpecs.map(
                spec => `${spec.pillarKey}-lesson-${spec.lessonNumber}`
              )
            )
          );
          
          // Create completed lessons object with specific timestamp
          const completedLessons: CompletedLessons = {
            lessonIds,
            lastUpdated: timestamp.toISOString(),
          };
          
          // Save to localStorage
          await saveCompletedLessons(completedLessons);
          
          // Reload from localStorage
          const reloadedLessons = await loadCompletedLessons();
          
          // Verify timestamp is preserved
          expect(reloadedLessons.lastUpdated).toBe(timestamp.toISOString());
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test that persistence handles maximum lesson count (24 lessons)
   */
  it('should handle maximum lesson count (24 lessons) correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null), // Fixed test case
        async () => {
          // Create all 24 possible lesson IDs
          const allPillars: PremiumPillarKey[] = [
            'mental-health',
            'relationships',
            'career',
            'fitness',
            'finance',
            'hobbies',
          ];
          
          const allLessonIds: string[] = [];
          for (const pillar of allPillars) {
            for (let i = 1; i <= 4; i++) {
              allLessonIds.push(`${pillar}-lesson-${i}`);
            }
          }
          
          // Create completed lessons object with all 24 lessons
          const completedLessons: CompletedLessons = {
            lessonIds: allLessonIds,
            lastUpdated: new Date().toISOString(),
          };
          
          // Save to localStorage
          await saveCompletedLessons(completedLessons);
          
          // Reload from localStorage
          const reloadedLessons = await loadCompletedLessons();
          
          // Verify all 24 lessons are present
          expect(reloadedLessons.lessonIds).toHaveLength(24);
          allLessonIds.forEach(lessonId => {
            expect(reloadedLessons.lessonIds).toContain(lessonId);
          });
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Test that persistence handles corrupted data gracefully
   */
  it('should handle corrupted data gracefully and return empty list', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate invalid JSON strings
        fc.oneof(
          fc.constant('invalid json'),
          fc.constant('{incomplete'),
          fc.constant('null'),
          fc.constant('undefined'),
          fc.constant('[]'),
          fc.constant('{}')
        ),
        async (corruptedData) => {
          // Manually set corrupted data in AsyncStorage
          (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(corruptedData);
          
          // Attempt to load
          const reloadedLessons = await loadCompletedLessons();
          
          // Should return empty list with valid structure
          expect(reloadedLessons.lessonIds).toEqual([]);
          expect(Array.isArray(reloadedLessons.lessonIds)).toBe(true);
          expect(typeof reloadedLessons.lastUpdated).toBe('string');
        }
      ),
      { numRuns: 20 }
    );
  });
});
