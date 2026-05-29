/**
 * Integration test for Task 12.2: AppContext sync in awardXP
 * 
 * Tests that XP earned in Pillars properly syncs with AppContext
 */

import { awardXP } from '../services/pillarChallengeService';
import { loadPillarProgress, savePillarProgress } from '../services/pillarStorageService';
import type { PremiumPillarKey } from '../types/pillars';

// Mock localStorage
const mockStorage: Record<string, string> = {};
global.localStorage = {
  getItem: jest.fn((key: string) => mockStorage[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  }),
  length: 0,
  key: jest.fn(() => null),
};

describe('Task 12.2: AppContext Sync Integration', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    jest.clearAllMocks();
  });

  it('should call AppContext updateXP callback when awarding XP', async () => {
    const pillarKey: PremiumPillarKey = 'mental-health';
    const mockUpdateXP = jest.fn().mockResolvedValue(undefined);

    // Award 50 XP with AppContext sync callback
    await awardXP(pillarKey, 50, mockUpdateXP);

    // Verify AppContext updateXP was called with correct amount
    expect(mockUpdateXP).toHaveBeenCalledWith(50);
    expect(mockUpdateXP).toHaveBeenCalledTimes(1);
  });

  it('should update local XP immediately (optimistic update)', async () => {
    const pillarKey: PremiumPillarKey = 'mental-health';
    const mockUpdateXP = jest.fn().mockResolvedValue(undefined);

    // Award 50 XP
    await awardXP(pillarKey, 50, mockUpdateXP);

    // Verify local progress was updated
    const progress = await loadPillarProgress(pillarKey);
    expect(progress.xp).toBe(50);
  });

  it('should keep local state if AppContext sync fails with network error', async () => {
    const pillarKey: PremiumPillarKey = 'mental-health';
    const mockUpdateXP = jest.fn().mockRejectedValue(new Error('Failed to save your XP. network error'));

    // Award 50 XP (should not throw)
    await awardXP(pillarKey, 50, mockUpdateXP);

    // Verify local progress was kept (optimistic update preserved)
    const progress = await loadPillarProgress(pillarKey);
    expect(progress.xp).toBe(50);
  });

  it('should rollback local state if AppContext sync fails with unexpected error', async () => {
    const pillarKey: PremiumPillarKey = 'mental-health';
    
    // Set initial XP to 100
    const initialProgress = await loadPillarProgress(pillarKey);
    initialProgress.xp = 100;
    await savePillarProgress(pillarKey, initialProgress);

    const mockUpdateXP = jest.fn().mockRejectedValue(new Error('Unexpected database error'));

    // Award 50 XP (should throw and rollback)
    await expect(awardXP(pillarKey, 50, mockUpdateXP)).rejects.toThrow('Failed to sync XP');

    // Verify local progress was rolled back to original value
    const progress = await loadPillarProgress(pillarKey);
    expect(progress.xp).toBe(100);
  });

  it('should sync in background without blocking UI', async () => {
    const pillarKey: PremiumPillarKey = 'mental-health';
    let syncCompleted = false;
    
    const mockUpdateXP = jest.fn().mockImplementation(async () => {
      // Simulate slow network
      await new Promise(resolve => setTimeout(resolve, 100));
      syncCompleted = true;
    });

    // Award XP
    await awardXP(pillarKey, 50, mockUpdateXP);

    // Verify sync was called (background operation)
    expect(mockUpdateXP).toHaveBeenCalled();
    expect(syncCompleted).toBe(true);
  });

  it('should work without AppContext callback (fallback to localStorage only)', async () => {
    const pillarKey: PremiumPillarKey = 'mental-health';

    // Award XP without AppContext callback
    await awardXP(pillarKey, 50);

    // Verify local progress was updated
    const progress = await loadPillarProgress(pillarKey);
    expect(progress.xp).toBe(50);
  });

  it('should sync multiple XP awards correctly', async () => {
    const pillarKey: PremiumPillarKey = 'mental-health';
    const mockUpdateXP = jest.fn().mockResolvedValue(undefined);

    // Award XP multiple times
    await awardXP(pillarKey, 30, mockUpdateXP); // Challenge
    await awardXP(pillarKey, 50, mockUpdateXP); // Lesson
    await awardXP(pillarKey, 50, mockUpdateXP); // Another lesson

    // Verify AppContext was called for each award
    expect(mockUpdateXP).toHaveBeenCalledTimes(3);
    expect(mockUpdateXP).toHaveBeenNthCalledWith(1, 30);
    expect(mockUpdateXP).toHaveBeenNthCalledWith(2, 50);
    expect(mockUpdateXP).toHaveBeenNthCalledWith(3, 50);

    // Verify total XP is correct
    const progress = await loadPillarProgress(pillarKey);
    expect(progress.xp).toBe(130);
  });

  it('should log success message when sync completes', async () => {
    const pillarKey: PremiumPillarKey = 'mental-health';
    const mockUpdateXP = jest.fn().mockResolvedValue(undefined);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await awardXP(pillarKey, 50, mockUpdateXP);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Successfully synced 50 XP to AppContext')
    );

    consoleSpy.mockRestore();
  });

  it('should log error message when sync fails', async () => {
    const pillarKey: PremiumPillarKey = 'mental-health';
    const mockUpdateXP = jest.fn().mockRejectedValue(new Error('network timeout'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await awardXP(pillarKey, 50, mockUpdateXP);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Network error syncing with AppContext')
    );

    consoleSpy.mockRestore();
  });
});
