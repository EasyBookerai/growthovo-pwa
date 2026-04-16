import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme';
import GlassCard from '../glass/GlassCard';
import { AchievementDefinition } from '../../types';
import { loadAchievementAssets, isAssetLoaded } from '../../services/assetLoadingService';
import { getAchievementAccessibilityLabel, getAchievementAccessibilityHint } from './accessibility';
import { useTranslation } from 'react-i18next';

export interface AchievementBadgeProps {
  achievement: AchievementDefinition;
  unlocked: boolean;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

/**
 * AchievementBadge - Individual achievement badge display
 * 
 * Features:
 * - Small, medium, large size variants
 * - Unlocked badges with full color and icon
 * - Locked badges as silhouettes with lock icon
 * - Display unlock requirements for locked badges
 * - onPress handler for badge details
 * - Lazy loading of achievement badge images
 * 
 * Requirements: 3.2, 3.3, 12.4
 */
export default function AchievementBadge({
  achievement,
  unlocked,
  size = 'medium',
  onPress,
}: AchievementBadgeProps) {
  const { t } = useTranslation();
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const sizeConfig = SIZE_CONFIGS[size];
  const categoryColor = getCategoryColor(achievement.category);

  // Lazy load achievement assets when component mounts
  useEffect(() => {
    // Check if asset is already loaded
    if (isAssetLoaded(`achievement_${achievement.id}`)) {
      setAssetsLoaded(true);
      return;
    }

    // Load achievement asset
    loadAchievementAssets([achievement.id])
      .then(() => {
        setAssetsLoaded(true);
      })
      .catch((err) => {
        console.warn('[AchievementBadge] Failed to load asset:', err);
        // Still show badge even if asset fails to load
        setAssetsLoaded(true);
      });
  }, [achievement.id]);

  const badgeStyle: ViewStyle = {
    width: sizeConfig.containerSize,
    height: sizeConfig.containerSize,
  };

  const iconContainerStyle: ViewStyle = {
    width: sizeConfig.iconSize,
    height: sizeConfig.iconSize,
    borderRadius: sizeConfig.iconSize / 2,
    backgroundColor: unlocked ? categoryColor : 'rgba(255, 255, 255, 0.1)',
    opacity: unlocked ? 1 : 0.4,
  };

  const content = (
    <GlassCard
      intensity={unlocked ? 'medium' : 'light'}
      style={styles.card}
      onPress={onPress}
      accessibilityLabel={getAchievementAccessibilityLabel(achievement, unlocked)}
      accessibilityHint={getAchievementAccessibilityHint(unlocked)}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityState={{ disabled: !onPress, selected: unlocked }}
    >
      {/* Icon Container */}
      <View style={[styles.iconContainer, iconContainerStyle]}>
        {unlocked ? (
          <Text style={[styles.icon, { fontSize: sizeConfig.iconFontSize }]}>
            {achievement.icon}
          </Text>
        ) : (
          <Text style={[styles.lockIcon, { fontSize: sizeConfig.iconFontSize * 0.6 }]}>
            🔒
          </Text>
        )}
      </View>

      {/* Title (only for medium and large) */}
      {size !== 'small' && (
        <Text
          style={[
            styles.title,
            { fontSize: sizeConfig.titleFontSize },
            !unlocked && styles.lockedText,
          ]}
          numberOfLines={1}
        >
          {unlocked ? achievement.title : t('gamification.achievements.locked')}
        </Text>
      )}

      {/* Unlock Requirements (only for locked badges, medium and large) */}
      {!unlocked && size !== 'small' && (
        <Text
          style={[
            styles.requirement,
            { fontSize: sizeConfig.requirementFontSize },
          ]}
          numberOfLines={2}
        >
          {getRequirementText(achievement)}
        </Text>
      )}

      {/* Category Badge (only for large) */}
      {size === 'large' && (
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>
            {getCategoryLabel(achievement.category)}
          </Text>
        </View>
      )}
    </GlassCard>
  );

  return (
    <View style={[styles.container, badgeStyle]}>
      {content}
    </View>
  );
}

/**
 * Get color for achievement category
 */
function getCategoryColor(category: string): string {
  switch (category) {
    case 'streak':
      return colors.streakOrange;
    case 'lessons':
      return colors.primary;
    case 'social':
      return colors.info;
    case 'special':
      return colors.xpGold;
    default:
      return colors.primary;
  }
}

/**
 * Get human-readable category label
 */
function getCategoryLabel(category: string): string {
  switch (category) {
    case 'streak':
      return 'STREAK';
    case 'lessons':
      return 'LESSONS';
    case 'social':
      return 'SOCIAL';
    case 'special':
      return 'SPECIAL';
    default:
      return category.toUpperCase();
  }
}

/**
 * Generate unlock requirement text from criteria
 */
function getRequirementText(achievement: AchievementDefinition): string {
  const { criteria } = achievement;
  
  switch (criteria.type) {
    case 'streak':
      return `Reach ${criteria.threshold} day streak`;
    case 'xp_total':
      return `Earn ${criteria.threshold} total XP`;
    case 'lessons_count':
      return `Complete ${criteria.threshold} lessons`;
    case 'level':
      return `Reach level ${criteria.threshold}`;
    case 'custom':
      return achievement.description;
    default:
      return achievement.description;
  }
}

/**
 * Size configurations for different badge variants
 */
const SIZE_CONFIGS = {
  small: {
    containerSize: 80,
    iconSize: 48,
    iconFontSize: 28,
    titleFontSize: 11,
    requirementFontSize: 9,
  },
  medium: {
    containerSize: 120,
    iconSize: 64,
    iconFontSize: 36,
    titleFontSize: 13,
    requirementFontSize: 10,
  },
  large: {
    containerSize: 160,
    iconSize: 80,
    iconFontSize: 44,
    titleFontSize: 15,
    requirementFontSize: 11,
  },
} as const;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    textAlign: 'center',
  },
  lockIcon: {
    textAlign: 'center',
    opacity: 0.6,
  },
  title: {
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  lockedText: {
    color: colors.textMuted,
  },
  requirement: {
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
});
