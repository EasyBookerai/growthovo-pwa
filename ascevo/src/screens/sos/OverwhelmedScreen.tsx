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
import { validateMinWordCount } from '../../services/debriefService';
import { colors, spacing, radius, typography } from '../../theme';

interface Props {
  userId: string;
  eventId: string;
  onComplete: () => void;
}

interface OverwhelmedResponse {
  topPriority: string;
  thingsToIgnore: string[];
  resetSentence: string;
}

type ScreenStage = 'input' | 'response';

const MIN_WORDS = 10;

export default function OverwhelmedScreen({ userId, eventId, onComplete }: Props) {
  const [stage, setStage] = useState<ScreenStage>('input');
  const [brainDump, setBrainDump] = useState('');
  const [response, setResponse] = useState<OverwhelmedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);

  const isValid = validateMinWordCount(brainDump, MIN_WORDS);

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('sos-response', {
        body: {
          type: 'overwhelmed',
          userId,
          subscriptionStatus: 'active',
          payload: { brainDump: brainDump.trim() },
        },
      });
      if (data?.topPriority) {
        setResponse({
          topPriority: data.topPriority,
          thingsToIgnore: Array.isArray(data.thingsToIgnore) ? data.thingsToIgnore : [],
          resetSentence: data.resetSentence ?? '',
        });
      } else {
        setResponse({
          topPriority: getSOSFallback('overwhelmed'),
          thingsToIgnore: [],
          resetSentence: 'Breathe.',
        });
      }
    } catch {
      setResponse({
        topPriority: getSOSFallback('overwhelmed'),
        thingsToIgnore: [],
        resetSentence: 'Breathe.',
      });
    } finally {
      setLoading(false);
      setStage('response');
    }
  }

  async function handleDone() {
    setCompleting(true);
    try {
      await completeSOSEvent(eventId, 'completed', brainDump.trim());
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
        {/* ── Stage: Brain dump input ── */}
        {stage === 'input' && (
          <View style={styles.section}>
            <Text style={styles.title}>Dump everything in your head here.</Text>
            <Text style={styles.subtitle}>
              Rex will sort what actually matters from what can wait.
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="Everything. Work, people, tasks, fears — all of it."
              placeholderTextColor={colors.textMuted}
              value={brainDump}
              onChangeText={setBrainDump}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Brain dump text input"
            />
            <Text style={[styles.wordCount, isValid && styles.wordCountValid]}>
              {brainDump.trim().split(/\s+/).filter(w => w.length > 0).length} / {MIN_WORDS} words minimum
            </Text>
            <TouchableOpacity
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!isValid || loading}
              accessibilityLabel="Submit brain dump"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <Text style={styles.buttonText}>Sort it out</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Stage: Structured response ── */}
        {stage === 'response' && response && (
          <View style={styles.section}>
            <Text style={styles.rexLabel}>Rex</Text>

            <View style={styles.card}>
              <Text style={styles.cardHeading}>The one thing that matters today</Text>
              <Text style={styles.cardBody}>{response.topPriority}</Text>
            </View>

            {response.thingsToIgnore.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardHeading}>Ignore until tomorrow</Text>
                {response.thingsToIgnore.map((item, i) => (
                  <Text key={i} style={styles.ignoreItem}>
                    {'• '}{item}
                  </Text>
                ))}
              </View>
            )}

            <View style={[styles.card, styles.resetCard]}>
              <Text style={styles.resetSentence}>{response.resetSentence}</Text>
            </View>

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
  textArea: {
    width: '100%',
    minHeight: 160,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wordCount: {
    ...typography.small,
    color: colors.textMuted,
    alignSelf: 'flex-end',
  },
  wordCountValid: {
    color: colors.success,
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
  ignoreItem: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  resetCard: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  resetSentence: {
    ...typography.bodyBold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
  },
});
