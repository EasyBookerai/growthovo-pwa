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

interface Props {
  visible: boolean;
  onComplete: (data: { mood: string; focus: string; intention: string }) => void;
  onClose: () => void;
}

const MOODS = [
  { emoji: '😔', label: 'Struggling', value: 'struggling' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '🤩', label: 'Amazing', value: 'amazing' },
];

export default function CheckInModal({ visible, onComplete, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState('');
  const [focus, setFocus] = useState('');
  const [intention, setIntention] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      setStep(1);
      setMood('');
      setFocus('');
      setIntention('');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  function handleNext() {
    if (step === 1 && mood) {
      setStep(2);
    } else if (step === 2 && focus) {
      setStep(3);
    } else if (step === 3 && intention) {
      onComplete({ mood, focus, intention });
      onClose();
    }
  }

  function handleBack() {
    if (step > 1) {
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
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.stepIndicator}>Step {step} of 3</Text>
            </View>

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

            {/* Step 3: Intention */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.question}>Set one intention</Text>
                <TextInput
                  style={styles.input}
                  value={intention}
                  onChangeText={setIntention}
                  placeholder="e.g., I will be present in conversations..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  maxLength={200}
                  autoFocus
                />
              </View>
            )}

            {/* Navigation */}
            <View style={styles.navigation}>
              {step > 1 && (
                <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                  <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.nextBtn,
                  (!mood && step === 1) ||
                  (!focus && step === 2) ||
                  (!intention && step === 3)
                    ? styles.nextBtnDisabled
                    : null,
                ]}
                onPress={handleNext}
                disabled={
                  (!mood && step === 1) ||
                  (!focus && step === 2) ||
                  (!intention && step === 3)
                }
              >
                <Text style={styles.nextBtnText}>
                  {step === 3 ? 'Complete' : 'Next →'}
                </Text>
              </TouchableOpacity>
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
    borderRadius: radius.xl,
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
    borderRadius: radius.lg,
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
    borderRadius: radius.lg,
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
});
