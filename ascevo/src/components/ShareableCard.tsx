import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Sharing from 'expo-sharing';
import { colors, typography, spacing, radius, getPillarColor } from '../theme';

interface Props {
  username: string;
  streak: number;
  totalXP: number;
  topPillar: { name: string; level: number; icon: string };
  onClose: () => void;
}

export default function ShareableCard({ username, streak, totalXP, topPillar, onClose }: Props) {
  const pillarColour = getPillarColor(topPillar.name);

  async function handleShare() {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) return;
    // In production, capture the view as an image using react-native-view-shot
    // For MVP, share as text
    await Sharing.shareAsync('', {
      dialogTitle: 'Share your Growthovo profile',
    }).catch(() => {});
  }

  return (
    <View style={styles.overlay}>
      <View style={[styles.card, { borderTopColor: pillarColour }]}>
        <Text style={styles.appName}>GROWTHOVO</Text>
        <Text style={styles.username}>{username}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>🔥 {streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>⚡ {totalXP.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>

        <View style={[styles.topPillar, { backgroundColor: pillarColour + '22', borderColor: pillarColour }]}>
          <Text style={styles.topPillarIcon}>{topPillar.icon}</Text>
          <View>
            <Text style={[styles.topPillarName, { color: pillarColour }]}>{topPillar.name}</Text>
            <Text style={styles.topPillarLevel}>Level {topPillar.level}</Text>
          </View>
        </View>

        <Text style={styles.tagline}>Level up your life at growthovo.app</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} accessibilityRole="button">
          <Text style={styles.shareBtnText}>Share Card</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} accessibilityRole="button">
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000CC', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl,
    width: '100%', borderTopWidth: 4, alignItems: 'center', gap: spacing.md,
  },
  appName: { ...typography.caption, color: colors.textMuted, letterSpacing: 4 },
  username: { ...typography.h2, color: colors.text },
  statsRow: { flexDirection: 'row', gap: spacing.xl },
  stat: { alignItems: 'center' },
  statValue: { ...typography.h3, color: colors.text },
  statLabel: { ...typography.small, color: colors.textMuted },
  topPillar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderRadius: radius.md, padding: spacing.md, borderWidth: 1, width: '100%',
  },
  topPillarIcon: { fontSize: 32 },
  topPillarName: { ...typography.bodyBold },
  topPillarLevel: { ...typography.small, color: colors.textMuted },
  tagline: { ...typography.small, color: colors.textMuted },
  actions: { marginTop: spacing.lg, gap: spacing.md, width: '100%' },
  shareBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  shareBtnText: { color: '#fff', ...typography.bodyBold },
  closeText: { color: colors.textMuted, textAlign: 'center', ...typography.body },
});
