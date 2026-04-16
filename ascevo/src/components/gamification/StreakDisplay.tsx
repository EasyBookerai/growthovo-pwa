import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../theme';
import GlassCard from '../glass/GlassCard';
import { useTranslation } from 'react-i18next';

export interface StreakDisplayProps {
  streak: number;
  isAtRisk: boolean;
  freezeCount: number;
  onPress?: () => void;
  variant?: 'compact' | 'expanded';
}

/**
 * StreakDisplay - Enhanced streak display with fire animations
 * 
 * Features:
 * - Animated fire emoji with pulse effect
 * - Warning state with skull emoji for at-risk streaks
 * - Freeze count indicator
 * - Compact and expanded variants
 * - Milestone celebrations (7, 30, 100, 365 days)
 * 
 * Requirements: 1.1, 1.2, 1.4
 */
export default function StreakDisplay({
  streak,
  isAtRisk,
  freezeCount,
  onPress,
  variant = 'compact',
}: StreakDisplayProps) {
  const { t } = useTranslation();
  // Animation for fire emoji pulse
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Continuous pulse animation for fire emoji
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // infinite repeat
      false
    );
  }, []);

  const animatedFireStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const isMilestone = checkMilestone(streak);
  const emoji = isAtRisk ? '💀' : '🔥';
  const statusColor = isAtRisk ? colors.error : colors.streakOrange;

  if (variant === 'compact') {
    return (
      <GlassCard
        intensity="medium"
        style={styles.compactContainer}
        onPress={onPress}
        accessibilityLabel={t('gamification.streak.accessibility_label', {
          streak,
          atRisk: isAtRisk ? t('gamification.streak.at_risk') : '',
          freezes:
            freezeCount > 0
              ? t('gamification.streak.freezes_available', { count: freezeCount })
              : '',
        })}
        accessibilityHint={t('gamification.streak.accessibility_hint')}
        accessibilityState={{ disabled: !onPress }}
      >
        <View style={styles.compactContent}>
          <Animated.Text
            style={[styles.compactEmoji, animatedFireStyle]}
            accessibilityLabel={
              isAtRisk ? t('gamification.streak.at_risk') : t('gamification.streak.title')
            }
          >
            {emoji}
          </Animated.Text>
          <View style={styles.compactTextContainer}>
            <Text style={[styles.compactStreak, { color: statusColor }]}>
              {streak}
            </Text>
            <Text style={styles.compactLabel}>{t('gamification.streak.day_streak')}</Text>
          </View>
          {freezeCount > 0 && (
            <View
              style={styles.freezeBadge}
              accessibilityLabel={`${freezeCount} streak freeze${
                freezeCount > 1 ? 's' : ''
              } available`}
            >
              <Text style={styles.freezeIcon}>❄️</Text>
              <Text style={styles.freezeCount}>{freezeCount}</Text>
            </View>
          )}
        </View>
        {isAtRisk && (
          <Text
            style={styles.atRiskLabel}
            accessibilityLabel="Warning: Complete today's goal to maintain your streak"
          >
            {t('gamification.streak.at_risk')}
          </Text>
        )}
      </GlassCard>
    );
  }

  // Expanded variant
  return (
    <GlassCard
      intensity="medium"
      style={styles.expandedContainer}
      onPress={onPress}
      accessibilityLabel={t('gamification.streak.accessibility_label', {
        streak,
        atRisk: isAtRisk ? t('gamification.streak.at_risk') : '',
        freezes:
          freezeCount > 0
            ? t('gamification.streak.freezes_available', { count: freezeCount })
            : '',
      })}
      accessibilityHint={t('gamification.streak.accessibility_hint')}
      accessibilityState={{ disabled: !onPress }}
    >
      <View style={styles.expandedHeader}>
        <Animated.Text style={[styles.expandedEmoji, animatedFireStyle]}>
          {emoji}
        </Animated.Text>
        {freezeCount > 0 && (
          <View style={styles.freezeBadgeExpanded}>
            <Text style={styles.freezeIconExpanded}>❄️</Text>
            <Text style={styles.freezeCountExpanded}>{freezeCount}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.expandedStreak, { color: statusColor }]}>
        {streak}
      </Text>
      <Text style={styles.expandedLabel}>{t('gamification.streak.day_streak')}</Text>

      {isAtRisk && (
        <View style={styles.atRiskBanner}>
          <Text style={styles.atRiskBannerText}>
            ⚠️ {t('gamification.streak.at_risk_desc')}
          </Text>
        </View>
      )}

      {isMilestone && !isAtRisk && (
        <View style={styles.milestoneBanner}>
          <Text style={styles.milestoneBannerText}>
            🎉 {t('gamification.streak.milestone_title', { days: streak })}
          </Text>
        </View>
      )}

      {freezeCount > 0 && (
        <Text style={styles.freezeDescription}>
          {t('gamification.streak.freeze_hint')}
        </Text>
      )}
    </GlassCard>
  );
}
            {freezeCount} streak {freezeCount === 1 ? 'freeze' : 'freezes'} available
          </Text>
        )}
      </GlassCard>
    </TouchableOpacity>
  );
}

/**
 * Check if streak is at a milestone (7, 30, 100, 365 days)
 */
function checkMilestone(streak: number): boolean {
  return streak === 7 || streak === 30 || streak === 100 || streak === 365;
}

const styles = StyleSheet.create({
  // Compact variant styles
  compactContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactEmoji: {
    fontSize: 32,
  },
  compactTextContainer: {
    flex: 1,
  },
  compactStreak: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  compactLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  freezeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  freezeIcon: {
    fontSize: 14,
  },
  freezeCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.info,
  },
  atRiskLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
    marginTop: 8,
    textAlign: 'center',
  },

  // Expanded variant styles
  expandedContainer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  expandedEmoji: {
    fontSize: 64,
  },
  freezeBadgeExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  freezeIconExpanded: {
    fontSize: 20,
  },
  freezeCountExpanded: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.info,
  },
  expandedStreak: {
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 56,
  },
  expandedLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  atRiskBanner: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    width: '100%',
  },
  atRiskBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
    textAlign: 'center',
  },
  milestoneBanner: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    width: '100%',
  },
  milestoneBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    textAlign: 'center',
  },
  freezeDescription: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 12,
    textAlign: 'center',
  },
});
