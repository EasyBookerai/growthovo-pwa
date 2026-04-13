import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Audio } from 'expo-av';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../theme';
import { submitSession } from '../../services/speakingService';
import { SPEAKING_LEVEL_CONFIG, SpeakingLevel } from '../../types';

// ─── Navigation types ─────────────────────────────────────────────────────────

type RecordingParams = {
  RecordingScreen: {
    level: SpeakingLevel;
    topic: string;
    userId: string;
    language: string;
  };
};

// ─── Waveform bar component ───────────────────────────────────────────────────

function WaveformBar({ delay, isActive }: { delay: number; isActive: boolean }) {
  const height = useSharedValue(8);

  useEffect(() => {
    if (isActive) {
      height.value = withRepeat(
        withTiming(32 + Math.random() * 20, {
          duration: 400 + delay * 80,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      height.value = withTiming(8, { duration: 200 });
    }
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return <Animated.View style={[styles.waveBar, animStyle]} />;
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type ScreenState = 'idle' | 'recording' | 'processing' | 'error' | 'permission_denied';

export default function RecordingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RecordingParams, 'RecordingScreen'>>();
  const { level, topic, userId, language } = route.params;

  const config = SPEAKING_LEVEL_CONFIG[level];
  const maxSeconds = config.maxDurationSeconds;

  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      clearTimer();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  // ─── Auto-stop when max duration reached ─────────────────────────────────

  useEffect(() => {
    if (elapsed >= maxSeconds && screenState === 'recording') {
      handleStop();
    }
  }, [elapsed, maxSeconds, screenState]);

  // ─── Timer helpers ────────────────────────────────────────────────────────

  function startTimer() {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(secs);
    }, 500);
  }

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // ─── Record ───────────────────────────────────────────────────────────────

  const handleRecord = useCallback(async () => {
    setErrorMsg('');

    // Request permission
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      setScreenState('permission_denied');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setElapsed(0);
      setScreenState('recording');
      startTimer();
    } catch (err) {
      setErrorMsg('Could not start recording. Please try again.');
      setScreenState('error');
    }
  }, []);

  // ─── Stop ─────────────────────────────────────────────────────────────────

  const handleStop = useCallback(async () => {
    if (screenState !== 'recording') return;

    clearTimer();

    const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

    // Reject if too short
    if (durationSeconds < 5) {
      try {
        await recordingRef.current?.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
      setElapsed(0);
      setScreenState('error');
      setErrorMsg('Recording too short. Please speak for at least 5 seconds.');
      return;
    }

    setScreenState('processing');

    try {
      await recordingRef.current?.stopAndUnloadAsync();
      const uri = recordingRef.current?.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error('No audio file found.');

      const result = await submitSession({
        userId,
        level,
        topic,
        audioUri: uri,
        durationSeconds,
        language,
      });

      navigation.navigate('FeedbackScreen', { result });
    } catch (err: any) {
      setScreenState('error');
      setErrorMsg(err?.message ?? 'Something went wrong. Please try again.');
    }
  }, [screenState, userId, level, topic, language, navigation]);

  // ─── Derived display values ───────────────────────────────────────────────

  const remaining = Math.max(0, maxSeconds - elapsed);

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ─── Render: permission denied ────────────────────────────────────────────

  if (screenState === 'permission_denied') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.permissionIcon}>🎙️</Text>
          <Text style={styles.permissionTitle}>Microphone access needed</Text>
          <Text style={styles.permissionBody}>
            GROWTHOVO needs microphone access to record your speech session.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => Linking.openSettings()}
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>Open Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
          >
            <Text style={styles.ghostBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: processing (Rex is listening) ────────────────────────────────

  if (screenState === 'processing') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.processingLabel}>Rex is listening...</Text>
          <View style={styles.waveformRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <WaveformBar key={i} delay={i} isActive={true} />
            ))}
          </View>
          <ActivityIndicator color={colors.primary} size="small" style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: main recording UI ────────────────────────────────────────────

  const isRecording = screenState === 'recording';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          disabled={isRecording}
        >
          <Text style={[styles.backText, isRecording && styles.disabledText]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{config.label}</Text>
        </View>
      </View>

      {/* Topic card */}
      <View style={styles.topicCard}>
        <Text style={styles.topicLabel}>YOUR TOPIC</Text>
        <Text style={styles.topicText}>{topic}</Text>
        <Text style={styles.topicHint}>Max {formatTime(maxSeconds)}</Text>
      </View>

      {/* Timer display */}
      <View style={styles.timerSection}>
        {isRecording ? (
          <>
            <Text style={styles.elapsedTime}>{formatTime(elapsed)}</Text>
            <Text style={styles.remainingTime}>{formatTime(remaining)} remaining</Text>
          </>
        ) : (
          <Text style={styles.idleHint}>Tap the mic to start</Text>
        )}
      </View>

      {/* Waveform (visible while recording) */}
      <View style={styles.waveformRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <WaveformBar key={i} delay={i} isActive={isRecording} />
        ))}
      </View>

      {/* Error message */}
      {screenState === 'error' && errorMsg ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Record / Stop button */}
      <View style={styles.controls}>
        {!isRecording ? (
          <TouchableOpacity
            style={styles.recordBtn}
            onPress={handleRecord}
            accessibilityRole="button"
            accessibilityLabel="Start recording"
          >
            <Text style={styles.recordBtnIcon}>🎙️</Text>
            <Text style={styles.recordBtnText}>
              {screenState === 'error' ? 'Try again' : 'Start recording'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={handleStop}
            accessibilityRole="button"
            accessibilityLabel="Stop recording"
          >
            <View style={styles.stopIcon} />
            <Text style={styles.stopBtnText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backText: {
    ...typography.body,
    color: colors.textMuted,
  },
  disabledText: {
    opacity: 0.3,
  },
  levelBadge: {
    backgroundColor: colors.pillars.communication,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  levelBadgeText: {
    ...typography.smallBold,
    color: '#fff',
  },
  topicCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.pillars.communication,
    gap: spacing.sm,
  },
  topicLabel: {
    ...typography.caption,
    color: colors.pillars.communication,
  },
  topicText: {
    ...typography.h3,
    color: colors.text,
    lineHeight: 28,
  },
  topicHint: {
    ...typography.small,
    color: colors.textMuted,
  },
  timerSection: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  elapsedTime: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
  },
  remainingTime: {
    ...typography.body,
    color: colors.textMuted,
  },
  idleHint: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 18,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 60,
    marginBottom: spacing.lg,
  },
  waveBar: {
    width: 6,
    borderRadius: radius.full,
    backgroundColor: colors.pillars.communication,
  },
  errorCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    marginTop: 'auto',
  },
  recordBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recordBtnIcon: {
    fontSize: 22,
  },
  recordBtnText: {
    ...typography.bodyBold,
    color: '#fff',
  },
  stopBtn: {
    backgroundColor: colors.error,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stopIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  stopBtnText: {
    ...typography.bodyBold,
    color: '#fff',
  },
  // Permission denied styles
  permissionIcon: {
    fontSize: 56,
  },
  permissionTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  permissionBody: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  primaryBtnText: {
    ...typography.bodyBold,
    color: '#fff',
  },
  ghostBtn: {
    paddingVertical: spacing.sm,
  },
  ghostBtnText: {
    ...typography.body,
    color: colors.textMuted,
  },
  // Processing styles
  processingLabel: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
});
