/**
 * Unit tests for pillarLessonService
 * 
 * Tests lesson completion logic including:
 * - Lesson completion with XP award
 * - Idempotent operations (no double XP)
 * - localStorage persistence
 */

import {
  completeLesson,
  isLessonCompleted,
  getCompletedLessonIds,
  getCompletedLessonCountForPillar,
} from '../services/pillarLessonService';
import {
  loadPillarProgress,
  savePillarProgress,
  loadCompletedLessons,
  saveCompletedLessons,
  loadGlobalXP,
  saveGlobalXP,
  getCurrentDate,
} from '../services/pillarStorageService';
import type { PremiumPillarKey } from '../types/pillars';

// Mock storage service
jest.mock('../services/pillarStorageService');

const mockLoadPillarProgress = loadPillarProgress as jest.MockedFunction<typeof loadPillarProgress>;
const mockSavePillarProgress = savePillarProgress as jest.MockedFunction<typeof savePillarProgress>;
const mockLoadCompletedLessons = loadCompletedLessons as jest.MockedFunction<typeof loadCompletedLessons>;
const mockSaveCompletedLessons = saveCompletedLessons as jest.MockedFunction<typeof saveCompletedLessons>;
const mockLoadGlobalXP = loadGlobalXP as jest.MockedFunction<typeof loadGlobalXP>;
const mockSaveGlobalXP = saveGlobalXP as jest.MockedFunction<typeof saveGlobalXP>;
const mockGetCurrentDate = getCurrentDate as jest.MockedFunction<typeof getCurrentDate>;

