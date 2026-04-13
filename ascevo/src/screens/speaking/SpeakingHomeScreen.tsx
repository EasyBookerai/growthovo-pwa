import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import {
  getSpeechProgress,
  getWeeklyChallenge,
} from '../../services/speakingService';
import { SPEAKING_LEVEL_CONFIG, SpeakingLevel, SpeechProgress, WeeklyChallenge } from '../../types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SpeakingHomeScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: {
      userId: string;
      subscriptionStatus: string;
      language: string;
    };
  };
}

// ─── Topic prompts by level ───────────────────────────────────────────────────

const TOPIC_PROMPTS: Record<SpeakingLevel, string[]> = {
  1: [
    'Describe your morning routine',
    'Talk about your favorite hobby',
    'Explain why you joined GROWTHOVO',
    'Describe a place you feel safe',
    'Talk about a skill you want to learn',
  ],
  2: [
    'Explain why discipline matters to you',
    'Describe a time you overcame a challenge',
    'Talk about your biggest goal this year',
    'Explain your opinion on social media',
    'Describe what success means to you',
  ],
  3: [
    'Argue for or against remote work',
    'Present a 2-minute case for your favorite book',
    'Explain a complex topic you understand well',
    'Describe the biggest lesson you learned last year',
    'Present your view on personal growth',
  ],
  4: [
    'Pitch a business idea in 3 minutes',
    'Present a controversial opinion you hold',
    'Explain how you handle high-pressure situations',
    'Describe your leadership philosophy',
    'Present a case study from your life',
  ],
  5: [
    'Deliver a 5-minute TED-style talk on your expertise',
    'Present your life story as a hero\'s journey',
    'Pitch yourself for your dream role',
    'Deliver a keynote on overcoming adversity',
    'Present a vision for your future self',
  ],
};

function getTodaysTopic(level: SpeakingLevel): string {
  const prompts = TOPIC_PROMPTS[level];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return prompts[dayOfYear % prompts.length];
}

// ─── LevelCard Component ──────────────────────────────────────────────────────

interface LevelCardProps {
  level: SpeakingLevel;
  isUnlocked: boolean;
  isCurrent: boolean;
  unlockRequirement?: string;
  onSelect: () => void;
}

