import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';
import { Achievement, getRarityColor } from '../services/gamificationService';
import { triggerHaptic } from '../services/webThemeService';

interface Props {
  achievement: Achievement;
  onClose: () => void;
  onViewDetails?: () => void;
}

/**
 * Achievement unlock toast notification
 * Appears at top of screen, slides down with bounce
 * Quick celebration without blocking flow
 */
export default function AchievementToast({ achievement, onClose, onViewDetails }: Props) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    triggerHaptic('success');

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const rarityColor = getRarityColor(achievement.rarity);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          borderLeftColor: rarityColor,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={() => {
          triggerHaptic('light');
          onViewDetails?.();
          handleDismiss();
        }}
        activeOpacity={0.9}
      >
        {/* Icon */}
        <View style={[styles.iconBadge, { backgroundColor: rarityColor + '20' }]}>
          <Text style={styles.icon}>{achievement.icon}</Text>
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={styles.header}>🎉 Achievement Unlocked!</Text>
          <Text style={styles.name}>{achievement.name}</Text>
          <Text style={styles.reward}>+{achievement.xpReward} XP</Text>
        </View>

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={(e) => {
            e.stopPropagation();
            triggerHaptic('light');
            handleDismiss();
          }}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.md,
    right: spacing.md,
    zIndex: 10000,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  header: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 15,
    marginTop: 2,
  },
  reward: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  closeButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  closeText: {
    fontSize: 24,
    color: colors.textMuted,
    fontWeight: '300',
  },
});
