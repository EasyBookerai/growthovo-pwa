// 🎉 CelebrationModal Component
// Full-screen celebration modal with glassmorphism background and confetti animation
// Displays XP earned, achievements unlocked, and streak milestones

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import GlassModal from '../glass/GlassModal';
import { CelebrationData } from '../../services/animationService';
import { AchievementDefinition } from '../../types';
import { getResolvedTheme } from '../../services/themeService';
import { triggerHaptic, isReducedMotionEnabled } from '../../services/animationService';
import { loadCelebrationAssets, isAssetLoaded } from '../../services/assetLoadingService';
import { getCelebrationAccessibilityLabel } from './accessibility';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface CelebrationModalProps {
  visible: boolean;
  data: CelebrationData;
  onComplete: () => void;
  achievementDefinitions?: AchievementDefinition[];
  autoDismissDelay?: number;
}

/**
 * 🎊 CelebrationModal Component
 * 
 * Full-screen modal that displays celebrations for:
 * - Lesson completions
 * - Level ups
 * - Streak milestones
 * - Achievement unlocks
 * 
 * Features:
 * - Glassmorphism background
 * - Confetti animation
 * - Animated XP counter
 * - Achievement badges display
 * - Streak milestone indicators
 * - Skip button
 * - Auto-dismiss timer
 * 
 * **Validates: Requirements 6.1, 6.2, 6.4, 6.5**
 * 
 * @example
 * ```tsx
 * <CelebrationModal
 *   visible={isVisible}
 *   data={{
 *     type: 'lesson_complete',
 *     title: 'Lesson Complete!',
 *     subtitle: 'Great work!',
 *     xpEarned: 50,
 *     intensity: 'high',
 *   }}
 *   onComplete={() => setIsVisible(false)}
 * />
 * ```
 */
