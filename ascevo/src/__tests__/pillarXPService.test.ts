/**
 * Unit tests for pillarXPService
 * 
 * Tests XP calculation functions with specific examples and edge cases.
 */

import {
  calculateLevel,
  calculateProgress,
  getXPToNextLevel,
  validateXP,
  validateXPAmount,
} from '../services/pillarXPService';

describe('pillarXPService', () => {
  describe('calculateLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevel(0)).toBe(1);
    });
    
    it('should return level 1 for XP < 500', () => {
      expect(calculateLevel(250)).toBe(1);
      expect(calculateLevel(499)).toBe(1);
    });
    
    it('should return level 2 for 500 XP', () => {
      expect(calculateLevel(500)).toBe(2);
    });
    
    it('should return level 2 for XP between 500-999', () => {
      expect(calculateLevel(750)).toBe(2);
      expect(calculateLevel(999)).toBe(2);
    });
    
    it('should return level 3 for 1000 XP', () => {
      expect(calculateLevel(1000)).toBe(3);
    });
    
    it('should return level 10 for 4500 XP', () => {
      expect(calculateLevel(4500)).toBe(10);
    });
    
    it('should cap at level 10 for XP >= 5000', () => {
      expect(calculateLevel(5000)).toBe(10);
      expect(calculateLevel(10000)).toBe(10);
    });
    
    it('should handle negative XP by returning level 1', () => {
      expect(calculateLevel(-100)).toBe(1);
    });
  });
  
  describe('calculateProgress', () => {
    it('should return 0% for 0 XP', () => {
      expect(calculateProgress(0)).toBe(0);
    });
    
    it('should return 50% for 250 XP', () => {
      expect(calculateProgress(250)).toBe(50);
    });
    
    it('should return ~99.8% for 499 XP', () => {
      expect(calculateProgress(499)).toBeCloseTo(99.8, 1);
    });
    
    it('should return 0% for 500 XP (new level)', () => {
      expect(calculateProgress(500)).toBe(0);
    });
    
    it('should return 50% for 750 XP (level 2, 250/500)', () => {
      expect(calculateProgress(750)).toBe(50);
    });
    
    it('should return 0% for 1000 XP (level 3)', () => {
      expect(calculateProgress(1000)).toBe(0);
    });
    
    it('should always return value < 100', () => {
      for (let xp = 0; xp < 5000; xp += 100) {
        const progress = calculateProgress(xp);
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThan(100);
      }
    });
    
    it('should handle negative XP by returning 0%', () => {
      expect(calculateProgress(-100)).toBe(0);
    });
  });
  
  describe('getXPToNextLevel', () => {
    it('should return 500 for 0 XP', () => {
      expect(getXPToNextLevel(0)).toBe(500);
    });
    
    it('should return 250 for 250 XP', () => {
      expect(getXPToNextLevel(250)).toBe(250);
    });
    
    it('should return 1 for 499 XP', () => {
      expect(getXPToNextLevel(499)).toBe(1);
    });
    
    it('should return 500 for 500 XP (new level)', () => {
      expect(getXPToNextLevel(500)).toBe(500);
    });
    
    it('should return 250 for 750 XP', () => {
      expect(getXPToNextLevel(750)).toBe(250);
    });
    
    it('should return 500 for 1000 XP (level 3)', () => {
      expect(getXPToNextLevel(1000)).toBe(500);
    });
    
    it('should always return value between 1 and 500', () => {
      for (let xp = 0; xp < 5000; xp += 100) {
        const remaining = getXPToNextLevel(xp);
        expect(remaining).toBeGreaterThanOrEqual(1);
        expect(remaining).toBeLessThanOrEqual(500);
      }
    });
    
    it('should handle negative XP by returning 500', () => {
      expect(getXPToNextLevel(-100)).toBe(500);
    });
  });
  
  describe('validateXP', () => {
    it('should return true for valid XP values', () => {
      expect(validateXP(0)).toBe(true);
      expect(validateXP(100)).toBe(true);
      expect(validateXP(5000)).toBe(true);
    });
    
    it('should return false for negative XP', () => {
      expect(validateXP(-1)).toBe(false);
      expect(validateXP(-100)).toBe(false);
    });
    
    it('should return false for non-integer XP', () => {
      expect(validateXP(100.5)).toBe(false);
      expect(validateXP(250.99)).toBe(false);
    });
    
    it('should return false for non-number values', () => {
      expect(validateXP(NaN)).toBe(false);
      expect(validateXP(Infinity)).toBe(false);
    });
  });
  
  describe('validateXPAmount', () => {
    it('should return true for valid XP amounts', () => {
      expect(validateXPAmount(1)).toBe(true);
      expect(validateXPAmount(50)).toBe(true);
      expect(validateXPAmount(500)).toBe(true);
      expect(validateXPAmount(1000)).toBe(true);
    });
    
    it('should return false for zero or negative amounts', () => {
      expect(validateXPAmount(0)).toBe(false);
      expect(validateXPAmount(-1)).toBe(false);
      expect(validateXPAmount(-100)).toBe(false);
    });
    
    it('should return false for amounts > 1000', () => {
      expect(validateXPAmount(1001)).toBe(false);
      expect(validateXPAmount(5000)).toBe(false);
    });
    
    it('should return false for non-integer amounts', () => {
      expect(validateXPAmount(50.5)).toBe(false);
      expect(validateXPAmount(100.99)).toBe(false);
    });
    
    it('should return false for non-number values', () => {
      expect(validateXPAmount(NaN)).toBe(false);
      expect(validateXPAmount(Infinity)).toBe(false);
    });
  });
  
  describe('XP system invariants', () => {
    it('should maintain level = floor(xp / 500) + 1 for all valid XP', () => {
      for (let xp = 0; xp < 5000; xp += 50) {
        const level = calculateLevel(xp);
        const expectedLevel = Math.floor(xp / 500) + 1;
        expect(level).toBe(Math.min(expectedLevel, 10));
      }
    });
    
    it('should maintain progress + remaining = 100% for all valid XP', () => {
      for (let xp = 0; xp < 5000; xp += 100) {
        const progress = calculateProgress(xp);
        const remaining = getXPToNextLevel(xp);
        const totalPercentage = progress + (remaining / 500) * 100;
        expect(totalPercentage).toBeCloseTo(100, 1);
      }
    });
    
    it('should increment level by 1 when crossing 500-boundary', () => {
      for (let xp = 0; xp < 4500; xp += 500) {
        const levelBefore = calculateLevel(xp);
        const levelAfter = calculateLevel(xp + 500);
        expect(levelAfter).toBe(levelBefore + 1);
      }
    });
  });
});
