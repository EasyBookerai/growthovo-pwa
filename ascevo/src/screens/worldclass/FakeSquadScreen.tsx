import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Share,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, radius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { KEYS, getUserName } from '../../services/growthovoExperienceService';
import { triggerHaptic } from '../../services/webThemeService';

interface Props {
  onClose: () => void;
}

interface Member {
  id: string;
  name: string;
  xp: number;
  streak: number;
  lessons: number;
  badges: string[];
  status: string;
  statusIcon: string;
  lastActivity: string;
}

const INITIAL_MEMBERS: Member[] = [
  { 
    id: '1', 
    name: 'Ana M.', 
    xp: 1240, 
    streak: 12, 
    lessons: 48,
    badges: ['🔥', '🏆', '💎'],
    status: 'Studied Finance today',
    statusIcon: '📊',
    lastActivity: '2h ago',
  },
  { 
    id: '2', 
    name: 'Bogdan T.', 
    xp: 890, 
    streak: 5, 
    lessons: 34,
    badges: ['🔥', '💪'],
    status: 'Completed Public Speaking session',
    statusIcon: '🎤',
    lastActivity: '4h ago',
  },
  { 
    id: '3', 
    name: 'Ioana S.', 
    xp: 650, 
    streak: 0, 
    lessons: 22,
    badges: ['❄️'],
    status: 'Streak frozen',
    statusIcon: '❄️',
    lastActivity: '1d ago',
  },
];

interface FeedItem {
  id: string;
  who: string;
  action: string;
  time: string;
  icon: string;
}

const FEED: FeedItem[] = [
  { id: 'f1', who: 'Ana M.', action: 'Completed "Building Wealth" lesson', time: '2h ago', icon: '📊' },
  { id: 'f2', who: 'Bogdan T.', action: 'Nailed a 5-minute speech', time: '4h ago', icon: '🎤' },
  { id: 'f3', who: 'You', action: 'Completed daily check-in', time: '6h ago', icon: '✅' },
  { id: 'f4', who: 'Ioana S.', action: 'Used streak freeze', time: '1d ago', icon: '❄️' },
  { id: 'f5', who: 'Ana M.', action: 'Reached 1000 XP milestone!', time: '2d ago', icon: '🎉' },
];

const REACTIONS = ['❤️', '🔥', '💪', '👏', '✨'];

