import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { QuizQuestion, PillarKey } from '../../types';
import { colors, typography, spacing, radius } from '../../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

const PILLAR_ACCENT: Record<PillarKey, string> = {
  mind: '#7C3AED',
  discipline: '#DC2626',
  communication: '#2563EB',
  money: '#16A34A',
  relationships: '#DB2777',
};

interface Props {
  questionIndex: number; // 0-based, 0–4
  question: QuizQuestion;
  onAnswer: (pillar: PillarKey) => void;
  progress: number; // 0.0–1.0
}

export default function QuizQuestionScreen({ questionIndex, question, onAnswer, progress }: Props) {
  const translateX = useSharedValue(SCREEN_WIDTH);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    translateX.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  function handleAnswerPress(pillar: PillarKey, index: number) {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    setTimeout(() => onAnswer(pillar), 300);
  }

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Question {questionIndex + 1} of 5</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text style={styles.emoji}>{question.emoji}</Text>
            <Text style={styles.questionText}>{question.text}</Text>

            <View style={styles.answersContainer}>
              {question.answers.map((answer, index) => {
                const isTapped = selectedIndex === index;
                const accentColor = PILLAR_ACCENT[answer.pillar];
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.answerCard,
                      isTapped && { borderColor: accentColor, backgroundColor: `${accentColor}22` },
                    ]}
                    onPress={() => handleAnswerPress(answer.pillar, index)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={answer.text}
                    accessibilityState={{ selected: isTapped }}
                  >
                    <Text style={[styles.answerText, isTapped && { color: accentColor }]}>
                      {answer.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  safeArea: { flex: 1 },
  progressSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  progressLabel: { ...typography.small, color: colors.textMuted, marginBottom: spacing.xs },
  progressTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  emoji: { fontSize: 64, marginBottom: spacing.lg, textAlign: 'center' },
  questionText: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 32,
  },
  answersContainer: { width: '100%', gap: spacing.sm },
  answerCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  answerText: { ...typography.body, color: colors.text },
});