export default function CelebrationModal({
  visible,
  data,
  onComplete,
  achievementDefinitions = [],
  autoDismissDelay,
}: CelebrationModalProps) {
  const { t } = useTranslation();
  const theme = getResolvedTheme();
  const confettiRef = useRef<any>(null);
  const [xpCount, setXpCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const xpFadeAnim = useRef(new Animated.Value(0)).current;
  const autoDismissTimer = useRef<NodeJS.Timeout | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    isReducedMotionEnabled().then(setReducedMotion);
  }, []);

  // Lazy load celebration assets when modal becomes visible
  useEffect(() => {
    if (visible && !assetsLoaded) {
      loadCelebrationAssets()
        .then(() => {
          setAssetsLoaded(true);
        })
        .catch((err) => {
          console.warn('[CelebrationModal] Failed to load assets:', err);
          // Still show celebration even if assets fail to load
          setAssetsLoaded(true);
        });
    }
  }, [visible, assetsLoaded]);

  // Trigger animations when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      xpFadeAnim.setValue(0);
      setXpCount(0);

      // Trigger haptic feedback
      const intensity = data.intensity || 'medium';
      triggerHaptic(intensity === 'high' ? 'success' : 'medium');

      // Start confetti
      if (!reducedMotion && confettiRef.current) {
        setTimeout(() => {
          confettiRef.current?.start();
        }, 200);
      }

      // Animate modal entrance
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate XP counter
      if (data.xpEarned) {
        setTimeout(() => {
          Animated.timing(xpFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();

          // Count up animation
          const duration = reducedMotion ? 500 : 1000;
          const steps = 20;
          const increment = data.xpEarned / steps;
          let currentStep = 0;

          const interval = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
              setXpCount(data.xpEarned!);
              clearInterval(interval);
            } else {
              setXpCount(Math.floor(increment * currentStep));
            }
          }, duration / steps);
        }, 400);
      }

      // Set up auto-dismiss timer
      const delay = autoDismissDelay || getAutoDismissDelay(data.intensity);
      autoDismissTimer.current = setTimeout(() => {
        handleComplete();
      }, delay);
    }

    return () => {
      if (autoDismissTimer.current) {
        clearTimeout(autoDismissTimer.current);
        autoDismissTimer.current = null;
      }
    };
  }, [visible, data, reducedMotion]);

  const handleComplete = () => {
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  // Get celebration icon based on type
  const getCelebrationIcon = () => {
    switch (data.type) {
      case 'lesson_complete':
        return '✅';
      case 'level_up':
        return '⬆️';
      case 'streak_milestone':
        return '🔥';
      case 'achievement':
        return '🏆';
      default:
        return '🎉';
    }
  };

  // Get achievement details from definitions
  const getAchievementDetails = (achievementId: string) => {
    return achievementDefinitions.find((def) => def.id === achievementId);
  };

  return (
    <GlassModal
      visible={visible}
      onClose={handleComplete}
      animationType="fade"
      blurIntensity={30}
      fullScreen={true}
      showCloseButton={false}
      accessibilityLabel={getCelebrationAccessibilityLabel(
        data.type,
        data.xpEarned,
        data.newLevel,
        data.streakMilestone
      )}
      accessibilityViewIsModal={true}
      importantForAccessibility="yes"
    >
      {/* Confetti Animation */}
      {!reducedMotion && (
        <ConfettiCannon
          ref={confettiRef}
          count={data.intensity === 'high' ? 200 : data.intensity === 'low' ? 50 : 100}
          origin={{ x: SCREEN_WIDTH / 2, y: -10 }}
          autoStart={false}
          fadeOut={true}
          fallSpeed={3000}
          explosionSpeed={350}
        />
      )}

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Celebration Icon */}
        <Text style={styles.icon}>{getCelebrationIcon()}</Text>

        {/* Title */}
        <Text style={[styles.title, { color: theme.text }]}>{data.title}</Text>

        {/* Subtitle */}
        {data.subtitle && (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {data.subtitle}
          </Text>
        )}

        {/* XP Earned */}
        {data.xpEarned !== undefined && (
          <Animated.View style={[styles.xpContainer, { opacity: xpFadeAnim }]}>
            <Text style={styles.xpLabel}>XP Earned</Text>
            <Text style={styles.xpValue}>+{xpCount}</Text>
          </Animated.View>
        )}

        {/* New Level */}
        {data.newLevel !== undefined && (
          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>New Level</Text>
            <Text style={styles.levelValue}>{data.newLevel}</Text>
          </View>
        )}

        {/* Streak Milestone */}
        {data.streakMilestone !== undefined && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakValue}>{data.streakMilestone} Day Streak!</Text>
          </View>
        )}

        {/* Unlocked Achievements */}
        {data.achievements && data.achievements.length > 0 && (
          <View style={styles.achievementsContainer}>
            <Text style={[styles.achievementsTitle, { color: theme.text }]}>
              Achievements Unlocked
            </Text>
            <View style={styles.achievementsList}>
              {data.achievements.map((achievement) => {
                const details = getAchievementDetails(achievement.id);
                return (
                  <View key={achievement.id} style={styles.achievementItem}>
                    <Text style={styles.achievementIcon}>
                      {details?.icon || achievement.icon || '🏆'}
                    </Text>
                    <Text style={[styles.achievementTitle, { color: theme.text }]}>
                      {details?.title || achievement.title}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Skip Button */}
        <TouchableOpacity
          style={[styles.skipButton, { backgroundColor: theme.cardBackground }]}
          onPress={handleSkip}
          accessibilityLabel="Skip celebration"
          accessibilityRole="button"
        >
          <Text style={[styles.skipButtonText, { color: theme.text }]}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>
    </GlassModal>
  );
}

/**
 * Get auto-dismiss delay based on celebration intensity
 */
function getAutoDismissDelay(intensity?: 'low' | 'medium' | 'high'): number {
  switch (intensity) {
    case 'high':
      return 4000;
    case 'low':
      return 2000;
    case 'medium':
    default:
      return 3000;
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  xpContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  xpLabel: {
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: '600',
    marginBottom: 8,
  },
  xpValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  levelContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  levelLabel: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 8,
  },
  levelValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  streakIcon: {
    fontSize: 32,
    marginRight: 8,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  achievementsContainer: {
    marginTop: 24,
    width: '100%',
    maxWidth: 400,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  skipButton: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
