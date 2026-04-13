import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../theme';

interface Props {
  onStart: () => void;
}

export default function TimeCapsuleIntroScreen({ onStart }: Props) {
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.6);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    iconOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    iconScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.2)) });
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    buttonOpacity.value = withDelay(1100, withTiming(1, { duration: 400 }));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Text style={[styles.icon, iconStyle]}>📦</Animated.Text>

        <Animated.View style={[styles.textSection, titleStyle]}>
          <Text style={styles.title}>Meet your Day 1 self</Text>
        </Animated.View>

        <Animated.View style={[styles.subtitleSection, subtitleStyle]}>
          <Text style={styles.subtitle}>
            Record a short video and write three promises to your future self.
            We'll seal it and unlock it on Day 90 — so you can see exactly how far you've come.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.infoCard, subtitleStyle]}>
          <Text style={styles.infoRow}>📹  60-second video message</Text>
          <Text style={styles.infoRow}>✍️  Three written promises</Text>
          <Text style={styles.infoRow}>🔒  Sealed until Day 90</Text>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={onStart}
            accessibilityRole="button"
            accessibilityLabel="Start Recording"
          >
            <Text style={styles.startButtonText}>Start Recording</Text>
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
  icon: {
    fontSize: 72,
  },
  textSection: {
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  subtitleSection: {
    alignItems: 'center',
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
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 360,
    gap: spacing.sm,
  },
  infoRow: {
    ...typography.body,
    color: colors.text,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  startButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
});
