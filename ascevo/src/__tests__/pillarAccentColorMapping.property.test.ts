/**
 * Property-Based Test: Pillar Accent Color Mapping
 * 
 * Feature: premium-pillars-experience
 * Property 3: Pillar Accent Color Mapping
 * Validates: Requirements 1.6, 1.7, 1.8, 1.9, 1.10, 1.11
 * 
 * Tests that for any pillar in the system, the accent color matches the specification:
 * - Mental Health → #A78BFA
 * - Relationships → #F472B6
 * - Career → #60A5FA
 * - Fitness → #34D399
 * - Finance → #FBBF24
 * - Hobbies → #F87171
 */

import fc from 'fast-check';
import { PILLAR_COLORS, VALID_PILLARS, PremiumPillarKey } from '../types/pillars';

describe('Property 3: Pillar Accent Color Mapping', () => {
  // Expected color mappings from requirements
  const EXPECTED_COLORS: Record<PremiumPillarKey, string> = {
    'mental-health': '#A78BFA',
    'relationships': '#F472B6',
    'career': '#60A5FA',
    'fitness': '#34D399',
    'finance': '#FBBF24',
    'hobbies': '#F87171',
  };

  it('should map each pillar key to the correct accent color for all 6 pillars', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_PILLARS),
        (pillarKey) => {
          const actualColor = PILLAR_COLORS[pillarKey];
          const expectedColor = EXPECTED_COLORS[pillarKey];
          
          // Color should match specification
          expect(actualColor).toBe(expectedColor);
          
          // Color should be a valid hex color (6 characters + #)
          expect(actualColor).toMatch(/^#[0-9A-F]{6}$/i);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have exactly 6 pillar colors defined', () => {
    const pillarKeys = Object.keys(PILLAR_COLORS) as PremiumPillarKey[];
    
    // Should have exactly 6 pillars
    expect(pillarKeys).toHaveLength(6);
    
    // All valid pillars should be present
    VALID_PILLARS.forEach(pillarKey => {
      expect(pillarKeys).toContain(pillarKey);
    });
  });

  it('should have unique colors for each pillar (no duplicates)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_PILLARS),
        fc.constantFrom(...VALID_PILLARS),
        (pillarKey1, pillarKey2) => {
          const color1 = PILLAR_COLORS[pillarKey1];
          const color2 = PILLAR_COLORS[pillarKey2];
          
          // If pillars are different, colors should be different
          if (pillarKey1 !== pillarKey2) {
            expect(color1).not.toBe(color2);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return consistent color for the same pillar across multiple lookups', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_PILLARS),
        (pillarKey) => {
          const color1 = PILLAR_COLORS[pillarKey];
          const color2 = PILLAR_COLORS[pillarKey];
          const color3 = PILLAR_COLORS[pillarKey];
          
          // Multiple lookups should return the same color
          expect(color1).toBe(color2);
          expect(color2).toBe(color3);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have all colors in uppercase hex format', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_PILLARS),
        (pillarKey) => {
          const color = PILLAR_COLORS[pillarKey];
          
          // Color should start with #
          expect(color).toMatch(/^#/);
          
          // Color should be 7 characters total (#RRGGBB)
          expect(color).toHaveLength(7);
          
          // Hex digits should be uppercase (as per spec)
          const hexPart = color.substring(1);
          expect(hexPart).toBe(hexPart.toUpperCase());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should map Mental Health to purple (#A78BFA)', () => {
    expect(PILLAR_COLORS['mental-health']).toBe('#A78BFA');
  });

  it('should map Relationships to pink (#F472B6)', () => {
    expect(PILLAR_COLORS['relationships']).toBe('#F472B6');
  });

  it('should map Career to blue (#60A5FA)', () => {
    expect(PILLAR_COLORS['career']).toBe('#60A5FA');
  });

  it('should map Fitness to green (#34D399)', () => {
    expect(PILLAR_COLORS['fitness']).toBe('#34D399');
  });

  it('should map Finance to yellow (#FBBF24)', () => {
    expect(PILLAR_COLORS['finance']).toBe('#FBBF24');
  });

  it('should map Hobbies to red (#F87171)', () => {
    expect(PILLAR_COLORS['hobbies']).toBe('#F87171');
  });
});
