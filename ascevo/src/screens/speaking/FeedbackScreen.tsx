import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withDelay,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../theme';
import { SpeechAnalysisResult, MilestoneAlert, SpeakingLevel } from '../../types';
import { getConfidenceColor, getMetricStatus } from '../../services/speakingMetrics';
import { checkMilestonesForUser, checkLevelUnlockForUser } from '../../services/speakingService';
import ShareableCard from '../../components/ShareableCard';

// expo-av Audio for playing Rex verdict
let Audio: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Audio = require('expo-av').Audio;
} catch {
  // expo-av not installed
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FeedbackScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: {
      result: SpeechAnalysisResult;
      userId: string;
      previousScore?: number; // for retry comparison
    };
  };
}

// ─── ConfidenceHero Component ─────────────────────────────────────────────────

interface ConfidenceHeroProps {
  score: number;
  previousScore?: number;
}

function ConfidenceHero({ score, previousScore }: ConfidenceHeroProps) {
  const animatedScore = useSharedValue(0);
  const color = getConfidenceColor(score);
  const delta = previousScore !== undefined ? score - previousScore : 0;

  useEffect(() => {
    animatedScore.value = withTiming(score, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [score]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1, { duration: 300 }),
  }));

  return (
    <Animated.View style={[styles.heroCard, animStyle]}>
      <Text style={styles.heroLabel}>CONFIDENCE SCORE</Text>
      <Text style={[styles.heroScore, { color }]}>{Math.round(score)}</Text>
      {previousScore !== undefined && delta !== 0 && (
        <View style={styles.trendRow}>
          <Text style={[styles.trendText, { color: delta > 0 ? colors.success : colors.error }]}>
            {delta > 0 ? '↑' : '↓'} {Math.abs(delta)} vs last session
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

// ─── MetricCard Component ─────────────────────────────────────────────────────

interface MetricCardProps {
  name: string;
  value: string | number;
  score?: number;
  delay: number;
}

function MetricCard({ name, value, score, delay }: MetricCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }));
  }, [delay]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const status = score !== undefined ? getMetricStatus(score) : null;
  const statusColor =
    status === 'STRONG' ? colors.success :
    status === 'GOOD' ? colors.pillars.communication :
    status === 'NEEDS WORK' ? colors.warning :
    colors.error;

  return (
    <Animated.View style={[styles.metricCard, animStyle]}>
      <Text style={styles.metricName}>{name}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {status && <Text style={[styles.metricStatus, { color: statusColor }]}>{status}</Text>}
    </Animated.View>
  );
}

// ─── MetricCardGrid Component ─────────────────────────────────────────────────

interface MetricCardGridProps {
  result: SpeechAnalysisResult;
}

function MetricCardGrid({ result }: MetricCardGridProps) {
  const metrics = [
    { name: 'Language Strength', value: result.languageStrength, score: result.languageStrength },
    { name: 'Filler-Free Rate', value: `${result.fillersPerMinute.toFixed(1)}/min`, score: Math.max(0, 100 - result.fillersPerMinute * 12.5) },
    { name: 'Pace', value: `${result.paceWpm} WPM`, score: result.paceScore },
    { name: 'Structure', value: result.structureScore, score: result.structureScore },
    { name: 'Opening', value: result.openingStrength, score: result.openingStrength },
    { name: 'Closing', value: result.closingStrength, score: result.closingStrength },
    { name: 'Anxious Pauses', value: result.anxiousPauses, score: Math.max(0, 100 - result.anxiousPauses * 10) },
    { name: 'Purposeful Pauses', value: result.purposefulPauses },
  ];

  return (
    <View style={styles.metricGrid}>
      {metrics.map((metric, index) => (
        <MetricCard
          key={metric.name}
          name={metric.name}
          value={metric.value}
          score={metric.score}
          delay={index * 150}
        />
      ))}
    </View>
  );
}

// ─── FillerHeatmap Component ──────────────────────────────────────────────────

interface FillerHeatmapProps {
  transcript: string;
  fillerPositions: Array<{ word: string; charOffset: number }>;
  fillerWords: Record<string, number>;
}

