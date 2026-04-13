import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, radius } from '../../theme';
import type { PillarKey } from '../../types';

interface Props {
  userId: string;
  primaryPillar: PillarKey;
  quizScores: Record<PillarKey, number>;
  onComplete: (videoUri: string) => void;
  onSkip: () => void;
}

type Step = 'idle' | 'preview' | 'uploading' | 'error';

export default function VideoRecordScreen({
  userId,
  primaryPillar,
  quizScores,
  onComplete,
  onSkip,
}: Props) {
  const [step, setStep] = useState<Step>('idle');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleRecord = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera permission required',
          'Please allow camera access to record your video message.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'videos' as any,
        videoMaxDuration: 60,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setVideoUri(result.assets[0].uri);
        setStep('preview');
      }
    } catch (err) {
      console.error('Video recording error:', err);
      Alert.alert('Error', 'Could not open camera. Please try again.');
    }
  };

  const handleConfirm = async () => {
    if (!videoUri) return;
    setStep('uploading');
    setErrorMsg('');
    try {
      onComplete(videoUri);
    } catch (err) {
      setErrorMsg('Upload failed. Please try again.');
      setStep('error');
    }
  };

  const handleReRecord = () => {
    setVideoUri(null);
    setStep('idle');
    setErrorMsg('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Day 1 Video</Text>
        <TouchableOpacity onPress={onSkip} accessibilityRole="button" accessibilityLabel="Skip video">
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {step === 'idle' && (
          <>
            {/* Prompt overlay card */}
            <View style={styles.promptCard}>
              <Text style={styles.promptEmoji}>🎥</Text>
              <Text style={styles.promptTitle}>Tell your future self</Text>
              <Text style={styles.promptText}>
                "Tell your future self why you're starting today"
              </Text>
              <Text style={styles.promptHint}>Max 60 seconds</Text>
            </View>

            <TouchableOpacity
              style={styles.recordButton}
              onPress={handleRecord}
              accessibilityRole="button"
              accessibilityLabel="Record video"
            >
              <Text style={styles.recordButtonIcon}>⏺</Text>
              <Text style={styles.recordButtonText}>Record Video</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'preview' && videoUri && (
          <>
            <View style={styles.videoContainer}>
              {/* Video preview placeholder — expo-av not installed */}
              <View style={styles.videoPreviewPlaceholder}>
                <Text style={styles.videoPreviewIcon}>🎥</Text>
                <Text style={styles.videoPreviewText}>Video recorded</Text>
                <Text style={styles.videoPreviewHint}>Tap "Use This Video" to continue</Text>
              </View>
            </View>

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.reRecordButton}
                onPress={handleReRecord}
                accessibilityRole="button"
                accessibilityLabel="Re-record video"
              >
                <Text style={styles.reRecordText}>Re-record</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                accessibilityRole="button"
                accessibilityLabel="Confirm video"
              >
                <Text style={styles.confirmButtonText}>Use This Video</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 'uploading' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Saving your message...</Text>
          </View>
        )}

        {step === 'error' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleConfirm}
              accessibilityRole="button"
              accessibilityLabel="Retry upload"
            >
              <Text style={styles.retryButtonText}>Retry Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReRecord}
              accessibilityRole="button"
              accessibilityLabel="Re-record video"
            >
              <Text style={styles.reRecordLink}>Re-record instead</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  skipText: {
    ...typography.body,
    color: colors.textMuted,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    gap: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  promptEmoji: {
    fontSize: 48,
  },
  promptTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  promptText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 26,
  },
  promptHint: {
    ...typography.small,
    color: colors.textMuted,
  },
  recordButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recordButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  recordButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 400,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  videoPreviewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  videoPreviewIcon: {
    fontSize: 48,
  },
  videoPreviewText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  videoPreviewHint: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    maxWidth: 360,
  },
  reRecordButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  reRecordText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  confirmButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  retryButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  reRecordLink: {
    ...typography.body,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
