import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { PillarKey } from '../../types';
import { colors, typography, spacing, radius } from '../../theme';

const PILLAR_DATA: Record<PillarKey, { emoji: string; name: string; description: string }> = {
  mind: {
    emoji: '🧠',
    name: 'Mind',
    description: 'Master your thoughts, beat anxiety, and build mental clarity.',
  },
  discipline: {
    emoji: '🔥',
    name: 'Discipline',
    description: 'Build habits that stick and become someone who follows through.',
  },
  communication: {
    emoji: '💬',
    name: 'Communication',
    description: 'Speak with confidence, lead rooms, and connect deeply.',
  },
  money: {
    emoji: '💰',
    name: 'Money',
    description: 'Understand money, build wealth, and stop financial self-sabotage.',
  },
  relationships: {
    emoji: '❤️',
    name: 'Relationships',
    description: 'Know who you are, build your identity, and attract the right people.',
  },
};

const PILLAR_ACCENT: Record<PillarKey, string> = {
  mind: colors.pillars.mind,
  discipline: colors.pillars.discipline,
  communication: colors.pillars.communication,
  money: colors.pillars.money,
  relationships: colors.pillars.relationships,
};

interface Props {
  primaryPillar: PillarKey;
  secondaryPillar: PillarKey;
  onContinue: () => void;
}

export default function PillarResultScreen({ primaryPillar, secondaryPillar, onContinue }: Props) {
  const primary = PILLAR_DATA[primaryPillar];
  const secondary = PILLAR_DATA[secondaryPillar];
  const accentColor = PILLAR_ACCENT[primaryPillar];

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.2)) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  // Stagger the button in slightly after the main content
  const buttonOpacity = useSharedValue(0);
  useEffect(() => {
    buttonOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
  }, []);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {/* Label */}
          <Text style={styles.label}>Your biggest growth area is</Text>

          {/* Emoji */}
          <Text style={styles.emoji}>{primary.emoji}</Text>

          {/* Pillar name */}
          <Text style={[styles.pillarName, { color: accentColor }]}>{primary.name}</Text>

          {/* Description */}
          <Text style={styles.description}>{primary.description}</Text>

          {/* Secondary pillar */}
          <View style={styles.secondaryContainer}>
            <Text style={styles.secondaryText}>
              Your secondary focus:{' '}
              <Text style={[styles.secondaryPillarName, { color: PILLAR_ACCENT[secondaryPillar] }]}>
                {secondary.name}
              </Text>
            </Text>
          </View>
        </Animated.View>

        {/* Continue button */}
        <Animated.View style={[styles.buttonWrapper, buttonAnimatedStyle]}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: accentColor }]}
            onPress={onContinue}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 96,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  pillarName: {
    ...typography.h1,
    fontSize: 40,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.xl,
  },
  secondaryContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  secondaryPillarName: {
    ...typography.bodyBold,
  },
  buttonWrapper: {
    marginTop: spacing.lg,
  },
  continueButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  continueButtonText: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 18,
  },
});
