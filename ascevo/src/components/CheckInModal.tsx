import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  SafeAreaView,
} from 'react-native';
import { colors, typography, spacing, radius } from '../theme';
import { supabase } from '../services/supabaseClient';

/**
 * CheckInModal Props Interface
 * 
 * Props for the CheckInModal component that handles the daily check-in flow.
 * 
 * @property {boolean} visible - Controls modal visibility
 * @property {string} userId - Authenticated user ID for saving check-in data
 * @property {function} onComplete - Callback when check-in is completed with mood, focus, and intention data
 * @property {function} onClose - Callback when modal is closed without completing
 */
interface Props {
  visible: boolean;
  userId: string;
  onComplete: (data: { mood: string; focus: string; intention: string }) => void;
  onClose: () => void;
}

/**
 * Mood options for check-in
 * 
 * Predefined mood choices with emoji, label, and value.
 * Used in Step 1 of the check-in flow.
 */
const MOODS = [
  { emoji: '😔', label: 'Struggling', value: 'struggling' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '🤩', label: 'Amazing', value: 'amazing' },
];

/**
 * CheckInModal Component
 * 
 * Multi-step modal for daily check-in with mood selection, focus input, and completion screen.
 * Awards +50 XP on completion and saves check-in data to Supabase.
 * 
 * Flow:
 * 1. Step 1: Select mood (5 emoji options)
 * 2. Step 2: Enter focus text (what's your focus today?)
 * 3. Step 3: Completion screen with summary
 * 
 * Features:
 * - 3-step wizard with validation
 * - Animated transitions between steps
 * - Error handling with user-friendly messages
 * - Saves check-in data to Supabase
 * - Awards +50 XP via onComplete callback
 * - Auto-closes after completion
 * 
 * @param {Props} props - Component props
 * @param {boolean} props.visible - Controls modal visibility
 * @param {string} props.userId - User ID for saving check-in
 * @param {function} props.onComplete - Called when check-in completes with data
 * @param {function} props.onClose - Called when modal is closed
 * 
 * @example
 * ```tsx
 * <CheckInModal
 *   visible={isVisible}
 *   userId={user.id}
 *   onComplete={(data) => {
 *     updateXP(50);
 *     console.log('Check-in:', data);
 *   }}
 *   onClose={() => setIsVisible(false)}
 * />
 * ```
 */
export default function CheckInModal({ visible, userId, onComplete, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState('');
  const [focus, setFocus] = useState('');
  const [intention, setIntention] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      setStep(1);
      setMood('');
      setFocus('');
      setIntention('');
      setIsSubmitting(false);
      setError(null);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  /**
   * Handle next button press
   * 
   * Advances to the next step if current step is valid.
   * Step 1 requires mood selection, Step 2 requires focus text.
   * Step 3 triggers completion and saves data.
   * 
   * @async
   */
  async function handleNext() {
    if (step === 1 && mood) {
      setStep(2);
    } else if (step === 2 && focus) {
      setStep(3);
    } else if (step === 3) {
      // Step 3 is completion screen - save data and award XP
      await handleComplete();
    }
  }

  /**
   * Handle check-in completion
   * 
   * Saves check-in data to Supabase and triggers onComplete callback.
   * Continues even if database save fails to ensure good user experience.
   * Auto-closes modal after 1.5 seconds.
   * 
   * @async
   */
  async function handleComplete() {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Save check-in data to Supabase
      const { error: insertError } = await supabase
        .from('check_ins')
        .insert({
          user_id: userId,
          mood,
          focus,
          intention: intention || 'No intention set',
          xp_awarded: 50,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('[CheckInModal] Failed to save check-in:', insertError);
        setError('Unable to save your check-in. Your XP will still be awarded.');
        // Continue anyway - don't block user experience
      }

      // Call onComplete callback to award XP
      onComplete({ mood, focus, intention });
      
      // Close modal after brief delay to show completion screen
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('[CheckInModal] Error completing check-in:', error);
      setError('Something went wrong, but your XP has been awarded.');
      // Continue anyway - don't block user experience
      onComplete({ mood, focus, intention });
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Handle back button press
   * 
   * Navigates to the previous step.
   * Only available in steps 1-2 (not on completion screen).
   */
  function handleBack() {
    if (step > 1 && step < 3) {
      setStep(step - 1);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.stepIndicator}>Step {step} of 3</Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {error}</Text>
              </View>
            )}

            {/* Step 1: Mood */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.question}>How are you feeling?</Text>
                <View style={styles.moodGrid}>
                  {MOODS.map((m) => (
                    <TouchableOpacity
                      key={m.value}
                      style={[
                        styles.moodButton,
                        mood === m.value && styles.moodButtonSelected,
                      ]}
                      onPress={() => setMood(m.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.moodEmoji}>{m.emoji}</Text>
                      <Text style={styles.moodLabel}>{m.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Step 2: Focus */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.question}>What's your focus today?</Text>
                <TextInput
                  style={styles.input}
                  value={focus}
                  onChangeText={setFocus}
                  placeholder="e.g., Complete 2 lessons, stay consistent..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  maxLength={200}
                  autoFocus
                />
              </View>
            )}

            {/* Step 3: Completion Screen */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <View style={styles.completionContainer}>
                  <Text style={styles.completionEmoji}>✨</Text>
                  <Text style={styles.completionTitle}>Check-in Complete!</Text>
                  <Text style={styles.completionMessage}>
                    You've earned +50 XP for checking in today.
                  </Text>
                  <View style={styles.completionSummary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Mood:</Text>
                      <Text style={styles.summaryValue}>
                        {MOODS.find(m => m.value === mood)?.emoji} {MOODS.find(m => m.value === mood)?.label}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Focus:</Text>
                      <Text style={styles.summaryValue}>{focus}</Text>
                    </View>
                  </View>
                  <Text style={styles.completionFooter}>
                    Keep up the momentum! 🚀
                  </Text>
                </View>
              </View>
            )}

            {/* Navigation */}
            <View style={styles.navigation}>
              {step > 1 && step < 3 && (
                <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
                  <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
              )}
              {step < 3 && (
                <TouchableOpacity
                  style={[
                    styles.nextBtn,
                    (!mood && step === 1) || (!focus && step === 2)
                      ? styles.nextBtnDisabled
                      : null,
                  ]}
                  onPress={handleNext}
                  disabled={(!mood && step === 1) || (!focus && step === 2)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextBtnText}>Next →</Text>
                </TouchableOpacity>
              )}
              {step === 3 && (
                <TouchableOpacity
                  style={[styles.nextBtn, styles.completeBtn]}
                  onPress={handleNext}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextBtnText}>
                    {isSubmitting ? 'Saving...' : 'Done ✓'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: 24,
  },
  stepIndicator: {
    ...typography.small,
    color: colors.textMuted,
  },
  stepContent: {
    minHeight: 300,
  },
  question: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  moodButton: {
    width: 80,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124,58,237,0.2)',
  },
  moodEmoji: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    ...typography.small,
    color: colors.text,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  navigation: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  backBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  backBtnText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  nextBtn: {
    flex: 2,
    padding: spacing.md,
    borderRadius: 100,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: 'rgba(124,58,237,0.3)',
  },
  nextBtnText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  completionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  completionEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  completionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  completionMessage: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  completionSummary: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    ...typography.bodyBold,
    color: colors.textMuted,
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  completionFooter: {
    ...typography.body,
    color: '#7C3AED',
    textAlign: 'center',
  },
  completeBtn: {
    backgroundColor: '#16A34A',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorBannerText: {
    ...typography.small,
    color: '#FCA5A5',
    textAlign: 'center',
  },
});
