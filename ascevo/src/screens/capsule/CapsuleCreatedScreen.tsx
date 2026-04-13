import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

interface Props {
  onContinue: () => void;
}

export default function CapsuleCreatedScreen({ onContinue }: Props) {
  const lockScale = useSharedValue(0);
  const lockOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const countdownOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    // Lock icon pops in
    lockOpacity.value = withTiming(1, { duration: 300 });
    lockScale.value = withSequence(
      withTiming(1.3, { duration: 400, easing: Easing.out(Easing.back(2)) }),
      withSpring(1, { damping: 10, stiffness: 120 })
    );

    // Text reveals staggered
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    countdownOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    subtitleOpacity.value = withDelay(1200, withTiming(1, { duration: 400 }));
    buttonOpacity.value = withDelay(1600, withTiming(1, { duration: 400 }));
  }, []);

  const lockStyle = useAnimatedStyle(() => ({
    opacity: lockOpacity.value,
    transform: [{ scale: lockScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const countdownStyle = useAnimatedStyle(() => ({ opacity: countdownOpacity.value }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Lock icon */}
        <Animated.Text style={[styles.lockIcon, lockStyle]}>🔒</Animated.Text>

        {/* Title */}
        <Animated.View style={[styles.titleSection, titleStyle]}>
          <Text style={styles.title}>Your capsule is sealed</Text>
        </Animated.View>

        {/* Countdown badge */}
        <Animated.View style={[styles.countdownBadge, countdownStyle]}>
          <Text style={styles.countdownLabel}>OPENS IN</Text>
          <Text style={styles.countdownValue}>90 days</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={[styles.subtitleSection, subtitleStyle]}>
          <Text style={styles.subtitle}>
            Your Day 1 video and promises are locked away. On Day 90, you'll see exactly how far you've come.
          </Text>
        </Animated.View>

        {/* Info card */}
        <Animated.View style={[styles.infoCard, subtitleStyle]}>
          <Text style={styles.infoText}>
            📅  We'll remind you when it's time to open it
          </Text>
        </Animated.View>

        {/* Continue button */}
        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={onContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue to app"
          >
            <Text style={styles.continueButtonText}>Let's Get Started</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  lockIcon: {
    fontSize: 96,
  },
  titleSection: {
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  countdownBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  countdownLabel: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  countdownValue: {
    ...typography.h2,
    color: colors.text,
  },
  subtitleSection: {
    paddingHorizontal: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
    maxWidth: 360,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
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
    alignItems: 'center',
  },
  continueButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
});
