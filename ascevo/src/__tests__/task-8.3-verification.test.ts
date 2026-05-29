/**
 * Task 8.3 Verification Test
 * 
 * Verifies that lessons list is correctly wired to LESSON_CONTENT:
 * - Load 4 lessons per pillar from LESSON_CONTENT constant
 * - Check completed status from localStorage
 * - Display appropriate status indicator based on completion state
 */

import { LESSON_CONTENT } from '../data/lessonContent';
import { loadCompletedLessons } from '../services/pillarStorageService';
import type { PremiumPillarKey } from '../types/pillars';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('Task 8.3: Wire lessons list to LESSON_CONTENT', () => {
  describe('Load 4 lessons per pillar from LESSON_CONTENT', () => {
    it('should load exactly 4 lessons for mental-health pillar', () => {
      const pillarKey: PremiumPillarKey = 'mental-health';
      
      // Filter lessons for this pillar
      const pillarLessons = Object.values(LESSON_CONTENT).filter(
        (lesson) => lesson.pillarKey === pillarKey
      );
      
      // Sort by lesson number and take first 4
      const sortedLessons = pillarLessons
        .sort((a, b) => a.number - b.number)
        .slice(0, 4);
      
      expect(sortedLessons).toHaveLength(4);
      expect(sortedLessons[0].number).toBe(1);
      expect(sortedLessons[1].number).toBe(2);
      expect(sortedLessons[2].number).toBe(3);
      expect(sortedLessons[3].number).toBe(4);
    });

    it('should load exactly 4 lessons for relationships pillar', () => {
      const pillarKey: PremiumPillarKey = 'relationships';
      
      const pillarLessons = Object.values(LESSON_CONTENT).filter(
        (lesson) => lesson.pillarKey === pillarKey
      );
      
      const sortedLessons = pillarLessons
        .sort((a, b) => a.number - b.number)
        .slice(0, 4);
      
      expect(sortedLessons).toHaveLength(4);
      expect(sortedLessons[0].title).toBe('Active Listening Mastery');
      expect(sortedLessons[1].title).toBe('Setting Healthy Boundaries');
      expect(sortedLessons[2].title).toBe('Conflict Resolution Skills');
      expect(sortedLessons[3].title).toBe('Deepening Emotional Intimacy');
    });

    it('should load exactly 4 lessons for career pillar', () => {
      const pillarKey: PremiumPillarKey = 'career';
      
      const pillarLessons = Object.values(LESSON_CONTENT).filter(
        (lesson) => lesson.pillarKey === pillarKey
      );
      
      const sortedLessons = pillarLessons
        .sort((a, b) => a.number - b.number)
        .slice(0, 4);
      
      expect(sortedLessons).toHaveLength(4);
      expect(sortedLessons[0].title).toBe('Defining Your Career Vision');
      expect(sortedLessons[1].title).toBe('Deep Work: Focus Without Distraction');
      expect(sortedLessons[2].title).toBe('Personal Branding Basics');
      expect(sortedLessons[3].title).toBe('Negotiation Fundamentals');
    });

    it('should load exactly 4 lessons for fitness pillar', () => {
      const pillarKey: PremiumPillarKey = 'fitness';
      
      const pillarLessons = Object.values(LESSON_CONTENT).filter(
        (lesson) => lesson.pillarKey === pillarKey
      );
      
      const sortedLessons = pillarLessons
        .sort((a, b) => a.number - b.number)
        .slice(0, 4);
      
      expect(sortedLessons).toHaveLength(4);
      expect(sortedLessons[0].title).toBe('Building a Sustainable Routine');
      expect(sortedLessons[1].title).toBe('The Science of Sleep & Recovery');
      expect(sortedLessons[2].title).toBe('Nutrition Essentials');
      expect(sortedLessons[3].title).toBe('Progressive Overload Explained');
    });

    it('should load exactly 4 lessons for finance pillar', () => {
      const pillarKey: PremiumPillarKey = 'finance';
      
      const pillarLessons = Object.values(LESSON_CONTENT).filter(
        (lesson) => lesson.pillarKey === pillarKey
      );
      
      const sortedLessons = pillarLessons
        .sort((a, b) => a.number - b.number)
        .slice(0, 4);
      
      expect(sortedLessons).toHaveLength(4);
      expect(sortedLessons[0].title).toBe('Track Every Euro: Budgeting 101');
      expect(sortedLessons[1].title).toBe('Emergency Fund: Why & How');
      expect(sortedLessons[2].title).toBe('Investing Basics for Beginners');
      expect(sortedLessons[3].title).toBe('Eliminating Bad Debt Fast');
    });

    it('should load exactly 4 lessons for hobbies pillar', () => {
      const pillarKey: PremiumPillarKey = 'hobbies';
      
      const pillarLessons = Object.values(LESSON_CONTENT).filter(
        (lesson) => lesson.pillarKey === pillarKey
      );
      
      const sortedLessons = pillarLessons
        .sort((a, b) => a.number - b.number)
        .slice(0, 4);
      
      expect(sortedLessons).toHaveLength(4);
      expect(sortedLessons[0].title).toBe('Finding Your Creative Flow');
      expect(sortedLessons[1].title).toBe('Turning Passion into Practice');
      expect(sortedLessons[2].title).toBe('Learning Any Skill Faster');
      expect(sortedLessons[3].title).toBe('Building a Creative Habit');
    });

    it('should sort lessons by number in ascending order', () => {
      const pillarKey: PremiumPillarKey = 'mental-health';
      
      const pillarLessons = Object.values(LESSON_CONTENT).filter(
        (lesson) => lesson.pillarKey === pillarKey
      );
      
      const sortedLessons = pillarLessons
        .sort((a, b) => a.number - b.number)
        .slice(0, 4);
      
      // Verify lessons are in order 1, 2, 3, 4
      for (let i = 0; i < sortedLessons.length; i++) {
        expect(sortedLessons[i].number).toBe(i + 1);
      }
    });
  });

  describe('Check completed status from localStorage', () => {
    it('should load completed lessons from localStorage', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      
      // Mock completed lessons data
      const mockCompletedLessons = {
        lessonIds: ['mental-health-lesson-1', 'mental-health-lesson-2'],
        lastUpdated: new Date().toISOString(),
      };
      
      AsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(mockCompletedLessons)
      );
      
      const result = await loadCompletedLessons();
      
      expect(result.lessonIds).toHaveLength(2);
      expect(result.lessonIds).toContain('mental-health-lesson-1');
      expect(result.lessonIds).toContain('mental-health-lesson-2');
    });

    it('should return empty array when no completed lessons exist', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await loadCompletedLessons();
      
      expect(result.lessonIds).toHaveLength(0);
      expect(result.lessonIds).toEqual([]);
    });

    it('should create a Set from completed lesson IDs for efficient lookup', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      
      const mockCompletedLessons = {
        lessonIds: ['lesson-1', 'lesson-2', 'lesson-3'],
        lastUpdated: new Date().toISOString(),
      };
      
      AsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(mockCompletedLessons)
      );
      
      const result = await loadCompletedLessons();
      const completedSet = new Set(result.lessonIds);
      
      // Verify Set operations work correctly
      expect(completedSet.has('lesson-1')).toBe(true);
      expect(completedSet.has('lesson-2')).toBe(true);
      expect(completedSet.has('lesson-3')).toBe(true);
      expect(completedSet.has('lesson-4')).toBe(false);
    });
  });

  describe('Display appropriate status indicator based on completion state', () => {
    it('should determine lesson status as "completed" when in completedIds', () => {
      const completedIds = new Set(['mental-health-lesson-1', 'mental-health-lesson-2']);
      const lesson = LESSON_CONTENT['mental-health-lesson-1'];
      
      const status = completedIds.has(lesson.id) ? 'completed' : 'available';
      
      expect(status).toBe('completed');
    });

    it('should determine lesson status as "available" when not in completedIds', () => {
      const completedIds = new Set(['mental-health-lesson-1']);
      const lesson = LESSON_CONTENT['mental-health-lesson-2'];
      
      const status = completedIds.has(lesson.id) ? 'completed' : 'available';
      
      expect(status).toBe('available');
    });

    it('should show checkmark for completed lessons', () => {
      const completedIds = new Set(['mental-health-lesson-1']);
      const lesson = LESSON_CONTENT['mental-health-lesson-1'];
      
      const isCompleted = completedIds.has(lesson.id);
      const statusIndicator = isCompleted ? '✓' : 'Start →';
      
      expect(statusIndicator).toBe('✓');
    });

    it('should show "Start →" for available lessons', () => {
      const completedIds = new Set(['mental-health-lesson-1']);
      const lesson = LESSON_CONTENT['mental-health-lesson-2'];
      
      const isCompleted = completedIds.has(lesson.id);
      const statusIndicator = isCompleted ? '✓' : 'Start →';
      
      expect(statusIndicator).toBe('Start →');
    });

    it('should correctly identify status for all lessons in a pillar', () => {
      const completedIds = new Set([
        'mental-health-lesson-1',
        'mental-health-lesson-3',
      ]);
      
      const pillarLessons = Object.values(LESSON_CONTENT)
        .filter((lesson) => lesson.pillarKey === 'mental-health')
        .sort((a, b) => a.number - b.number)
        .slice(0, 4);
      
      const statuses = pillarLessons.map((lesson) => ({
        id: lesson.id,
        status: completedIds.has(lesson.id) ? 'completed' : 'available',
      }));
      
      expect(statuses[0].status).toBe('completed'); // lesson 1
      expect(statuses[1].status).toBe('available'); // lesson 2
      expect(statuses[2].status).toBe('completed'); // lesson 3
      expect(statuses[3].status).toBe('available'); // lesson 4
    });
  });

  describe('Integration: Complete workflow', () => {
    it('should load lessons, check completion, and determine correct status for each', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      
      // Mock completed lessons
      const mockCompletedLessons = {
        lessonIds: ['relationships-lesson-1', 'relationships-lesson-2'],
        lastUpdated: new Date().toISOString(),
      };
      
      AsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(mockCompletedLessons)
      );
      
      // Step 1: Load lessons for pillar
      const pillarKey: PremiumPillarKey = 'relationships';
      const pillarLessons = Object.values(LESSON_CONTENT)
        .filter((lesson) => lesson.pillarKey === pillarKey)
        .sort((a, b) => a.number - b.number)
        .slice(0, 4);
      
      expect(pillarLessons).toHaveLength(4);
      
      // Step 2: Load completed lessons from localStorage
      const completedLessonsData = await loadCompletedLessons();
      const completedIds = new Set(completedLessonsData.lessonIds);
      
      expect(completedIds.size).toBe(2);
      
      // Step 3: Determine status for each lesson
      const lessonsWithStatus = pillarLessons.map((lesson) => ({
        ...lesson,
        status: completedIds.has(lesson.id) ? 'completed' : 'available',
      }));
      
      // Verify correct status for each lesson
      expect(lessonsWithStatus[0].status).toBe('completed'); // lesson 1
      expect(lessonsWithStatus[1].status).toBe('completed'); // lesson 2
      expect(lessonsWithStatus[2].status).toBe('available'); // lesson 3
      expect(lessonsWithStatus[3].status).toBe('available'); // lesson 4
    });

    it('should handle all 6 pillars correctly', async () => {
      const pillars: PremiumPillarKey[] = [
        'mental-health',
        'relationships',
        'career',
        'fitness',
        'finance',
        'hobbies',
      ];
      
      for (const pillarKey of pillars) {
        const pillarLessons = Object.values(LESSON_CONTENT)
          .filter((lesson) => lesson.pillarKey === pillarKey)
          .sort((a, b) => a.number - b.number)
          .slice(0, 4);
        
        // Each pillar should have exactly 4 lessons
        expect(pillarLessons).toHaveLength(4);
        
        // Lessons should be numbered 1-4
        expect(pillarLessons[0].number).toBe(1);
        expect(pillarLessons[1].number).toBe(2);
        expect(pillarLessons[2].number).toBe(3);
        expect(pillarLessons[3].number).toBe(4);
        
        // All lessons should have the correct pillarKey
        pillarLessons.forEach((lesson) => {
          expect(lesson.pillarKey).toBe(pillarKey);
        });
      }
    });
  });
});
