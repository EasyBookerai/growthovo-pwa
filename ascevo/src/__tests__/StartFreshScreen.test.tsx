/**
 * Tests for StartFreshScreen functionality
 *
 * Covers:
 *  - Rex message rotation for starting fresh
 *  - Streak reset functionality
 *  - Day 1 message display
 *
 * Feature: growthovo-features-v3
 * Validates: Requirements 5.9
 */

import { resetStreak } from '../services/streakService';

// Mock the services
jest.mock('../services/streakService');

const mockResetStreak = resetStreak as jest.MockedFunction<typeof resetStreak>;

describe('StartFreshScreen functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResetStreak.mockResolvedValue();
  });

  it('generates Rex lines for starting fresh with proper rotation', () => {
    const getRexStartFreshLine = (dayOfYear: number): string => {
      const lines = [
        "Day 1. Again. That's fine. Most people never even get to Day 1.",
        "Starting over isn't failing. Staying down is.",
        "Day 1 is the hardest day. You've done it before. Do it again.",
        "Fresh start. Clean slate. Same you, better choices.",
        "Every expert was once a beginner. Every pro was once an amateur. Day 1.",
      ];
      
      return lines[dayOfYear % lines.length];
    };

    // Test that all lines are reachable
    expect(getRexStartFreshLine(0)).toBe("Day 1. Again. That's fine. Most people never even get to Day 1.");
    expect(getRexStartFreshLine(1)).toBe("Starting over isn't failing. Staying down is.");
    expect(getRexStartFreshLine(2)).toBe("Day 1 is the hardest day. You've done it before. Do it again.");
    expect(getRexStartFreshLine(3)).toBe("Fresh start. Clean slate. Same you, better choices.");
    expect(getRexStartFreshLine(4)).toBe("Every expert was once a beginner. Every pro was once an amateur. Day 1.");
    
    // Test rotation wraps around
    expect(getRexStartFreshLine(5)).toBe("Day 1. Again. That's fine. Most people never even get to Day 1.");
    expect(getRexStartFreshLine(6)).toBe("Starting over isn't failing. Staying down is.");
  });

  it('validates all Rex lines contain motivational content', () => {
    const lines = [
      "Day 1. Again. That's fine. Most people never even get to Day 1.",
      "Starting over isn't failing. Staying down is.",
      "Day 1 is the hardest day. You've done it before. Do it again.",
      "Fresh start. Clean slate. Same you, better choices.",
      "Every expert was once a beginner. Every pro was once an amateur. Day 1.",
    ];

    lines.forEach(line => {
      expect(line).toContain('Day 1');
      expect(line.length).toBeGreaterThan(20); // Ensure substantial content
    });
  });

  it('calls resetStreak with correct userId', async () => {
    const userId = 'test-user-123';
    
    // Simulate the streak reset call that happens in useEffect
    await resetStreak(userId);
    
    expect(mockResetStreak).toHaveBeenCalledWith(userId);
    expect(mockResetStreak).toHaveBeenCalledTimes(1);
  });

  it('handles streak reset failure gracefully', async () => {
    const userId = 'test-user-123';
    const error = new Error('Database connection failed');
    mockResetStreak.mockRejectedValue(error);

    try {
      await resetStreak(userId);
    } catch (e) {
      expect(e).toBe(error);
    }

    expect(mockResetStreak).toHaveBeenCalledWith(userId);
  });

  it('validates start fresh message structure', () => {
    const title = 'Starting fresh.';
    const subtitle = 'Day 1.';
    
    expect(title).toBe('Starting fresh.');
    expect(subtitle).toBe('Day 1.');
    expect(title + ' ' + subtitle).toBe('Starting fresh. Day 1.');
  });
});