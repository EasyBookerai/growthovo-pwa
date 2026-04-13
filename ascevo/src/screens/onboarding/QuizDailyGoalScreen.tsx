import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { PillarKey } from '../../types';
import { saveQuizResults } from '../../services/onboardingQuizService';
import { colors, typography, spacing, radius } from '../../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  userId: string;
  primaryPillar: PillarKey;
  secondaryPillar: PillarKey;
  onComplete: () => void;
}

const GOAL_OPTIONS: { minutes: 5 | 10 | 15; label: string }[] = [
  { minutes: 5, label: 'Light' },
  { minutes: 10, label: 'Steady' },
  { minutes: 15, label: 'Serious' },
];

export default function QuizDailyGoalScreen({ userId, primaryPillar, secondaryPillar, onComplete }: Props) {
  const [selectedGoal, setSelectedGoal] = useState<5 | 10 | 15 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const translateX = useSharedValue(SCREEN_WIDTH);

  useEffect(() => {
    translateX.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  async function handleConfirm() {
    if (!selectedGoal) return;
    setLoading(true);
    setError(null);
    try {
      await saveQuizResults(userId, primaryPillar, secondaryPillar, selectedGoal);
      onComplete();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = !selectedGoal || loading;

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <SafeAreaView style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>How much time can you commit daily?</Text>
            <Text style={styles.subtitle}>Be honest. 5 minutes done beats 60 minutes planned.</Text>
          </View>

          <View style={styles.cardsContainer}>
            {GOAL_OPTIONS.map((option) => {
              const isSelected = selectedGoal === option.minutes;
              return (
                <TouchableOpacity
                  key={option.minutes}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => setSelectedGoal(option.minutes)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${option.minutes} minutes, ${option.label}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.cardMinutes, isSelected && styles.cardMinutesSelected]}>
                    {option.minutes}
                  </Text>
                  <Text style={styles.cardUnit}>min</Text>
                  <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={handleConfirm} accessibilityRole="button">
                <Text style={styles.retryText}>Tap to retry</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.confirmButton, isDisabled && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={isDisabled}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Confirm daily goal"
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm</Text>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, justifyContent: 'space-between' },
  header: { paddingTop: spacing.xxl, alignItems: 'center' },
  title: { ...typography.h2, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 26 },
  cardsContainer: { flex: 1, justifyContent: 'center', gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  cardSelected: { borderColor: colors.primary, backgroundColor: `${colors.primary}1A` },
  cardMinutes: { fontSize: 56, fontWeight: '800', color: colors.textMuted, lineHeight: 64 },
  cardMinutesSelected: { color: colors.primary },
  cardUnit: { ...typography.body, color: colors.textMuted, marginTop: -spacing.xs },
  cardLabel: { ...typography.bodyBold, color: colors.textMuted, marginTop: spacing.sm, letterSpacing: 1, textTransform: 'uppercase' },
  cardLabelSelected: { color: colors.text },
  errorContainer: {
    backgroundColor: `${colors.error}1A`,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  errorText: { ...typography.body, color: colors.error, textAlign: 'center', marginBottom: spacing.sm },
  retryText: { ...typography.bodyBold, color: colors.error, textDecorationLine: 'underline' },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  confirmButtonDisabled: { opacity: 0.4 },
  confirmButtonText: { ...typography.bodyBold, color: colors.text, fontSize: 18 },
});
