import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabaseClient';
import { getNextLesson } from '../../services/lessonService';
import { refillHearts } from '../../services/heartService';
import { getTotalXP } from '../../services/progressService';
import { getActivePair, getPartnerCheckinStatus, subscribeToPartnerCheckin, generateWeeklyComparison } from '../../services/partnerService';
import { getOrGenerateWeeklyReport } from '../../services/reportService';
import LessonPlayerScreen from '../lesson/LessonPlayerScreen';
import WeeklyReportScreen from '../report/WeeklyReportScreen';
import RelapseDetectionGate from '../../components/RelapseDetectionGate';
import { colors, typography, spacing, radius } from '../../theme';
import type { Lesson, LeagueMember, WeeklySummaryRecord, PartnerComparisonReport, WeeklyRexReport } from '../../types';
import SOSBottomSheet from '../../screens/sos/SOSBottomSheet';
import RexChatBottomSheet from '../../screens/chat/RexChatBottomSheet';

interface Props {
  userId: string;
  subscriptionStatus: string;
  onNavigateToStreakBroke: (streakCount: number) => void;
}

export default function HomeScreen({ userId, subscriptionStatus, onNavigateToStreakBroke }: Props) {
  const { t } = useTranslation();
  const [streak, setStreak] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [totalXP, setTotalXP] = useState(0);
  const [freezeCount, setFreezeCount] = useState(0);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [leagueTop, setLeagueTop] = useState<LeagueMember[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [streakAtRisk, setStreakAtRisk] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryRecord | null>(null);
  const [sosVisible, setSosVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState<{ partnerName: string; checkedIn: boolean; partnerStreak: number } | null>(null);
  const [weeklyComparison, setWeeklyComparison] = useState<PartnerComparisonReport | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyRexReport | null>(null);
  const [reportVisible, setReportVisible] = useState(false);
  const unsubscribePartnerRef = useRef<(() => void) | null>(null);

  const isPremium = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  function handleStreakBroke(originalStreak: number) {
    onNavigateToStreakBroke(originalStreak);
  }

  useEffect(() => {
    loadDashboard();
    loadWeeklySummary();
    loadWeeklyReport();
    loadPartnerStatus();
    return () => {
      unsubscribePartnerRef.current?.();
    };
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      await refillHearts(userId).catch(() => {});

      const [streakData, heartsData, xp, lesson, leagueData] = await Promise.all([
        supabase.from('streaks').select('current_streak, last_activity_date, freeze_count').eq('user_id', userId).single(),
        supabase.from('hearts').select('count').eq('user_id', userId).single(),
        getTotalXP(userId),
        supabase.from('pillars').select('id').eq('name', 'Discipline').single().then(({ data }) =>
          data ? getNextLesson(userId, data.id) : null
        ),
        loadLeague(),
      ]);

      if (streakData.data) {
        setStreak(streakData.data.current_streak);
        setFreezeCount(streakData.data.freeze_count || 0);
        const today = new Date().toISOString().split('T')[0];
        setStreakAtRisk(streakData.data.last_activity_date !== today);
      }
      if (heartsData.data) setHearts(heartsData.data.count);
      setTotalXP(xp);
      setNextLesson(lesson);
    } finally {
      setLoading(false);
    }
  }

  async function loadLeague() {
    const { data: membership } = await supabase
      .from('league_members')
      .select('league_id, rank')
      .eq('user_id', userId)
      .maybeSingle();

    if (!membership) return;
    setUserRank(membership.rank);

    const { data: members } = await supabase
      .from('league_members')
      .select('user_id, weekly_xp, rank, users(username, avatar_url)')
      .eq('league_id', membership.league_id)
      .order('weekly_xp', { ascending: false })
      .limit(3);

    if (members) {
      setLeagueTop(members.map((m: any) => ({
        id: m.user_id,
        leagueId: membership.league_id,
        userId: m.user_id,
        username: m.users?.username ?? 'Unknown',
        avatarUrl: m.users?.avatar_url,
        weeklyXp: m.weekly_xp,
        rank: m.rank,
      })));
    }
  }

  async function loadPartnerStatus() {
    try {
      const pair = await getActivePair(userId);
      if (!pair) {
        setPartnerStatus(null);
        return;
      }

      // Fetch partner name and streak
      const { data: partnerData } = await supabase
        .from('users')
        .select('username')
        .eq('id', pair.partnerId)
        .single();

      const { data: streakData } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', pair.partnerId)
        .single();

      const checkedIn = await getPartnerCheckinStatus(pair.id, pair.partnerId);

      setPartnerStatus({
        partnerName: partnerData?.username ?? 'Partner',
        checkedIn,
        partnerStreak: streakData?.current_streak ?? 0,
      });

      // Subscribe to real-time updates
      const unsubscribe = subscribeToPartnerCheckin(pair.partnerId, (newCheckedIn) => {
        setPartnerStatus((prev) =>
          prev ? { ...prev, checkedIn: newCheckedIn } : null
        );
      });
      unsubscribePartnerRef.current = unsubscribe;

      // On Monday: load weekly comparison
      const today = new Date();
      if (today.getDay() === 1) {
        try {
          const comparison = await generateWeeklyComparison(pair.id);
          setWeeklyComparison(comparison);
        } catch {
          // Non-critical — silently ignore
        }
      }
    } catch {
      // Silently ignore — partner card is non-critical
    }
  }

  async function loadWeeklySummary() {    // Only show on Monday (day 1) — surface the most recent summary
    const today = new Date();
    if (today.getDay() !== 1) return; // 1 = Monday

    // Get the most recent week_start (last Sunday)
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - 1);
    const weekStart = lastSunday.toISOString().split('T')[0];

    const { data } = await supabase
      .from('weekly_summaries')
      .select('id, user_id, week_start, summary_text, push_sent, created_at')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single();

    if (data) {
      setWeeklySummary({
        id: data.id,
        userId: data.user_id,
        weekStart: data.week_start,
        summaryText: data.summary_text,
        pushSent: data.push_sent,
        createdAt: data.created_at,
      });
    }
  }

  async function loadWeeklyReport() {
    // Only show on Monday (day 1) — check if a report exists for last week
    const today = new Date();
    if (today.getDay() !== 1) return; // 1 = Monday

    // Last Sunday's date = the week_start for the previous week
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - 1);
    const weekStart = lastSunday.toISOString().split('T')[0];

    try {
      const { data } = await supabase
        .from('weekly_rex_reports')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start', weekStart)
        .maybeSingle();

      if (data) {
        setWeeklyReport({
          id: data.id,
          userId: data.user_id,
          weekStart: data.week_start,
          numbersJson: data.numbers_json,
          patternAnalysis: data.pattern_analysis,
          verdictText: data.verdict_text,
          audioUrl: data.audio_url ?? null,
          nextWeekFocusJson: data.next_week_focus_json,
          createdAt: data.created_at,
        });
      }
    } catch {
      // Non-critical — silently ignore
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <RelapseDetectionGate userId={userId} onStreakBroke={handleStreakBroke}>
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top row: streak + hearts */}
        <View style={styles.topRow}>
          {/* Streak badge */}
          <View style={[styles.card, styles.streakCard]}>
            <Text style={styles.streakIcon}>{streakAtRisk ? '💀' : '🔥'}</Text>
            <Text style={styles.streakCount}>{streak}</Text>
            <Text style={styles.streakLabel}>{t('home.day_streak')}</Text>
            {streakAtRisk && <Text style={styles.atRiskLabel}>{t('home.at_risk')}</Text>}
          </View>

          {/* Hearts */}
          {!isPremium && (
            <View style={[styles.card, styles.heartsCard]}>
              <Text style={styles.heartsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Text key={i} style={{ opacity: i < hearts ? 1 : 0.2 }}>❤️</Text>
                ))}
              </Text>
              <Text style={styles.heartsLabel}>{t('home.hearts_count', { count: hearts })}</Text>
            </View>
          )}
          {isPremium && (
            <View style={[styles.card, styles.heartsCard]}>
              <Text style={{ fontSize: 28 }}>♾️</Text>
              <Text style={styles.heartsLabel}>{t('home.unlimited_hearts')}</Text>
            </View>
          )}
        </View>

        {/* XP bar */}
        <View style={[styles.card, styles.xpCard]}>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>{t('home.total_xp')}</Text>
            <Text style={styles.xpValue}>{totalXP.toLocaleString()}</Text>
          </View>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${Math.min((totalXP % 100), 100)}%` }]} />
          </View>
        </View>

        {/* Freeze inventory */}
        <View style={[styles.card, styles.freezeCard]}>
          <View style={styles.freezeRow}>
            <Text style={styles.freezeIcon}>🧊</Text>
            <View style={styles.freezeInfo}>
              <Text style={styles.freezeLabel}>{t('home.streak_freezes')}</Text>
              <Text style={styles.freezeCount}>{freezeCount}/3</Text>
            </View>
          </View>
          <Text style={styles.freezeHint}>{t('home.freeze_hint')}</Text>
        </View>

        {/* Weekly Rex summary card — shown on Monday mornings */}
        {weeklySummary && (
          <View style={[styles.card, styles.rexSummaryCard]}>
            <Text style={styles.rexSummaryLabel}>{t('home.rex_weekly_report')}</Text>
            <Text style={styles.rexSummaryText}>{weeklySummary.summaryText}</Text>
            <Text style={styles.rexSummaryWeek}>Week of {weeklySummary.weekStart}</Text>
          </View>
        )}

        {/* Weekly Rex Report card — shown on Monday mornings when report exists */}
        {weeklyReport && (
          <TouchableOpacity
            style={[styles.card, styles.weeklyReportCard]}
            onPress={() => setReportVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="View your weekly report"
          >
            <Text style={styles.weeklyReportLabel}>WEEKLY REPORT READY</Text>
            <Text style={styles.weeklyReportTitle}>Rex has your week.</Text>
            <Text style={styles.weeklyReportHint}>Tap to see your full report →</Text>
          </TouchableOpacity>
        )}

        {/* Weekly comparison card — shown on Monday mornings when paired */}
        {weeklyComparison && (
          <View style={[styles.card, styles.weeklyComparisonCard]}>
            <Text style={styles.weeklyComparisonLabel}>WEEKLY RECAP</Text>
            <View style={styles.weeklyComparisonRow}>
              <View style={styles.weeklyComparisonStat}>
                <Text style={styles.weeklyComparisonName}>You</Text>
                <Text style={styles.weeklyComparisonCount}>{weeklyComparison.userStats.challengesCompleted}</Text>
                <Text style={styles.weeklyComparisonStatLabel}>challenges</Text>
              </View>
              <Text style={styles.weeklyComparisonVs}>vs</Text>
              <View style={styles.weeklyComparisonStat}>
                <Text style={styles.weeklyComparisonName}>{weeklyComparison.partnerStats.name}</Text>
                <Text style={styles.weeklyComparisonCount}>{weeklyComparison.partnerStats.challengesCompleted}</Text>
                <Text style={styles.weeklyComparisonStatLabel}>challenges</Text>
              </View>
            </View>
            <Text style={styles.weeklyComparisonWinner}>
              {weeklyComparison.winnerId === weeklyComparison.userStats.userId
                ? 'You won this week! 🏆'
                : `${weeklyComparison.partnerStats.name} won this week — your turn next 💪`}
            </Text>
          </View>
        )}

        {/* Partner status card */}
        {partnerStatus ? (
          <View style={[styles.card, styles.partnerCard]}>
            <Text style={styles.partnerLabel}>ACCOUNTABILITY PARTNER</Text>
            <View style={styles.partnerRow}>
              <View style={[styles.partnerDot, partnerStatus.checkedIn ? styles.partnerDotGreen : styles.partnerDotGrey]} />
              <Text style={styles.partnerName}>{partnerStatus.partnerName}</Text>
              <Text style={styles.partnerStreak}>🔥 {partnerStatus.partnerStreak}</Text>
            </View>
            <Text style={styles.partnerStatus}>
              {partnerStatus.checkedIn ? 'Checked in today' : 'Not checked in yet'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.card, styles.partnerCard]}
            accessibilityRole="button"
            accessibilityLabel="Invite an accountability partner"
          >
            <Text style={styles.partnerLabel}>ACCOUNTABILITY PARTNER</Text>
            <Text style={styles.partnerInviteText}>Invite an accountability partner</Text>
            <Text style={styles.partnerInviteHint}>Hold each other to the standard.</Text>
          </TouchableOpacity>
        )}

        {/* Daily lesson card */}
        {nextLesson ? (
          <TouchableOpacity
            style={[styles.card, styles.lessonCard]}
            onPress={() => setActiveLesson(nextLesson)}
            accessibilityRole="button"
            accessibilityLabel={`Start lesson: ${nextLesson.title}`}
          >
            <View style={styles.lessonCardHeader}>
              <Text style={styles.lessonCardBadge}>{t('home.todays_lesson')}</Text>
              <Text style={styles.lessonCardArrow}>→</Text>
            </View>
            <Text style={styles.lessonCardTitle}>{nextLesson.title}</Text>
            <Text style={styles.lessonCardSub}>{t('home.lesson_duration')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.card, styles.lessonCard]}>
            <Text style={styles.lessonCardBadge}>{t('home.all_done')}</Text>
            <Text style={styles.lessonCardTitle}>{t('home.all_lessons_complete')}</Text>
          </View>
        )}

        {/* League snapshot */}
        {leagueTop.length > 0 && (
          <View style={[styles.card, styles.leagueCard]}>
            <Text style={styles.sectionTitle}>{t('home.your_league')}</Text>
            {leagueTop.map((m, i) => (
              <View key={m.userId} style={styles.leagueRow}>
                <Text style={styles.leagueRank}>#{i + 1}</Text>
                <Text style={styles.leagueUsername}>{m.username}</Text>
                <Text style={styles.leagueXP}>{m.weeklyXp} XP</Text>
              </View>
            ))}
            {userRank && userRank > 3 && (
              <View style={[styles.leagueRow, styles.leagueRowSelf]}>
                <Text style={styles.leagueRank}>#{userRank}</Text>
                <Text style={[styles.leagueUsername, { color: colors.primary }]}>{t('common.you')}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Lesson modal */}
      <Modal visible={!!activeLesson} animationType="slide" presentationStyle="fullScreen">
        {activeLesson && (
          <LessonPlayerScreen
            lesson={activeLesson}
            userId={userId}
            pillarColour={colors.pillars.discipline}
            onComplete={() => {
              setActiveLesson(null);
              loadDashboard();
            }}
            onClose={() => setActiveLesson(null)}
          />
        )}
      </Modal>

      {/* Weekly Report modal */}
      <Modal visible={reportVisible} animationType="slide" presentationStyle="fullScreen">
        {weeklyReport && (
          <WeeklyReportScreen
            userId={userId}
            weekStart={weeklyReport.weekStart}
            onClose={() => setReportVisible(false)}
          />
        )}
      </Modal>

      {/* SOS Button — always visible, fixed above tab bar */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => setSosVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="SOS — tap for emergency help"
      >
        <Text style={styles.sosButtonText}>SOS</Text>
      </TouchableOpacity>

      {/* Rex Chat Button — always visible, bottom-left */}
      <TouchableOpacity
        style={styles.rexButton}
        onPress={() => setChatVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Chat with Rex"
      >
        <Text style={styles.rexButtonText}>R</Text>
      </TouchableOpacity>

      {/* SOS Bottom Sheet */}
      <SOSBottomSheet
        userId={userId}
        visible={sosVisible}
        onClose={() => setSosVisible(false)}
        onSelectType={(type: string) => {
          setSosVisible(false);
        }}
      />

      {/* Rex Chat Bottom Sheet */}
      <RexChatBottomSheet
        userId={userId}
        subscriptionStatus={subscriptionStatus}
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
      />
    </View>
    </RelapseDetectionGate>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  container: { padding: spacing.md, paddingTop: 60, paddingBottom: 80, gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
  topRow: { flexDirection: 'row', gap: spacing.md },
  streakCard: { flex: 1, alignItems: 'center', gap: 4 },
  streakIcon: { fontSize: 32 },
  streakCount: { ...typography.h1, color: colors.text },
  streakLabel: { ...typography.small, color: colors.textMuted },
  atRiskLabel: { ...typography.smallBold, color: colors.error },
  heartsCard: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  heartsRow: { fontSize: 18 },
  heartsLabel: { ...typography.small, color: colors.textMuted },
  xpCard: {},
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  xpLabel: { ...typography.bodyBold, color: colors.text },
  xpValue: { ...typography.bodyBold, color: colors.xpGold },
  xpBarBg: { height: 6, backgroundColor: colors.border, borderRadius: 3 },
  xpBarFill: { height: 6, backgroundColor: colors.xpGold, borderRadius: 3 },
  freezeCard: {},
  freezeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  freezeIcon: { fontSize: 24 },
  freezeInfo: { flex: 1 },
  freezeLabel: { ...typography.bodyBold, color: colors.text },
  freezeCount: { ...typography.body, color: colors.textMuted },
  freezeHint: { ...typography.small, color: colors.textMuted },
  lessonCard: { borderLeftWidth: 4, borderLeftColor: colors.pillars.discipline },
  lessonCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  lessonCardBadge: { ...typography.caption, color: colors.pillars.discipline },
  lessonCardArrow: { ...typography.bodyBold, color: colors.pillars.discipline },
  lessonCardTitle: { ...typography.h3, color: colors.text, marginBottom: 4 },
  lessonCardSub: { ...typography.small, color: colors.textMuted },
  leagueCard: {},
  sectionTitle: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.sm },
  leagueRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: spacing.sm },
  leagueRowSelf: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4, paddingTop: 8 },
  leagueRank: { ...typography.smallBold, color: colors.textMuted, width: 28 },
  leagueUsername: { ...typography.body, color: colors.text, flex: 1 },
  leagueXP: { ...typography.smallBold, color: colors.xpGold },
  rexSummaryCard: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  rexSummaryLabel: { ...typography.caption, color: colors.primary, marginBottom: spacing.sm },
  rexSummaryText: { ...typography.body, color: colors.text, lineHeight: 26, marginBottom: spacing.sm },
  rexSummaryWeek: { ...typography.small, color: colors.textMuted },
  sosButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  rexButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  rexButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  partnerCard: { borderLeftWidth: 4, borderLeftColor: colors.pillars.relationships },
  partnerLabel: { ...typography.caption, color: colors.pillars.relationships, marginBottom: spacing.sm },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  partnerDot: { width: 10, height: 10, borderRadius: 5 },
  partnerDotGreen: { backgroundColor: colors.success },
  partnerDotGrey: { backgroundColor: colors.textMuted },
  partnerName: { ...typography.bodyBold, color: colors.text, flex: 1 },
  partnerStreak: { ...typography.smallBold, color: colors.streakOrange },
  partnerStatus: { ...typography.small, color: colors.textMuted },
  partnerInviteText: { ...typography.bodyBold, color: colors.text, marginBottom: 4 },
  partnerInviteHint: { ...typography.small, color: colors.textMuted },
  weeklyComparisonCard: { borderLeftWidth: 4, borderLeftColor: colors.xpGold },
  weeklyComparisonLabel: { ...typography.caption, color: colors.xpGold, marginBottom: spacing.sm },
  weeklyComparisonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: spacing.sm },
  weeklyComparisonStat: { alignItems: 'center', gap: 2 },
  weeklyComparisonName: { ...typography.small, color: colors.textMuted },
  weeklyComparisonCount: { ...typography.h2, color: colors.text },
  weeklyComparisonStatLabel: { ...typography.small, color: colors.textMuted },
  weeklyComparisonVs: { ...typography.bodyBold, color: colors.textMuted },
  weeklyComparisonWinner: { ...typography.bodyBold, color: colors.text, textAlign: 'center' },
  weeklyReportCard: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  weeklyReportLabel: { ...typography.caption, color: colors.primary, marginBottom: spacing.sm },
  weeklyReportTitle: { ...typography.h3, color: colors.text, marginBottom: 4 },
  weeklyReportHint: { ...typography.small, color: colors.textMuted },
});
