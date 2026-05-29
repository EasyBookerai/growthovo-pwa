/**
 * Unit tests for pillarChallengeService
 * 
 * Tests challenge completion logic with specific examples and edge cases.
 */

import {
  awardXP,
  completeDailyChallenge,
  isChallengeCompletedToday,
  checkDailyResetForAllPillars,
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

describe('pillarChallengeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentDate.mockReturnValue('2024-01-15');
  });

  describe('awardXP', () => {
    it('should award XP and update pillar progress', async () => {
      const pillarKey: PremiumPillarKey = 'mental-health';
      const progress = createDefaultProgress(pillarKey);
      progress.xp = 100;
      progress.level = 1;

      mockLoadPillarProgress.mockResolvedValue(progress);
      mockLoadGlobalXP.mockResolvedValue(500);

      await awardXP(pillarKey, 30);

      expect(mockSavePillarProgress).toHaveBeenCalledWith(
        pillarKey,
        expect.objectContaining({
          xp: 130,
          level: 1,
          lastActivityDate: '2024-01-15',
        })
      );

      expect(mockSaveGlobalXP).toHaveBeenCalledWith(530);
    });

    it('should recalculate level when XP crosses threshold', async () => {
      const pillarKey: PremiumPillarKey = 'fitness';
      const progress = createDefaultProgress(pillarKey);
      progress.xp = 490;
      progress.level = 1;

      mockLoadPillarProgress.mockResolvedValue(progress);
      mockLoadGlobalXP.mockResolvedValue(1000);

      await awardXP(pillarKey, 30);

      expect(mockSavePillarProgress).toHaveBeenCalledWith(
        pillarKey,
        expect.objectContaining({
          xp: 520,
          level: 2, // Level up!
        })
      );
    });

    it('should throw error for negative XP amount', async () => {
      await expect(awardXP('career', -10)).rejects.toThrow('XP amount must be positive');
    });

    it('should throw error for zero XP amount', async () => {
      await expect(awardXP('career', 0)).rejects.toThrow('XP amount must be positive');
    });
  });

  describe('completeDailyChallenge', () => {
    it('should mark challenge as completed and award 30 XP', async () => {
      const pillarKey: PremiumPillarKey = 'relationships';
      const progress = createDefaultProgress(pillarKey);
      progress.xp = 200;
      progress.level = 1;
      progress.challengeCompletedToday = false;

      mockLoadPillarProgress.mockResolvedValue(progress);
      mockLoadGlobalXP.mockResolvedValue(800);

      await completeDailyChallenge(pillarKey);

      // First call: mark challenge as completed
      expect(mockSavePillarProgress).toHaveBeenNthCalledWith(
        1,
        pillarKey,
        expect.objectContaining({
          challengeCompletedToday: true,
          challengeCompletionDate: '2024-01-15',
        })
      );

      // Second call: save after awarding XP
      expect(mockSavePillarProgress).toHaveBeenNthCalledWith(
        2,
        pillarKey,
        expect.objectContaining({
          xp: 230,
        })
      );

      expect(mockSaveGlobalXP).toHaveBeenCalledWith(830);
    });

    it('should throw error if challenge already completed today', async () => {
      const pillarKey: PremiumPillarKey = 'finance';
      const progress = createDefaultProgress(pillarKey);
      progress.challengeCompletedToday = true;
      progress.challengeCompletionDate = '2024-01-15';

      mockLoadPillarProgress.mockResolvedValue(progress);

      await expect(completeDailyChallenge(pillarKey)).rejects.toThrow(
        'Challenge already completed today'
      );

      expect(mockSavePillarProgress).not.toHaveBeenCalled();
    });

    it('should reset challenge if date has changed', async () => {
      const pillarKey: PremiumPillarKey = 'hobbies';
      const progress = createDefaultProgress(pillarKey);
      progress.xp = 150;
      progress.challengeCompletedToday = true;
      progress.challengeCompletionDate = '2024-01-14'; // Yesterday

      mockLoadPillarProgress.mockResolvedValue(progress);
      mockLoadGlobalXP.mockResolvedValue(600);
      mockGetCurrentDate.mockReturnValue('2024-01-15'); // Today

      await completeDailyChallenge(pillarKey);

      // Should reset and allow completion
      expect(mockSavePillarProgress).toHaveBeenCalledWith(
        pillarKey,
        expect.objectContaining({
          challengeCompletedToday: true,
          challengeCompletionDate: '2024-01-15',
          xp: 180, // 150 + 30
        })
      );
    });
  });

  describe('isChallengeCompletedToday', () => {
    it('should return true if challenge completed today', async () => {
      const pillarKey: PremiumPillarKey = 'mental-health';
      const progress = createDefaultProgress(pillarKey);
      progress.challengeCompletedToday = true;
      progress.challengeCompletionDate = '2024-01-15';

      mockLoadPillarProgress.mockResolvedValue(progress);

      const result = await isChallengeCompletedToday(pillarKey);

      expect(result).toBe(true);
    });

    it('should return false if challenge not completed', async () => {
      const pillarKey: PremiumPillarKey = 'career';
      const progress = createDefaultProgress(pillarKey);
      progress.challengeCompletedToday = false;

      mockLoadPillarProgress.mockResolvedValue(progress);

      const result = await isChallengeCompletedToday(pillarKey);

      expect(result).toBe(false);
    });

    it('should reset and return false if date has changed', async () => {
      const pillarKey: PremiumPillarKey = 'fitness';
      const progress = createDefaultProgress(pillarKey);
      progress.challengeCompletedToday = true;
      progress.challengeCompletionDate = '2024-01-14'; // Yesterday

      mockLoadPillarProgress.mockResolvedValue(progress);
      mockGetCurrentDate.mockReturnValue('2024-01-15'); // Today

      const result = await isChallengeCompletedToday(pillarKey);

      expect(result).toBe(false);
      expect(mockSavePillarProgress).toHaveBeenCalledWith(
        pillarKey,
        expect.objectContaining({
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        })
      );
    });
  });

  describe('checkDailyResetForAllPillars', () => {
    it('should reset all pillars with outdated completion dates', async () => {
      const progressYesterday = createDefaultProgress('mental-health');
      progressYesterday.challengeCompletedToday = true;
      progressYesterday.challengeCompletionDate = '2024-01-14';

      const progressToday = createDefaultProgress('relationships');
      progressToday.challengeCompletedToday = true;
      progressToday.challengeCompletionDate = '2024-01-15';

      mockLoadPillarProgress.mockImplementation(async (key) => {
        if (key === 'mental-health') return progressYesterday;
        if (key === 'relationships') return progressToday;
        return createDefaultProgress(key);
      });

      mockGetCurrentDate.mockReturnValue('2024-01-15');

      await checkDailyResetForAllPillars();

      // Should reset mental-health (yesterday)
      expect(mockSavePillarProgress).toHaveBeenCalledWith(
        'mental-health',
        expect.objectContaining({
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        })
      );

      // Should NOT reset relationships (today)
      const relationshipsCalls = (mockSavePillarProgress.mock.calls as any[]).filter(
        (call) => call[0] === 'relationships'
      );
      expect(relationshipsCalls.length).toBe(0);
    });

    it('should handle all 6 pillars', async () => {
      mockLoadPillarProgress.mockImplementation(async (key) => {
        return createDefaultProgress(key);
      });

      await checkDailyResetForAllPillars();

      // Should load all 6 pillars
      expect(mockLoadPillarProgress).toHaveBeenCalledTimes(6);
      expect(mockLoadPillarProgress).toHaveBeenCalledWith('mental-health');
      expect(mockLoadPillarProgress).toHaveBeenCalledWith('relationships');
      expect(mockLoadPillarProgress).toHaveBeenCalledWith('career');
      expect(mockLoadPillarProgress).toHaveBeenCalledWith('fitness');
      expect(mockLoadPillarProgress).toHaveBeenCalledWith('finance');
      expect(mockLoadPillarProgress).toHaveBeenCalledWith('hobbies');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple XP awards in sequence', async () => {
      const pillarKey: PremiumPillarKey = 'career';
      let currentXP = 100;

      mockLoadPillarProgress.mockImplementation(async () => {
        const progress = createDefaultProgress(pillarKey);
        progress.xp = currentXP;
        progress.level = Math.floor(currentXP / 500) + 1;
        return progress;
      });

      mockSavePillarProgress.mockImplementation(async (key, progress) => {
        currentXP = progress.xp;
      });

      mockLoadGlobalXP.mockResolvedValue(1000);

      // Award XP three times
      await awardXP(pillarKey, 30);
      await awardXP(pillarKey, 30);
      await awardXP(pillarKey, 30);

      expect(mockSavePillarProgress).toHaveBeenCalledTimes(3);
      expect(currentXP).toBe(190); // 100 + 30 + 30 + 30
    });

    it('should handle challenge completion at level boundary', async () => {
      const pillarKey: PremiumPillarKey = 'fitness';
      const progress = createDefaultProgress(pillarKey);
      progress.xp = 480; // 20 XP away from level 2
      progress.level = 1;
      progress.challengeCompletedToday = false;

      mockLoadPillarProgress.mockResolvedValue(progress);
      mockLoadGlobalXP.mockResolvedValue(2000);

      await completeDailyChallenge(pillarKey);

      // Should level up: 480 + 30 = 510 (level 2)
      expect(mockSavePillarProgress).toHaveBeenCalledWith(
        pillarKey,
        expect.objectContaining({
          xp: 510,
          level: 2,
        })
      );
    });
  });
});
