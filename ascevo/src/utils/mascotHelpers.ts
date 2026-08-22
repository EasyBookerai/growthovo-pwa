/**
 * Mascot Helper Utilities
 * 
 * Utility functions for mascot calculations and formatting
 */

import { MascotStage, MascotStatus } from '../types/mascot';

/**
 * Calculate XP needed for a specific level
 */
export function calculateXPForLevel(level: number): number {
  // Formula: XP = Level^2 * 50
  return level * level * 50;
}

/**
 * Calculate level from XP amount
 */
export function calculateLevelFromXP(xp: number): number {
  // Formula: Level = floor(sqrt(XP / 50))
  return Math.max(1, Math.floor(Math.sqrt(xp * 0.02)));
}

/**
 * Get XP range for current level
 */
export function getLevelXPRange(level: number): { min: number; max: number } {
  return {
    min: calculateXPForLevel(level),
    max: calculateXPForLevel(level + 1) - 1,
  };
}

/**
 * Calculate progress percentage within current level
 */
export function calculateLevelProgress(currentXP: number): number {
  const level = calculateLevelFromXP(currentXP);
  const range = getLevelXPRange(level);
  const xpInLevel = currentXP - range.min;
  const xpForLevel = range.max - range.min + 1;
  return Math.min(100, Math.max(0, (xpInLevel / xpForLevel) * 100));
}

/**
 * Get mascot stage from XP and level
 */
export function getMascotStageFromProgress(
  xp: number,
  level: number
): MascotStage {
  if (level >= 50 || xp >= 2500) return MascotStage.MASTER;
  if (level >= 25 || xp >= 1250) return MascotStage.JUVENILE;
  if (level >= 10 || xp >= 500) return MascotStage.HATCHLING;
  return MascotStage.EGG;
}

/**
 * Check if user will evolve with additional XP
 */
export function willEvolveWithXP(
  currentXP: number,
  currentLevel: number,
  xpToAdd: number
): { willEvolve: boolean; newStage: MascotStage | null } {
  const currentStage = getMascotStageFromProgress(currentXP, currentLevel);
  const newXP = currentXP + xpToAdd;
  const newLevel = calculateLevelFromXP(newXP);
  const newStage = getMascotStageFromProgress(newXP, newLevel);

  return {
    willEvolve: newStage > currentStage,
    newStage: newStage > currentStage ? newStage : null,
  };
}

/**
 * Get requirements for next stage
 */
export function getNextStageRequirements(
  currentStage: MascotStage
): { level: number; xp: number } | null {
  const requirements: Record<
    MascotStage,
    { level: number; xp: number } | null
  > = {
    [MascotStage.EGG]: { level: 10, xp: 500 },
    [MascotStage.HATCHLING]: { level: 25, xp: 1250 },
    [MascotStage.JUVENILE]: { level: 50, xp: 2500 },
    [MascotStage.MASTER]: null, // Max stage
  };

  return requirements[currentStage];
}

/**
 * Format XP with thousands separator
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString();
}

/**
 * Get stage color (for UI theming)
 */
export function getStageColor(stage: MascotStage): string {
  const colors: Record<MascotStage, string> = {
    [MascotStage.EGG]: '#D4C5B9',
    [MascotStage.HATCHLING]: '#F4A460',
    [MascotStage.JUVENILE]: '#8B7355',
    [MascotStage.MASTER]: '#FFD700',
  };
  return colors[stage];
}

/**
 * Get stage emoji
 */
export function getStageEmoji(stage: MascotStage): string {
  const emojis: Record<MascotStage, string> = {
    [MascotStage.EGG]: '🥚',
    [MascotStage.HATCHLING]: '🐣',
    [MascotStage.JUVENILE]: '🦅',
    [MascotStage.MASTER]: '👑',
  };
  return emojis[stage];
}

/**
 * Get encouragement message based on progress
 */
export function getEncouragementMessage(status: MascotStatus): string {
  const { stageId, currentLevel, xpForNextStage } = status;

  if (stageId === MascotStage.MASTER) {
    return "You've mastered it all! Amazing work! 🎉";
  }

  if (xpForNextStage <= 100) {
    return "So close to evolution! Keep going! 🔥";
  }

  if (currentLevel % 5 === 0) {
    return `Level ${currentLevel}! You're crushing it! 💪`;
  }

  const messages = [
    "Keep growing! Your Growthovo is getting stronger! 🌱",
    "Great progress! Every lesson counts! ⭐",
    "You're doing amazing! Keep it up! 🚀",
    "Steady progress leads to evolution! 📈",
    "Your dedication is showing! Keep learning! 📚",
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Calculate days until next evolution (estimated)
 */
export function estimateDaysToEvolution(
  xpForNextStage: number,
  averageXPPerDay: number
): number {
  if (averageXPPerDay === 0 || xpForNextStage === 0) return 0;
  return Math.ceil(xpForNextStage / averageXPPerDay);
}

/**
 * Get milestone achievements for current stage
 */
export function getStageMilestones(stage: MascotStage): string[] {
  const milestones: Record<MascotStage, string[]> = {
    [MascotStage.EGG]: [
      'Started your growth journey',
      'Completed your first lesson',
    ],
    [MascotStage.HATCHLING]: [
      'Reached Level 10',
      'Hatched your first evolution',
      'Earned 500 XP',
    ],
    [MascotStage.JUVENILE]: [
      'Reached Level 25',
      'Unlocked aviator gear',
      'Earned 1,250 XP',
    ],
    [MascotStage.MASTER]: [
      'Reached Level 50',
      'Achieved Master status',
      'Earned 2,500 XP',
      'Unlocked crown and armor',
    ],
  };
  return milestones[stage];
}

/**
 * Check if stage has visual glow effect
 */
export function shouldShowGlow(stage: MascotStage): boolean {
  return stage === MascotStage.MASTER;
}

/**
 * Get stage description for display
 */
export function getStageDescription(stage: MascotStage): string {
  const descriptions: Record<MascotStage, string> = {
    [MascotStage.EGG]:
      'Your growth journey begins! Complete lessons to hatch your Growthovo.',
    [MascotStage.HATCHLING]:
      'Your Growthovo has hatched! Keep learning to help it grow stronger.',
    [MascotStage.JUVENILE]:
      'Your Growthovo is maturing! Soon it will reach its full potential.',
    [MascotStage.MASTER]:
      'You've reached the pinnacle! Your Master Griffin represents your dedication.',
  };
  return descriptions[stage];
}

/**
 * Generate share text for social media
 */
export function generateShareText(status: MascotStatus): string {
  const emoji = getStageEmoji(status.stageId);
  return `${emoji} I just reached Level ${status.currentLevel} in Growthovo! My mascot has evolved to ${status.stageName}! 🚀 #Growthovo #PersonalGrowth`;
}
