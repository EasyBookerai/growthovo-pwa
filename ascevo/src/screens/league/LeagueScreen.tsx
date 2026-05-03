import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, Animated,
} from 'react-native';
import { supabase } from '../../services/supabaseClient';
import { assignUserToLeague, getLeagueRankings } from '../../services/leagueService';
import { colors, typography, spacing } from '../../theme';
import type { LeagueMember } from '../../types';
import LeaderboardCard from '../../components/gamification/LeaderboardCard';
import GlassCard from '../../components/glass/GlassCard';

interface Props {
  userId: string;
}

// Fake leaderboard data for ranks 1-10
const FAKE_LEADERBOARD = [
  { rank: 1, username: 'DragonSlayer', xp: 1250, avatar: 'D' },
  { rank: 2, username: 'MindMaster', xp: 1180, avatar: 'M' },
  { rank: 3, username: 'FocusKing', xp: 1050, avatar: 'F' },
  { rank: 4, username: 'GrowthGuru', xp: 920, avatar: 'G' },
  { rank: 5, username: 'StreakQueen', xp: 850, avatar: 'S' },
  { rank: 6, username: 'XPHunter', xp: 780, avatar: 'X' },
  { rank: 7, username: 'LevelUp', xp: 710, avatar: 'L' },
  { rank: 8, username: 'ChampionX', xp: 640, avatar: 'C' },
  { rank: 9, username: 'ProgressPro', xp: 570, avatar: 'P' },
  { rank: 10, username: 'RiseUp', xp: 500, avatar: 'R' },
];

// Fake squad members
const FAKE_SQUAD = [
  { username: 'Sarah', xp: 420, online: true, avatar: 'S' },
  { username: 'Mike', xp: 380, online: false, avatar: 'M' },
  { username: 'Alex', xp: 350, online: true, avatar: 'A' },
];