describe('pillarLessonService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getCurrentDate to return a fixed date
    mockGetCurrentDate.mockReturnValue('2024-01-15');
    
    // Default mock implementations
    mockLoadPillarProgress.mockResolvedValue({
      pillarKey: 'mental-health',
      xp: 0,
      level: 1,
      completedLessons: [],
      streak: 0,
      lastActivityDate: '',
      challengeCompletedToday: false,
      challengeCompletionDate: null,
    });
    
    mockLoadCompletedLessons.mockResolvedValue({
      lessonIds: [],
      lastUpdated: new Date().toISOString(),
    });
    
    mockLoadGlobalXP.mockResolvedValue(0);
  });

  describe('completeLesson', () => {
    it('should complete a lesson and award 50 XP', async () => {
      const pillarKey: PremiumPillarKey = 'mental-health';
      const lessonId = 'mental-health-lesson-1';

      await completeLesson(pillarKey, lessonId);

      // Verify lesson was added to completed lessons
      expect(mockSaveCompletedLessons).toHaveBeenCalledWith(
        expect.objectContaining({
          lessonIds: [lessonId],
        })
      );

      // Verify pillar progress was updated
      expect(mockSavePillarProgress).toHaveBeenCalledWith(
        pillarKey,
        expect.objectContaining({
          completedLessons: [lessonId],
        })
      );

      // Verify XP was awarded (50 XP)
      expect(mockSaveGlobalXP).toHaveBeenCalledWith(50);
    });

    it('should be idempotent - not award XP twice for same lesson', async () => {
      const pillarKey: PremiumPillarKey = 'career';
      const lessonId = 'career-lesson-2';

      // Mock lesson already completed
      mockLoadCompletedLessons.mockResolvedValue({
        lessonIds: [lessonId],
        lastUpdated: new Date().toISOString(),
      });

      await completeLesson(pillarKey, lessonId);

      // Verify no saves were made (idempotent)
      expect(mockSaveCompletedLessons).not.toHaveBeenCalled();
      expect(mockSavePillarProgress).not.toHaveBeenCalled();
      expect(mockSaveGlobalXP).not.toHaveBeenCalled();
    });

    it('should update pillar progress with lesson ID', async () => {
      const pillarKey: PremiumPillarKey = 'fitness';
      const lessonId = 'fitness-lesson-3';

      mockLoadPillarProgress.mockResolvedValue({
        pillarKey: 'fitness',
        xp: 100,
        level: 1,
        completedLessons: ['fitness-lesson-1', 'fitness-lesson-2'],
        streak: 0,
        lastActivityDate: '',
        challengeCompletedToday: false,
        challengeCompletionDate: null,
      });

      await completeLesson(pillarKey, lessonId);

      // Verify lesson was added to pillar's completed lessons
      expect(mockSavePillarProgress).toHaveBeenCalledWith(
        pillarKey,
        expect.objectContaining({
          completedLessons: ['fitness-lesson-1', 'fitness-lesson-2', lessonId],
        })
      );
    });

    it('should update last activity date', async () => {
      const pillarKey: PremiumPillarKey = 'finance';
      const lessonId = 'finance-lesson-1';

      await completeLesson(pillarKey, lessonId);

      // Verify savePillarProgress was called
      expect(mockSavePillarProgress).toHaveBeenCalled();
      
      // Get the actual call arguments
      const callArgs = mockSavePillarProgress.mock.calls[0];
      const savedProgress = callArgs[1];
      
      // Verify last activity date was set to the mocked date
      expect(savedProgress.lastActivityDate).toBe('2024-01-15');
    });
  });

  describe('isLessonCompleted', () => {
    it('should return true if lesson is completed', async () => {
      const lessonId = 'mental-health-lesson-1';

      mockLoadCompletedLessons.mockResolvedValue({
        lessonIds: [lessonId],
        lastUpdated: new Date().toISOString(),
      });

      const result = await isLessonCompleted(lessonId);

      expect(result).toBe(true);
    });

    it('should return false if lesson is not completed', async () => {
      const lessonId = 'mental-health-lesson-1';

      mockLoadCompletedLessons.mockResolvedValue({
        lessonIds: [],
        lastUpdated: new Date().toISOString(),
      });

      const result = await isLessonCompleted(lessonId);

      expect(result).toBe(false);
    });
  });

  describe('getCompletedLessonIds', () => {
    it('should return all completed lesson IDs', async () => {
      const lessonIds = ['lesson-1', 'lesson-2', 'lesson-3'];

      mockLoadCompletedLessons.mockResolvedValue({
        lessonIds,
        lastUpdated: new Date().toISOString(),
      });

      const result = await getCompletedLessonIds();

      expect(result).toEqual(lessonIds);
    });

    it('should return empty array if no lessons completed', async () => {
      mockLoadCompletedLessons.mockResolvedValue({
        lessonIds: [],
        lastUpdated: new Date().toISOString(),
      });

      const result = await getCompletedLessonIds();

      expect(result).toEqual([]);
    });
  });

  describe('getCompletedLessonCountForPillar', () => {
    it('should return count of completed lessons for a pillar', async () => {
      const pillarKey: PremiumPillarKey = 'hobbies';

      mockLoadPillarProgress.mockResolvedValue({
        pillarKey: 'hobbies',
        xp: 150,
        level: 1,
        completedLessons: ['hobbies-lesson-1', 'hobbies-lesson-2', 'hobbies-lesson-3'],
        streak: 0,
        lastActivityDate: '',
        challengeCompletedToday: false,
        challengeCompletionDate: null,
      });

      const result = await getCompletedLessonCountForPillar(pillarKey);

      expect(result).toBe(3);
    });

    it('should return 0 if no lessons completed for pillar', async () => {
      const pillarKey: PremiumPillarKey = 'relationships';

      mockLoadPillarProgress.mockResolvedValue({
        pillarKey: 'relationships',
        xp: 0,
        level: 1,
        completedLessons: [],
        streak: 0,
        lastActivityDate: '',
        challengeCompletedToday: false,
        challengeCompletionDate: null,
      });

      const result = await getCompletedLessonCountForPillar(pillarKey);

      expect(result).toBe(0);
    });
  });
});
