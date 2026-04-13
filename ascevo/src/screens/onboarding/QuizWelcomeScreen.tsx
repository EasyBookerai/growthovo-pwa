import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  onStart: () => void;
}

export default function QuizWelcomeScreen({ onStart }: Props) {
  const translateX = useSharedValue(SCREEN_WIDTH);

  useEffect(() => {
    translateX.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <SafeAreaView style={styles.inner}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🚀</Text>
            <Text style={styles.logoText}>GROWTHOVO</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.tagline}>Let's build your personal growth path</Text>
            <Text style={styles.subtitle}>
              5 questions. 90 seconds. Your entire growth journey starts here.
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={onStart}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Start the quiz"
          >
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  logoText: {
    ...typography.h1,
    color: colors.text,
    letterSpacing: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  tagline: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  startButtonText: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 18,
  },
});
