import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius, getPillarColor } from '../../theme';
import type { PillarKey } from '../../types';

interface Props {
  restoredStreak: number;
  primaryPillar: PillarKey;
  onContinue: () => void;
}

// Confetti particle component
function ConfettiParticle({ 
  color, 
  delay, 
  startX, 
  startY 
}: { 
  color: string; 
  delay: number; 
  startX: number; 
  startY: number; 
}) {
  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Animate particle falling with rotation
    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(
      delay,
      withTiming(startY + 400, { duration: 2000, easing: Easing.out(Easing.quad) })
    );
    translateX.value = withDelay(
      delay,
      withTiming(startX + (Math.random() - 0.5) * 100, { duration: 2000 })
    );
    rotation.value = withDelay(
      delay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration: 2000 })
    );
    
    // Fade out
    opacity.value = withDelay(
      delay + 1500,
      withTiming(0, { duration: 500 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiParticle,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

export default function ComebackSuccessScreen({ 
  restoredStreak, 
  primaryPillar, 
  onContinue 
}: Props) {
  const { t } = useTranslation();
  const pillarColor = getPillarColor(primaryPillar);
  
  // Animation values
  const streakOpacity = useSharedValue(0);
  const streakScale = useSharedValue(0.5);
  const messageOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate streak number reveal
    streakOpacity.value = withTiming(1, { duration: 400 });
    streakScale.value = withSequence(
      withTiming(1.2, { duration: 300, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 200 })
    );
    
    // Animate message and button
    messageOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    buttonOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }));
  }, []);

  const streakAnimatedStyle = useAnimatedStyle(() => ({
    opacity: streakOpacity.value,
    transform: [{ scale: streakScale.value }],
  }));

  const messageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'I broke my streak and came back. @growthovo',
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const getRexMessage = (streak: number): string => {
    if (streak > 30) return "You didn't just come back. You came back stronger.";
    if (streak >= 15) return "That's what I'm talking about. Welcome back.";
    return "You showed up when it mattered. That's everything.";
  };

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 20 }, (_, i) => (
    <ConfettiParticle
      key={i}
      color={i % 3 === 0 ? pillarColor : i % 3 === 1 ? colors.xpGold : colors.success}
      delay={i * 50}
      startX={Math.random() * 300 + 50}
      startY={-20}
    />
  ));

  return (
    <View style={styles.container}>
      {/* Confetti Animation */}
      <View style={styles.confettiContainer}>
        {confettiParticles}
      </View>

      <View style={styles.content}>
        {/* Success Icon */}
        <Text style={styles.successIcon}>🎉</Text>

        {/* Restored Streak */}
        <Animated.View style={[styles.streakSection, streakAnimatedStyle]}>
          <Text style={styles.streakLabel}>{t('relapse.streak_restored')}</Text>
          <Text style={[styles.streakNumber, { color: pillarColor }]}>
            {restoredStreak}
          </Text>
          <Text style={styles.streakSubLabel}>{t('relapse.day_streak')}</Text>
        </Animated.View>

        {/* Rex Message */}
        <Animated.View style={[styles.rexCard, messageAnimatedStyle]}>
          <Text style={styles.rexLabel}>{t('relapse.rex_says')}</Text>
          <Text style={styles.rexMessage}>{getRexMessage(restoredStreak)}</Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: pillarColor }]}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel={t('relapse.share_comeback')}
          >
            <Text style={styles.shareButtonText}>{t('relapse.share_comeback')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={onContinue}
            accessibilityRole="button"
            accessibilityLabel={t('common.continue')}
          >
            <Text style={styles.continueButtonText}>{t('common.continue')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  confettiParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    zIndex: 2,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  streakSection: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  streakNumber: {
    ...typography.h1,
    fontSize: 72,
    fontWeight: '800',
  },
  streakSubLabel: {
    ...typography.body,
    color: colors.textMuted,
  },
  rexCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    width: '100%',
    maxWidth: 400,
  },
  rexLabel: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  rexMessage: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: spacing.md,
    width: '100%',
    maxWidth: 300,
  },
  shareButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  shareButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  continueButtonText: {
    ...typography.body,
    color: colors.textMuted,
  },
});