export default function LeagueScreen({ userId }: Props) {
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [leagueId, setLeagueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);
  const realtimeRef = useRef<any>(null);
  const fadeAnims = useRef(FAKE_LEADERBOARD.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    init();
    return () => {
      if (realtimeRef.current) supabase.removeChannel(realtimeRef.current);
    };
  }, []);

  useEffect(() => {
    // Animate leaderboard entries on mount
    if (!loading) {
      Animated.stagger(
        50,
        fadeAnims.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [loading]);

  async function init() {
    setLoading(true);
    try {
      const id = await assignUserToLeague(userId);
      setLeagueId(id);
      const rankings = await getLeagueRankings(id);
      setMembers(rankings);
      setDaysLeft(getDaysUntilMonday());
      subscribeRealtime(id);
    } finally {
      setLoading(false);
    }
  }

  function subscribeRealtime(id: string) {
    const channel = supabase
      .channel(`league-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'league_members', filter: `league_id=eq.${id}` },
        async () => {
          const updated = await getLeagueRankings(id);
          setMembers(updated);
        }
      )
      .subscribe();
    realtimeRef.current = channel;
  }

  const userMember = members.find((m) => m.userId === userId);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.leagueGold} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 6.1: Weekly League Header */}
        <GlassCard intensity="medium" style={styles.header}>
          <Text style={styles.title}>Weekly League 🏆</Text>
          
          {/* 6.2: Countdown badge */}
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>
              ⏰ {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
            </Text>
          </View>
        </GlassCard>

        {/* 6.3: User rank card */}
        <GlassCard intensity="medium" style={styles.userRankCard}>
          <Text style={styles.rankCardLabel}>YOUR RANK</Text>
          <View style={styles.rankCardBadge}>
            <Text style={styles.rankCardBadgeText}>Bronze League</Text>
          </View>
          <View style={styles.rankCardStats}>
            <View style={styles.rankCardStatItem}>
              <Text style={styles.rankCardStatLabel}>Rank</Text>
              <Text style={styles.rankCardStatValue}>#12</Text>
            </View>
            <View style={styles.rankCardDivider} />
            <View style={styles.rankCardStatItem}>
              <Text style={styles.rankCardStatLabel}>Weekly XP</Text>
              <Text style={styles.rankCardStatValue}>340</Text>
            </View>
          </View>
          
          {/* 6.4: Progress bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>160 XP to rank up</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '68%' }]} />
            </View>
          </View>
        </GlassCard>

        {/* 6.5 & 6.6 & 6.7: Leaderboard with medals and user row */}
        <GlassCard intensity="light" style={styles.leaderboardCard}>
          <Text style={styles.sectionTitle}>Top Players</Text>
          
          {FAKE_LEADERBOARD.map((entry, index) => (
            <Animated.View
              key={entry.rank}
              style={[
                styles.leaderboardRow,
                { opacity: fadeAnims[index] },
              ]}
            >
              <View style={styles.leaderboardRank}>
                {/* 6.6: Medals for top 3 */}
                {entry.rank === 1 && <Text style={styles.medalEmoji}>🥇</Text>}
                {entry.rank === 2 && <Text style={styles.medalEmoji}>🥈</Text>}
                {entry.rank === 3 && <Text style={styles.medalEmoji}>🥉</Text>}
                {entry.rank > 3 && <Text style={styles.rankNumber}>#{entry.rank}</Text>}
              </View>
              
              <View style={styles.leaderboardAvatar}>
                <Text style={styles.leaderboardAvatarText}>{entry.avatar}</Text>
              </View>
              
              <Text style={styles.leaderboardUsername}>{entry.username}</Text>
              
              <Text style={styles.leaderboardXp}>{entry.xp} XP</Text>
            </Animated.View>
          ))}

          {/* 6.7: Current user row with purple highlight */}
          <View style={[styles.leaderboardRow, styles.userRow]}>
            <View style={styles.leaderboardRank}>
              <Text style={styles.rankNumber}>#12</Text>
            </View>
            
            <View style={[styles.leaderboardAvatar, styles.userAvatar]}>
              <Text style={styles.leaderboardAvatarText}>C</Text>
            </View>
            
            <Text style={[styles.leaderboardUsername, styles.userUsername]}>Champion (You)</Text>
            
            <Text style={[styles.leaderboardXp, styles.userXp]}>340 XP</Text>
          </View>
        </GlassCard>

        {/* 6.8 & 6.9: Your Squad section with online status */}
        <GlassCard intensity="light" style={styles.squadCard}>
          <Text style={styles.sectionTitle}>Your Squad</Text>
          
          {FAKE_SQUAD.map((member) => (
            <View key={member.username} style={styles.squadRow}>
              <View style={styles.squadAvatarContainer}>
                <View style={styles.squadAvatar}>
                  <Text style={styles.squadAvatarText}>{member.avatar}</Text>
                </View>
                {/* 6.9: Online/offline status indicator */}
                <View style={[styles.statusDot, member.online ? styles.statusOnline : styles.statusOffline]} />
              </View>
              
              <View style={styles.squadInfo}>
                <Text style={styles.squadUsername}>{member.username}</Text>
                <Text style={styles.squadXp}>{member.xp} XP this week</Text>
              </View>
              
              <Text style={styles.squadStatus}>{member.online ? '🟢 Online' : '⚫ Offline'}</Text>
            </View>
          ))}

          {/* 6.10: Invite a Friend button */}
          <TouchableOpacity style={styles.inviteButton} activeOpacity={0.7}>
            <Text style={styles.inviteButtonText}>Invite a Friend →</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Zone legend */}
        <GlassCard intensity="light" style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.promotionGreen }]} />
            <Text style={styles.legendText}>Top 5 promote to next league</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.relegationRed }]} />
            <Text style={styles.legendText}>Bottom 5 relegate to previous league</Text>
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

function getRankEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

function getDaysUntilMonday(): number {
  const now = new Date();
  const day = now.getDay();
  return day === 1 ? 7 : (8 - day) % 7;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  scrollContent: {
    padding: spacing.md,
    paddingTop: 60,
    paddingBottom: 100,
    gap: spacing.md,
  },
  header: { 
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: { ...typography.h2, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  countdownBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  countdownText: {
    ...typography.small,
    color: '#A78BFA',
    fontWeight: '600',
  },
  userRankCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  rankCardLabel: {
    ...typography.small,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  rankCardBadge: {
    backgroundColor: '#CD7F32',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  rankCardBadgeText: {
    ...typography.small,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rankCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  rankCardStatItem: {
    alignItems: 'center',
  },
  rankCardStatLabel: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  rankCardStatValue: {
    ...typography.h2,
    color: colors.text,
    fontSize: 32,
  },
  rankCardDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContainer: {
    width: '100%',
  },
  progressLabel: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  leaderboardCard: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  userRow: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: '#7C3AED',
    marginTop: spacing.sm,
  },
  leaderboardRank: {
    width: 50,
    alignItems: 'center',
  },
  medalEmoji: {
    fontSize: 24,
  },
  rankNumber: {
    ...typography.bodyBold,
    color: colors.textMuted,
    fontSize: 16,
  },
  leaderboardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  userAvatar: {
    backgroundColor: '#7C3AED',
  },
  leaderboardAvatarText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 16,
  },
  leaderboardUsername: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  userUsername: {
    ...typography.bodyBold,
    color: '#A78BFA',
  },
  leaderboardXp: {
    ...typography.bodyBold,
    color: colors.textMuted,
  },
  userXp: {
    color: '#7C3AED',
  },
  squadCard: {
    padding: spacing.md,
  },
  squadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: spacing.xs,
  },
  squadAvatarContainer: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  squadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  squadAvatarText: {
    ...typography.bodyBold,
    color: '#A78BFA',
    fontSize: 16,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  statusOnline: {
    backgroundColor: '#10B981',
  },
  statusOffline: {
    backgroundColor: '#6B7280',
  },
  squadInfo: {
    flex: 1,
  },
  squadUsername: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: 2,
  },
  squadXp: {
    ...typography.small,
    color: colors.textMuted,
  },
  squadStatus: {
    ...typography.small,
    color: colors.textMuted,
  },
  inviteButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#7C3AED',
    alignItems: 'center',
  },
  inviteButtonText: {
    ...typography.bodyBold,
    color: '#7C3AED',
    fontSize: 16,
  },
  legend: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.sm,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { ...typography.small, color: colors.textMuted },
});
