import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabaseClient';
import {
  selectMentalState,
  dismissBriefing,
  getBriefingFallbackTruth,
  getBriefingFallbackFocus,
} from '../../services/briefingService';
import { colors, typography, spacing, radius } from '../../theme';
import type { MentalState, MorningBriefingData } from '../../types';

// ─── Mental state options ──────────────────────────────────────────────────────

const MENTAL_STATE_OPTIONS: { state: MentalState; emoji: string; label: string }[] = [
  { state: 'anxious', emoji: '😰', label: 'Anxious' },
  { state: 'low', emoji: '😔', label: 'Low' },
  { state: 'neutral', emoji: '😐', label: 'Neutral' },
  { state: 'good', emoji: '🙂', label: 'Good' },
  { state: 'locked_in', emoji: '🔥', label: 'Locked In' },
];

const STREAK_MILESTONES = [7, 14, 30, 60, 90];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  userId: string;
  onDismiss: () => void;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonLine({ width = '100%', height = 16 }: { width?: string | number; height?: number }) {
  return (
    <View
      style={[
        styles.skeletonLine,
        { width: width as any, height },
      ]}
    />
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MorningBriefingScreen({ userId, onDismiss }: Props) {
  const [briefingData, setBriefingData] = useState<MorningBriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [selectedState, setSelectedState] = useState<MentalState | null>(null);
  const [rexReaction, setRexReaction] = useState<string | null>(null);
  const [reactionLoading, setReactionLoading] = useState(false);

  const [dismissing, setDismissing] = useState(false);

  // ── Load briefing data on mount ──────────────────────────────────────────────
  useEffect(() => {
    loadBriefing();
  }, []);

  async function loadBriefing() {
    setLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await supabase.functions.invoke('generate-morning-briefing', {
        body: { userId },
      });

      if (error || !data) throw new Error('Failed to load briefing');
      setBriefingData(data as MorningBriefingData);
    } catch {
      // Fallback content
      const dayOfWeek = new Date().getDay();
      setBriefingData({
        rexDailyTruth: getBriefingFallbackTruth(dayOfWeek),
        todaysFocus: getBriefingFallbackFocus('discipline'),
        streakCount: 0,
        heartsRemaining: 5,
        leaguePosition: 0,
        leaguePositionDelta: 0,
        streakMilestone: null,
        partnerStatus: null,
      });
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  // ── Mental state tap ─────────────────────────────────────────────────────────
  async function handleMentalStateTap(state: MentalState) {
    if (reactionLoading) return;
    setSelectedState(state);
    setRexReaction(null);
    setReactionLoading(true);
    try {
      const reaction = await selectMentalState(userId, state);
      setRexReaction(reaction);
    } catch {
      setRexReaction("Show up anyway. That's the whole game.");
    } finally {
      setReactionLoading(false);
    }
  }

  // ── Dismiss ──────────────────────────────────────────────────────────────────
  async function handleLetsGo() {
    if (!selectedState || dismissing) return;
    setDismissing(true);
    try {
      await dismissBriefing(userId);
    } catch {
      // Non-blocking — still navigate
    }
    onDismiss();
  }

  // ── Milestone message ────────────────────────────────────────────────────────
  function getMilestoneMessage(streak: number): string | null {
    if (!STREAK_MILESTONES.includes(streak)) return null;
    const messages: Record<number, string> = {
      7: '7 days. One week of not quitting.',
      14: '14 days. Two weeks of showing up.',
      30: '30 days. A month of discipline.',
      60: '60 days. You\'re building something real.',
      90: '90 days. Most people quit at day 3.',
    };
    return messages[streak] ?? null;
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.header}>Good morning.</Text>
        <Text style={styles.subheader}>60 seconds. Let's go.</Text>

        {/* ── Section 1: Mental State ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>How are you showing up today?</Text>
          <View style={styles.emojiRow}>
            {MENTAL_STATE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.state}
                style={[
                  styles.emojiButton,
                  selectedState === opt.state && styles.emojiButtonSelected,
                ]}
                onPress={() => handleMentalStateTap(opt.state)}
                accessibilityRole="button"
                accessibilityLabel={opt.label}
                accessibilityState={{ selected: selectedState === opt.state }}
              >
                <Text style={styles.emojiText}>{opt.emoji}</Text>
                <Text style={[
                  styles.emojiLabel,
                  selectedState === opt.state && styles.emojiLabelSelected,
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rex reaction */}
          {reactionLoading && (
            <View style={styles.reactionBox}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
          {!reactionLoading && rexReaction && (
            <View style={styles.reactionBox}>
              <Text style={styles.rexLabel}>Rex</Text>
              <Text style={styles.reactionText}>{rexReaction}</Text>
            </View>
          )}
        </View>

        {/* ── Section 2: Rex's Daily Truth ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Rex's Daily Truth</Text>
          {loading ? (
            <View style={styles.skeletonBlock}>
              <SkeletonLine />
              <SkeletonLine width="80%" />
            </View>
          ) : (
            <View style={styles.truthBox}>
              {loadError && (
                <Text style={styles.fallbackBadge}>Offline content</Text>
              )}
              <Text style={styles.truthText}>{briefingData?.rexDailyTruth}</Text>
            </View>
          )}
        </View>

        {/* ── Section 3: Today's Single Focus ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Today's Single Focus</Text>
          {loading ? (
            <View style={styles.skeletonBlock}>
              <SkeletonLine />
              <SkeletonLine width="60%" />
            </View>
          ) : (
            <View style={styles.focusBox}>
              <Text style={styles.focusText}>{briefingData?.todaysFocus}</Text>
            </View>
          )}
        </View>

        {/* ── Section 4: Streak / Hearts / League / Partner ── */}
        <View style={styles.section}>
          {loading ? (
            <View style={styles.skeletonBlock}>
              <SkeletonLine height={48} />
            </View>
          ) : briefingData ? (
            <>
              {/* Streak milestone or standard streak */}
              {briefingData.streakMilestone != null ? (
                <View style={styles.milestoneBox}>
                  <Text style={styles.milestoneEmoji}>🏆</Text>
                  <Text style={styles.milestoneText}>
                    {getMilestoneMessage(briefingData.streakMilestone)}
                  </Text>
                </View>
              ) : (
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statEmoji}>🔥</Text>
                    <Text style={styles.statValue}>{briefingData.streakCount}</Text>
                    <Text style={styles.statLabel}>day streak</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statEmoji}>❤️</Text>
                    <Text style={styles.statValue}>{briefingData.heartsRemaining}</Text>
                    <Text style={styles.statLabel}>hearts</Text>
                  </View>
                  {briefingData.leaguePosition > 0 && (
                    <View style={styles.statItem}>
                      <Text style={styles.statEmoji}>🏅</Text>
                      <Text style={styles.statValue}>#{briefingData.leaguePosition}</Text>
                      <Text style={styles.statLabel}>league</Text>
                    </View>
                  )}
                </View>
              )}

              {/* League drop comment */}
              {briefingData.leaguePositionDelta < 0 && (
                <Text style={styles.leagueDropText}>
                  You dropped {Math.abs(briefingData.leaguePositionDelta)} spot{Math.abs(briefingData.leaguePositionDelta) > 1 ? 's' : ''} in the league. Fix that today.
                </Text>
              )}

              {/* Partner status */}
              {briefingData.partnerStatus ? (
                <View style={styles.partnerBox}>
                  <Text style={styles.partnerText}>
                    {briefingData.partnerStatus.checkedIn
                      ? `${briefingData.partnerStatus.partnerName} checked in. They're ready.`
                      : `${briefingData.partnerStatus.partnerName} hasn't checked in yet. You going to let them slip?`}
                  </Text>
                </View>
              ) : (
                <View style={styles.partnerBox}>
                  <Text style={styles.partnerPromptText}>
                    No accountability partner yet. Invite someone who'll call you out.
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </View>

        {/* ── Section 5: Let's Go button ── */}
        <TouchableOpacity
          style={[
            styles.letsGoButton,
            !selectedState && styles.letsGoButtonDisabled,
          ]}
          onPress={handleLetsGo}
          disabled={!selectedState || dismissing}
          accessibilityRole="button"
          accessibilityLabel="Let's go"
          accessibilityState={{ disabled: !selectedState || dismissing }}
        >
          {dismissing ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <Text style={[
              styles.letsGoText,
              !selectedState && styles.letsGoTextDisabled,
            ]}>
              {selectedState ? "Let's go →" : 'Select your state first'}
            </Text>
          )}
        </TouchableOpacity>
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

  // Sections
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Skeleton
  skeletonBlock: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  skeletonLine: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
  },

  // Mental state emojis
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  emojiButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 4,
  },
  emojiButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  emojiText: {
    fontSize: 24,
  },
  emojiLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emojiLabelSelected: {
    color: colors.primary,
  },

  // Rex reaction
  reactionBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    minHeight: 56,
    justifyContent: 'center',
    gap: 4,
  },
  rexLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  reactionText: {
    ...typography.body,
    color: colors.text,
  },

  // Daily truth
  truthBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  fallbackBadge: {
    ...typography.caption,
    color: colors.textMuted,
  },
  truthText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
  },

  // Focus
  focusBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.xpGold,
  },
  focusText: {
    ...typography.bodyBold,
    color: colors.text,
    lineHeight: 26,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    gap: 4,
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  statLabel: {
    ...typography.small,
    color: colors.textMuted,
  },

  // Milestone
  milestoneBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  milestoneEmoji: {
    fontSize: 32,
  },
  milestoneText: {
    ...typography.bodyBold,
    color: colors.xpGold,
    flex: 1,
  },

  // League drop
  leagueDropText: {
    ...typography.small,
    color: colors.error,
  },

  // Partner
  partnerBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  partnerText: {
    ...typography.body,
    color: colors.text,
  },
  partnerPromptText: {
    ...typography.body,
    color: colors.textMuted,
  },

  // Let's go button
  letsGoButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  letsGoButtonDisabled: {
    backgroundColor: colors.surface,
  },
  letsGoText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  letsGoTextDisabled: {
    color: colors.textMuted,
  },
});
