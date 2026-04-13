import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Share, Alert,
} from 'react-native';
import { supabase } from '../../services/supabaseClient';
import { getUserSquad, getSquadMembers, createSquad, joinSquad } from '../../services/squadService';
import { colors, typography, spacing, radius } from '../../theme';
import type { Squad, SquadMember } from '../../types';

interface Props {
  userId: string;
}

export default function SquadScreen({ userId }: Props) {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle');
  const [squadName, setSquadName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const realtimeRef = useRef<any>(null);

  useEffect(() => {
    init();
    return () => {
      if (realtimeRef.current) supabase.removeChannel(realtimeRef.current);
    };
  }, []);

  async function init() {
    setLoading(true);
    const s = await getUserSquad(userId);
    setSquad(s);
    if (s) {
      const m = await getSquadMembers(s.id);
      setMembers(m);
      subscribeRealtime(s.id);
    }
    setLoading(false);
  }

  function subscribeRealtime(squadId: string) {
    const channel = supabase
      .channel(`squad-${squadId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'squad_members', filter: `squad_id=eq.${squadId}` },
        async () => {
          const updated = await getSquadMembers(squadId);
          setMembers(updated);
        }
      )
      .subscribe();
    realtimeRef.current = channel;
  }

  async function handleCreate() {
    if (!squadName.trim()) { setError('Enter a squad name.'); return; }
    setError('');
    setActionLoading(true);
    try {
      // Use Discipline pillar ID from seed
      const { data: pillar } = await supabase.from('pillars').select('id').eq('name', 'Discipline').single();
      const s = await createSquad(userId, pillar?.id ?? '', squadName.trim());
      setSquad(s);
      const m = await getSquadMembers(s.id);
      setMembers(m);
      subscribeRealtime(s.id);
      setMode('idle');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleJoin() {
    if (!inviteCode.trim()) { setError('Enter an invite code.'); return; }
    setError('');
    setActionLoading(true);
    try {
      const s = await joinSquad(userId, inviteCode.trim());
      setSquad(s);
      const m = await getSquadMembers(s.id);
      setMembers(m);
      subscribeRealtime(s.id);
      setMode('idle');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function shareInvite() {
    if (!squad) return;
    await Share.share({
      message: `Join my Growthovo squad "${squad.name}"! Use code: ${squad.inviteCode}`,
    });
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  if (!squad) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>⚔️ Squad Mode</Text>
          <Text style={styles.subtitle}>Team up with 4 others. Compete together.</Text>
        </View>

        {mode === 'idle' && (
          <View style={styles.noSquadActions}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setMode('create')} accessibilityRole="button">
              <Text style={styles.btnText}>Create a Squad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => setMode('join')} accessibilityRole="button">
              <Text style={styles.btnTextSecondary}>Join with Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'create' && (
          <View style={styles.form}>
            <Text style={styles.formLabel}>Squad name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. The Grind Squad"
              placeholderTextColor={colors.textMuted}
              value={squadName}
              onChangeText={setSquadName}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleCreate} disabled={actionLoading} accessibilityRole="button">
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('idle')} accessibilityRole="button">
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'join' && (
          <View style={styles.form}>
            <Text style={styles.formLabel}>Invite code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ABC123"
              placeholderTextColor={colors.textMuted}
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleJoin} disabled={actionLoading} accessibilityRole="button">
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Join</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('idle')} accessibilityRole="button">
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>⚔️ {squad.name}</Text>
        <TouchableOpacity onPress={shareInvite} accessibilityRole="button">
          <Text style={styles.inviteCode}>Code: {squad.inviteCode} 📋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {members.map((m, i) => {
          const isUser = m.userId === userId;
          return (
            <View key={m.userId} style={[styles.memberCard, isUser && styles.memberCardSelf]}>
              <Text style={styles.memberRank}>#{i + 1}</Text>
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, isUser && { color: colors.primary }]}>
                  {m.username}{isUser ? ' (you)' : ''}
                </Text>
                <Text style={styles.memberStreak}>🔥 {m.currentStreak} day streak</Text>
              </View>
              <Text style={styles.memberXP}>{m.weeklyXp} XP</Text>
            </View>
          );
        })}

        {members.length < 5 && (
          <View style={styles.emptySlot}>
            <Text style={styles.emptySlotText}>
              {5 - members.length} slot{5 - members.length !== 1 ? 's' : ''} open — share your code!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 4 },
  inviteCode: { ...typography.small, color: colors.primary, marginTop: 4 },
  noSquadActions: { padding: spacing.lg, gap: spacing.md },
  form: { padding: spacing.lg, gap: spacing.md },
  formLabel: { ...typography.bodyBold, color: colors.text },
  input: {
    backgroundColor: colors.surface, color: colors.text, borderRadius: radius.md,
    padding: spacing.md, ...typography.body, borderWidth: 1, borderColor: colors.border,
  },
  error: { color: colors.error, ...typography.body },
  btn: { borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  btnText: { color: '#fff', ...typography.bodyBold },
  btnTextSecondary: { color: colors.text, ...typography.bodyBold },
  back: { color: colors.textMuted, textAlign: 'center', ...typography.body },
  list: { padding: spacing.md, gap: 8, paddingBottom: 80 },
  memberCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
  },
  memberCardSelf: { borderWidth: 1, borderColor: colors.primary },
  memberRank: { ...typography.bodyBold, color: colors.textMuted, width: 28 },
  memberInfo: { flex: 1 },
  memberName: { ...typography.body, color: colors.text },
  memberStreak: { ...typography.small, color: colors.textMuted },
  memberXP: { ...typography.bodyBold, color: colors.xpGold },
  emptySlot: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
  },
  emptySlotText: { ...typography.body, color: colors.textMuted },
});
