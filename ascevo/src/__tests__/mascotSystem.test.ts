/**
 * Mascot Evolution System Tests
 * 
 * Tests for mascot progression logic and calculations
 */

import {
  calculateXPForLevel,
  calculateLevelFromXP,
  calculateLevelProgress,
  getMascotStageFromProgress,
  willEvolveWithXP,
  getNextStageRequirements,
} from '../utils/mascotHelpers';
import { MascotStage } from '../types/mascot';

describe('Mascot XP and Level Calculations', () => {
  describe('calculateXPForLevel', () => {
    it('should calculate correct XP for level 1', () => {
      expect(calculateXPForLevel(1)).toBe(50);
    });

    it('should calculate correct XP for level 10', () => {
      expect(calculateXPForLevel(10)).toBe(5000);
    });

    it('should calculate correct XP for level 25', () => {
      expect(calculateXPForLevel(25)).toBe(31250);
    });

    it('should calculate correct XP for level 50', () => {
      expect(calculateXPForLevel(50)).toBe(125000);
    });
  });

  describe('calculateLevelFromXP', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevelFromXP(0)).toBe(1);
    });

    it('should return level 10 for 500 XP', () => {
      expect(calculateLevelFromXP(500)).toBe(10);
    });

    it('should return level 25 for 1250 XP', () => {
      expect(calculateLevelFromXP(1250)).toBe(25);
    });

    it('should return level 50 for 2500 XP', () => {
      expect(calculateLevelFromXP(2500)).toBe(50);
    });

    it('should handle fractional levels correctly', () => {
      expect(calculateLevelFromXP(600)).toBe(10);
      expect(calculateLevelFromXP(750)).toBe(12);
    });
  });

  describe('calculateLevelProgress', () => {
    it('should return 0% at level start', () => {
      expect(calculateLevelProgress(0)).toBe(0);
    });

    it('should return value between 0-100', () => {
      const progress = calculateLevelProgress(250);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it('should increase with more XP', () => {
      const progress1 = calculateLevelProgress(100);
      const progress2 = calculateLevelProgress(200);
      expect(progress2).toBeGreaterThan(progress1);
    });
  });
});

describe('Mascot Stage Determination', () => {
  describe('getMascotStageFromProgress', () => {
    it('should return EGG for new users', () => {
      expect(getMascotStageFromProgress(0, 1)).toBe(MascotStage.EGG);
      expect(getMascotStageFromProgress(100, 5)).toBe(MascotStage.EGG);
    });

    it('should return HATCHLING at level 10', () => {
      expect(getMascotStageFromProgress(500, 10)).toBe(MascotStage.HATCHLING);
    });

    it('should return HATCHLING with 500 XP regardless of level', () => {
      expect(getMascotStageFromProgress(500, 5)).toBe(MascotStage.HATCHLING);
    });

    it('should return JUVENILE at level 25', () => {
      expect(getMascotStageFromProgress(1250, 25)).toBe(MascotStage.JUVENILE);
    });

    it('should return JUVENILE with 1250 XP regardless of level', () => {
      expect(getMascotStageFromProgress(1250, 15)).toBe(MascotStage.JUVENILE);
    });

    it('should return MASTER at level 50', () => {
      expect(getMascotStageFromProgress(2500, 50)).toBe(MascotStage.MASTER);
    });

    it('should return MASTER with 2500 XP regardless of level', () => {
      expect(getMascotStageFromProgress(2500, 30)).toBe(MascotStage.MASTER);
    });
  });

  describe('willEvolveWithXP', () => {
    it('should detect evolution from EGG to HATCHLING', () => {
      const result = willEvolveWithXP(400, 9, 100);
      expect(result.willEvolve).toBe(true);
      expect(result.newStage).toBe(MascotStage.HATCHLING);
    });

    it('should not detect evolution if staying in same stage', () => {
      const result = willEvolveWithXP(100, 5, 50);
      expect(result.willEvolve).toBe(false);
      expect(result.newStage).toBe(null);
    });

    it('should detect evolution from HATCHLING to JUVENILE', () => {
      const result = willEvolveWithXP(1200, 24, 50);
      expect(result.willEvolve).toBe(true);
      expect(result.newStage).toBe(MascotStage.JUVENILE);
    });

    it('should detect evolution from JUVENILE to MASTER', () => {
      const result = willEvolveWithXP(2400, 49, 100);
      expect(result.willEvolve).toBe(true);
      expect(result.newStage).toBe(MascotStage.MASTER);
    });
  });

  describe('getNextStageRequirements', () => {
    it('should return requirements for HATCHLING from EGG', () => {
      const req = getNextStageRequirements(MascotStage.EGG);
      expect(req).toEqual({ level: 10, xp: 500 });
    });

    it('should return requirements for JUVENILE from HATCHLING', () => {
      const req = getNextStageRequirements(MascotStage.HATCHLING);
      expect(req).toEqual({ level: 25, xp: 1250 });
    });

    it('should return requirements for MASTER from JUVENILE', () => {
      const req = getNextStageRequirements(MascotStage.JUVENILE);
      expect(req).toEqual({ level: 50, xp: 2500 });
    });

    it('should return null for MASTER (max stage)', () => {
      const req = getNextStageRequirements(MascotStage.MASTER);
      expect(req).toBe(null);
    });
  });
});