export default function FakeSquadScreen({ onClose }: Props) {
  const { xp, streak } = useAppContext();
  const { showToast } = useToast();
  const [userName, setUserName] = useState('You');
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [profile, setProfile] = useState<Member | null>(null);
  const [reactFeedId, setReactFeedId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, string>>({});

  async function loadData() {
    const name = await getUserName();
    setUserName(name);
    
    const raw = await AsyncStorage.getItem(KEYS.squadReactions);
    if (raw) setReactions(JSON.parse(raw));
  }

  useEffect(() => {
    loadData();
  }, []);

  async function pickReaction(feedId: string, emoji: string) {
    triggerHaptic('light');
    const next = { ...reactions, [feedId]: emoji };
    setReactions(next);
    await AsyncStorage.setItem(KEYS.squadReactions, JSON.stringify(next));
    setReactFeedId(null);
    showToast('Reaction added! ' + emoji, 'success');
  }

  async function invite() {
    triggerHaptic('medium');
    const code = 'GROW' + Math.floor(Math.random() * 9000 + 1000);
    const link = `Join my Growthovo squad and let's grow together! growthovo.com/squad/join?code=${code}`;
    if (Platform.OS === 'web' && navigator.clipboard) {
      await navigator.clipboard.writeText(link);
      showToast('Invite link copied! 📋', 'success');
    } else {
      await Share.share({ message: link });
    }
  }

  function viewProfile(member: Member) {
    triggerHaptic('light');
    setProfile(member);
  }

  // Create leaderboard with user included
  const leaderboard = [
    ...members,
    {
      id: 'me',
      name: userName,
      xp,
      streak,
      lessons: Math.floor(xp / 25),
      badges: streak >= 7 ? ['🔥'] : [],
      status: 'Active',
      statusIcon: '✨',
      lastActivity: 'now',
    }
  ].sort((a, b) => b.xp - a.xp);

  const userRank = leaderboard.findIndex((m) => m.id === 'me') + 1;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={onClose} accessibilityRole="button">
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Squad 👥</Text>
        <Text style={styles.subtitle}>Growing together, one day at a time</Text>

        {/* Leaderboard Mini Card */}
        <View style={styles.leaderboardCard}>
          <Text style={styles.leaderboardTitle}>🏆 This Week</Text>
          {leaderboard.slice(0, 3).map((m, idx) => (
            <View key={m.id} style={styles.leaderboardRow}>
              <Text style={styles.leaderboardRank}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
              </Text>
              <Text style={[styles.leaderboardName, m.id === 'me' && styles.leaderboardMe]}>
                {m.name}
              </Text>
              <Text style={styles.leaderboardXp}>{m.xp} XP</Text>
            </View>
          ))}
          {userRank > 3 && (
            <View style={styles.leaderboardRow}>
              <Text style={styles.leaderboardRank}>{userRank}.</Text>
              <Text style={[styles.leaderboardName, styles.leaderboardMe]}>{userName}</Text>
              <Text style={styles.leaderboardXp}>{xp} XP</Text>
            </View>
          )}
        </View>

        <Text style={styles.section}>Squad Members</Text>
        {members.map((m) => (
          <TouchableOpacity 
            key={m.id} 
            style={styles.memberCard} 
            onPress={() => viewProfile(m)}
            accessibilityRole="button"
          >
            <View style={styles.memberHeader}>
              <Text style={styles.memberName}>{m.name}</Text>
              <View style={styles.badgeRow}>
                {m.badges.map((b, i) => (
                  <Text key={i} style={styles.badge}>{b}</Text>
                ))}
              </View>
            </View>
            <View style={styles.memberStats}>
              <Text style={styles.memberStat}>{m.xp} XP</Text>
              <Text style={styles.memberStat}>•</Text>
              <Text style={styles.memberStat}>{m.streak > 0 ? `🔥 ${m.streak} day streak` : '❄️ Frozen'}</Text>
              <Text style={styles.memberStat}>•</Text>
              <Text style={styles.memberStat}>{m.lessons} lessons</Text>
            </View>
            <View style={styles.memberStatus}>
              <Text style={styles.statusIcon}>{m.statusIcon}</Text>
              <Text style={styles.statusText}>{m.status}</Text>
            </View>
            <Text style={styles.memberTime}>{m.lastActivity}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.section}>Activity Feed</Text>
        {FEED.length === 0 ? (
          <Text style={styles.empty}>Your squad's activity will appear here 👥</Text>
        ) : (
          FEED.map((f) => (
            <TouchableOpacity 
              key={f.id} 
              style={styles.feedItem} 
              onPress={() => setReactFeedId(f.id)}
              accessibilityRole="button"
            >
              <View style={styles.feedHeader}>
                <Text style={styles.feedIcon}>{f.icon}</Text>
                <View style={styles.feedContent}>
                  <Text style={styles.feedWho}>{f.who}</Text>
                  <Text style={styles.feedAction}>{f.action}</Text>
                  <Text style={styles.feedTime}>{f.time}</Text>
                </View>
              </View>
              {reactions[f.id] && (
                <View style={styles.reactionBadge}>
                  <Text style={styles.reactionEmoji}>{reactions[f.id]}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity 
          style={styles.inviteBtn} 
          onPress={invite}
          accessibilityRole="button"
        >
          <Text style={styles.inviteText}>Invite Friends to Squad 📨</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={!!profile} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{profile?.name}</Text>
            <View style={styles.profileStats}>
              <View style={styles.profileStatBox}>
                <Text style={styles.profileStatValue}>{profile?.xp}</Text>
                <Text style={styles.profileStatLabel}>XP</Text>
              </View>
              <View style={styles.profileStatBox}>
                <Text style={styles.profileStatValue}>{profile?.streak}</Text>
                <Text style={styles.profileStatLabel}>Streak</Text>
              </View>
              <View style={styles.profileStatBox}>
                <Text style={styles.profileStatValue}>{profile?.lessons}</Text>
                <Text style={styles.profileStatLabel}>Lessons</Text>
              </View>
            </View>
            <View style={styles.badgeRow}>
              {profile?.badges.map((b, i) => (
                <Text key={i} style={styles.badgeLarge}>{b}</Text>
              ))}
            </View>
            <Text style={styles.profileStatus}>
              {profile?.statusIcon} {profile?.status}
            </Text>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setProfile(null)}
              accessibilityRole="button"
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reaction Modal */}
      <Modal visible={!!reactFeedId} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>React to this</Text>
            <View style={styles.reactionRow}>
              {REACTIONS.map((e) => (
                <TouchableOpacity 
                  key={e} 
                  onPress={() => reactFeedId && pickReaction(reactFeedId, e)}
                  accessibilityRole="button"
                >
                  <Text style={styles.reactionBtn}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={() => setReactFeedId(null)}
              accessibilityRole="button"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: 80 },
  back: { color: colors.primary, marginBottom: spacing.md, ...typography.body },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  
  // Leaderboard
  leaderboardCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  leaderboardTitle: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.sm },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  leaderboardRank: { ...typography.body, width: 32 },
  leaderboardName: { ...typography.body, color: colors.text, flex: 1 },
  leaderboardMe: { ...typography.bodyBold, color: colors.primary },
  leaderboardXp: { ...typography.bodyBold, color: colors.text },
  
  // Members
  section: { ...typography.bodyBold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  memberCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  memberName: { ...typography.bodyBold, color: colors.text, fontSize: 16 },
  badgeRow: { flexDirection: 'row', gap: 4 },
  badge: { fontSize: 16 },
  badgeLarge: { fontSize: 32 },
  memberStats: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  memberStat: { ...typography.small, color: colors.textSecondary },
  memberStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statusIcon: { fontSize: 14 },
  statusText: { ...typography.body, color: colors.text, flex: 1 },
  memberTime: { ...typography.small, color: colors.textMuted },
  
  // Feed
  feedItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  feedIcon: { fontSize: 24 },
  feedContent: { flex: 1 },
  feedWho: { ...typography.bodyBold, color: colors.text },
  feedAction: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  feedTime: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  reactionBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary + '20',
    borderRadius: 16,
    padding: 4,
    paddingHorizontal: 8,
  },
  reactionEmoji: { fontSize: 16 },
  
  empty: { ...typography.body, color: colors.textMuted, textAlign: 'center', padding: spacing.xl },
  
  // Invite
  inviteBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  inviteText: { ...typography.bodyBold, color: '#fff' },
  
  // Modals
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'center', 
    padding: spacing.lg,
  },
  modalCard: { 
    backgroundColor: colors.surface, 
    borderRadius: radius.lg, 
    padding: spacing.xl,
  },
  modalTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  
  // Profile Modal
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.lg,
  },
  profileStatBox: {
    alignItems: 'center',
  },
  profileStatValue: { ...typography.h2, color: colors.primary, fontSize: 32 },
  profileStatLabel: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  profileStatus: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  closeBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  closeBtnText: { ...typography.bodyBold, color: '#fff' },
  
  // Reaction Modal
  reactionRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginVertical: spacing.lg,
  },
  reactionBtn: { fontSize: 40, padding: spacing.sm },
  cancelBtn: {
    backgroundColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelBtnText: { ...typography.bodyBold, color: colors.text },
});
