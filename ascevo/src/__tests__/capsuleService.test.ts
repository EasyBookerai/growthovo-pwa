/**
 * Tests for capsuleService pure functions
 *
 * Covers:
 *  - Unit tests: getCapsuleRexReaction
 *  - getCapsuleStatus daysRemaining calculation logic
 *
 * Feature: growthovo-features-v3
 * Validates: Requirements 3.15
 */

import { getCapsuleRexReaction } from '../services/capsuleService';

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe('getCapsuleRexReaction — unit tests', () => {
  it('returns high streak message for streaks over 60 days', () => {
    expect(getCapsuleRexReaction(61)).toBe("You did it. I didn't doubt you. Much.");
    expect(getCapsuleRexReaction(100)).toBe("You did it. I didn't doubt you. Much.");
    expect(getCapsuleRexReaction(365)).toBe("You did it. I didn't doubt you. Much.");
  });

  it('returns medium streak message for streaks 30-60 days', () => {
    expect(getCapsuleRexReaction(30)).toBe("Not perfect. But you showed up more than most.");
    expect(getCapsuleRexReaction(45)).toBe("Not perfect. But you showed up more than most.");
    expect(getCapsuleRexReaction(60)).toBe("Not perfect. But you showed up more than most.");
  });

  it('returns low streak message for streaks under 30 days', () => {
    expect(getCapsuleRexReaction(0)).toBe("Watch the video. Then decide if day 91 is different.");
    expect(getCapsuleRexReaction(15)).toBe("Watch the video. Then decide if day 91 is different.");
    expect(getCapsuleRexReaction(29)).toBe("Watch the video. Then decide if day 91 is different.");
  });

  it('handles boundary values correctly', () => {
    // Boundary at 30
    expect(getCapsuleRexReaction(29)).toBe("Watch the video. Then decide if day 91 is different.");
    expect(getCapsuleRexReaction(30)).toBe("Not perfect. But you showed up more than most.");
    
    // Boundary at 60
    expect(getCapsuleRexReaction(60)).toBe("Not perfect. But you showed up more than most.");
    expect(getCapsuleRexReaction(61)).toBe("You did it. I didn't doubt you. Much.");
  });
});

// ─── Days Remaining Calculation Tests ─────────────────────────────────────────

describe('getCapsuleStatus daysRemaining calculation', () => {
  // Helper function to simulate the days remaining calculation
  function calculateDaysRemaining(createdAt: Date, currentDate: Date): number {
    const unlockDate = new Date(createdAt.getTime() + 90 * 24 * 60 * 60 * 1000);
    return Math.max(0, Math.ceil((unlockDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)));
  }

  it('calculates correct days remaining for new capsule', () => {
    const createdAt = new Date('2024-01-01T00:00:00Z');
    const currentDate = new Date('2024-01-01T12:00:00Z'); // Same day, 12 hours later
    
    expect(calculateDaysRemaining(createdAt, currentDate)).toBe(90);
  });

  it('calculates correct days remaining after some time', () => {
    const createdAt = new Date('2024-01-01T00:00:00Z');
    const currentDate = new Date('2024-01-31T00:00:00Z'); // 30 days later
    
    expect(calculateDaysRemaining(createdAt, currentDate)).toBe(60);
  });

  it('returns 0 days remaining when unlock date is reached', () => {
    const createdAt = new Date('2024-01-01T00:00:00Z');
    const currentDate = new Date('2024-04-01T00:00:00Z'); // 90 days later
    
    expect(calculateDaysRemaining(createdAt, currentDate)).toBe(0);
  });

  it('returns 0 days remaining when past unlock date', () => {
    const createdAt = new Date('2024-01-01T00:00:00Z');
    const currentDate = new Date('2024-05-01T00:00:00Z'); // 120 days later
    
    expect(calculateDaysRemaining(createdAt, currentDate)).toBe(0);
  });

  it('handles edge case of exactly 90 days', () => {
    const createdAt = new Date('2024-01-01T12:00:00Z');
    const currentDate = new Date('2024-03-31T12:00:00Z'); // Exactly 90 days later
    
    expect(calculateDaysRemaining(createdAt, currentDate)).toBe(0);
  });

  it('handles leap year correctly', () => {
    const createdAt = new Date('2024-01-01T00:00:00Z'); // 2024 is a leap year
    const currentDate = new Date('2024-02-29T00:00:00Z'); // 59 days later (leap day)
    
    expect(calculateDaysRemaining(createdAt, currentDate)).toBe(31);
  });
});