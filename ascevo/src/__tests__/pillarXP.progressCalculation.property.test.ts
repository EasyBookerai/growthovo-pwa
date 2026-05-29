/**
 * Property-Based Test: Progress Percentage Calculation
 * 
 * Feature: premium-pillars-experience
 * Property 2: Progress Percentage Calculation
 * Validates: Requirements 16.2, 16.3
 * 
 * Tests that for any XP value:
 * - progress = ((xp mod 500) / 500) * 100
 * - result is always between 0 (inclusive) and 100 (exclusive)
 */

import fc from 'fast-check';
import { calculateProgress } from '../services/pillarXPService';

describe('Property 2: Progress Percentage Calculation', () => {
  it('should calculate progress as ((xp mod 500) / 500) * 100 for any XP value', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4999 }),
        (xp) => {
          const progress = calculateProgress(xp);
          const expected = ((xp % 500) / 500) * 100;
          
          // Progress should match formula
          expect(progress).toBeCloseTo(expected, 2);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should always return value between 0 (inclusive) and 100 (exclusive)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4999 }),
        (xp) => {
          const progress = calculateProgress(xp);
          
          // Progress should be >= 0
          expect(progress).toBeGreaterThanOrEqual(0);
          
          // Progress should be < 100
          expect(progress).toBeLessThan(100);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should reset to 0 at level boundaries (multiples of 500)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // Levels 1-10
        (level) => {
          const xpAtLevelStart = (level - 1) * 500;
          const progress = calculateProgress(xpAtLevelStart);
          
          // Progress should be 0 at level start
          expect(progress).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should be monotonically increasing within a level', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 499 }), // Within a single level
        fc.integer({ min: 1, max: 100 }),
        (xpInLevel, delta) => {
          const xp1 = xpInLevel;
          const xp2 = Math.min(xpInLevel + delta, 499);
          
          const progress1 = calculateProgress(xp1);
          const progress2 = calculateProgress(xp2);
          
          // Progress should increase or stay same
          expect(progress2).toBeGreaterThanOrEqual(progress1);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should approach 100% as XP approaches level boundary', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // Levels 1-10
        (level) => {
          const xpNearBoundary = level * 500 - 1;
          const progress = calculateProgress(xpNearBoundary);
          
          // Progress should be very close to 100% (but less than)
          expect(progress).toBeGreaterThan(99);
          expect(progress).toBeLessThan(100);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should maintain progress + remaining = 100% invariant', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4999 }),
        (xp) => {
          const progress = calculateProgress(xp);
          const currentLevelXP = xp % 500;
          const remaining = 500 - currentLevelXP;
          const remainingPercentage = (remaining / 500) * 100;
          
          // Progress + remaining should equal 100%
          expect(progress + remainingPercentage).toBeCloseTo(100, 1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
