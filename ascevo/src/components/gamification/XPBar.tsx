import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useProgressAnimation } from '../../hooks/useProgressAnimation';
import { colors } from '../../theme';
import GlassCard from '../glass/GlassCard';

export interface XPBarProps {
  currentXP: number;
  requiredXP: number;
  level: number;
  animated?: boolean;
  showLabel?: boolean;
  gradient?: [string, string];
  onPress?: () => void;
}

/**
 * XPBar - Animated XP progress bar with level display
 * 
 * Features:
 * - Smooth fill animation using useProgressAnimation
 * - Gradient progress bar
 * - Level badge display
 * - Overflow animation for level-up
 * - Custom gradient colors support
 * - Cross-platform compatibility
 * 
 * Requirements: 2.2, 2.4, 7.2
 */
export default function XPBar({
  currentXP,
  requiredXP,
  level,
  animated = true,
  showLabel = true,
  gradient = [colors.xpGold, '#F59E0B'],
  onPress,
}: XPBarProps) {
  // Calculate progress percentage (0-100)
  const progressPercentage = Math.min((currentXP / requiredXP) * 100, 100);
  
  // Use progress animation hook for smooth transitions
  const { animatedValue, isAnimating } = useProgressAnimation(
    animated ? progressPercentage : progressPercentage,
    animated ? 500 : 0
  );

  // Animated style for progress bar fill
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedValue.value}%`,
    };
  });

  // Check if we're at or over 100% (level-up state)
  const isLevelingUp = currentXP >= requiredXP;

  return (
    <GlassCard
      intensity="medium"
      style={styles.container}
      onPress={onPress}
      accessibilityRole="progressbar"
      accessibilityLabel={`Level ${level}, ${currentXP} out of ${requiredXP} XP, ${Math.round(progressPercentage)}% complete`}
      accessibilityHint={onPress ? "Tap to view XP details and history" : undefined}
      accessibilityValue={{
        min: 0,
        max: requiredXP,
        now: currentXP,
        text: `${Math.round(progressPercentage)} percent`,
      }}
    >
      <View style={styles.content}>
        {/* Level Badge */}
        <View 
          style={styles.levelBadge}
          accessibilityLabel={`Level ${level}`}
        >
          <Text style={styles.levelText}>{level}</Text>
        </View>

        {/* Progress Bar Container */}
        <View style={styles.progressContainer}>
          {showLabel && (
            <View style={styles.labelContainer}>
              <Text style={styles.xpLabel}>
                {currentXP} / {requiredXP} XP
              </Text>
            </View>
          )}

          {/* Progress Bar Track */}
          <View style={styles.progressTrack}>
            {/* Progress Bar Fill */}
            <Animated.View
              style={[
                styles.progressFill,
                progressStyle,
                {
                  backgroundColor: gradient[0],
                },
                isLevelingUp && styles.progressFillOverflow,
              ]}
            >
              {/* Gradient overlay for visual depth */}
              {Platform.OS === 'web' && (
                <View
                  style={[
                    styles.gradientOverlay,
                    {
                      // @ts-ignore - CSS gradient for web
                      backgroundImage: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})`,
                    },
                  ]}
                />
              )}
            </Animated.View>

            {/* Shine effect for active animation */}
            {isAnimating && (
              <View style={styles.shineEffect} />
            )}
          </View>
        </View>
      </View>

      {/* Level-up indicator */}
      {isLevelingUp && (
        <View style={styles.levelUpIndicator}>
          <Text style={styles.levelUpText}>🎉 Ready to level up!</Text>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  levelText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  progressContainer: {
    flex: 1,
    gap: 6,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  progressFillOverflow: {
    // Pulsing animation for level-up state
    shadowColor: colors.xpGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  levelUpIndicator: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 8,
    alignItems: 'center',
  },
  levelUpText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
});
