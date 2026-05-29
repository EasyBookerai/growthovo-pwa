/**
 * Property-Based Test: Level Calculation from XP
 * 
 * Feature: premium-pillars-experience
 * Property 1: Level Calculation from XP
 * Validates: Requirements 16.1, 16.4, 16.5
 * 
 * Tests that for any XP value 0-4999:
 * - level = floor(xp / 500) + 1
 * - crossing 500-boundary increments level by exactly 1
 */

import fc from 'fast-check';
import { calculateLevel } from '../services/pillarXPService';

describe('Property 1: Level Calculation from XP', () => {
  it('should calculate level as floor(xp / 500) + 1 for any XP value 0-4999', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4999 }),
        (xp) => {
          const level = calculateLevel(xp);
          const expectedLevel = Math.floor(xp / 500) + 1;
          
          // Level should match formula
          expect(level).toBe(expectedLevel);
          
          // Level should be at least 1
          expect(level).toBeGreaterThanOrEqual(1);
          
          // Level should not exceed 10
          expect(level).toBeLessThanOrEqual(10);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should increment level by exactly 1 when crossing 500-boundary', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4499 }), // Max 4499 to allow +500
        (xp) => {
          const levelBefore = calculateLevel(xp);
          const levelAfter = calculateLevel(xp + 500);
          
          // Level should increment by exactly 1
          expect(levelAfter).toBe(levelBefore + 1);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should maintain level boundaries at multiples of 500', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9 }), // Levels 1-9
        (level) => {
          const xpAtLevelStart = (level - 1) * 500;
          const xpAtLevelEnd = level * 500 - 1;
          
          // XP at level start should give correct level
          expect(calculateLevel(xpAtLevelStart)).toBe(level);
          
          // XP at level end should give correct level
          expect(calculateLevel(xpAtLevelEnd)).toBe(level);
          
          // XP at next level start should increment level
          expect(calculateLevel(xpAtLevelEnd + 1)).toBe(level + 1);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should be monotonically increasing (never decrease with more XP)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4999 }),
        fc.integer({ min: 1, max: 1000 }),
        (xp, delta) => {
          const levelBefore = calculateLevel(xp);
          const levelAfter = calculateLevel(Math.min(xp + delta, 4999));
          
          // Level should never decrease
          expect(levelAfter).toBeGreaterThanOrEqual(levelBefore);
        }
      ),
      { numRuns: 100 }
    );
  });
});
