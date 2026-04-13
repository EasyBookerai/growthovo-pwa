import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { supabase } from '../../services/supabaseClient';
import { assignUserToLeague, getLeagueRankings } from '../../services/leagueService';
import { colors, typography, spacing, radius } from '../../theme';
import type { LeagueMember } from '../../types';

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
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Weekly League</Text>
        <Text style={styles.subtitle}>{daysLeft} day{daysLeft !== 1 ? 's' : ''} until reset</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {members.map((m, i) => {
          const isUser = m.userId === userId;
          const isPromotion = i < 5;
          const isRelegation = i >= members.length - 5;

          return (
            <View
              key={m.userId}
              style={[
                styles.row,
                isUser && styles.rowSelf,
                isPromotion && styles.rowPromotion,
                isRelegation && !isPromotion && styles.rowRelegation,
              ]}
            >
              <Text style={[styles.rank, isPromotion && { color: colors.promotionGreen }]}>
                {getRankEmoji(i + 1)}
              </Text>
              <View style={styles.userInfo}>
                <Text style={[styles.username, isUser && { color: colors.primary }]}>
                  {m.username}{isUser ? ' (you)' : ''}
                </Text>
                {isPromotion && <Text style={styles.promotionTag}>↑ Promotion zone</Text>}
                {isRelegation && !isPromotion && <Text style={styles.relegationTag}>↓ Relegation zone</Text>}
              </View>
              <Text style={styles.xp}>{m.weeklyXp} XP</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Zone legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.promotionGreen }]} />
          <Text style={styles.legendText}>Top 5 promote</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.relegationRed }]} />
          <Text style={styles.legendText}>Bottom 5 relegate</Text>
        </View>
      </View>
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
  header: { padding: spacing.lg, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  list: { padding: spacing.md, gap: 8, paddingBottom: 80 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
  },
  rowSelf: { borderWidth: 1, borderColor: colors.primary },
  rowPromotion: { borderLeftWidth: 3, borderLeftColor: colors.promotionGreen },
  rowRelegation: { borderLeftWidth: 3, borderLeftColor: colors.relegationRed },
  rank: { ...typography.bodyBold, color: colors.text, width: 36, textAlign: 'center' },
  userInfo: { flex: 1 },
  username: { ...typography.body, color: colors.text },
  promotionTag: { ...typography.small, color: colors.promotionGreen },
  relegationTag: { ...typography.small, color: colors.relegationRed },
  xp: { ...typography.bodyBold, color: colors.xpGold },
  legend: {
    flexDirection: 'row', justifyContent: 'center', gap: spacing.xl,
    padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { ...typography.small, color: colors.textMuted },
});
