import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { PillarKey } from '../../types';
import { QUIZ_QUESTIONS, scoreQuiz } from '../../services/onboardingQuizService';
import { registerPushToken } from '../../services/notificationService';
import { colors, typography, spacing, radius } from '../../theme';

import QuizWelcomeScreen from './QuizWelcomeScreen';
import QuizQuestionScreen from './QuizQuestionScreen';
import PillarResultScreen from './PillarResultScreen';
import QuizDailyGoalScreen from './QuizDailyGoalScreen';
import PaywallScreen from '../paywall/PaywallScreen';
import PartnerSetupScreen from '../partner/PartnerSetupScreen';

type QuizStep =
  | 'quiz-welcome'
  | 'quiz-question-0'
  | 'quiz-question-1'
  | 'quiz-question-2'
  | 'quiz-question-3'
  | 'quiz-question-4'
  | 'quiz-result'
  | 'quiz-goal'
  | 'quiz-notification'
  | 'quiz-paywall'
  | 'partner_setup';

interface Props {
  userId: string;
  onComplete: () => void;
}

export default function QuizFlow({ userId, onComplete }: Props) {
  const [step, setStep] = useState<QuizStep>('quiz-welcome');
  const [answers, setAnswers] = useState<PillarKey[]>([]);
  const [pillars, setPillars] = useState<{ primary: PillarKey; secondary: PillarKey } | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);

  function handleAnswer(pillar: PillarKey) {
    const newAnswers = [...answers, pillar];
    setAnswers(newAnswers);

    const currentIndex = parseInt(step.replace('quiz-question-', ''), 10);
    if (currentIndex < 4) {
      setStep(`quiz-question-${currentIndex + 1}` as QuizStep);
    } else {
      // All 5 questions answered — score and show result
      const result = scoreQuiz(newAnswers);
      setPillars(result);
      setStep('quiz-result');
    }
  }

  async function handleNotificationContinue() {
    setNotifLoading(true);
    try {
      await registerPushToken(userId);
    } catch {
      // Silent fail — app works without notifications
    } finally {
      setNotifLoading(false);
      setStep('quiz-paywall');
    }
  }

  switch (step) {
    case 'quiz-welcome':
      return (
        <QuizWelcomeScreen
          onStart={() => setStep('quiz-question-0')}
        />
      );

    case 'quiz-question-0':
    case 'quiz-question-1':
    case 'quiz-question-2':
    case 'quiz-question-3':
    case 'quiz-question-4': {
      const index = parseInt(step.replace('quiz-question-', ''), 10);
      return (
        <QuizQuestionScreen
          questionIndex={index}
          question={QUIZ_QUESTIONS[index]}
          onAnswer={handleAnswer}
          progress={(index + 1) / 5}
        />
      );
    }

    case 'quiz-result':
      return pillars ? (
        <PillarResultScreen
          primaryPillar={pillars.primary}
          secondaryPillar={pillars.secondary}
          onContinue={() => setStep('quiz-goal')}
        />
      ) : null;

    case 'quiz-goal':
      return pillars ? (
        <QuizDailyGoalScreen
          userId={userId}
          primaryPillar={pillars.primary}
          secondaryPillar={pillars.secondary}
          onComplete={() => setStep('quiz-notification')}
        />
      ) : null;

    case 'quiz-notification':
      return (
        <NotificationPermissionScreen
          loading={notifLoading}
          onContinue={handleNotificationContinue}
        />
      );

    case 'quiz-paywall':
      return (
        <PaywallScreen
          userId={userId}
          onClose={() => setStep('partner_setup')}
          onSuccess={() => setStep('partner_setup')}
        />
      );

    case 'partner_setup':
      return (
        <PartnerSetupScreen
          userId={userId}
          primaryPillar={pillars?.primary ?? ''}
          onClose={onComplete}
        />
      );

    default:
      return null;
  }
}

// ─── Inline notification permission screen ────────────────────────────────────

interface NotifProps {
  loading: boolean;
  onContinue: () => void;
}

function NotificationPermissionScreen({ loading, onContinue }: NotifProps) {
  return (
    <View style={notifStyles.root}>
      <SafeAreaView style={notifStyles.inner}>
        <View style={notifStyles.content}>
          <Text style={notifStyles.emoji}>🔔</Text>
          <Text style={notifStyles.title}>Stay on track</Text>
          <Text style={notifStyles.subtitle}>
            Allow notifications to stay on track
          </Text>
        </View>

        <TouchableOpacity
          style={notifStyles.button}
          onPress={onContinue}
          disabled={loading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={notifStyles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const notifStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  inner: {
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
  emoji: { fontSize: 72, marginBottom: spacing.xl, textAlign: 'center' },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 18,
  },
});
