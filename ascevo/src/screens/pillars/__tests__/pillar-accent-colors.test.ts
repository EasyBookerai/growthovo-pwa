/**
 * Test: Pillar Accent Color Mapping
 * 
 * Validates that each pillar card uses the correct accent color for its left border
 * as specified in Requirements 1.5-1.11
 */

import { PILLAR_COLORS } from '../../../types/pillars';

describe('Pillar Accent Colors', () => {
  it('should have correct accent color for Mental Health pillar', () => {
    expect(PILLAR_COLORS['mental-health']).toBe('#A78BFA');
  });

  it('should have correct accent color for Relationships pillar', () => {
    expect(PILLAR_COLORS['relationships']).toBe('#F472B6');
  });

  it('should have correct accent color for Career pillar', () => {
    expect(PILLAR_COLORS['career']).toBe('#60A5FA');
  });

  it('should have correct accent color for Fitness pillar', () => {
    expect(PILLAR_COLORS['fitness']).toBe('#34D399');
  });

  it('should have correct accent color for Finance pillar', () => {
    expect(PILLAR_COLORS['finance']).toBe('#FBBF24');
  });

  it('should have correct accent color for Hobbies pillar', () => {
    expect(PILLAR_COLORS['hobbies']).toBe('#F87171');
  });

  it('should have all 6 pillar colors defined', () => {
    const pillarKeys = Object.keys(PILLAR_COLORS);
    expect(pillarKeys).toHaveLength(6);
    expect(pillarKeys).toContain('mental-health');
    expect(pillarKeys).toContain('relationships');
    expect(pillarKeys).toContain('career');
    expect(pillarKeys).toContain('fitness');
    expect(pillarKeys).toContain('finance');
    expect(pillarKeys).toContain('hobbies');
  });
});