describe('Mascot Evolution Scenarios', () => {
  it('should handle complete journey from EGG to MASTER', () => {
    let xp = 0;
    let level = 1;

    // Start as EGG
    expect(getMascotStageFromProgress(xp, level)).toBe(MascotStage.EGG);

    // Add XP to reach HATCHLING
    xp = 500;
    level = calculateLevelFromXP(xp);
    expect(getMascotStageFromProgress(xp, level)).toBe(MascotStage.HATCHLING);

    // Add XP to reach JUVENILE
    xp = 1250;
    level = calculateLevelFromXP(xp);
    expect(getMascotStageFromProgress(xp, level)).toBe(MascotStage.JUVENILE);

    // Add XP to reach MASTER
    xp = 2500;
    level = calculateLevelFromXP(xp);
    expect(getMascotStageFromProgress(xp, level)).toBe(MascotStage.MASTER);
  });

  it('should handle lesson completion XP gains', () => {
    const lessonXP = 50;
    let totalXP = 0;

    // Complete 10 lessons (500 XP)
    for (let i = 0; i < 10; i++) {
      totalXP += lessonXP;
    }

    expect(totalXP).toBe(500);
    const level = calculateLevelFromXP(totalXP);
    expect(getMascotStageFromProgress(totalXP, level)).toBe(
      MascotStage.HATCHLING
    );
  });

  it('should handle daily challenge XP gains', () => {
    const challengeXP = 30;
    let totalXP = 0;

    // Complete challenges for ~17 days
    for (let i = 0; i < 17; i++) {
      totalXP += challengeXP;
    }

    expect(totalXP).toBe(510);
    const level = calculateLevelFromXP(totalXP);
    expect(getMascotStageFromProgress(totalXP, level)).toBe(
      MascotStage.HATCHLING
    );
  });
});

describe('Edge Cases', () => {
  it('should handle negative XP gracefully', () => {
    expect(calculateLevelFromXP(-100)).toBe(1);
  });

  it('should handle very large XP values', () => {
    const largeXP = 1000000;
    const level = calculateLevelFromXP(largeXP);
    expect(level).toBeGreaterThan(0);
    expect(getMascotStageFromProgress(largeXP, level)).toBe(MascotStage.MASTER);
  });

  it('should handle exactly threshold values', () => {
    expect(getMascotStageFromProgress(500, 10)).toBe(MascotStage.HATCHLING);
    expect(getMascotStageFromProgress(1250, 25)).toBe(MascotStage.JUVENILE);
    expect(getMascotStageFromProgress(2500, 50)).toBe(MascotStage.MASTER);
  });

  it('should handle one XP below threshold', () => {
    expect(getMascotStageFromProgress(499, 9)).toBe(MascotStage.EGG);
    expect(getMascotStageFromProgress(1249, 24)).toBe(MascotStage.HATCHLING);
    expect(getMascotStageFromProgress(2499, 49)).toBe(MascotStage.JUVENILE);
  });
});
