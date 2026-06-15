import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { 
  saveTomorrowReminder, 
  markEveningDebriefDone, 
  getUserName 
} from '../../services/growthovoExperienceService';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'rating' | 'win' | 'challenge' | 'priority' | 'complete';

interface Props {
  onDismiss: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD_COLOR = '#FFD700';
const MAX_LINES = 3;

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function EveningDebriefScreen({ onDismiss }: Props) {
  const { updateXP, name: contextName } = useAppContext();
  
  const [step, setStep] = useState<Step>('rating');
  const [rating, setRating] = useState<number>(0);
  const [winText, setWinText] = useState<string>('');
  const [challengeText, setChallengeText] = useState<string>('');
  const [priorityText, setPriorityText] = useState<string>('');
  const [userName, setUserName] = useState<string>('Champion');
  const [xpAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    getUserName().then(setUserName);
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const countLines = (text: string): number => {
    return text.split('\n').length;
  };

  const canContinueFromRating = rating > 0;
  const canContinueFromWin = winText.trim().length > 0 && countLines(winText) <= MAX_LINES;
  const canContinueFromChallenge = challengeText.trim().length > 0;
  const canComplete = priorityText.trim().length > 0;

  // ── Step transitions ─────────────────────────────────────────────────────────

  async function handleCompleteDebrief() {
    try {
      // Save tomorrow's reminder to localStorage
      await saveTomorrowReminder(priorityText);
      
      // Mark debrief as done today
      await markEveningDebriefDone();
      
      // Award 30 XP
      await updateXP(30);
      
      // Show completion
      setStep('complete');
      
      // Animate XP badge
      Animated.sequence([
        Animated.timing(xpAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(xpAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    } catch (error) {
      console.error('Error completing debrief:', error);
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────────

  function renderStarRating() {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = rating >= star;
          return (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              accessibilityRole="button"
              accessibilityLabel={`Rate your day ${star} out of 5 stars`}
              accessibilityState={{ selected: isFilled }}
              style={styles.starButton}
            >
              <Text style={[styles.starIcon, isFilled && styles.starIconFilled]}>
                ★
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // ── Part 1: Day rating ───────────────────────────────────────────────────────

  function renderRating() {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepLabel}>Part 1 of 4</Text>
        <Text style={styles.question}>How was your day overall?</Text>
        
        {renderStarRating()}

        <TouchableOpacity
          style={[styles.primaryButton, !canContinueFromRating && styles.primaryButtonDisabled]}
          onPress={() => setStep('win')}
          disabled={!canContinueFromRating}
          accessibilityRole="button"
        >
          <Text style={[styles.primaryButtonText, !canContinueFromRating && styles.primaryButtonTextDisabled]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Part 2: Win reflection ───────────────────────────────────────────────────

  function renderWin() {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepLabel}>Part 2 of 4</Text>
        <Text style={styles.question}>What's one win from today?</Text>
        
        <TextInput
          style={styles.textInput}
          value={winText}
          onChangeText={setWinText}
          placeholder="Even something small counts..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          maxLength={200}
          accessibilityLabel="What's one win from today"
        />
        <Text style={styles.wordCountHint}>
          {countLines(winText)}/{MAX_LINES} lines {countLines(winText) > MAX_LINES && '(too many)'}
        </Text>

        <TouchableOpacity
          style={[styles.primaryButton, !canContinueFromWin && styles.primaryButtonDisabled]}
          onPress={() => setStep('challenge')}
          disabled={!canContinueFromWin}
          accessibilityRole="button"
        >
          <Text style={[styles.primaryButtonText, !canContinueFromWin && styles.primaryButtonTextDisabled]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Part 3: Challenge reflection ─────────────────────────────────────────────

  function renderChallenge() {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepLabel}>Part 3 of 4</Text>
        <Text style={styles.question}>What was challenging today?</Text>
        
        <TextInput
          style={styles.textInput}
          value={challengeText}
          onChangeText={setChallengeText}
          placeholder="No judgment, just reflection..."
          placeholderTextColor={colors.textMuted}
          multiline
          accessibilityLabel="What was challenging today"
        />

        <TouchableOpacity
          style={[styles.primaryButton, !canContinueFromChallenge && styles.primaryButtonDisabled]}
          onPress={() => setStep('priority')}
          disabled={!canContinueFromChallenge}
          accessibilityRole="button"
        >
          <Text style={[styles.primaryButtonText, !canContinueFromChallenge && styles.primaryButtonTextDisabled]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Part 4: Tomorrow's priority ──────────────────────────────────────────────

  function renderPriority() {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepLabel}>Part 4 of 4</Text>
        <Text style={styles.question}>What's the ONE thing you want to do tomorrow?</Text>
        
        <TextInput
          style={styles.textInput}
          value={priorityText}
          onChangeText={setPriorityText}
          placeholder="Tomorrow I will..."
          placeholderTextColor={colors.textMuted}
          multiline
          accessibilityLabel="What's the ONE thing you want to do tomorrow"
        />

        <TouchableOpacity
          style={[styles.primaryButton, !canComplete && styles.primaryButtonDisabled]}
          onPress={handleCompleteDebrief}
          disabled={!canComplete}
          accessibilityRole="button"
        >
          <Text style={[styles.primaryButtonText, !canComplete && styles.primaryButtonTextDisabled]}>
            Complete →
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Complete screen ──────────────────────────────────────────────────────────

  function renderComplete() {
    const xpOpacity = xpAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const xpTranslate = xpAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

    return (
      <ScrollView contentContainerStyle={styles.completeContainer} showsVerticalScrollIndicator={false}>
        {/* XP animation */}
        <Animated.View style={[styles.xpBadge, { opacity: xpOpacity, transform: [{ translateY: xpTranslate }] }]}>
          <Text style={styles.xpText}>+30 XP 🔥</Text>
        </Animated.View>

        {/* Rex response */}
        <View style={styles.rexBox}>
          <Text style={styles.rexLabel}>Rex</Text>
          <Text style={styles.rexText}>
            Got it. I'll remind you about "{priorityText}" tomorrow morning 💪
          </Text>
        </View>

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
        <Text style={styles.header}>🌙 Evening Debrief</Text>
        <Text style={styles.subheader}>4 quick reflections to close your day</Text>

        {step === 'rating' && renderRating()}
        {step === 'win' && renderWin()}
        {step === 'challenge' && renderChallenge()}
        {step === 'priority' && renderPriority()}
        {step === 'complete' && renderComplete()}
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

  // Star rating
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  starButton: {
    padding: spacing.xs,
  },
  starIcon: {
    fontSize: 48,
    color: colors.textMuted,
  },
  starIconFilled: {
    color: GOLD_COLOR,
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

  // Complete screen
  completeContainer: {
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
    color: GOLD_COLOR,
  },
  rexBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  rexLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  rexText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
  },
});
