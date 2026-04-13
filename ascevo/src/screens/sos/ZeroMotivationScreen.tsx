import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabaseClient';
import { completeSOSEvent, getSOSFallback } from '../../services/sosService';
import { colors, spacing, radius, typography } from '../../theme';

interface Props {
  userId: string;
  eventId: string;
  onComplete: () => void;
}

export default function ZeroMotivationScreen({ userId, eventId, onComplete }: Props) {
  const [resetMessage, setResetMessage] = useState('');
  const [microAction, setMicroAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchResetMessage();
  }, []);

  async function fetchResetMessage() {
    try {
      const { data } = await supabase.functions.invoke('sos-response', {
        body: {
          type: 'zero_motivation',
          userId,
          subscriptionStatus: 'active',
          payload: {
            goals: [],
            primaryPillar: 'discipline',
            streakCount: 0,
          },
        },
      });

      const message: string = data?.message || getSOSFallback('zero_motivation');
      parseMessage(message);
    } catch {
      parseMessage(getSOSFallback('zero_motivation'));
    } finally {
      setLoading(false);
    }
  }

  /**
   * Splits the reset message into the main body and the final micro-action sentence.
   * The micro-action is the last sentence of the response (Req 9.2).
   */
  function parseMessage(message: string) {
    const sentences = message.trim().split(/(?<=[.!?])\s+/);
    if (sentences.length > 1) {
      setMicroAction(sentences[sentences.length - 1]);
      setResetMessage(sentences.slice(0, -1).join(' '));
    } else {
      setResetMessage(message);
      setMicroAction('');
    }
  }

  async function handleDone() {
    setCompleting(true);
    try {
      await completeSOSEvent(eventId, 'completed');
    } catch (err) {
      console.error('Failed to complete SOS event:', err);
    } finally {
      setCompleting(false);
      onComplete();
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
    >
      <Text style={styles.title}>Zero Motivation Reset</Text>
      <Text style={styles.subtitle}>Rex has something to say.</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Rex is thinking...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.rexLabel}>Rex</Text>
          <Text style={styles.resetMessage}>{resetMessage}</Text>

          {microAction ? (
            <View style={styles.microActionCard}>
              <Text style={styles.microActionLabel}>Your micro-action</Text>
              <Text style={styles.microActionText}>{microAction}</Text>
            </View>
          ) : null}
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, (loading || completing) && styles.buttonDisabled]}
        onPress={handleDone}
        disabled={loading || completing}
        accessibilityLabel="Done"
        accessibilityRole="button"
      >
        {completing ? (
          <ActivityIndicator color={colors.text} size="small" />
        ) : (
          <Text style={styles.buttonText}>Done</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...typography.small,
    color: colors.textMuted,
  },
  content: {
    gap: spacing.lg,
  },
  rexLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  resetMessage: {
    ...typography.body,
    color: colors.text,
    lineHeight: 28,
  },
  microActionCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    gap: spacing.xs,
  },
  microActionLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  microActionText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
});
