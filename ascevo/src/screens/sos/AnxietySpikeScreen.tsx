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
import { completeSOSEvent, getAnxietyHistoryCount, getSOSFallback } from '../../services/sosService';
import { colors, spacing, radius, typography } from '../../theme';

interface Props {
  userId: string;
  eventId: string;
  onComplete: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale';
type ScreenStage = 'breathing' | 'reframe' | 'closing';

interface BreathingPhase {
  label: string;
  duration: number; // ms
  toScale: number;
}

const PHASES: BreathingPhase[] = [
  { label: 'Inhale 4s', duration: 4000, toScale: 1.6 },
  { label: 'Hold 7s', duration: 7000, toScale: 1.6 },
  { label: 'Exhale 8s', duration: 8000, toScale: 1.0 },
];

const CYCLE_DURATION_MS = 19000; // 4 + 7 + 8
const MIN_CYCLES = 3;

export default function AnxietySpikeScreen({ userId, eventId, onComplete }: Props) {
  const [stage, setStage] = useState<ScreenStage>('breathing');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration / 1000);
  const [reframeText, setReframeText] = useState('');
  const [closingLine, setClosingLine] = useState('');
  const [loadingClosing, setLoadingClosing] = useState(false);
  const [completing, setCompleting] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1.0)).current;
  const phaseRef = useRef(0);
  const cyclesRef = useRef(0);
  const activeRef = useRef(true);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Run breathing animation loop
  useEffect(() => {
    activeRef.current = true;
    runPhase(0);
    return () => {
      activeRef.current = false;
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runPhase(idx: number) {
    if (!activeRef.current) return;
    const phase = PHASES[idx];
    phaseRef.current = idx;
    setPhaseIndex(idx);

    // Start countdown
    let remaining = phase.duration / 1000;
    setCountdown(remaining);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining >= 0) setCountdown(remaining);
    }, 1000);

    // Animate scale
    Animated.timing(scaleAnim, {
      toValue: phase.toScale,
      duration: phase.duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished || !activeRef.current) return;
      if (countdownRef.current) clearInterval(countdownRef.current);

      const nextIdx = (idx + 1) % PHASES.length;
      if (nextIdx === 0) {
        // Completed a full cycle
        const newCycles = cyclesRef.current + 1;
        cyclesRef.current = newCycles;
        setCyclesCompleted(newCycles);
      }
      runPhase(nextIdx);
    });
  }

  function handleNextAfterBreathing() {
    activeRef.current = false;
    if (countdownRef.current) clearInterval(countdownRef.current);
    scaleAnim.stopAnimation();
    setStage('reframe');
  }

  async function handleReframeSubmit() {
    if (!reframeText.trim()) return;
    setLoadingClosing(true);
    try {
      const anxietyCount = await getAnxietyHistoryCount(userId, 30);
      const { data } = await supabase.functions.invoke('sos-response', {
        body: {
          type: 'anxiety_spike',
          userId,
          subscriptionStatus: 'active',
          payload: { anxietyCount },
        },
      });
      setClosingLine(data?.message || getSOSFallback('anxiety_spike'));
    } catch {
      setClosingLine(getSOSFallback('anxiety_spike'));
    } finally {
      setLoadingClosing(false);
      setStage('closing');
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

  const nextEnabled = cyclesCompleted >= MIN_CYCLES;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {stage === 'breathing' && (
          <View style={styles.section}>
            <Text style={styles.title}>4-7-8 Breathing</Text>
            <Text style={styles.subtitle}>
              Follow the circle. Minimum 3 cycles before you can continue.
            </Text>

            <View style={styles.circleContainer}>
              <Animated.View
                style={[
                  styles.circle,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              />
              <View style={styles.circleOverlay}>
                <Text style={styles.phaseLabel}>{PHASES[phaseIndex].label}</Text>
                <Text style={styles.countdown}>{countdown}</Text>
              </View>
            </View>

            <Text style={styles.cycleCount}>
              Cycles: {cyclesCompleted} / {MIN_CYCLES}
            </Text>

            <TouchableOpacity
              style={[styles.button, !nextEnabled && styles.buttonDisabled]}
              onPress={handleNextAfterBreathing}
              disabled={!nextEnabled}
              accessibilityLabel="Continue to reframe"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {stage === 'reframe' && (
          <View style={styles.section}>
            <Text style={styles.title}>Cognitive Reframe</Text>
            <Text style={styles.prompt}>
              Name 3 things actually in your control right now.
            </Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Write them here..."
              placeholderTextColor={colors.textMuted}
              value={reframeText}
              onChangeText={setReframeText}
              accessibilityLabel="Cognitive reframe input"
            />
            <TouchableOpacity
              style={[styles.button, !reframeText.trim() && styles.buttonDisabled]}
              onPress={handleReframeSubmit}
              disabled={!reframeText.trim() || loadingClosing}
              accessibilityLabel="Submit reframe"
              accessibilityRole="button"
            >
              {loadingClosing ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {stage === 'closing' && (
          <View style={styles.section}>
            <Text style={styles.rexLabel}>Rex</Text>
            <Text style={styles.closingLine}>{closingLine}</Text>
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
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  circle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
  circleOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    ...typography.bodyBold,
    color: colors.text,
    textAlign: 'center',
  },
  countdown: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  cycleCount: {
    ...typography.small,
    color: colors.textMuted,
  },
  prompt: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  textInput: {
    width: '100%',
    minHeight: 120,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
    textAlignVertical: 'top',
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
  closingLine: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
});
