import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../theme';
import { getCapsuleRexReaction } from '../../services/capsuleService';
import type { TimeCapsule } from '../../types';

interface Props {
  capsule: TimeCapsule;
  currentStreak: number;
  currentXp: number;
  onContinue: () => void;
}

// ─── Promise Card (staggered reveal) ─────────────────────────────────────────

interface PromiseCardProps {
  index: number;
  text: string;
  delay: number;
}

function PromiseCard({ index, text, delay }: PromiseCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const labels = [
    'In 90 days, I will...',
    'The one habit I committed to...',
    'My future self deserves...',
  ];

  return (
    <Animated.View style={[styles.promiseCard, animStyle]}>
      <Text style={styles.promiseLabel}>{labels[index]}</Text>
      <Text style={styles.promiseText}>"{text}"</Text>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CapsuleUnlockScreen({
  capsule,
  currentStreak,
  currentXp,
  onContinue,
}: Props) {
  // Unlock animation
  const unlockScale = useSharedValue(0);
  const unlockOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Lock icon bursts open
    unlockOpacity.value = withTiming(1, { duration: 300 });
    unlockScale.value = withSequence(
      withTiming(1.5, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    // Content fades in after unlock animation
    contentOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
  }, []);

  const unlockStyle = useAnimatedStyle(() => ({
    opacity: unlockOpacity.value,
    transform: [{ scale: unlockScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  const rexReaction = getCapsuleRexReaction(currentStreak);
  const xpGained = currentXp - capsule.startingXp;

  const handleWatchVideo = () => {
    if (capsule.videoUrl) {
      Linking.openURL(capsule.videoUrl).catch(() => {
        // Silently fail if URL can't be opened
      });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just opened my 90-day time capsule on @growthovo. Day 1 XP: ${capsule.startingXp} → Today: ${currentXp}. The journey is real. 🔓`,
        title: 'My 90-Day Transformation',
      });
    } catch {
      // Share cancelled or failed — no-op
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Unlock animation header */}
        <View style={styles.unlockHeader}>
          <Animated.Text style={[styles.unlockIcon, unlockStyle]}>🔓</Animated.Text>
          <Animated.View style={contentStyle}>
            <Text style={styles.unlockTitle}>Your capsule is open</Text>
            <Text style={styles.unlockSubtitle}>90 days ago, you made a promise.</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.mainContent, contentStyle]}>
          {/* Video playback */}
          <TouchableOpacity
            style={styles.videoContainer}
            onPress={handleWatchVideo}
            accessibilityRole="button"
            accessibilityLabel="Watch your Day 1 video"
          >
            <Text style={styles.videoIcon}>▶️</Text>
            <Text style={styles.videoLabel}>Watch Your Day 1 Message</Text>
            <Text style={styles.videoHint}>Tap to play</Text>
          </TouchableOpacity>

          {/* Stats comparison */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Day 1 XP</Text>
                <Text style={styles.statValue}>{capsule.startingXp}</Text>
              </View>
              <View style={styles.statDivider}>
                <Text style={styles.statArrow}>→</Text>
              </View>
              <View style={[styles.statCard, styles.statCardHighlight]}>
                <Text style={[styles.statLabel, styles.statLabelHighlight]}>Current XP</Text>
                <Text style={[styles.statValue, styles.statValueHighlight]}>{currentXp}</Text>
              </View>
            </View>
            {xpGained > 0 && (
              <Text style={styles.xpGainedText}>+{xpGained} XP earned over 90 days</Text>
            )}
          </View>

          {/* Promises revealed one by one with staggered animation */}
          <View style={styles.promisesSection}>
            <Text style={styles.sectionTitle}>Your Promises</Text>
            <PromiseCard index={0} text={capsule.promise1} delay={1200} />
            <PromiseCard index={1} text={capsule.promise2} delay={1500} />
            <PromiseCard index={2} text={capsule.promise3} delay={1800} />
          </View>

          {/* Rex reaction */}
          <View style={styles.rexCard}>
            <Text style={styles.rexLabel}>REX SAYS</Text>
            <Text style={styles.rexText}>{rexReaction}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Share your transformation"
            >
              <Text style={styles.shareButtonText}>Share My Transformation 🔗</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue"
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  unlockHeader: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  unlockIcon: {
    fontSize: 96,
  },
  unlockTitle: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  unlockSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  mainContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  videoContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  videoIcon: {
    fontSize: 48,
  },
  videoLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  videoHint: {
    ...typography.small,
    color: colors.textMuted,
  },
  statsSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statCardHighlight: {
    backgroundColor: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statLabelHighlight: {
    color: 'rgba(255,255,255,0.8)',
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
  },
  statValueHighlight: {
    color: '#FFFFFF',
  },
  statDivider: {
    alignItems: 'center',
  },
  statArrow: {
    ...typography.h3,
    color: colors.textMuted,
  },
  xpGainedText: {
    ...typography.small,
    color: colors.xpGold,
    textAlign: 'center',
  },
  promisesSection: {
    gap: spacing.md,
  },
  promiseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    gap: spacing.sm,
  },
  promiseLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  promiseText: {
    ...typography.body,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  rexCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rexLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  rexText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
  },
  actions: {
    gap: spacing.md,
  },
  shareButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  continueButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
});
