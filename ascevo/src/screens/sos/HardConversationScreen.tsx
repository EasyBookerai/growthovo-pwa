import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../../services/supabaseClient';
import { completeSOSEvent, getSOSFallback } from '../../services/sosService';
import { colors, spacing, radius, typography } from '../../theme';

interface Props {
  userId: string;
  eventId: string;
  subscriptionStatus: string;
  onComplete: () => void;
}

interface HardConvPrep {
  openingLine: string;
  thingsToAvoid: string[];
  targetOutcome: string;
}

type ScreenStage = 'input' | 'prep' | 'rehearse';

const isPremium = (status: string) => status === 'active' || status === 'trialing';

export default function HardConversationScreen({
  userId,
  eventId,
  subscriptionStatus,
  onComplete,
}: Props) {
  const [stage, setStage] = useState<ScreenStage>('input');
  const [situation, setSituation] = useState('');
  const [prep, setPrep] = useState<HardConvPrep | null>(null);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [rehearseMessage, setRehearseMessage] = useState('');

  async function handleSubmit() {
    if (!situation.trim()) return;
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('sos-response', {
        body: {
          type: 'hard_conversation',
          userId,
          subscriptionStatus: 'active',
          payload: { situation: situation.trim() },
        },
      });
      if (data?.openingLine) {
        setPrep({
          openingLine: data.openingLine,
          thingsToAvoid: Array.isArray(data.thingsToAvoid) ? data.thingsToAvoid : [],
          targetOutcome: data.targetOutcome ?? '',
        });
      } else {
        // Fallback: parse from generic message or use structured fallback
        setPrep({
          openingLine: getSOSFallback('hard_conversation'),
          thingsToAvoid: [],
          targetOutcome: 'Stay calm and reach a mutual understanding.',
        });
      }
    } catch {
      setPrep({
        openingLine: getSOSFallback('hard_conversation'),
        thingsToAvoid: [],
        targetOutcome: 'Stay calm and reach a mutual understanding.',
      });
    } finally {
      setLoading(false);
      setStage('prep');
    }
  }

  function handleRehearsePress() {
    if (isPremium(subscriptionStatus)) {
      setRehearseMessage('Coming soon — Rehearse with Rex is on its way.');
      setStage('rehearse');
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Stage: Input ── */}
        {stage === 'input' && (
          <View style={styles.section}>
            <Text style={styles.title}>What's the conversation?</Text>
            <Text style={styles.subtitle}>
              Rex will give you an opening line, what to avoid, and the outcome to aim for.
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="2–3 words, e.g. 'firing someone', 'asking for raise'"
              placeholderTextColor={colors.textMuted}
              value={situation}
              onChangeText={setSituation}
              maxLength={80}
              accessibilityLabel="Conversation situation input"
            />
            <TouchableOpacity
              style={[styles.button, !situation.trim() && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!situation.trim() || loading}
              accessibilityLabel="Get prep from Rex"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <Text style={styles.buttonText}>Prep me</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Stage: Prep response ── */}
        {stage === 'prep' && prep && (
          <View style={styles.section}>
            <Text style={styles.rexLabel}>Rex</Text>

            <View style={styles.card}>
              <Text style={styles.cardHeading}>Open with</Text>
              <Text style={styles.cardBody}>{prep.openingLine}</Text>
            </View>

            {prep.thingsToAvoid.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardHeading}>Don't say</Text>
                {prep.thingsToAvoid.map((item, i) => (
                  <Text key={i} style={styles.avoidItem}>
                    {'• '}{item}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardHeading}>Target outcome</Text>
              <Text style={styles.cardBody}>{prep.targetOutcome}</Text>
            </View>

            {/* Rehearse with Rex — premium vs paywall */}
            {isPremium(subscriptionStatus) ? (
              <TouchableOpacity
                style={styles.rehearseButton}
                onPress={handleRehearsePress}
                accessibilityLabel="Rehearse with Rex"
                accessibilityRole="button"
              >
                <Text style={styles.rehearseButtonText}>🎭 Rehearse with Rex</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.paywallCard}>
                <Text style={styles.paywallTitle}>Rehearse with Rex</Text>
                <Text style={styles.paywallBody}>
                  Practice the conversation with Rex playing the other person. Upgrade to Premium to unlock.
                </Text>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  accessibilityLabel="Upgrade to Premium"
                  accessibilityRole="button"
                >
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleDone}
              disabled={completing}
              accessibilityLabel="Done"
              accessibilityRole="button"
            >
              {completing ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <Text style={styles.buttonText}>Done</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Stage: Rehearse placeholder ── */}
        {stage === 'rehearse' && (
          <View style={styles.section}>
            <Text style={styles.title}>Rehearse with Rex</Text>
            <Text style={styles.subtitle}>{rehearseMessage}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setStage('prep')}
              accessibilityLabel="Go back to prep"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Back to prep</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  section: {
    alignItems: 'center',
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
  textInput: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    minWidth: 160,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  rexLabel: {
    ...typography.caption,
    color: colors.primary,
    alignSelf: 'flex-start',
  },
  card: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeading: {
    ...typography.smallBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  avoidItem: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  rehearseButton: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  rehearseButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  paywallCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  paywallTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  paywallBody: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: colors.xpGold,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  upgradeButtonText: {
    ...typography.bodyBold,
    color: colors.background,
  },
});
