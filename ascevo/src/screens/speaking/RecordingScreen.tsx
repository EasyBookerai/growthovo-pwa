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
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../theme';
import { submitSession } from '../../services/speakingService';
import { SPEAKING_LEVEL_CONFIG, SpeakingLevel, SpeechAnalysisResult } from '../../types';
import { 
  isPremiumUser 
} from '../../services/growthovoExperienceService';
import { 
  getSpeakingSessionsRemaining, 
  incrementSpeakingSessionCount 
} from '../../services/paywallService';
import PaywallModal from '../../components/PaywallModal';
import { triggerHaptic } from '../../services/webThemeService';

// expo-av Audio — install with: npx expo install expo-av
let Audio: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Audio = require('expo-av').Audio;
} catch {
  // expo-av not installed
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RecordingScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: {
      level: SpeakingLevel;
      topic: string;
      userId: string;
      language: string;
    };
  };
}

// ─── Waveform bar ─────────────────────────────────────────────────────────────

function WaveformBar({ delay, isActive }: { delay: number; isActive: boolean }) {
  const height = useSharedValue(8);

  useEffect(() => {
    if (isActive) {
      height.value = withRepeat(
        withTiming(28 + delay * 6, {
          duration: 380 + delay * 90,
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

// ─── Screen ───────────────────────────────────────────────────────────────────

type ScreenState = 'idle' | 'recording' | 'processing' | 'error' | 'permission_denied';

export default function RecordingScreen({ navigation, route }: RecordingScreenProps) {
  const { level, topic, userId, language } = route.params;
  const config = SPEAKING_LEVEL_CONFIG[level as SpeakingLevel];
  const maxSeconds = config.maxDurationSeconds;

  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionsRemaining, setSessionsRemaining] = useState(2);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const recordingRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      clearTimer();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    checkSessionLimit();
  }, []);

  async function checkSessionLimit() {
    const premium = await isPremiumUser();
    setIsPremium(premium);
    if (!premium) {
      const remaining = await getSpeakingSessionsRemaining();
      setSessionsRemaining(remaining);
    } else {
      setSessionsRemaining(999);
    }
  }

  useEffect(() => {
    if (elapsed >= maxSeconds && screenState === 'recording') {
      handleStop();
    }
  }, [elapsed]);

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

  const handleRecord = useCallback(async () => {
    setErrorMsg('');

    // Check paywall limit
    if (!isPremium && sessionsRemaining <= 0) {
      triggerHaptic('error');
      setShowPaywall(true);
      return;
    }

    if (!Audio) {
      setScreenState('error');
      setErrorMsg('Audio recording unavailable. Please install expo-av.');
      return;
    }

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

      // Increment counter for free users
      if (!isPremium) {
        const remaining = await incrementSpeakingSessionCount();
        setSessionsRemaining(remaining);
      }

      triggerHaptic('medium');
      recordingRef.current = recording;
      setElapsed(0);
      setScreenState('recording');
      startTimer();
    } catch {
      setErrorMsg('Could not start recording. Please try again.');
      setScreenState('error');
    }
  }, [isPremium, sessionsRemaining]);

  const handleStop = useCallback(async () => {
    if (screenState !== 'recording') return;

    clearTimer();
    const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

    if (durationSeconds < 5) {
      try { await recordingRef.current?.stopAndUnloadAsync(); } catch {}
      recordingRef.current = null;
      setElapsed(0);
      setScreenState('error');
      setErrorMsg('Recording too short. Please speak for at least 5 seconds.');
      return;
    }

    setScreenState('processing');

    try {
      await recordingRef.current?.stopAndUnloadAsync();
      const uri: string | null = recordingRef.current?.getURI() ?? null;
      recordingRef.current = null;

      if (!uri) throw new Error('No audio file found.');

      const result: SpeechAnalysisResult = await submitSession({
        userId,
        level,
        topic,
        audioUri: uri,
        durationSeconds,
        language,
      });

      navigation.navigate('FeedbackScreen', { result, userId });
    } catch (err: any) {
      setScreenState('error');
      setErrorMsg(err?.message ?? 'Something went wrong. Please try again.');
    }
  }, [screenState, userId, level, topic, language, navigation]);

  const remaining = Math.max(0, maxSeconds - elapsed);

  function formatTime(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function getCounterColor(): string {
    if (isPremium) return colors.success;
    if (sessionsRemaining >= 2) return '#16A34A'; // green
    if (sessionsRemaining === 1) return '#F59E0B'; // amber
    return '#EF4444'; // red
  }

  if (screenState === 'permission_denied') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.bigIcon}>🎙️</Text>
          <Text style={styles.permissionTitle}>Microphone access needed</Text>
          <Text style={styles.permissionBody}>
            GROWTHOVO needs microphone access to record your speech session.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => Linking.openSettings()}
            accessibilityRole="button"
            accessibilityLabel="Open device settings"
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
          <ActivityIndicator
            color={colors.primary}
            size="small"
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isRecording = screenState === 'recording';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={isRecording}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={[styles.backText, isRecording && styles.dimmed]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{config.label}</Text>
        </View>
      </View>

      {!isPremium && !isRecording && (
        <View style={styles.counterBanner}>
          <Text style={[styles.counterText, { color: getCounterColor() }]}>
            {sessionsRemaining === 0
              ? '⚠️ Daily limit reached'
              : `${sessionsRemaining}/2 free sessions today`}
          </Text>
        </View>
      )}

      <View style={styles.topicCard}>
        <Text style={styles.topicLabel}>YOUR TOPIC</Text>
        <Text style={styles.topicText}>{topic}</Text>
        <Text style={styles.topicHint}>Max {formatTime(maxSeconds)}</Text>
      </View>

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

      <View style={styles.waveformRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <WaveformBar key={i} delay={i} isActive={isRecording} />
        ))}
      </View>

      {screenState === 'error' && errorMsg ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

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

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onStartTrial={() => {
          setShowPaywall(false);
          navigation.navigate?.('Paywall');
        }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  backText: { ...typography.body, color: colors.textMuted },
  dimmed: { opacity: 0.3 },
  levelBadge: {
    backgroundColor: colors.pillars.communication,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  levelBadgeText: { ...typography.smallBold, color: '#fff' },
  counterBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  counterText: {
    ...typography.small,
    fontWeight: '600',
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
  topicLabel: { ...typography.caption, color: colors.pillars.communication },
  topicText: { ...typography.h3, color: colors.text, lineHeight: 28 },
  topicHint: { ...typography.small, color: colors.textMuted },
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
  remainingTime: { ...typography.body, color: colors.textMuted },
  idleHint: { ...typography.body, color: colors.textMuted, fontSize: 18 },
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
  errorText: { ...typography.body, color: colors.error },
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
  recordBtnIcon: { fontSize: 22 },
  recordBtnText: { ...typography.bodyBold, color: '#fff' },
  stopBtn: {
    backgroundColor: colors.error,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stopIcon: { width: 16, height: 16, backgroundColor: '#fff', borderRadius: 3 },
  stopBtnText: { ...typography.bodyBold, color: '#fff' },
  bigIcon: { fontSize: 56 },
  permissionTitle: { ...typography.h3, color: colors.text, textAlign: 'center' },
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
  primaryBtnText: { ...typography.bodyBold, color: '#fff' },
  ghostBtn: { paddingVertical: spacing.sm },
  ghostBtnText: { ...typography.body, color: colors.textMuted },
  processingLabel: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
});
