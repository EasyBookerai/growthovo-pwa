import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

interface Props {
  onComplete: (promises: [string, string, string]) => void;
}

const PROMPTS = [
  'In 90 days, I will...',
  'The one habit I\'m committing to is...',
  'My future self deserves...',
] as const;

export default function WrittenPromisesScreen({ onComplete }: Props) {
  const [values, setValues] = useState<[string, string, string]>(['', '', '']);
  const [errors, setErrors] = useState<[boolean, boolean, boolean]>([false, false, false]);

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleChange = (index: 0 | 1 | 2, text: string) => {
    const next = [...values] as [string, string, string];
    next[index] = text;
    setValues(next);
    if (text.trim().length > 0) {
      const nextErrors = [...errors] as [boolean, boolean, boolean];
      nextErrors[index] = false;
      setErrors(nextErrors);
    }
  };

  const handleContinue = () => {
    const nextErrors: [boolean, boolean, boolean] = [
      values[0].trim().length === 0,
      values[1].trim().length === 0,
      values[2].trim().length === 0,
    ];
    setErrors(nextErrors);

    if (nextErrors.some(Boolean)) {
      // Focus first empty field
      const firstEmpty = nextErrors.findIndex(Boolean);
      inputRefs[firstEmpty]?.current?.focus();
      return;
    }

    onComplete([values[0].trim(), values[1].trim(), values[2].trim()]);
  };

  const allFilled = values.every((v) => v.trim().length > 0);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>✍️</Text>
          <Text style={styles.title}>Your Three Promises</Text>
          <Text style={styles.subtitle}>
            These will be sealed with your video and revealed on Day 90.
          </Text>
        </View>

        {/* Promise inputs */}
        <View style={styles.inputsContainer}>
          {PROMPTS.map((prompt, i) => {
            const idx = i as 0 | 1 | 2;
            return (
              <View key={i} style={styles.inputGroup}>
                <Text style={styles.promptLabel}>
                  <Text style={styles.promptNumber}>{i + 1}. </Text>
                  {prompt}
                </Text>
                <TextInput
                  ref={inputRefs[idx]}
                  style={[
                    styles.textInput,
                    errors[idx] && styles.textInputError,
                  ]}
                  value={values[idx]}
                  onChangeText={(text) => handleChange(idx, text)}
                  placeholder={prompt}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType={i < 2 ? 'next' : 'done'}
                  onSubmitEditing={() => {
                    if (i < 2) inputRefs[(i + 1) as 1 | 2]?.current?.focus();
                  }}
                  accessibilityLabel={`Promise ${i + 1}: ${prompt}`}
                />
                {errors[idx] && (
                  <Text style={styles.errorText}>This promise is required</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={[styles.continueButton, !allFilled && styles.continueButtonDisabled]}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel="Seal my promises"
        >
          <Text style={styles.continueButtonText}>Seal My Promises 🔒</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          You won't be able to edit these after sealing.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
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
    lineHeight: 24,
  },
  inputsContainer: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  promptLabel: {
    ...typography.bodyBold,
    color: colors.text,
    lineHeight: 22,
  },
  promptNumber: {
    color: colors.primary,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
    minHeight: 88,
  },
  textInputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  footerNote: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
