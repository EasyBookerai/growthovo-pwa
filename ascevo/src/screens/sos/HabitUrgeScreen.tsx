import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { supabase } from '../../services/supabaseClient';
import { completeSOSEvent, getSOSFallback } from '../../services/sosService';
import { colors, spacing, radius, typography } from '../../theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const HABITS = [
  'Scrolling social media',
  'Eating junk food',
  'Smoking',
  'Drinking alcohol',
  'Procrastinating',
  'Other',
];

const WAVE_METAPHOR =
  "The urge will pass in 4–7 minutes. Don't feed it. Watch it like a wave.";

const DISTRACTION_CHALLENGE =
  'Do 10 push-ups right now. Or walk to the nearest window and look outside for 2 minutes.';

const TEXT_GUIDE = `Urge Surfing Guide

1. Notice the urge without judgment. Name it: "I'm feeling an urge to ${'{habit}'}."
2. Observe where you feel it in your body — chest, stomach, hands?
3. Breathe slowly: inhale 4 counts, hold 4 counts, exhale 6 counts.
4. Watch the urge like a wave — it will rise, peak, and fall on its own.
5. Repeat the breathing until the wave passes.

You don't have to act on it. You've surfed it before.`;

const SUCCESS_AWAY_MINUTES = 10;
const XP_AWARD = 15;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  userId: string;
  eventId: string;
  subscriptionStatus: string;
  onComplete: () => void;
}

type Stage = 'select' | 'surfing' | 'challenge';

// ─── Component ────────────────────────────────────────────────────────────────

export default function HabitUrgeScreen({
  userId,
  eventId,
  subscriptionStatus,
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('select');
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Track when user leaves the app to detect 10+ minute absence
  const backgroundedAtRef = useRef<number | null>(null);
  const successAwardedRef = useRef(false);

  const isPremium =
    subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  // ─── App state listener for 10-min success ──────────────────────────────────

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'background' || nextState === 'inactive') {
          backgroundedAtRef.current = Date.now();
        } else if (nextState === 'active') {
          const backgroundedAt = backgroundedAtRef.current;
          if (
            backgroundedAt !== null &&
            !successAwardedRef.current &&
            stage === 'surfing'
          ) {
            const minutesAway = (Date.now() - backgroundedAt) / 60000;
            if (minutesAway >= SUCCESS_AWAY_MINUTES) {
              successAwardedRef.current = true;
              handleSuccessReturn();
            }
          }
          backgroundedAtRef.current = null;
        }
      }
    );

    return () => subscription.remove();
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers ───────────────────────────────────────────────────────────────

  async function handleHabitSelect(habit: string) {
    setSelectedHabit(habit);
    setStage('surfing');

    if (isPremium) {
      setLoadingAudio(true);
      try {
        const { data } = await supabase.functions.invoke('generate-urge-audio', {
          body: { userId, habit, subscriptionStatus },
        });
        if (data?.audioUrl) {
          setAudioUrl(data.audioUrl);
        }
      } catch {
        // Silently fall back to text guide — requirement 11.7
      } finally {
        setLoadingAudio(false);
      }
    }
  }

  async function handleSuccessReturn() {
    try {
      await completeSOSEvent(eventId, 'success');
      // Award 15 XP — requirement 11.5
      await supabase.rpc('award_xp', { p_user_id: userId, p_amount: XP_AWARD, p_source: 'habit_urge_success' });
    } catch (err) {
      console.error('Failed to record urge success:', err);
    }
  }

  async function handleDone() {
    setCompleting(true);
    try {
      if (!successAwardedRef.current) {
        await completeSOSEvent(eventId, 'completed');
      }
    } catch (err) {
      console.error('Failed to complete SOS event:', err);
    } finally {
      setCompleting(false);
      onComplete();
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      {stage === 'select' && (
        <View style={styles.section}>
          <Text style={styles.title}>What's the urge?</Text>
          <Text style={styles.subtitle}>
            Pick the habit you're fighting right now.
          </Text>
          {HABITS.map((habit) => (
            <TouchableOpacity
              key={habit}
              style={styles.habitCard}
              onPress={() => handleHabitSelect(habit)}
              accessibilityLabel={`Select habit: ${habit}`}
              accessibilityRole="button"
            >
              <Text style={styles.habitText}>{habit}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {stage === 'surfing' && (
        <View style={styles.section}>
          <Text style={styles.title}>Urge Surfing</Text>

          {/* Wave metaphor — requirement 11.2 */}
          <View style={styles.waveCard}>
            <Text style={styles.waveEmoji}>🌊</Text>
            <Text style={styles.waveText}>{WAVE_METAPHOR}</Text>
          </View>

          {/* Premium: audio URL note / Free: text guide — requirements 11.3, 11.4 */}
          {isPremium ? (
            loadingAudio ? (
              <View style={styles.audioBox}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={styles.audioNote}>
                  Generating your guided audio…
                </Text>
              </View>
            ) : audioUrl ? (
              <View style={styles.audioBox}>
                <Text style={styles.audioLabel}>🎧 Guided Audio Ready</Text>
                <Text style={styles.audioNote}>
                  Audio generated. Open this link in your browser to listen:
                </Text>
                <Text style={styles.audioUrl} selectable>
                  {audioUrl}
                </Text>
              </View>
            ) : (
              // TTS failed — fall back to text guide (requirement 11.7)
              <View style={styles.guideBox}>
                <Text style={styles.guideText}>
                  {TEXT_GUIDE.replace('{habit}', selectedHabit ?? 'this habit')}
                </Text>
              </View>
            )
          ) : (
            // Free user text guide — requirement 11.4
            <View style={styles.guideBox}>
              <Text style={styles.guideText}>
                {TEXT_GUIDE.replace('{habit}', selectedHabit ?? 'this habit')}
              </Text>
            </View>
          )}

          {/* Distraction challenge — requirement 11.4 */}
          <View style={styles.challengeCard}>
            <Text style={styles.challengeLabel}>⚡ Distraction Challenge</Text>
            <Text style={styles.challengeText}>{DISTRACTION_CHALLENGE}</Text>
          </View>

          <Text style={styles.awayHint}>
            Leave the app for 10+ minutes and we'll mark this as a win.
          </Text>

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
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  habitCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  habitText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  waveCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  waveEmoji: {
    fontSize: 36,
  },
  waveText: {
    ...typography.bodyBold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
  },
  audioBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  audioLabel: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  audioNote: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  audioUrl: {
    ...typography.small,
    color: colors.info,
    textAlign: 'center',
  },
  guideBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guideText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  challengeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  challengeLabel: {
    ...typography.smallBold,
    color: colors.warning,
  },
  challengeText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  awayHint: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
});
