import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Image,
} from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabaseClient';
import { getAllPillarLevels, getTotalXP } from '../../services/progressService';
import { getCapsuleStatus } from '../../services/capsuleService';
import { colors, typography, spacing, radius, getPillarColor } from '../../theme';
import type { Pillar } from '../../types';

interface Props {
  userId: string;
  onOpenSettings: () => void;
  onOpenCapsule?: () => void;
  onOpenSpeaking?: () => void;
}

const PILLAR_NAMES = ['Mind', 'Discipline', 'Communication', 'Money', 'Career', 'Relationships'];

export default function ProfileScreen({ userId, onOpenSettings, onOpenCapsule, onOpenSpeaking }: Props) {
  const [user, setUser] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [pillarLevels, setPillarLevels] = useState<Record<string, number>>({});
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [capsule, setCapsule] = useState<{ exists: boolean; daysRemaining: number; unlocked: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [userData, streakData, xp, pillarData] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('streaks').select('current_streak').eq('user_id', userId).single(),
      getTotalXP(userId),
      supabase.from('pillars').select('*').order('display_order'),
    ]);

    setUser(userData.data);
    setStreak(streakData.data?.current_streak ?? 0);
    setTotalXP(xp);

    const pillarList = (pillarData.data ?? []).map((p: any) => ({
      id: p.id, name: p.name, colour: p.colour, icon: p.icon, displayOrder: p.display_order,
    }));
    setPillars(pillarList);

    const levels = await getAllPillarLevels(userId, pillarList.map((p) => p.id));
    setPillarLevels(levels);

    // Load capsule status
    try {
      const status = await getCapsuleStatus(userId);
      setCapsule(status);
    } catch {
      setCapsule(null);
    }

    // Load friends
    const { data: friendData } = await supabase
      .from('friends')
      .select('friend_id, users!friends_friend_id_fkey(username, avatar_url), streaks!inner(current_streak)')
      .eq('user_id', userId)
      .limit(10);
    setFriends(friendData ?? []);

    setLoading(false);
  }

  async function uploadAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;

    const uri = result.assets[0].uri;
    const ext = uri.split('.').pop() ?? 'jpg';
    const path = `avatars/${userId}.${ext}`;

    const response = await fetch(uri);
    const blob = await response.blob();
    await supabase.storage.from('avatars').upload(path, blob, { upsert: true });
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('users').update({ avatar_url: data.publicUrl }).eq('id', userId);
    setUser((prev: any) => ({ ...prev, avatar_url: data.publicUrl }));
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={uploadAvatar} accessibilityRole="button" accessibilityLabel="Change avatar">
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{user?.username?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.xpText}>⚡ {totalXP.toLocaleString()} XP total</Text>
          <Text style={styles.streakText}>🔥 {streak} day streak</Text>
        </View>
        <TouchableOpacity onPress={onOpenSettings} accessibilityRole="button" accessibilityLabel="Settings">
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Spider chart */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Skill Radar</Text>
        <SpiderChart pillars={pillars} levels={pillarLevels} />
      </View>

      {/* Pillar level badges */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pillar Levels</Text>
        <View style={styles.badgeGrid}>
          {pillars.map((p) => {
            const level = pillarLevels[p.id] ?? 1;
            const colour = getPillarColor(p.name);
            return (
              <View key={p.id} style={[styles.badge, { borderColor: colour }]}>
                <Text style={styles.badgeIcon}>{p.icon}</Text>
                <Text style={[styles.badgeLevel, { color: colour }]}>Lv {level}</Text>
                <Text style={styles.badgeName}>{p.name}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Speaking Trainer */}
      <TouchableOpacity
        style={styles.speakingCard}
        onPress={onOpenSpeaking}
        accessibilityRole="button"
        accessibilityLabel="Open Public Speaking Trainer"
      >
        <View style={styles.speakingHeader}>
          <Text style={styles.speakingIcon}>🎙️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.speakingTitle}>Public Speaking Trainer</Text>
            <Text style={styles.speakingSubtitle}>Practice speaking with AI feedback</Text>
          </View>
          <Text style={styles.speakingArrow}>→</Text>
        </View>
      </TouchableOpacity>

      {/* Capsule countdown */}
      {capsule?.exists && (
        <View style={styles.card}>
          {capsule.daysRemaining > 0 ? (
            <View style={styles.capsuleRow}>
              <Text style={styles.capsuleText}>🔒 Time Capsule</Text>
              <View style={styles.capsuleBadge}>
                <Text style={styles.capsuleBadgeText}>Opens in {capsule.daysRemaining} days</Text>
              </View>
            </View>
          ) : !capsule.unlocked ? (
            <TouchableOpacity
              onPress={onOpenCapsule}
              style={styles.capsuleCTA}
              accessibilityRole="button"
              accessibilityLabel="Open your time capsule"
            >
              <Text style={styles.capsuleCTAText}>🔓 Open your capsule</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* Friends streaks */}
      {friends.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Friend Streaks</Text>
          {friends.map((f: any) => (
            <View key={f.friend_id} style={styles.friendRow}>
              <Text style={styles.friendName}>{f.users?.username ?? 'Friend'}</Text>
              <Text style={styles.friendStreak}>🔥 {f.streaks?.current_streak ?? 0}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Legal Footer */}
      <View style={styles.legalFooter}>
        <Text style={styles.legalTitle}>Legal & About</Text>
        <TouchableOpacity
          style={styles.legalLink}
          onPress={() => {/* TODO: Navigate to Privacy Policy */}}
          accessibilityRole="button"
        >
          <Text style={styles.legalLinkText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.legalLink}
          onPress={() => {/* TODO: Navigate to Terms & Conditions */}}
          accessibilityRole="button"
        >
          <Text style={styles.legalLinkText}>Terms & Conditions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.legalLink}
          onPress={() => {/* TODO: Navigate to Cookie Policy */}}
          accessibilityRole="button"
        >
          <Text style={styles.legalLinkText}>Cookie Policy</Text>
        </TouchableOpacity>
        <Text style={styles.legalVersion}>
          Growthovo v1.0.0 • Legal docs v1.0 • Effective: Jan 2024
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Spider Chart ─────────────────────────────────────────────────────────────

function SpiderChart({ pillars, levels }: { pillars: Pillar[]; levels: Record<string, number> }) {
  const size = 220;
  const center = size / 2;
  const maxRadius = 80;
  const n = pillars.length;

  function getPoint(index: number, radius: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  }

  const maxLevel = 10;
  const dataPoints = pillars.map((p, i) => {
    const level = levels[p.id] ?? 1;
    const r = (level / maxLevel) * maxRadius;
    return getPoint(i, r);
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1].map((scale) =>
    pillars.map((_, i) => getPoint(i, maxRadius * scale)).map((p) => `${p.x},${p.y}`).join(' ')
  );

  return (
    <Svg width={size} height={size} style={{ alignSelf: 'center' }}>
      {/* Grid rings */}
      {rings.map((points, i) => (
        <Polygon key={i} points={points} fill="none" stroke={colors.border} strokeWidth={1} />
      ))}

      {/* Axis lines */}
      {pillars.map((_, i) => {
        const outer = getPoint(i, maxRadius);
        return <Line key={i} x1={center} y1={center} x2={outer.x} y2={outer.y} stroke={colors.border} strokeWidth={1} />;
      })}

      {/* Data polygon */}
      <Polygon points={dataPolygon} fill={colors.primary + '44'} stroke={colors.primary} strokeWidth={2} />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={4} fill={getPillarColor(pillars[i].name)} />
      ))}

      {/* Labels */}
      {pillars.map((p, i) => {
        const labelPoint = getPoint(i, maxRadius + 18);
        return (
          <SvgText
            key={i}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            fontSize={10}
            fill={colors.textMuted}
          >
            {p.icon}
          </SvgText>
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  container: { padding: spacing.md, paddingTop: 60, paddingBottom: 80, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { ...typography.h2, color: '#fff' },
  headerInfo: { flex: 1 },
  username: { ...typography.h3, color: colors.text },
  xpText: { ...typography.small, color: colors.xpGold },
  streakText: { ...typography.small, color: colors.streakOrange },
  settingsIcon: { fontSize: 24 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
  sectionTitle: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.md },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: {
    width: '30%', alignItems: 'center', padding: spacing.sm,
    borderRadius: radius.md, borderWidth: 1,
  },
  badgeIcon: { fontSize: 20 },
  badgeLevel: { ...typography.smallBold },
  badgeName: { ...typography.small, color: colors.textMuted },
  friendRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  friendName: { ...typography.body, color: colors.text },
  friendStreak: { ...typography.bodyBold, color: colors.streakOrange },
  capsuleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  capsuleText: { ...typography.bodyBold, color: colors.text },
  capsuleBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  capsuleBadgeText: { ...typography.small, color: colors.textSecondary },
  capsuleCTA: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  capsuleCTAText: { ...typography.bodyBold, color: '#fff' },
  speakingCard: {
    backgroundColor: colors.pillars.communication,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  speakingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  speakingIcon: { fontSize: 32 },
  speakingTitle: { ...typography.bodyBold, color: '#fff', fontSize: 16 },
  speakingSubtitle: { ...typography.small, color: 'rgba(255,255,255,0.8)' },
  speakingArrow: { fontSize: 24, color: '#fff' },
  legalFooter: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  legalTitle: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.xs },
  legalLink: { paddingVertical: spacing.xs },
  legalLinkText: { ...typography.body, color: colors.primary },
  legalVersion: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
});
