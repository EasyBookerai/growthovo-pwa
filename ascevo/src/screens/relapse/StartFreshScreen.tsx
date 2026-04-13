import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../theme';
import { resetStreak } from '../../services/streakService';

interface Props {
  userId: string;
  onContinue: () => void;
}

export default function StartFreshScreen({ userId, onContinue }: Props) {
  const { t } = useTranslation();
  
  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.8);
  const rexOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    // Reset the streak to 0 when component mounts
    const handleResetStreak = async () => {
      try {
        await resetStreak(userId);
      } catch (error) {
        console.error('Failed to reset streak:', error);
        // Continue with UI animation even if reset fails
      }
    };

    handleResetStreak();

    // Animate title reveal
    titleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    titleScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.2)) });
    
    // Animate Rex message
    rexOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
    
    // Animate button
    buttonOpacity.value = withDelay(1200, withTiming(1, { duration: 400 }));
  }, [userId]);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const rexAnimatedStyle = useAnimatedStyle(() => ({
    opacity: rexOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const getRexStartFreshLine = (): string => {
    const lines = [
      "Day 1. Again. That's fine. Most people never even get to Day 1.",
      "Starting over isn't failing. Staying down is.",
      "Day 1 is the hardest day. You've done it before. Do it again.",
      "Fresh start. Clean slate. Same you, better choices.",
      "Every expert was once a beginner. Every pro was once an amateur. Day 1.",
    ];
    
    // Rotate based on day of year to provide variety
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return lines[dayOfYear % lines.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Fresh start icon */}
        <Text style={styles.freshIcon}>🌱</Text>

        {/* Main message */}
        <Animated.View style={[styles.titleSection, titleAnimatedStyle]}>
          <Text style={styles.title}>Starting fresh.</Text>
          <Text style={styles.subtitle}>Day 1.</Text>
        </Animated.View>

        {/* Rex message */}
        <Animated.View style={[styles.rexCard, rexAnimatedStyle]}>
          <Text style={styles.rexLabel}>{t('relapse.rex_says')}</Text>
          <Text style={styles.rexMessage}>{getRexStartFreshLine()}</Text>
        </Animated.View>

        {/* Continue button */}
        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
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
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  freshIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  titleSection: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    fontSize: 48,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    ...typography.h2,
    fontSize: 32,
    color: colors.success,
    textAlign: 'center',
    fontWeight: '600',
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
    width: '100%',
    maxWidth: 300,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  continueButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
});