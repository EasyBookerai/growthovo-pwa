/**
 * Growthovo Mascot Evolution Types
 * 
 * Defines TypeScript interfaces for the mascot progression system
 */

/**
 * Mascot evolution stages
 */
export enum MascotStage {
  EGG = 1,
  HATCHLING = 2,
  JUVENILE = 3,
  MASTER = 4,
}

/**
 * Mascot stage names (for display)
 */
export const MASCOT_STAGE_NAMES: Record<MascotStage, string> = {
  [MascotStage.EGG]: 'Egg',
  [MascotStage.HATCHLING]: 'Hatchling',
  [MascotStage.JUVENILE]: 'Juvenile Griffin',
  [MascotStage.MASTER]: 'Master Griffin',
};

/**
 * Mascot stage requirements
 */
export interface MascotStageData {
  id: MascotStage;
  name: string;
  description: string;
  minLevel: number;
  minXP: number;
  displayOrder: number;
}

/**
 * User's current mascot progress
 */
export interface UserMascotProgress {
  userId: string;
  currentStage: MascotStage;
  totalXP: number;
  currentLevel: number;
  lastEvolutionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Complete mascot status (includes progress to next stage)
 */
export interface MascotStatus {
  stageId: MascotStage;
  stageName: string;
  stageDescription: string;
  currentLevel: number;
  totalXP: number;
  xpForNextLevel: number;
  xpForNextStage: number;
  nextStageLevel: number;
  lastEvolutionAt: string | null;
}

/**
 * Evolution event data (returned when mascot evolves)
 */
export interface MascotEvolutionEvent {
  newStage: MascotStage;
  newLevel: number;
  newXP: number;
  evolved: boolean;
  previousStage: MascotStage;
}

/**
 * Evolution history record
 */
export interface MascotEvolutionHistory {
  id: string;
  userId: string;
  fromStage: MascotStage;
  toStage: MascotStage;
  xpAtEvolution: number;
  levelAtEvolution: number;
  evolvedAt: string;
}

/**
 * Props for mascot display component
 */
export interface MascotDisplayProps {
  stage: MascotStage;
  size?: number;
  animated?: boolean;
  showGlow?: boolean;
  style?: any;
}

/**
 * Animation configuration for mascot transitions
 */
export interface MascotAnimationConfig {
  duration: number;
  glowDuration: number;
  particleCount: number;
  hapticFeedback: boolean;
}

/**
 * Default animation configuration
 */
export const DEFAULT_MASCOT_ANIMATION: MascotAnimationConfig = {
  duration: 1500, // 1.5 seconds
  glowDuration: 2000, // 2 seconds
  particleCount: 20,
  hapticFeedback: true,
};
