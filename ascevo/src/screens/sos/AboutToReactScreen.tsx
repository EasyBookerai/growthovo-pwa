import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
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
  onComplete: () => void;
}

type ScreenStage = 'countdown' | 'input' | 'response';

const COUNTDOWN_SECONDS = 90;

export default function AboutToReactScreen({ userId, eventId, onComplete }: Props) {
  const [stage, setStage] = useState<ScreenStage>('countdown');
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [situation, setSituation] = useState('');
  const [calmDraft, setCalmDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Animated circle scale: starts at 1, expands to 1.8 over 90 seconds
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Start expanding circle animation over 90 seconds
    animRef.current = Animated.timing(scaleAnim, {
      toValue: 1.8,
      duration: COUNTDOWN_SECONDS * 1000,
      useNativeDriver: true,
    });
    animRef.current.start();

    // Countdown ticker
    let remaining = COUNTDOWN_SECONDS;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setStage('input');
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      animRef.current?.stop();
    };
  }, []);

  async function handleSubmit() {
    if (!situation.trim()) return;
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('sos-response', {
        body: {
          type: 'about_to_react',
          userId,
          subscriptionStatus: 'active',
          payload: { situation: situation.trim() },
        },
      });
      setCalmDraft(data?.message || getSOSFallback('about_to_react'));
    } catch {
      setCalmDraft(getSOSFallback('about_to_react'));
    } finally {
      setLoading(false);
      setStage('response');
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
        {stage === 'countdown' && (
          <View style={styles.section}>
            <Text style={styles.title}>Put the phone down for 90 seconds first.</Text>
            <Text style={styles.subtitle}>
              Whatever you're about to send — wait. The circle will tell you when.
            </Text>

            <View style={styles.circleContainer}>
              <Animated.View
                style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}
              />
              <View style={styles.circleOverlay}>
                <Text style={styles.countdownNumber}>{secondsLeft}</Text>
                <Text style={styles.countdownLabel}>seconds</Text>
              </View>
            </View>

            <Text style={styles.noSkipHint}>You cannot skip this.</Text>
          </View>
        )}

        {stage === 'input' && (
          <View style={styles.section}>
            <Text style={styles.title}>Still want to send it?</Text>
            <Text style={styles.subtitle}>Here's what to say instead.</Text>
            <Text style={styles.prompt}>
              Describe the situation in 2–3 words so Rex can help you draft a calm response.
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 'angry at boss', 'fight with partner'"
              placeholderTextColor={colors.textMuted}
              value={situation}
              onChangeText={setSituation}
              maxLength={60}
              accessibilityLabel="Situation description input"
            />
            <TouchableOpacity
              style={[styles.button, !situation.trim() && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!situation.trim() || loading}
              accessibilityLabel="Get calm response"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <Text style={styles.buttonText}>Get calm response</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {stage === 'response' && (
          <View style={styles.section}>
            <Text style={styles.rexLabel}>Rex</Text>
            <Text style={styles.responseText}>{calmDraft}</Text>
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
  circleContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  circle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    opacity: 0.5,
  },
  circleOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  countdownLabel: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  noSkipHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  prompt: {
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
    marginBottom: -spacing.sm,
  },
  responseText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
});
