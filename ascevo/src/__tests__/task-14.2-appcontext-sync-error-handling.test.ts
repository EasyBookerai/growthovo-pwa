/**
 * Task 14.2: Add AppContext sync error handling
 * 
 * Tests for retry queue, exponential backoff, and syncing indicator.
 * 
 * Requirements:
 * - Implement retry queue for failed syncs
 * - Add exponential backoff for retries (1s, 2s, 4s, 8s, max 30s)
 * - Keep local state as source of truth
 * - Display "Syncing..." indicator during retry
 * 
 * Validates: Requirements 17.1
 */

import {
  awardXP,
  registerSyncStatusCallback,
  unregisterSyncStatusCallback,
  isSyncing,
} from '../services/pillarChallengeService';
import {
  loadPillarProgress,
  loadGlobalXP,
} from '../services/pillarStorageService';

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};

beforeAll(() => {
  global.localStorage = {
    getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      mockLocalStorage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete mockLocalStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
    }),
    length: 0,
    key: jest.fn(),
  } as Storage;
});

beforeEach(async () => {
  // Clear localStorage before each test
  Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
  
  // Clear any registered callbacks
  unregisterSyncStatusCallback();
  
  // Clear timers
  jest.clearAllTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Task 14.2: AppContext Sync Error Handling', () => {
  describe('Retry Queue Implementation', () => {
    it('should add failed sync to retry queue on network error', async () => {
      const mockOnAppContextSync = jest.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValueOnce(undefined);
      
      // Award XP with failing callback
      await awardXP('mental-health', 50, mockOnAppContextSync);
      
      // Verify local state is updated (optimistic update)
      const progress = await loadPillarProgress('mental-health');
      expect(progress.xp).toBe(50);
      
      // Verify callback was called once (initial attempt)
      expect(mockOnAppContextSync).toHaveBeenCalledTimes(1);
      
      // Verify sync is in progress
      expect(isSyncing()).toBe(true);
    });
    
    it('should keep local state as source of truth on network error', async () => {
      const mockOnAppContextSync = jest.fn()
        .mockRejectedValue(new Error('connection failed'));
      
      // Award XP with failing callback
      await awardXP('mental-health', 50, mockOnAppContextSync);
      
      // Verify local state is updated despite sync failure
      const progress = await loadPillarProgress('mental-health');
      expect(progress.xp).toBe(50);
      expect(progress.level).toBe(1);
      
      const globalXP = await loadGlobalXP();
      expect(globalXP).toBe(50);
    });
    
    it('should rollback local state on unexpected error', async () => {
      const mockOnAppContextSync = jest.fn()
        .mockRejectedValue(new Error('Unexpected database error'));
      
      // Award XP with failing callback (should throw)
      await expect(
        awardXP('mental-health', 50, mockOnAppContextSync)
      ).rejects.toThrow('Failed to sync XP');
      
      // Verify local state is rolled back
      const progress = await loadPillarProgress('mental-health');
      expect(progress.xp).toBe(0);
      expect(progress.level).toBe(1);
      
      const globalXP = await loadGlobalXP();
      expect(globalXP).toBe(0);
    });
  });
  
  describe('Exponential Backoff', () => {
    it('should retry with exponential backoff delays', async () => {
      jest.useFakeTimers();
      
      let callCount = 0;
      const mockOnAppContextSync = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 3) {
          return Promise.reject(new Error('network timeout'));
        }
        return Promise.resolve();
      });
      
      // Award XP with failing callback
      await awardXP('mental-health', 50, mockOnAppContextSync);
      
      // Initial call
      expect(mockOnAppContextSync).toHaveBeenCalledTimes(1);
      
      // First retry after 1s (2^0 * 1000)
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Allow promises to resolve
      expect(mockOnAppContextSync).toHaveBeenCalledTimes(2);
      
      // Second retry after 2s (2^1 * 1000)
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
      expect(mockOnAppContextSync).toHaveBeenCalledTimes(3);
      
      // Third retry after 4s (2^2 * 1000)
      jest.advanceTimersByTime(4000);
      await Promise.resolve();
      expect(mockOnAppContextSync).toHaveBeenCalledTimes(4);
      
      // Verify sync is complete
      expect(isSyncing()).toBe(false);
      
      jest.useRealTimers();
    });
    
    it('should cap backoff delay at 30 seconds', async () => {
      jest.useFakeTimers();
      
      let callCount = 0;
      const mockOnAppContextSync = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 6) {
          return Promise.reject(new Error('network timeout'));
        }
        return Promise.resolve();
      });
      
      // Award XP with failing callback
      await awardXP('mental-health', 50, mockOnAppContextSync);
      
      // Skip to 5th retry (2^4 * 1000 = 16s)
      jest.advanceTimersByTime(1000 + 2000 + 4000 + 8000 + 16000);
      await Promise.resolve();
      
      // 6th retry should use max delay of 30s (not 2^5 * 1000 = 32s)
      jest.advanceTimersByTime(30000);
      await Promise.resolve();
      
      expect(mockOnAppContextSync).toHaveBeenCalledTimes(7);
      
      jest.useRealTimers();
    });
    
    it('should drop sync after 10 retries', async () => {
      jest.useFakeTimers();
      
      const mockOnAppContextSync = jest.fn()
        .mockRejectedValue(new Error('network timeout'));
      
      // Award XP with failing callback
      await awardXP('mental-health', 50, mockOnAppContextSync);
      
      // Advance through all retries (1s, 2s, 4s, 8s, 16s, 30s, 30s, 30s, 30s, 30s)
      const delays = [1000, 2000, 4000, 8000, 16000, 30000, 30000, 30000, 30000, 30000];
      for (const delay of delays) {
        jest.advanceTimersByTime(delay);
        await Promise.resolve();
      }
      
      // Should have attempted 11 times (initial + 10 retries)
      expect(mockOnAppContextSync).toHaveBeenCalledTimes(11);
      
      // Verify sync is no longer in progress (dropped)
      expect(isSyncing()).toBe(false);
      
      jest.useRealTimers();
    });
  });
  
  describe('Sync Status Callback', () => {
    it('should notify callback when sync starts', async () => {
      const mockStatusCallback = jest.fn();
      registerSyncStatusCallback(mockStatusCallback);
      
      const mockOnAppContextSync = jest.fn()
        .mockRejectedValue(new Error('network error'));
      
      // Award XP with failing callback
      await awardXP('mental-health', 50, mockOnAppContextSync);
      
      // Verify callback was called with true (syncing started)
      expect(mockStatusCallback).toHaveBeenCalledWith(true);
      
      unregisterSyncStatusCallback();
    });
    
    it('should notify callback when sync completes', async () => {
      jest.useFakeTimers();
      
      const mockStatusCallback = jest.fn();
      registerSyncStatusCallback(mockStatusCallback);
      
      const mockOnAppContextSync = jest.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValueOnce(undefined);
      
      // Award XP with failing callback
      await awardXP('mental-health', 50, mockOnAppContextSync);
      
      // Verify callback was called with true (syncing started)
      expect(mockStatusCallback).toHaveBeenCalledWith(true);
      
      // Advance timer to trigger retry
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      
      // Verify callback was called with false (syncing completed)
      expect(mockStatusCallback).toHaveBeenCalledWith(false);
      
      unregisterSyncStatusCallback();
      jest.useRealTimers();
    });
    
    it('should not call callback after unregister', async () => {
      const mockStatusCallback = jest.fn();
      registerSyncStatusCallback(mockStatusCallback);
      unregisterSyncStatusCallback();
      
      const mockOnAppContextSync = jest.fn()
        .mockRejectedValue(new Error('network error'));
      
      // Award XP with failing callback
      await awardXP('mental-health', 50, mockOnAppContextSync);
      
      // Verify callback was not called
      expect(mockStatusCallback).not.toHaveBeenCalled();
    });
  });
  
  describe('isSyncing() Function', () => {
    it('should return false when no syncs are pending', () => {
      expect(isSyncing()).toBe(false);
    });
    
    it('should return true when syncs are in retry queue', async () => {
      const mockOnAppContextSync = jest.fn()
        .mockRejectedValue(new Error('network error'));
      
      // Award XP with failing callback
      await awardXP('mental-health', 50, mockOnAppContextSync);
      
      // Verify isSyncing returns true
      expect(isSyncing()).toBe(true);
    });
    
    it('should return false after all retries complete', async () => {
      jest.useFakeTimers();
      
      const mockOnAppContextSync = jest.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValueOnce(undefined);
      
      // Award XP with failing callback
      await awardXP('mental-health', 50, mockOnAppContextSync);
      
      // Verify isSyncing returns true
      expect(isSyncing()).toBe(true);
      
      // Advance timer to trigger retry
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      
      // Verify isSyncing returns false after successful retry
      expect(isSyncing()).toBe(false);
      
      jest.useRealTimers();
    });
  });
  
  describe('Multiple Failed Syncs', () => {
    it('should queue multiple failed syncs', async () => {
      const mockOnAppContextSync = jest.fn()
        .mockRejectedValue(new Error('network error'));
      
      // Award XP multiple times with failing callback
      await awardXP('mental-health', 50, mockOnAppContextSync);
      await awardXP('relationships', 30, mockOnAppContextSync);
      await awardXP('career', 50, mockOnAppContextSync);
      
      // Verify all syncs are queued
      expect(isSyncing()).toBe(true);
      
      // Verify local state is updated for all
      const mentalHealthProgress = await loadPillarProgress('mental-health');
      expect(mentalHealthProgress.xp).toBe(50);
      
      const relationshipsProgress = await loadPillarProgress('relationships');
      expect(relationshipsProgress.xp).toBe(30);
      
      const careerProgress = await loadPillarProgress('career');
      expect(careerProgress.xp).toBe(50);
    });
    
    it('should process queued syncs in order', async () => {
      jest.useFakeTimers();
      
      const syncOrder: number[] = [];
      const mockOnAppContextSync = jest.fn().mockImplementation((amount: number) => {
        syncOrder.push(amount);
        if (syncOrder.length <= 3) {
          return Promise.reject(new Error('network error'));
        }
        return Promise.resolve();
      });
      
      // Award XP multiple times with failing callback
      await awardXP('mental-health', 50, mockOnAppContextSync);
      await awardXP('relationships', 30, mockOnAppContextSync);
      await awardXP('career', 25, mockOnAppContextSync);
      
      // Initial calls
      expect(syncOrder).toEqual([50, 30, 25]);
      
      // First retry (50 XP)
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      expect(syncOrder).toEqual([50, 30, 25, 50]);
      
      // Verify sync is complete
      expect(isSyncing()).toBe(false);
      
      jest.useRealTimers();
    });
  });
  
  describe('Integration with Lesson Completion', () => {
    it('should handle lesson completion with network error', async () => {
      const { completeLesson } = require('../services/pillarLessonService');
      
      const mockOnAppContextSync = jest.fn()
        .mockRejectedValue(new Error('network timeout'));
      
      // Complete lesson with failing callback
      await completeLesson('mental-health', 'mental-health-lesson-1', mockOnAppContextSync);
      
      // Verify lesson is marked complete locally
      const progress = await loadPillarProgress('mental-health');
      expect(progress.completedLessons).toContain('mental-health-lesson-1');
      expect(progress.xp).toBe(50);
      
      // Verify sync is in retry queue
      expect(isSyncing()).toBe(true);
    });
  });
});
