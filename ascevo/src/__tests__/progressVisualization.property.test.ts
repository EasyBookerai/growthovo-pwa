// 🧪 Property-Based Tests for Progress Visualization
// Tests universal properties across all inputs using fast-check
// Validates Requirements 7.3, 7.5

import fc from 'fast-check';
import { colors } from '../theme';
import {
  getProgressColor,
  shouldTriggerCompletionAnimation,
  normalizeProgress,
} from '../utils/progressVisualization';

describe('Property Tests: Progress Visualization', () => {
  /**
   * Property 26: Progress Color Mapping
   * For any progress percentage, the color should map correctly to the appropriate level
   * (low, medium, high, complete).
   * **Validates: Requirements 7.3**
   */
  describe('Property 26: Progress Color Mapping', () => {
    it('should map progress 0-24% to low color (error)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 24 }),
          (progress) => {
            const color = getProgressColor(progress);
            expect(color).toBe(colors.error);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should map progress 25-49% to medium color (warning)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 25, max: 49 }),
          (progress) => {
            const color = getProgressColor(progress);
            expect(color).toBe(colors.warning);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should map progress 50-99% to high color (info)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 99 }),
          (progress) => {
            const color = getProgressColor(progress);
            expect(color).toBe(colors.info);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should map progress 100% to complete color (success)', () => {
      fc.assert(
        fc.property(
          fc.constant(100),
          (progress) => {
            const color = getProgressColor(progress);
            expect(color).toBe(colors.success);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should map any progress percentage to exactly one of four colors', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (progress) => {
            const color = getProgressColor(progress);
            const validColors = [colors.error, colors.warning, colors.info, colors.success];
            
            // Color must be one of the four valid colors
            expect(validColors).toContain(color);
            
            // Color should be deterministic for the same progress value
            const color2 = getProgressColor(progress);
            expect(color).toBe(color2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have monotonic color transitions (no skipping levels)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (progress) => {
            const color = getProgressColor(progress);
            
            // Define color order: error < warning < info < success
            const colorOrder = [colors.error, colors.warning, colors.info, colors.success];
            const colorIndex = colorOrder.indexOf(color);
            
            // Color should be in the defined order
            expect(colorIndex).toBeGreaterThanOrEqual(0);
            expect(colorIndex).toBeLessThan(4);
            
            // If progress increases by 1, color should stay same or advance
            if (progress < 100) {
              const nextColor = getProgressColor(progress + 1);
              const nextColorIndex = colorOrder.indexOf(nextColor);
              
              // Next color index should be >= current (no going backwards)
              expect(nextColorIndex).toBeGreaterThanOrEqual(colorIndex);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle boundary values correctly', () => {
      // Test exact boundaries
      expect(getProgressColor(0)).toBe(colors.error);
      expect(getProgressColor(24)).toBe(colors.error);
      expect(getProgressColor(25)).toBe(colors.warning);
      expect(getProgressColor(49)).toBe(colors.warning);
      expect(getProgressColor(50)).toBe(colors.info);
      expect(getProgressColor(99)).toBe(colors.info);
      expect(getProgressColor(100)).toBe(colors.success);
    });

    it('should map progress with decimal values correctly', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          (progress) => {
            const color = getProgressColor(progress);
            const validColors = [colors.error, colors.warning, colors.info, colors.success];
            
            expect(validColors).toContain(color);
            
            // Verify color matches the integer floor value
            const floorProgress = Math.floor(progress);
            const expectedColor = getProgressColor(floorProgress);
            expect(color).toBe(expectedColor);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle negative and over-100 values gracefully', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 200 }),
          (progress) => {
            const normalized = normalizeProgress(progress);
            const color = getProgressColor(normalized);
            const validColors = [colors.error, colors.warning, colors.info, colors.success];
            
            // Normalized value should be in valid range
            expect(normalized).toBeGreaterThanOrEqual(0);
            expect(normalized).toBeLessThanOrEqual(100);
            
            // Color should be valid
            expect(validColors).toContain(color);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have consistent color for same progress across multiple calls', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (progress) => {
            const color1 = getProgressColor(progress);
            const color2 = getProgressColor(progress);
            const color3 = getProgressColor(progress);
            
            // All calls should return the same color
            expect(color1).toBe(color2);
            expect(color2).toBe(color3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should cover all four color levels across the full range', () => {
      const allColors = new Set<string>();
      
      for (let progress = 0; progress <= 100; progress++) {
        const color = getProgressColor(progress);
        allColors.add(color);
      }
      
      // All four colors should be used across the full range
      expect(allColors.size).toBe(4);
      expect(allColors.has(colors.error)).toBe(true);
      expect(allColors.has(colors.warning)).toBe(true);
      expect(allColors.has(colors.info)).toBe(true);
      expect(allColors.has(colors.success)).toBe(true);
    });
  });

  /**
   * Property 27: Completion Animation Trigger
   * For any progress that reaches exactly 100%, a completion animation should be triggered.
   * **Validates: Requirements 7.5**
   */
  describe('Property 27: Completion Animation Trigger', () => {
    it('should trigger completion animation when progress reaches 100%', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 99 }), // old progress (not complete)
          (oldProgress) => {
            const newProgress = 100;
            const shouldTrigger = shouldTriggerCompletionAnimation(oldProgress, newProgress);
            
            // Animation should trigger when reaching 100% from any lower value
            expect(shouldTrigger).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should NOT trigger completion animation when progress is already 100%', () => {
      fc.assert(
        fc.property(
          fc.constant(100), // old progress already at 100%
          (oldProgress) => {
            const newProgress = 100;
            const shouldTrigger = shouldTriggerCompletionAnimation(oldProgress, newProgress);
            
            // Animation should NOT re-trigger when already at 100%
            expect(shouldTrigger).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should NOT trigger completion animation for progress below 100%', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 99 }), // old progress
          fc.integer({ min: 0, max: 99 }), // new progress (not complete)
          (oldProgress, newProgress) => {
            const shouldTrigger = shouldTriggerCompletionAnimation(oldProgress, newProgress);
            
            // Animation should NOT trigger when not reaching 100%
            expect(shouldTrigger).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should trigger completion animation exactly once per completion', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 99 }),
          (startProgress) => {
            // First transition to 100%
            const trigger1 = shouldTriggerCompletionAnimation(startProgress, 100);
            expect(trigger1).toBe(true);
            
            // Subsequent checks at 100% should not trigger
            const trigger2 = shouldTriggerCompletionAnimation(100, 100);
            expect(trigger2).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle completion from any starting progress value', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 99 }),
          (oldProgress) => {
            const newProgress = 100;
            const shouldTrigger = shouldTriggerCompletionAnimation(oldProgress, newProgress);
            
            // Should trigger regardless of starting value (as long as < 100)
            expect(shouldTrigger).toBe(true);
            
            // Verify the condition: new is 100 and old is less
            expect(newProgress).toBe(100);
            expect(oldProgress).toBeLessThan(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case: 99% to 100% transition', () => {
      const shouldTrigger = shouldTriggerCompletionAnimation(99, 100);
      expect(shouldTrigger).toBe(true);
    });

    it('should handle edge case: 0% to 100% transition', () => {
      const shouldTrigger = shouldTriggerCompletionAnimation(0, 100);
      expect(shouldTrigger).toBe(true);
    });

    it('should NOT trigger for backwards progress from 100%', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 99 }),
          (newProgress) => {
            const oldProgress = 100;
            const shouldTrigger = shouldTriggerCompletionAnimation(oldProgress, newProgress);
            
            // Should NOT trigger when going backwards from 100%
            expect(shouldTrigger).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be deterministic for same input values', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          (oldProgress, newProgress) => {
            const result1 = shouldTriggerCompletionAnimation(oldProgress, newProgress);
            const result2 = shouldTriggerCompletionAnimation(oldProgress, newProgress);
            const result3 = shouldTriggerCompletionAnimation(oldProgress, newProgress);
            
            // All calls with same inputs should return same result
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle decimal progress values correctly', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 99.99, noNaN: true }),
          (oldProgress) => {
            const newProgress = 100;
            const shouldTrigger = shouldTriggerCompletionAnimation(oldProgress, newProgress);
            
            // Should trigger when reaching 100 from any decimal value below
            expect(shouldTrigger).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should only trigger on exact 100%, not values above', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 99 }),
          fc.integer({ min: 101, max: 200 }),
          (oldProgress, newProgress) => {
            const shouldTrigger = shouldTriggerCompletionAnimation(oldProgress, newProgress);
            
            // Should NOT trigger for values above 100%
            expect(shouldTrigger).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional Property: Progress Normalization
   * For any progress value, normalization should clamp to valid range
   */
  describe('Additional Property: Progress Normalization', () => {
    it('should clamp negative values to 0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: -1 }),
          (progress) => {
            const normalized = normalizeProgress(progress);
            expect(normalized).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should clamp values above 100 to 100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 101, max: 1000 }),
          (progress) => {
            const normalized = normalizeProgress(progress);
            expect(normalized).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve values in valid range 0-100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (progress) => {
            const normalized = normalizeProgress(progress);
            expect(normalized).toBe(progress);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return value in range 0-100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -10000, max: 10000 }),
          (progress) => {
            const normalized = normalizeProgress(progress);
            expect(normalized).toBeGreaterThanOrEqual(0);
            expect(normalized).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Integration Property: Color and Completion Animation Coordination
   * Validates that color mapping and completion animation work together correctly
   */
  describe('Integration Property: Color and Completion Coordination', () => {
    it('should show success color when completion animation triggers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 99 }),
          (oldProgress) => {
            const newProgress = 100;
            
            // Check if completion animation should trigger
            const shouldTrigger = shouldTriggerCompletionAnimation(oldProgress, newProgress);
            
            // Check color at completion
            const color = getProgressColor(newProgress);
            
            // When completion animation triggers, color should be success
            if (shouldTrigger) {
              expect(color).toBe(colors.success);
              expect(newProgress).toBe(100);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should transition through all color levels before completion', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (finalProgress) => {
            const colorsEncountered = new Set<string>();
            
            // Simulate progress from 0 to finalProgress
            for (let p = 0; p <= finalProgress; p++) {
              const color = getProgressColor(p);
              colorsEncountered.add(color);
            }
            
            // Verify color progression
            if (finalProgress >= 0) {
              expect(colorsEncountered.has(colors.error)).toBe(true);
            }
            if (finalProgress >= 25) {
              expect(colorsEncountered.has(colors.warning)).toBe(true);
            }
            if (finalProgress >= 50) {
              expect(colorsEncountered.has(colors.info)).toBe(true);
            }
            if (finalProgress >= 100) {
              expect(colorsEncountered.has(colors.success)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never trigger completion animation before reaching success color', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 99 }),
          fc.integer({ min: 0, max: 99 }),
          (oldProgress, newProgress) => {
            const shouldTrigger = shouldTriggerCompletionAnimation(oldProgress, newProgress);
            const color = getProgressColor(newProgress);
            
            // If not at success color, completion animation should not trigger
            if (color !== colors.success) {
              expect(shouldTrigger).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
