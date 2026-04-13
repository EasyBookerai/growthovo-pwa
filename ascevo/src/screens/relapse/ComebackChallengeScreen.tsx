import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { canUseComebackChallenge, createComebackChallenge } from '../../services/relapseService';
import { getHardestChallengeForPillar } from '../../services/challengeService';
import { colors, typography, spacing, radius } from '../../theme';
import type { Challenge, PillarKey } from '../../types';

interface Props {
  userId: string;
  primaryPillar: PillarKey;
  originalStreak: number;
  comebackUsedAt: string | null;
  onAccept: (challengeId: string) => void;
  onDecline: () => void;
}

export default function ComebackChallengeScreen({
  userId,
  primaryPillar,
  originalStreak,
  comebackUsedAt,
  onAccept,
  onDecline,
}: Props) {
  const { t } = useTranslation();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(24 * 60 * 60 * 1000); // 24 hours in ms
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, []);

  useEffect(() => {
    // Check if comeback was used within 30 days - if so, skip to start fresh
    if (!canUseComebackChallenge(comebackUsedAt)) {
      onDecline();
      return;
    }

    // Update countdown timer every second
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [comebackUsedAt, onDecline]);

  const loadChallenge = async () => {
    try {
      const hardestChallenge = await getHardestChallengeForPillar(primaryPillar);
      setChallenge(hardestChallenge);
    } catch (error) {
      console.error('Failed to load challenge:', error);
      Alert.alert('Error', 'Failed to load challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!challenge) return;
    
    setAccepting(true);
    try {
      await createComebackChallenge(userId, challenge.id);
      onAccept(challenge.id);
    } catch (error) {
      console.error('Failed to create comeback challenge:', error);
      Alert.alert('Error', 'Failed to create challenge. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const restoredStreak = Math.floor(originalStreak / 2);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>No challenge available</Text>
          <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
            <Text style={styles.declineButtonText}>{t('relapse.start_fresh')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('relapse.comeback_challenge_title')}</Text>
          <Text style={styles.subtitle}>{t('relapse.comeback_challenge_subtitle')}</Text>
        </View>

        {/* Timer */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>{t('relapse.time_remaining')}</Text>
          <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>
        </View>

        {/* Challenge Description */}
        <View style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>Your Challenge</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardText}>
              Complete this to restore your streak to {restoredStreak} days
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.acceptButton, accepting && styles.buttonDisabled]}
            onPress={handleAccept}
            disabled={accepting}
            accessibilityRole="button"
            accessibilityLabel={t('relapse.accept_challenge')}
          >
            <Text style={styles.acceptButtonText}>
              {accepting ? t('common.loading') : t('relapse.accept_challenge')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.declineButton}
            onPress={onDecline}
            accessibilityRole="button"
            accessibilityLabel={t('relapse.start_fresh')}
          >
            <Text style={styles.declineButtonText}>{t('relapse.start_fresh')}</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  timerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.warning,
  },
  timerLabel: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  timerValue: {
    ...typography.h1,
    fontSize: 48,
    color: colors.warning,
    fontFamily: 'monospace',
  },
  challengeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  challengeTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  challengeDescription: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  rewardInfo: {
    backgroundColor: colors.success + '20',
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  rewardText: {
    ...typography.caption,
    color: colors.success,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: spacing.md,
  },
  acceptButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  acceptButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  declineButtonText: {
    ...typography.body,
    color: colors.textMuted,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});