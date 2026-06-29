/**
 * Unit tests for recordDailyCheckIn function
 * Validates Requirements 4.1, 4.2, 4.3
 */

import { recordDailyCheckIn } from '../services/growthovoExperienceService';
import * as streakService from '../services/streakService';

// Mock the streak service
jest.mock('../services/streakService');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

describe('recordDailyCheckIn', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call incrementStreak with userId', async () => {
    // Mock incrementStreak to return a streak value
    (streakService.incrementStreak as jest.Mock).mockResolvedValue(5);
    (streakService.checkMilestone as jest.Mock).mockReturnValue({
      isMilestone: false,
      xpBonus: 0,
      days: 5,
    });

    const result = await recordDailyCheckIn(mockUserId);

    expect(streakService.incrementStreak).toHaveBeenCalledWith(mockUserId);
    expect(result.streak).toBe(5);
    expect(result.freezeUsed).toBe(false);
    expect(result.milestone).toBe(null);
  });

  it('should detect milestone when streak reaches 7 days', async () => {
    (streakService.incrementStreak as jest.Mock).mockResolvedValue(7);
    (streakService.checkMilestone as jest.Mock).mockReturnValue({
      isMilestone: true,
      xpBonus: 100,
      days: 7,
    });

    const result = await recordDailyCheckIn(mockUserId);

    expect(result.streak).toBe(7);
    expect(result.milestone).toBe(7);
  });

  it('should detect milestone when streak reaches 30 days', async () => {
    (streakService.incrementStreak as jest.Mock).mockResolvedValue(30);
    (streakService.checkMilestone as jest.Mock).mockReturnValue({
      isMilestone: true,
      xpBonus: 500,
      days: 30,
    });

    const result = await recordDailyCheckIn(mockUserId);

    expect(result.streak).toBe(30);
    expect(result.milestone).toBe(30);
  });

  it('should return freezeUsed as false since freezes are handled separately', async () => {
    (streakService.incrementStreak as jest.Mock).mockResolvedValue(10);
    (streakService.checkMilestone as jest.Mock).mockReturnValue({
      isMilestone: false,
      xpBonus: 0,
      days: 10,
    });

    const result = await recordDailyCheckIn(mockUserId);

    // Freeze logic is handled by handleMissedDay, not by recordDailyCheckIn
    expect(result.freezeUsed).toBe(false);
  });

  it('should handle consecutive day check-ins correctly', async () => {
    // Simulate consecutive days: day 1, day 2, day 3
    (streakService.incrementStreak as jest.Mock)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3);
    
    (streakService.checkMilestone as jest.Mock).mockReturnValue({
      isMilestone: false,
      xpBonus: 0,
      days: 0,
    });

    const result1 = await recordDailyCheckIn(mockUserId);
    const result2 = await recordDailyCheckIn(mockUserId);
    const result3 = await recordDailyCheckIn(mockUserId);

    expect(result1.streak).toBe(1);
    expect(result2.streak).toBe(2);
    expect(result3.streak).toBe(3);
  });

  it('should handle streak reset when days are missed (via DB RPC)', async () => {
    // The DB RPC handles missed days automatically
    // If a day is missed, increment_streak returns 1 (reset)
    (streakService.incrementStreak as jest.Mock).mockResolvedValue(1);
    (streakService.checkMilestone as jest.Mock).mockReturnValue({
      isMilestone: false,
      xpBonus: 0,
      days: 1,
    });

    const result = await recordDailyCheckIn(mockUserId);

    // Streak should be reset to 1 by the DB
    expect(result.streak).toBe(1);
  });
});
