import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {
  validateMinWordCount,
  getQ2Insight,
  submitDebrief,
  getTomorrowFocusPreview,
} from '../../services/debriefService';
import { colors, typography, spacing, radius } from '../../theme';
import type { Q1Answer, DebriefFlowState } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'q1' | 'q2' | 'q3' | 'verdict';

interface Props {
  userId: string;
  onDismiss: () => void;
}

// ─── Q1 option config ─────────────────────────────────────────────────────────

const Q1_OPTIONS: { answer: Q1Answer; label: string; followUp: string; enforceWordCount: boolean }[] = [
  { answer: 'yes_crushed_it', label: 'Yes, crushed it', followUp: 'What made it work?', enforceWordCount: false },
  { answer: 'partially', label: 'Partially', followUp: 'What got in the way?', enforceWordCount: false },
  { answer: 'no_didnt_happen', label: "No, didn't happen", followUp: 'What actually happened?', enforceWordCount: true },
];

const MIN_WORDS = 10;

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function EveningDebriefScreen({ userId, onDismiss }: Props) {
  const [step, setStep] = useState<Step>('q1');
  const [flow, setFlow] = useState<DebriefFlowState>({
    q1Answer: null,
    q1Detail: '',
    q2Obstacle: '',
    q3Note: '',
    q2Insight: null,
    rexVerdict: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tomorrowFocus, setTomorrowFocus] = useState<string | null>(null);
  const [xpAnim] = useState(new Animated.Value(0));

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const selectedQ1Option = Q1_OPTIONS.find(o => o.answer === flow.q1Answer);

  const q1DetailValid = selectedQ1Option
    ? selectedQ1Option.enforceWordCount
      ? validateMinWordCount(flow.q1Detail, MIN_WORDS)
      : flow.q1Detail.trim().length > 0
    : false;

  const q2Valid = validateMinWordCount(flow.q2Obstacle, MIN_WORDS);

  // ── Step transitions ─────────────────────────────────────────────────────────

  async function handleQ1Next() {
    if (!flow.q1Answer || !q1DetailValid) return;
    setStep('q2');
    setError(null);
  }

  async function handleQ2Submit() {
    if (!q2Valid || loading) return;
    setLoading(true);
    setError(null);
    try {
      const insight = await getQ2Insight(userId, flow.q2Obstacle);
      setFlow(prev => ({ ...prev, q2Insight: insight }));
      setStep('q3');
    } catch {
      setError('Failed to get insight. Tap retry.');
    } finally {
      setLoading(false);
    }
  }

  async function handleQ3Submit(skip = false) {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const finalState: DebriefFlowState = {
        ...flow,
        q3Note: skip ? '' : flow.q3Note,
      };
      const debrief = await submitDebrief(userId, finalState);
      const focus = await getTomorrowFocusPreview(userId);
      setFlow(prev => ({ ...prev, rexVerdict: debrief.rexVerdict }));
      setTomorrowFocus(focus);
      setStep('verdict');
      // Animate +20 XP
      Animated.sequence([
        Animated.timing(xpAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(xpAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    } catch {
      setError('Something went wrong. Tap retry.');
    } finally {
      setLoading(false);
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────────

  function renderError() {
    if (!error) return null;
    return (
      <TouchableOpacity
        style={styles.errorBox}
        onPress={() => {
          setError(null);
          if (step === 'q2') handleQ2Submit();
          else if (step === 'q3') handleQ3Submit();
        }}
      >
        <Text style={styles.errorText}>{error} Tap to retry.</Text>
      </TouchableOpacity>
    );
  }

  // ── Q1 ───────────────────────────────────────────────────────────────────────

  function renderQ1() {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepLabel}>Q1 of 3</Text>
        <Text style={styles.question}>Did you do the thing today?</Text>

        <View style={styles.optionList}>
          {Q1_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.answer}
              style={[
                styles.optionCard,
                flow.q1Answer === opt.answer && styles.optionCardSelected,
              ]}
              onPress={() => setFlow(prev => ({ ...prev, q1Answer: opt.answer, q1Detail: '' }))}
              accessibilityRole="button"
              accessibilityState={{ selected: flow.q1Answer === opt.answer }}
            >
              <Text style={[
                styles.optionLabel,
                flow.q1Answer === opt.answer && styles.optionLabelSelected,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedQ1Option && (
          <View style={styles.followUpContainer}>
            <Text style={styles.followUpLabel}>{selectedQ1Option.followUp}</Text>
            <TextInput
              style={styles.textInput}
              value={flow.q1Detail}
              onChangeText={text => setFlow(prev => ({ ...prev, q1Detail: text }))}
              placeholder="Type here..."
              placeholderTextColor={colors.textMuted}
              multiline
              accessibilityLabel={selectedQ1Option.followUp}
            />
            {selectedQ1Option.enforceWordCount && (
              <Text style={styles.wordCountHint}>
                {flow.q1Detail.trim().split(/\s+/).filter(w => w.length > 0).length}/{MIN_WORDS} words minimum
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, (!flow.q1Answer || !q1DetailValid) && styles.primaryButtonDisabled]}
          onPress={handleQ1Next}
          disabled={!flow.q1Answer || !q1DetailValid}
          accessibilityRole="button"
        >
          <Text style={[styles.primaryButtonText, (!flow.q1Answer || !q1DetailValid) && styles.primaryButtonTextDisabled]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Q2 ───────────────────────────────────────────────────────────────────────

  function renderQ2() {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepLabel}>Q2 of 3</Text>
        <Text style={styles.question}>What tried to stop you today?</Text>

        <TextInput
          style={styles.textInput}
          value={flow.q2Obstacle}
          onChangeText={text => setFlow(prev => ({ ...prev, q2Obstacle: text }))}
          placeholder="Be specific. What actually got in the way?"
          placeholderTextColor={colors.textMuted}
          multiline
          accessibilityLabel="What tried to stop you today"
        />
        <Text style={styles.wordCountHint}>
          {flow.q2Obstacle.trim().split(/\s+/).filter(w => w.length > 0).length}/{MIN_WORDS} words minimum
        </Text>

        {renderError()}

        <TouchableOpacity
          style={[styles.primaryButton, (!q2Valid || loading) && styles.primaryButtonDisabled]}
          onPress={handleQ2Submit}
          disabled={!q2Valid || loading}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <Text style={[styles.primaryButtonText, (!q2Valid || loading) && styles.primaryButtonTextDisabled]}>
              Submit →
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // ── Q3 ───────────────────────────────────────────────────────────────────────

  function renderQ3() {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepLabel}>Q3 of 3</Text>
        <Text style={styles.question}>What does tomorrow-you need to know?</Text>
        <Text style={styles.optionalHint}>Optional — but worth it.</Text>

        {/* Q2 insight inline */}
        {flow.q2Insight && (
          <View style={styles.insightBox}>
            <Text style={styles.insightLabel}>Rex</Text>
            <Text style={styles.insightText}>{flow.q2Insight}</Text>
          </View>
        )}

        <TextInput
          style={styles.textInput}
          value={flow.q3Note}
          onChangeText={text => setFlow(prev => ({ ...prev, q3Note: text }))}
          placeholder="Leave a note for tomorrow..."
          placeholderTextColor={colors.textMuted}
          multiline
          accessibilityLabel="What does tomorrow-you need to know"
        />

        {renderError()}

        <View style={styles.rowButtons}>
          <TouchableOpacity
            style={[styles.secondaryButton, loading && styles.primaryButtonDisabled]}
            onPress={() => handleQ3Submit(true)}
            disabled={loading}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, styles.flex1, loading && styles.primaryButtonDisabled]}
            onPress={() => handleQ3Submit(false)}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Done →</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Verdict ──────────────────────────────────────────────────────────────────

  function renderVerdict() {
    const xpOpacity = xpAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const xpTranslate = xpAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

    return (
      <ScrollView contentContainerStyle={styles.verdictContainer} showsVerticalScrollIndicator={false}>
        {/* XP animation */}
        <Animated.View style={[styles.xpBadge, { opacity: xpOpacity, transform: [{ translateY: xpTranslate }] }]}>
          <Text style={styles.xpText}>+20 XP 🔥</Text>
        </Animated.View>

        {/* Rex verdict */}
        <View style={styles.verdictBox}>
          <Text style={styles.verdictLabel}>Rex's Verdict</Text>
          <Text style={styles.verdictText}>{flow.rexVerdict ?? 'Day logged. Keep going.'}</Text>
        </View>

        {/* Tomorrow's focus */}
        {tomorrowFocus && (
          <View style={styles.tomorrowBox}>
            <Text style={styles.tomorrowLabel}>Tomorrow's Focus</Text>
            <Text style={styles.tomorrowText}>{tomorrowFocus}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close debrief"
        >
          <Text style={styles.primaryButtonText}>Close →</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Root render ──────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Evening Debrief</Text>
        <Text style={styles.subheader}>2 minutes. Be honest.</Text>

        {step === 'q1' && renderQ1()}
        {step === 'q2' && renderQ2()}
        {step === 'q3' && renderQ3()}
        {step === 'verdict' && renderVerdict()}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md,
    paddingTop: 60,
    paddingBottom: 48,
    gap: spacing.lg,
  },

  // Header
  header: {
    ...typography.h1,
    color: colors.text,
  },
  subheader: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },

  // Step container
  stepContainer: {
    gap: spacing.md,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  question: {
    ...typography.h2,
    color: colors.text,
  },
  optionalHint: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },

  // Q1 options
  optionList: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  optionLabel: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  optionLabelSelected: {
    color: colors.primary,
  },

  // Follow-up
  followUpContainer: {
    gap: spacing.sm,
  },
  followUpLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },

  // Text input
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  wordCountHint: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'right',
  },

  // Insight box
  insightBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    gap: 4,
  },
  insightLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  insightText: {
    ...typography.body,
    color: colors.text,
  },

  // Buttons
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.surface,
  },
  primaryButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  primaryButtonTextDisabled: {
    color: colors.textMuted,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  secondaryButtonText: {
    ...typography.bodyBold,
    color: colors.textMuted,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },

  // Error
  errorBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
  },

  // Verdict
  verdictContainer: {
    gap: spacing.lg,
    paddingBottom: 48,
  },
  xpBadge: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  xpText: {
    ...typography.bodyBold,
    color: colors.xpGold,
  },
  verdictBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  verdictLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  verdictText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
  },
  tomorrowBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.xpGold,
  },
  tomorrowLabel: {
    ...typography.caption,
    color: colors.xpGold,
  },
  tomorrowText: {
    ...typography.bodyBold,
    color: colors.text,
    lineHeight: 26,
  },
});
