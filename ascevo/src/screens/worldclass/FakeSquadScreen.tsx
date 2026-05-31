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
import { useToast } from '../../context/ToastContext';
import { KEYS } from '../../services/growthovoExperienceService';

interface Props {
  onClose: () => void;
}

const MEMBERS = [
  { id: '1', name: 'Ana M.', line: "🔥 12 day streak · 420 XP · 'Studied Finance today'" },
  { id: '2', name: 'Bogdan T.', line: "🔥 5 day streak · 280 XP · 'Completed Fitness lesson'" },
  { id: '3', name: 'Ioana S.', line: "❄️ streak frozen · 195 XP · 'Missed yesterday'" },
];

const FEED = [
  { id: 'f1', who: 'Ana M.', action: 'Studied Finance today', time: '2h ago' },
  { id: 'f2', who: 'Bogdan T.', action: 'Completed Fitness lesson', time: '4h ago' },
  { id: 'f3', who: 'You', action: 'Completed daily check-in', time: '6h ago' },
  { id: 'f4', who: 'Ioana S.', action: 'Missed yesterday', time: '1d ago' },
];

const REACTIONS = ['❤️', '🔥', '💪', '👏'];

export default function FakeSquadScreen({ onClose }: Props) {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<typeof MEMBERS[0] | null>(null);
  const [reactFeedId, setReactFeedId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, string>>({});

  async function loadReactions() {
    const raw = await AsyncStorage.getItem(KEYS.squadReactions);
    if (raw) setReactions(JSON.parse(raw));
  }

  useEffect(() => {
    loadReactions();
  }, []);

  async function pickReaction(feedId: string, emoji: string) {
    const next = { ...reactions, [feedId]: emoji };
    setReactions(next);
    await AsyncStorage.setItem(KEYS.squadReactions, JSON.stringify(next));
    setReactFeedId(null);
  }

  async function invite() {
    const code = 'XYZ' + Math.floor(Math.random() * 900 + 100);
    const link = `Join my Growthovo squad! growthovo.com/squad/join?code=${code}`;
    if (Platform.OS === 'web' && navigator.clipboard) {
      await navigator.clipboard.writeText(link);
    } else {
      await Share.share({ message: link });
    }
    showToast('Invite link copied! 📋', 'success');
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Squad</Text>

        {MEMBERS.map((m) => (
          <TouchableOpacity key={m.id} style={styles.memberCard} onPress={() => setProfile(m)}>
            <Text style={styles.memberName}>{m.name}</Text>
            <Text style={styles.memberLine}>{m.line}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.section}>Activity</Text>
        {FEED.length === 0 ? (
          <Text style={styles.empty}>Your squad&apos;s activity will appear here 👥</Text>
        ) : (
          FEED.map((f) => (
            <TouchableOpacity key={f.id} style={styles.feedItem} onPress={() => setReactFeedId(f.id)}>
              <Text style={styles.feedWho}>{f.who}</Text>
              <Text style={styles.feedAction}>{f.action}</Text>
              <Text style={styles.feedTime}>{f.time}</Text>
              {reactions[f.id] && <Text style={styles.reaction}>{reactions[f.id]}</Text>}
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={styles.inviteBtn} onPress={invite}>
          <Text style={styles.inviteText}>Invite to Squad</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={!!profile} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{profile?.name}</Text>
            <Text style={styles.body}>XP: 420 · Streak: 12 · Badges: 🔥 🏆</Text>
            <TouchableOpacity onPress={() => setProfile(null)}>
              <Text style={styles.back}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!reactFeedId} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>React</Text>
            <View style={styles.reactionRow}>
              {REACTIONS.map((e) => (
                <TouchableOpacity key={e} onPress={() => reactFeedId && pickReaction(reactFeedId, e)}>
                  <Text style={styles.reactionBtn}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setReactFeedId(null)}>
              <Text style={styles.back}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  back: { color: colors.primary, marginBottom: spacing.md, ...typography.body },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  memberCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberName: { ...typography.bodyBold, color: colors.text },
  memberLine: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  section: { ...typography.bodyBold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  feedItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedWho: { ...typography.bodyBold, color: colors.text },
  feedAction: { ...typography.body, color: colors.textSecondary },
  feedTime: { ...typography.small, color: colors.textMuted },
  reaction: { fontSize: 20, marginTop: 4 },
  empty: { ...typography.body, color: colors.textMuted, textAlign: 'center', padding: spacing.xl },
  inviteBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  inviteText: { ...typography.bodyBold, color: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: spacing.lg },
  modalCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl },
  modalTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  body: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  reactionRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: spacing.lg },
  reactionBtn: { fontSize: 36 },
});