function FillerHeatmap({ transcript, fillerPositions, fillerWords }: FillerHeatmapProps) {
  const [selectedFiller, setSelectedFiller] = useState<string | null>(null);

  // Build segments: text with filler highlights
  const segments: Array<{ text: string; isFiller: boolean; word?: string }> = [];
  let lastOffset = 0;

  const sortedPositions = [...fillerPositions].sort((a, b) => a.charOffset - b.charOffset);

  sortedPositions.forEach((pos) => {
    if (pos.charOffset > lastOffset) {
      segments.push({ text: transcript.slice(lastOffset, pos.charOffset), isFiller: false });
    }
    segments.push({ text: pos.word, isFiller: true, word: pos.word });
    lastOffset = pos.charOffset + pos.word.length;
  });

  if (lastOffset < transcript.length) {
    segments.push({ text: transcript.slice(lastOffset), isFiller: false });
  }

  return (
    <View style={styles.heatmapCard}>
      <Text style={styles.sectionTitle}>Filler Heatmap</Text>
      <View style={styles.transcriptBox}>
        <Text style={styles.transcriptText}>
          {segments.map((seg, i) =>
            seg.isFiller ? (
              <Text
                key={i}
                style={styles.fillerHighlight}
                onPress={() => setSelectedFiller(seg.word ?? null)}
              >
                {seg.text}
              </Text>
            ) : (
              <Text key={i}>{seg.text}</Text>
            )
          )}
        </Text>
      </View>
      {selectedFiller && (
        <View style={styles.fillerDetail}>
          <Text style={styles.fillerDetailText}>
            "{selectedFiller}" — used {fillerWords[selectedFiller] ?? 0} times
          </Text>
          <TouchableOpacity onPress={() => setSelectedFiller(null)}>
            <Text style={styles.fillerDetailClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── LanguageAnalysis Component ───────────────────────────────────────────────

interface LanguageAnalysisProps {
  strongExamples: string[];
  weakExamples: string[];
}

function LanguageAnalysis({ strongExamples, weakExamples }: LanguageAnalysisProps) {
  return (
    <View style={styles.languageCard}>
      <Text style={styles.sectionTitle}>Language Analysis</Text>
      <View style={styles.languageColumns}>
        <View style={styles.languageColumn}>
          <Text style={[styles.languageColumnTitle, { color: colors.success }]}>STRONG</Text>
          {strongExamples.slice(0, 3).map((ex, i) => (
            <View key={i} style={[styles.languageQuote, { borderLeftColor: colors.success }]}>
              <Text style={styles.languageQuoteText}>"{ex}"</Text>
            </View>
          ))}
        </View>
        <View style={styles.languageColumn}>
          <Text style={[styles.languageColumnTitle, { color: colors.error }]}>WEAK</Text>
          {weakExamples.slice(0, 3).map((ex, i) => (
            <View key={i} style={[styles.languageQuote, { borderLeftColor: colors.error }]}>
              <Text style={styles.languageQuoteText}>"{ex}"</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── OpeningClosingCards Component ────────────────────────────────────────────

interface OpeningClosingCardsProps {
  openingStrength: number;
  closingStrength: number;
  openingAnalysis: string;
  closingAnalysis: string;
}

function OpeningClosingCards({
  openingStrength,
  closingStrength,
  openingAnalysis,
  closingAnalysis,
}: OpeningClosingCardsProps) {
  return (
    <View style={styles.openingClosingRow}>
      <View style={styles.halfCard}>
        <Text style={styles.halfCardLabel}>OPENING</Text>
        <Text style={styles.halfCardScore}>{openingStrength}</Text>
        <Text style={styles.halfCardAnalysis}>{openingAnalysis}</Text>
      </View>
      <View style={styles.halfCard}>
        <Text style={styles.halfCardLabel}>CLOSING</Text>
        <Text style={styles.halfCardScore}>{closingStrength}</Text>
        <Text style={styles.halfCardAnalysis}>{closingAnalysis}</Text>
      </View>
    </View>
  );
}

// ─── RexVerdictSection Component ──────────────────────────────────────────────

interface RexVerdictSectionProps {
  verdict: string;
  audioUrl: string;
}

function RexVerdictSection({ verdict, audioUrl }: RexVerdictSectionProps) {
  const soundRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (Audio && audioUrl) {
      playAudio();
    }
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, [audioUrl]);

  async function playAudio() {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      soundRef.current = sound;
      setIsPlaying(true);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch {
      setIsPlaying(false);
    }
  }

  return (
    <View style={styles.rexVerdictCard}>
      <View style={styles.rexVerdictHeader}>
        <Text style={styles.rexVerdictLabel}>REX'S VERDICT</Text>
        {isPlaying && <Text style={styles.rexVerdictPlaying}>🔊 Playing...</Text>}
      </View>
      <Text style={styles.rexVerdictText}>{verdict}</Text>
    </View>
  );
}

// ─── OneFixCard Component ─────────────────────────────────────────────────────

interface OneFixCardProps {
  tomorrowFocus: string;
}

function OneFixCard({ tomorrowFocus }: OneFixCardProps) {
  return (
    <View style={styles.oneFixCard}>
      <Text style={styles.oneFixLabel}>THE ONE FIX</Text>
      <Text style={styles.oneFixText}>{tomorrowFocus}</Text>
    </View>
  );
}

// ─── GoAgainButton Component ──────────────────────────────────────────────────

interface GoAgainButtonProps {
  onPress: () => void;
}

function GoAgainButton({ onPress }: GoAgainButtonProps) {
  return (
    <TouchableOpacity
      style={styles.goAgainBtn}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Go again and apply the fix"
    >
      <Text style={styles.goAgainBtnText}>Go again — apply the fix</Text>
    </TouchableOpacity>
  );
}

// ─── MilestoneModal Component ─────────────────────────────────────────────────

interface MilestoneModalProps {
  alerts: MilestoneAlert[];
  onClose: () => void;
}

function MilestoneModal({ alerts, onClose }: MilestoneModalProps) {
  if (alerts.length === 0) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>🎯 Milestone Reached!</Text>
          {alerts.map((alert, index) => (
            <View key={index} style={styles.milestoneAlert}>
              <Text style={styles.milestoneMessage}>{alert.message}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.modalCloseBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── LevelUnlockModal Component ───────────────────────────────────────────────

interface LevelUnlockModalProps {
  level: SpeakingLevel;
  onClose: () => void;
}

function LevelUnlockModal({ level, onClose }: LevelUnlockModalProps) {
  const soundRef = useRef<any>(null);
  const levelLabels: Record<SpeakingLevel, string> = {
    1: 'Beginner',
    2: 'Intermediate',
    3: 'Advanced',
    4: 'Expert',
    5: 'Master',
  };

  useEffect(() => {
    // TODO: Play TTS voice message for level unlock
    // This would require generating TTS audio for the level unlock message
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>🔓 Level Unlocked!</Text>
          <Text style={styles.levelUnlockText}>
            You've unlocked Level {level}: {levelLabels[level]}
          </Text>
          <Text style={styles.levelUnlockSubtext}>
            You can now tackle more challenging speaking sessions.
          </Text>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.modalCloseBtnText}>Let's Go!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function FeedbackScreen({ navigation, route }: FeedbackScreenProps) {
  const { result, userId, previousScore } = route.params;
  const [milestoneAlerts, setMilestoneAlerts] = useState<MilestoneAlert[]>([]);
  const [unlockedLevel, setUnlockedLevel] = useState<SpeakingLevel | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    // Check for milestones and level unlocks after the session
    checkForMilestonesAndLevelUnlocks();
  }, []);

  async function checkForMilestonesAndLevelUnlocks() {
    try {
      // Check milestones
      const alerts = await checkMilestonesForUser(
        userId,
        result.sessionNumber,
        result.confidenceScore
      );
      
      if (alerts.length > 0) {
        setMilestoneAlerts(alerts);
        
        // Check if session 100 milestone was reached
        const session100 = alerts.find(a => a.message.includes('100'));
        if (session100) {
          // Show shareable card for session 100
          setShowShareCard(true);
        }
      }

      // Check level unlock
      const newLevel = await checkLevelUnlockForUser(userId);
      if (newLevel) {
        setUnlockedLevel(newLevel);
      }
    } catch (error) {
      console.error('Failed to check milestones/level unlocks:', error);
    }
  }

  function handleGoAgain() {
    // Navigate back to RecordingScreen with same topic
    navigation.navigate('RecordingScreen', {
      level: result.sessionNumber, // This should be the level, but we don't have it in result
      topic: 'Same topic', // We need to pass the original topic
      userId: 'user-id', // We need the userId
      language: 'en',
      retryOf: result.sessionId,
      originalScore: result.confidenceScore,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <ConfidenceHero score={result.confidenceScore} previousScore={previousScore} />

        <MetricCardGrid result={result} />

        <FillerHeatmap
          transcript={result.transcript}
          fillerPositions={result.fillerPositions}
          fillerWords={result.fillerWords}
        />

        <LanguageAnalysis
          strongExamples={result.strongLanguageExamples}
          weakExamples={result.weakLanguageExamples}
        />

        <OpeningClosingCards
          openingStrength={result.openingStrength}
          closingStrength={result.closingStrength}
          openingAnalysis={result.openingAnalysis}
          closingAnalysis={result.closingAnalysis}
        />

        <RexVerdictSection verdict={result.rexVerdict} audioUrl={result.rexAudioUrl} />

        <OneFixCard tomorrowFocus={result.tomorrowFocus} />

        <GoAgainButton onPress={handleGoAgain} />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Milestone alerts modal */}
      {milestoneAlerts.length > 0 && (
        <MilestoneModal
          alerts={milestoneAlerts}
          onClose={() => setMilestoneAlerts([])}
        />
      )}

      {/* Level unlock modal */}
      {unlockedLevel && (
        <LevelUnlockModal
          level={unlockedLevel}
          onClose={() => setUnlockedLevel(null)}
        />
      )}

      {/* Shareable card for session 100 */}
      {showShareCard && (
        <ShareableCard
          username="User" // TODO: Get from user profile
          streak={0} // TODO: Get from streak service
          totalXP={0} // TODO: Get from progress service
          topPillar={{ name: 'Speaking', level: 1, icon: '🎤' }}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backText: { ...typography.body, color: colors.textMuted },

  // ConfidenceHero
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  heroLabel: { ...typography.caption, color: colors.textMuted },
  heroScore: {
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -2,
  },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  trendText: { ...typography.bodyBold, fontSize: 14 },

  // MetricCard
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    width: '47%',
    gap: spacing.xs,
  },
  metricName: { ...typography.small, color: colors.textMuted },
  metricValue: { ...typography.h3, color: colors.text },
  metricStatus: { ...typography.caption, fontSize: 10 },

  // FillerHeatmap
  heatmapCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: { ...typography.h3, color: colors.text },
  transcriptBox: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  transcriptText: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  fillerHighlight: { color: colors.error, fontWeight: '700' },
  fillerDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  fillerDetailText: { ...typography.small, color: colors.text },
  fillerDetailClose: { ...typography.h3, color: colors.textMuted },

  // LanguageAnalysis
  languageCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  languageColumns: { flexDirection: 'row', gap: spacing.md },
  languageColumn: { flex: 1, gap: spacing.sm },
  languageColumnTitle: { ...typography.caption, marginBottom: spacing.xs },
  languageQuote: {
    borderLeftWidth: 3,
    paddingLeft: spacing.sm,
    paddingVertical: spacing.xs,
  },
  languageQuoteText: { ...typography.small, color: colors.textSecondary, lineHeight: 18 },

  // OpeningClosingCards
  openingClosingRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  halfCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  halfCardLabel: { ...typography.caption, color: colors.textMuted },
  halfCardScore: { ...typography.h2, color: colors.text },
  halfCardAnalysis: { ...typography.small, color: colors.textSecondary, lineHeight: 18 },

  // RexVerdict
  rexVerdictCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    gap: spacing.md,
  },
  rexVerdictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rexVerdictLabel: { ...typography.caption, color: colors.primary },
  rexVerdictPlaying: { ...typography.small, color: colors.primary },
  rexVerdictText: { ...typography.body, color: colors.text, lineHeight: 24 },

  // OneFix
  oneFixCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  oneFixLabel: { ...typography.caption, color: 'rgba(255,255,255,0.8)' },
  oneFixText: {
    ...typography.h3,
    color: '#fff',
    lineHeight: 28,
    fontFamily: 'monospace',
  },

  // GoAgain
  goAgainBtn: {
    backgroundColor: colors.pillars.communication,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  goAgainBtnText: { ...typography.bodyBold, color: '#fff' },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    gap: spacing.lg,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  milestoneAlert: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
  },
  milestoneMessage: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  levelUnlockText: {
    ...typography.h3,
    color: colors.primary,
    textAlign: 'center',
  },
  levelUnlockSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalCloseBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    ...typography.bodyBold,
    color: '#fff',
  },
});
