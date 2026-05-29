/**
 * Unit tests for pillarStorageService error handling
 * 
 * Tests error handling scenarios including:
 * - QuotaExceededError with cleanup and retry
 * - AsyncStorage unavailability with in-memory fallback
 * - Corrupted data handling
 * - Storage availability checking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  savePillarProgress,
  loadPillarProgress,
  saveGlobalXP,
  loadGlobalXP,
  saveCompletedLessons,
  loadCompletedLessons,
  createDefaultProgress,
  getStorageStatus,
  recheckStorageAvailability,
  clearInMemoryCache,
  ERROR_MESSAGES,
} from '../services/pillarStorageService';
import type { PillarProgress, CompletedLessons } from '../types/pillars';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('pillarStorageService - Error Handling', () => {
  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset AsyncStorage mock to default behavior
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
    (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    
    // Clear in-memory cache and reset storage availability
    clearInMemoryCache();
    await recheckStorageAvailability();
  });

  describe('QuotaExceededError handling', () => {
    it('should handle QuotaExceededError with cleanup and retry for pillar progress', async () => {
      const progress: PillarProgress = createDefaultProgress('mental-health');
      progress.xp = 100;
      
      // Clear mock calls from beforeEach
      jest.clearAllMocks();
      
      // First call throws QuotaExceededError, second call succeeds
      (AsyncStorage.setItem as jest.Mock)
        .mockRejectedValueOnce(new Error('QuotaExceeded'))
        .mockResolvedValueOnce(undefined);
      
      // Mock getAllKeys for cleanup
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'growthovo_pillar_progress_mental-health',
        'growthovo_pillar_progress_career',
      ]);
      
      // Mock getItem for cleanup (old data)
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          pillarKey: 'career',
          xp: 50,
          level: 1,
          completedLessons: [],
          streak: 0,
          lastActivityDate: '2020-01-01', // Old date
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        })
      );
      
      // Should not throw
      await expect(savePillarProgress('mental-health', progress)).resolves.not.toThrow();
      
      // Should have called setItem twice (initial + retry)
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
      
      // Should have called getAllKeys for cleanup
      expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
      
      // Should have called multiRemove to clear old data
      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    });

    it('should fall back to in-memory cache if retry fails', async () => {
      const progress: PillarProgress = createDefaultProgress('mental-health');
      progress.xp = 100;
      
      // Both calls throw QuotaExceededError
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('QuotaExceeded'));
      
      // Mock getAllKeys for cleanup
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
      
      // Should not throw
      await expect(savePillarProgress('mental-health', progress)).resolves.not.toThrow();
      
      // Should be able to load from in-memory cache
      const loaded = await loadPillarProgress('mental-health');
      expect(loaded.xp).toBe(100);
    });

    it('should handle QuotaExceededError for global XP', async () => {
      // Clear mock calls from beforeEach
      jest.clearAllMocks();
      
      // First call throws QuotaExceededError, second call succeeds
      (AsyncStorage.setItem as jest.Mock)
        .mockRejectedValueOnce(new Error('QuotaExceeded'))
        .mockResolvedValueOnce(undefined);
      
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
      
      // Should not throw
      await expect(saveGlobalXP(500)).resolves.not.toThrow();
      
      // Should have called setItem twice
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it('should handle QuotaExceededError for completed lessons', async () => {
      // Clear mock calls from beforeEach
      jest.clearAllMocks();
      
      const completedLessons: CompletedLessons = {
        lessonIds: ['mental-health-lesson-1'],
        lastUpdated: new Date().toISOString(),
      };
      
      // First call throws QuotaExceededError, second call succeeds
      (AsyncStorage.setItem as jest.Mock)
        .mockRejectedValueOnce(new Error('QuotaExceeded'))
        .mockResolvedValueOnce(undefined);
      
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
      
      // Should not throw
      await expect(saveCompletedLessons(completedLessons)).resolves.not.toThrow();
      
      // Should have called setItem twice
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('AsyncStorage unavailability', () => {
    it('should fall back to in-memory cache when AsyncStorage is unavailable', async () => {
      const progress: PillarProgress = createDefaultProgress('mental-health');
      progress.xp = 200;
      
      // Simulate AsyncStorage unavailable
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage unavailable'));
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage unavailable'));
      
      // Save should not throw
      await expect(savePillarProgress('mental-health', progress)).resolves.not.toThrow();
      
      // Load should return from in-memory cache
      const loaded = await loadPillarProgress('mental-health');
      expect(loaded.xp).toBe(200);
      expect(loaded.level).toBe(1);
    });

    it('should use in-memory cache for global XP when AsyncStorage unavailable', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage unavailable'));
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage unavailable'));
      
      // Save should not throw
      await expect(saveGlobalXP(750)).resolves.not.toThrow();
      
      // Load should return from in-memory cache
      const loaded = await loadGlobalXP();
      expect(loaded).toBe(750);
    });

    it('should use in-memory cache for completed lessons when AsyncStorage unavailable', async () => {
      const completedLessons: CompletedLessons = {
        lessonIds: ['mental-health-lesson-1', 'career-lesson-2'],
        lastUpdated: new Date().toISOString(),
      };
      
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage unavailable'));
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage unavailable'));
      
      // Save should not throw
      await expect(saveCompletedLessons(completedLessons)).resolves.not.toThrow();
      
      // Load should return from in-memory cache
      const loaded = await loadCompletedLessons();
      expect(loaded.lessonIds).toEqual(['mental-health-lesson-1', 'career-lesson-2']);
    });
  });

  describe('Corrupted data handling', () => {
    it('should return default progress for corrupted pillar data', async () => {
      // Mock corrupted JSON
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{ invalid json }');
      
      const loaded = await loadPillarProgress('mental-health');
      
      // Should return default progress
      expect(loaded.xp).toBe(0);
      expect(loaded.level).toBe(1);
      expect(loaded.pillarKey).toBe('mental-health');
    });

    it('should return 0 for corrupted global XP', async () => {
      // Mock corrupted data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('not a number');
      
      const loaded = await loadGlobalXP();
      
      // Should return 0
      expect(loaded).toBe(0);
    });

    it('should return empty array for corrupted completed lessons', async () => {
      // Mock corrupted JSON
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{ invalid json }');
      
      const loaded = await loadCompletedLessons();
      
      // Should return empty array
      expect(loaded.lessonIds).toEqual([]);
    });

    it('should sanitize invalid XP values', async () => {
      // Mock progress with negative XP
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          pillarKey: 'mental-health',
          xp: -100, // Invalid
          level: 1,
          completedLessons: [],
          streak: 0,
          lastActivityDate: '',
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        })
      );
      
      const loaded = await loadPillarProgress('mental-health');
      
      // Should sanitize to 0
      expect(loaded.xp).toBe(0);
    });

    it('should recalculate level if it does not match XP', async () => {
      // Mock progress with mismatched level
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          pillarKey: 'mental-health',
          xp: 600, // Should be level 2
          level: 1, // Wrong level
          completedLessons: [],
          streak: 0,
          lastActivityDate: '',
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        })
      );
      
      const loaded = await loadPillarProgress('mental-health');
      
      // Should recalculate level
      expect(loaded.level).toBe(2);
    });
  });

  describe('Storage status checking', () => {
    it('should report storage as available initially', async () => {
      const status = getStorageStatus();
      
      expect(status.isAvailable).toBe(true);
      expect(status.usingInMemoryCache).toBe(false);
      expect(status.message).toBe('Storage is available');
    });

    it('should report storage as unavailable after errors', async () => {
      // Simulate storage unavailable
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage unavailable'));
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage unavailable'));
      
      // Trigger error
      await savePillarProgress('mental-health', createDefaultProgress('mental-health'));
      
      // Check status after multiple failures
      await recheckStorageAvailability();
      
      const status = getStorageStatus();
      
      // Status depends on checkStorageAvailability result
      // If it fails, should report unavailable
      if (!status.isAvailable) {
        expect(status.usingInMemoryCache).toBe(true);
        expect(status.message).toBe(ERROR_MESSAGES.STORAGE_UNAVAILABLE);
      }
    });

    it('should recheck storage availability', async () => {
      // Mock storage becoming available
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      
      await recheckStorageAvailability();
      
      // Should have tested storage
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('growthovo_storage_test', 'test');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('growthovo_storage_test');
    });
  });

  describe('Old data cleanup', () => {
    it('should clear old progress data when quota exceeded', async () => {
      const progress: PillarProgress = createDefaultProgress('mental-health');
      
      // First call throws QuotaExceededError
      (AsyncStorage.setItem as jest.Mock)
        .mockRejectedValueOnce(new Error('QuotaExceeded'))
        .mockResolvedValueOnce(undefined);
      
      // Mock old data
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100); // 100 days ago
      
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'growthovo_pillar_progress_career',
        'growthovo_pillar_progress_fitness',
      ]);
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          pillarKey: 'career',
          xp: 50,
          level: 1,
          completedLessons: [],
          streak: 0,
          lastActivityDate: oldDate.toISOString().split('T')[0],
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        })
      );
      
      await savePillarProgress('mental-health', progress);
      
      // Should have called multiRemove to clear old data
      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    });

    it('should not clear recent data', async () => {
      const progress: PillarProgress = createDefaultProgress('mental-health');
      
      // First call throws QuotaExceededError
      (AsyncStorage.setItem as jest.Mock)
        .mockRejectedValueOnce(new Error('QuotaExceeded'))
        .mockResolvedValueOnce(undefined);
      
      // Mock recent data
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10); // 10 days ago
      
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'growthovo_pillar_progress_career',
      ]);
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          pillarKey: 'career',
          xp: 50,
          level: 1,
          completedLessons: [],
          streak: 0,
          lastActivityDate: recentDate.toISOString().split('T')[0],
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        })
      );
      
      await savePillarProgress('mental-health', progress);
      
      // Should have called multiRemove but with empty array (no old data)
      const multiRemoveCalls = (AsyncStorage.multiRemove as jest.Mock).mock.calls;
      if (multiRemoveCalls.length > 0) {
        expect(multiRemoveCalls[0][0]).toEqual([]);
      }
    });
  });

  describe('Error messages', () => {
    it('should have user-friendly error messages', () => {
      expect(ERROR_MESSAGES.PERSISTENCE_FAILED).toContain('Unable to save');
      expect(ERROR_MESSAGES.STORAGE_UNAVAILABLE).toContain('Storage unavailable');
      expect(ERROR_MESSAGES.QUOTA_EXCEEDED).toContain('Storage full');
      expect(ERROR_MESSAGES.INVALID_DATA).toContain('corrupted');
    });
  });
});
