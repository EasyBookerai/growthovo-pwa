import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator,
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

export default function LeagueScreen({ userId }: Props) {
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [leagueId, setLeagueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);
  const realtimeRef = useRef<any>(null);

  useEffect(() => {
    init();
    return () => {
      if (realtimeRef.current) supabase.removeChannel(realtimeRef.current);
    };
  }, []);

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
      {/* Glass header with league info */}
      <GlassCard intensity="medium" style={styles.header}>
        <Text style={styles.title}>🏆 Weekly League</Text>
        <Text style={styles.subtitle}>{daysLeft} day{daysLeft !== 1 ? 's' : ''} until reset</Text>
        
        {/* User's current position */}
        {userMember && (
          <View style={styles.userPosition}>
            <Text style={styles.positionLabel}>Your Position</Text>
            <View style={styles.positionInfo}>
              <Text style={styles.positionRank}>{getRankEmoji(userMember.rank)}</Text>
              <Text style={styles.positionXp}>{userMember.weeklyXp} XP</Text>
            </View>
          </View>
        )}
      </GlassCard>

      <ScrollView contentContainerStyle={styles.list}>
        {/* Enhanced leaderboard with glassmorphism */}
        <LeaderboardCard
          members={members}
          currentUserId={userId}
          variant="full"
        />

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
  header: { 
    margin: spacing.md,
    marginTop: 60,
    padding: spacing.lg,
  },
  title: { ...typography.h2, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.small, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  userPosition: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  positionLabel: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  positionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  positionRank: {
    ...typography.h2,
    fontSize: 32,
  },
  positionXp: {
    ...typography.h3,
    color: colors.xpGold,
  },
  list: { 
    padding: spacing.md, 
    gap: spacing.md, 
    paddingBottom: 80,
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
