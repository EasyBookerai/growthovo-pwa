import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getOrGenerateWeeklyReport } from '../../services/reportService';
import { colors, getPillarColor, radius, spacing, typography } from '../../theme';
import type { WeeklyRexReport } from '../../types';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  userId: string;
  weekStart: string;
  onClose: () => void;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBlock({ height = 80 }: { height?: number }) {
  return <View style={[styles.skeleton, { height }]} />;
}

// ─── Animated stat counter ────────────────────────────────────────────────────

function StatCounter({
  label,
  value,
  suffix = '',
  delay = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
}) {
  const animVal = useRef(new Animated.Value(0)).current;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(animVal, {
        toValue: value,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }, delay);

    const listener = animVal.addListener(({ value: v }) => {
      setDisplayed(Math.round(v));
    });

    return () => {
      clearTimeout(timeout);
      animVal.removeListener(listener);
    };
  }, [value, delay]);

  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>
        {displayed}
        {suffix}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Pattern card ─────────────────────────────────────────────────────────────

function PatternCard({ text, index }: { text: string; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const delay = index * 300;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, [index]);

  return (
    <Animated.View style={[styles.patternCard, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.patternIndex}>{index + 1}</Text>
      <Text style={styles.patternText}>{text}</Text>
    </Animated.View>
  );
}

// ─── Typewriter text ──────────────────────────────────────────────────────────

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return <Text style={styles.verdictText}>{displayed}</Text>;
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function WeeklyReportScreen({ userId, weekStart, onClose }: Props) {
  const [report, setReport] = useState<WeeklyRexReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  async function handleShare() {
    const caption = 'Rex just read me in 3 sentences. @growthovo #growthovo';
    try {
      await Share.share({ message: caption });
    } catch {
      // user dismissed or share failed — no-op
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrGenerateWeeklyReport(userId, weekStart);
      setReport(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }

  // Split pattern analysis into up to 3 observations
  function getPatternObservations(text: string): string[] {
    return text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Report</Text>
        <Text style={styles.headerSub}>{weekStart}</Text>
        <View style={styles.headerActions}>
          {report && (
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Share report"
            >
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error state */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading skeleton */}
      {loading && (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <SkeletonBlock height={40} />
          <SkeletonBlock height={120} />
          <SkeletonBlock height={200} />
          <SkeletonBlock height={160} />
          <SkeletonBlock height={140} />
        </ScrollView>
      )}

      {/* Report content */}
      {!loading && !error && report && (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* ── Section 1: The Numbers ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Numbers</Text>
            <View style={styles.statsGrid}>
              <StatCounter label="Lessons" value={report.numbersJson.lessonsCompleted} delay={0} />
              <StatCounter label="Challenges Done" value={report.numbersJson.challengesDone} delay={100} />
              <StatCounter label="Challenges Missed" value={report.numbersJson.challengesMissed} delay={200} />
              <StatCounter label="XP Earned" value={report.numbersJson.xpEarned} delay={300} />
              <StatCounter
                label="Morning Streak"
                value={report.numbersJson.morningCheckinStreak}
                suffix=" days"
                delay={400}
              />
              <StatCounter
                label="Debrief Rate"
                value={Math.round(report.numbersJson.eveningDebriefRate * 100)}
                suffix="%"
                delay={500}
              />
            </View>

            {/* SOS breakdown */}
            {Object.values(report.numbersJson.sosByType).some((v) => v > 0) && (
              <View style={styles.sosBreakdown}>
                <Text style={styles.sosTitle}>SOS Events</Text>
                <View style={styles.sosRow}>
                  {(
                    Object.entries(report.numbersJson.sosByType) as [string, number][]
                  )
                    .filter(([, count]) => count > 0)
                    .map(([type, count]) => (
                      <View key={type} style={styles.sosItem}>
                        <Text style={styles.sosCount}>{count}</Text>
                        <Text style={styles.sosType}>{type.replace(/_/g, ' ')}</Text>
                      </View>
                    ))}
                </View>
              </View>
            )}
          </View>

          {/* ── Section 2: Pattern Analysis ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pattern Analysis</Text>
            {getPatternObservations(report.patternAnalysis).map((obs, i) => (
              <PatternCard key={i} text={obs} index={i} />
            ))}
            {getPatternObservations(report.patternAnalysis).length === 0 && (
              <Text style={styles.emptyText}>No patterns detected this week.</Text>
            )}
          </View>

          {/* ── Section 3: The Verdict ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Verdict</Text>
            <View style={styles.verdictCard}>
              <TypewriterText text={report.verdictText} />
            </View>

            {/* Audio control */}
            <View style={styles.audioRow}>
              <TouchableOpacity
                style={styles.audioButton}
                onPress={() => setAudioPlaying((p) => !p)}
                accessibilityRole="button"
                accessibilityLabel={audioPlaying ? 'Pause audio' : 'Play audio'}
              >
                <Text style={styles.audioButtonText}>{audioPlaying ? '⏸ Pause' : '▶ Play'}</Text>
              </TouchableOpacity>
              {report.audioUrl ? (
                <Text style={styles.audioNote} numberOfLines={1}>
                  {audioPlaying ? 'Playing Rex verdict...' : 'Rex verdict audio ready'}
                </Text>
              ) : (
                <Text style={styles.audioNote}>No audio available</Text>
              )}
            </View>
          </View>

          {/* ── Section 4: Next Week's Focus ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Week's Focus</Text>

            <View
              style={[
                styles.focusCard,
                { borderLeftColor: getPillarColor(report.nextWeekFocusJson.pillar) },
              ]}
            >
              <Text style={styles.focusCardLabel}>Pillar</Text>
              <Text
                style={[
                  styles.focusCardValue,
                  { color: getPillarColor(report.nextWeekFocusJson.pillar) },
                ]}
              >
                {report.nextWeekFocusJson.pillar}
              </Text>
            </View>

            <View style={[styles.focusCard, { borderLeftColor: colors.xpGold }]}>
              <Text style={styles.focusCardLabel}>Habit to Build</Text>
              <Text style={styles.focusCardValue}>{report.nextWeekFocusJson.habit}</Text>
            </View>

            <View style={[styles.focusCard, { borderLeftColor: colors.primary }]}>
              <Text style={styles.focusCardLabel}>Do This Differently</Text>
              <Text style={styles.focusCardValue}>
                {report.nextWeekFocusJson.challengeToDoDifferently}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    paddingTop: 56,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  headerSub: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeText: {
    ...typography.body,
    color: colors.textMuted,
  },
  headerActions: {
    position: 'absolute',
    top: 56,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  shareButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },

  // Scroll content
  container: {
    padding: spacing.md,
    paddingBottom: 48,
    gap: spacing.xl,
  },

  // Skeleton
  skeleton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    ...typography.h3,
    color: colors.text,
  },
  errorDetail: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  retryText: {
    ...typography.bodyBold,
    color: colors.text,
  },

  // Sections
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // SOS breakdown
  sosBreakdown: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sosTitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sosItem: {
    alignItems: 'center',
    gap: 2,
  },
  sosCount: {
    ...typography.h3,
    color: colors.error,
  },
  sosType: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },

  // Pattern cards
  patternCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  patternIndex: {
    ...typography.h3,
    color: colors.primary,
    width: 24,
  },
  patternText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 24,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },

  // Verdict
  verdictCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  verdictText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
  },

  // Audio
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  audioButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  audioButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  audioNote: {
    ...typography.small,
    color: colors.textMuted,
    flex: 1,
  },

  // Focus cards
  focusCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    gap: 4,
  },
  focusCardLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  focusCardValue: {
    ...typography.bodyBold,
    color: colors.text,
  },
});
