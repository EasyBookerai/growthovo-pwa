import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  getGamificationStats,
  awardXP,
  checkAchievement,
  XP_REWARDS,
  GamificationStats,
  XPGainResult,
  Achievement,
} from '../services/gamificationService';

interface GamificationContextType {
  stats: GamificationStats;
  loading: boolean;
  refreshStats: () => Promise<void>;
  gainXP: (source: keyof typeof XP_REWARDS, amount?: number) => Promise<XPGainResult>;
  checkForAchievements: (progress: Record<string, number>) => Promise<Achievement[]>;
  
  // UI state
  showXPAnimation: boolean;
  xpAnimationData: { amount: number; x: number; y: number } | null;
  triggerXPAnimation: (amount: number, x: number, y: number) => void;
  
  showLevelUpModal: boolean;
  levelUpData: { level: number; perks: string[] } | null;
  dismissLevelUpModal: () => void;
  
  showAchievementToast: boolean;
  achievementToastData: Achievement | null;
  dismissAchievementToast: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<GamificationStats>({
    level: 1,
    totalXp: 0,
    currentXp: 0,
    nextLevelXp: 100,
    progress: 0,
    unlockedAchievements: [],
  });
  const [loading, setLoading] = useState(true);

  // XP Animation state
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpAnimationData, setXPAnimationData] = useState<{ amount: number; x: number; y: number } | null>(null);

  // Level Up Modal state
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ level: number; perks: string[] } | null>(null);

  // Achievement Toast state
  const [showAchievementToast, setShowAchievementToast] = useState(false);
  const [achievementToastData, setAchievementToastData] = useState<Achievement | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const gamificationStats = await getGamificationStats();
      setStats(gamificationStats);
    } catch (error) {
      console.error('Failed to load gamification stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = useCallback(async () => {
    await loadStats();
  }, []);

  const gainXP = useCallback(
    async (source: keyof typeof XP_REWARDS, customAmount?: number): Promise<XPGainResult> => {
      const amount = customAmount ?? XP_REWARDS[source];
      
      const result = await awardXP(amount, source);
      
      // Update local stats
      setStats((prev) => ({
        ...prev,
        level: result.leveledUp ? result.newLevel! : prev.level,
        totalXp: result.totalXp,
        currentXp: result.currentXp,
        progress: result.progress,
      }));

      // Show level up modal if leveled up
      if (result.leveledUp && result.newLevel && result.perksUnlocked) {
        setLevelUpData({
          level: result.newLevel,
          perks: result.perksUnlocked,
        });
        setShowLevelUpModal(true);
      }

      return result;
    },
    []
  );

  const triggerXPAnimation = useCallback((amount: number, x: number, y: number) => {
    setXPAnimationData({ amount, x, y });
    setShowXPAnimation(true);

    // Auto-hide after animation completes
    setTimeout(() => {
      setShowXPAnimation(false);
      setXPAnimationData(null);
    }, 1200);
  }, []);

  const dismissLevelUpModal = useCallback(() => {
    setShowLevelUpModal(false);
    setLevelUpData(null);
  }, []);

  const dismissAchievementToast = useCallback(() => {
    setShowAchievementToast(false);
    setAchievementToastData(null);
  }, []);

  const checkForAchievements = useCallback(
    async (progress: Record<string, number>): Promise<Achievement[]> => {
      const unlockedAchievements: Achievement[] = [];

      // Check all achievement types
      const achievementChecks = [
        'first_lesson',
        'lesson_10',
        'lesson_50',
        'lesson_100',
        'streak_3',
        'streak_7',
        'streak_30',
        'streak_100',
        'first_speech',
        'speaker_10',
        'squad_join',
        'friend_invite',
        'early_bird',
        'night_owl',
      ];

      for (const achievementId of achievementChecks) {
        const achievement = await checkAchievement(achievementId, progress);
        if (achievement) {
          unlockedAchievements.push(achievement);
          
          // Show toast for first achievement
          if (unlockedAchievements.length === 1) {
            setAchievementToastData(achievement);
            setShowAchievementToast(true);
            
            // Auto-dismiss after 4 seconds
            setTimeout(() => {
              setShowAchievementToast(false);
            }, 4000);
          }
        }
      }

      if (unlockedAchievements.length > 0) {
        // Refresh stats to include new achievements
        await refreshStats();
      }

      return unlockedAchievements;
    },
    [refreshStats]
  );

  const value: GamificationContextType = {
    stats,
    loading,
    refreshStats,
    gainXP,
    checkForAchievements,
    
    showXPAnimation,
    xpAnimationData,
    triggerXPAnimation,
    
    showLevelUpModal,
    levelUpData,
    dismissLevelUpModal,
    
    showAchievementToast,
    achievementToastData,
    dismissAchievementToast,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
}