function LevelCard({ level, isUnlocked, isCurrent, unlockRequirement, onSelect }: LevelCardProps) {
  const config = SPEAKING_LEVEL_CONFIG[level];
  const minutes = Math.floor(config.maxDurationSeconds / 60);
  const seconds = config.maxDurationSeconds % 60;
  const duration = seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;

  return (
    <TouchableOpacity
      style={[
        styles.levelCard,
        isCurrent && styles.levelCardCurrent,
        !isUnlocked && styles.levelCardLocked,
      ]}
      onPress={isUnlocked ? onSelect : undefined}
      disabled={!isUnlocked}
      accessibilityRole="button"
      accessibilityLabel={`Level ${level}: ${config.label}`}
      accessibilityState={{ disabled: !isUnlocked }}
    >
      <View style={styles.levelCardHeader}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>L{level}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.levelLabel}>{config.label}</Text>
          <Text style={styles.levelDuration}>Max {duration}</Text>
        </View>
        {!isUnlocked && <Text style={styles.lockIcon}>🔒</Text>}
        {isCurrent && <Text style={styles.currentBadge}>CURRENT</Text>}
      </View>
      {!isUnlocked && unlockRequirement && (
        <Text style={styles.unlockRequirement}>{unlockRequirement}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SpeakingHomeScreen({ navigation, route }: SpeakingHomeScreenProps) {
  const { userId, subscriptionStatus, language } = route.params;
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<SpeechProgress | null>(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<SpeakingLevel>(1);

  const isFree = subscriptionStatus === 'free' || subscriptionStatus === 'canceled';
  const isPremium = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  useEffect(() => {
    loadData();
  }, [userId]);

  async function loadData() {
    setLoading(true);
    try {
      const [progressData, challengeData] = await Promise.all([
        getSpeechProgress(userId),
        isPremium ? getWeeklyChallenge() : Promise.resolve(null),
      ]);
      setProgress(progressData);
      setSelectedLevel(progressData?.currentLevel ?? 1);
      setWeeklyChallenge(challengeData);
    } catch (err) {
      console.error('[SpeakingHomeScreen] Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleStartSession() {
    // Check free tier limit
    if (isFree && (progress?.sessionsThisWeek ?? 0) >= 1) {
      // Show upgrade prompt - navigate back to main and trigger paywall
      navigation.goBack();
      // The paywall will be shown by the parent navigation
      return;
    }

    const topic = getTodaysTopic(selectedLevel);
    navigation.navigate('RecordingScreen', {
      level: selectedLevel,
      topic,
      userId,
      language: language ?? 'en',
    });
  }

  function handleStartChallenge() {
    if (!weeklyChallenge) return;
    navigation.navigate('RecordingScreen', {
      level: selectedLevel,
      topic: weeklyChallenge.prompt,
      userId,
      language: language ?? 'en',
      isChallenge: true,
      challengeId: weeklyChallenge.id,
    });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const currentLevel = progress?.currentLevel ?? 1;
  const todaysTopic = getTodaysTopic(selectedLevel);
  const sessionsThisWeek = progress?.sessionsThisWeek ?? 0;

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
          <Text style={styles.headerTitle}>Public Speaking</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProgressDashboard', { userId })}
            accessibilityRole="button"
            accessibilityLabel="View progress"
          >
            <Text style={styles.progressIcon}>📊</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{progress?.totalSessions ?? 0}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(progress?.avgConfidenceLast7 ?? 0)}</Text>
            <Text style={styles.statLabel}>Avg Confidence</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sessionsThisWeek}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Free tier limit warning */}
        {isFree && sessionsThisWeek >= 1 && (
          <View style={styles.limitCard}>
            <Text style={styles.limitText}>
              🔒 Free tier: 1 session per day. Upgrade for unlimited sessions.
            </Text>
          </View>
        )}

        {/* Weekly Challenge (Premium only) */}
        {isPremium && weeklyChallenge && (
          <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeLabel}>WEEKLY CHALLENGE</Text>
              <Text style={styles.challengeXp}>+{weeklyChallenge.xpBonus} XP</Text>
            </View>
            <Text style={styles.challengePrompt}>{weeklyChallenge.prompt}</Text>
            <TouchableOpacity
              style={styles.challengeBtn}
              onPress={handleStartChallenge}
              accessibilityRole="button"
            >
              <Text style={styles.challengeBtnText}>Start Challenge</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Level Selection */}
        <Text style={styles.sectionTitle}>Select Your Level</Text>
        <View style={styles.levelList}>
          {([1, 2, 3, 4, 5] as SpeakingLevel[]).map((level) => {
            const config = SPEAKING_LEVEL_CONFIG[level];
            const isUnlocked = level <= currentLevel;
            const isCurrent = level === selectedLevel;
            
            let unlockRequirement: string | undefined;
            if (!isUnlocked) {
              unlockRequirement = `Complete ${config.unlockSessions} sessions with ${config.unlockAvgConfidence}+ avg confidence`;
            }

            return (
              <LevelCard
                key={level}
                level={level}
                isUnlocked={isUnlocked}
                isCurrent={isCurrent}
                unlockRequirement={unlockRequirement}
                onSelect={() => setSelectedLevel(level)}
              />
            );
          })}
        </View>

        {/* Today's Topic */}
        <View style={styles.topicCard}>
          <Text style={styles.topicLabel}>TODAY'S TOPIC</Text>
          <Text style={styles.topicText}>{todaysTopic}</Text>
          <Text style={styles.topicHint}>
            {SPEAKING_LEVEL_CONFIG[selectedLevel].label} • Max {Math.floor(SPEAKING_LEVEL_CONFIG[selectedLevel].maxDurationSeconds / 60)}m
          </Text>
        </View>

        {/* Start Session Button */}
        <TouchableOpacity
          style={[styles.startBtn, (isFree && sessionsThisWeek >= 1) && styles.startBtnDisabled]}
          onPress={handleStartSession}
          accessibilityRole="button"
          accessibilityLabel="Start speaking session"
        >
          <Text style={styles.startBtnText}>
            {isFree && sessionsThisWeek >= 1 ? 'Upgrade to Continue' : 'Start Session'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backText: { ...typography.body, color: colors.textMuted },
  headerTitle: { ...typography.h2, color: colors.text },
  progressIcon: { fontSize: 24 },

  // Stats Card
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center', gap: spacing.xs },
  statValue: { ...typography.h2, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textMuted },
  statDivider: { width: 1, backgroundColor: colors.border },

  // Limit Card
  limitCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    gap: spacing.sm,
  },
  limitText: { ...typography.body, color: colors.text, lineHeight: 22 },
  upgradeBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  upgradeBtnText: { ...typography.bodyBold, color: '#fff' },

  // Challenge Card
  challengeCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeLabel: { ...typography.caption, color: 'rgba(255,255,255,0.8)' },
  challengeXp: { ...typography.bodyBold, color: '#fff' },
  challengePrompt: { ...typography.h3, color: '#fff', lineHeight: 28 },
  challengeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  challengeBtnText: { ...typography.bodyBold, color: '#fff' },

  // Level Selection
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  levelList: { gap: spacing.md, marginBottom: spacing.lg },
  levelCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  levelCardCurrent: {
    borderWidth: 2,
    borderColor: colors.pillars.communication,
  },
  levelCardLocked: { opacity: 0.5 },
  levelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  levelBadge: {
    backgroundColor: colors.pillars.communication,
    borderRadius: radius.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeText: { ...typography.bodyBold, color: '#fff', fontSize: 12 },
  levelLabel: { ...typography.bodyBold, color: colors.text },
  levelDuration: { ...typography.small, color: colors.textMuted },
  lockIcon: { fontSize: 20 },
  currentBadge: {
    ...typography.caption,
    color: colors.pillars.communication,
    fontSize: 10,
  },
  unlockRequirement: {
    ...typography.small,
    color: colors.textMuted,
    lineHeight: 18,
  },

  // Topic Card
  topicCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.pillars.communication,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  topicLabel: { ...typography.caption, color: colors.pillars.communication },
  topicText: { ...typography.h3, color: colors.text, lineHeight: 28 },
  topicHint: { ...typography.small, color: colors.textMuted },

  // Start Button
  startBtn: {
    backgroundColor: colors.pillars.communication,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  startBtnDisabled: { backgroundColor: colors.textMuted },
  startBtnText: { ...typography.bodyBold, color: '#fff', fontSize: 16 },
});
