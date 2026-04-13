import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Sharing from 'expo-sharing';
import { colors, typography, spacing, radius, getPillarColor } from '../theme';

interface Props {
  username: string;
  pillarName: string;
  pillarIcon: string;
  onClose: () => void;
}

export default function LevelUpCertificate({ username, pillarName, pillarIcon, onClose }: Props) {
  const colour = getPillarColor(pillarName);

  async function handleShare() {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) return;
    await Sharing.shareAsync('', { dialogTitle: `I reached Level 10 in ${pillarName} on Growthovo!` }).catch(() => {});
  }

  return (
    <View style={styles.overlay}>
      <View style={[styles.cert, { borderColor: colour }]}>
        <Text style={styles.certEmoji}>🏆</Text>
        <Text style={styles.certTitle}>LEVEL 10 ACHIEVED</Text>
        <Text style={styles.pillarIcon}>{pillarIcon}</Text>
        <Text style={[styles.pillarName, { color: colour }]}>{pillarName}</Text>
        <Text style={styles.certBody}>
          <Text style={styles.certUsername}>{username}</Text>
          {'\n'}has mastered the {pillarName} pillar on Growthovo.
        </Text>
        <Text style={styles.certDate}>{new Date().toLocaleDateString('en-IE', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colour }]} onPress={handleShare} accessibilityRole="button">
          <Text style={styles.btnText}>Share Certificate</Text>
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
  cert: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl,
    width: '100%', borderWidth: 2, alignItems: 'center', gap: spacing.md,
  },
  certEmoji: { fontSize: 48 },
  certTitle: { ...typography.caption, color: colors.textMuted, letterSpacing: 4 },
  pillarIcon: { fontSize: 40 },
  pillarName: { ...typography.h2 },
  certBody: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 26 },
  certUsername: { ...typography.bodyBold, color: colors.text },
  certDate: { ...typography.small, color: colors.textMuted },
  actions: { marginTop: spacing.lg, gap: spacing.md, width: '100%' },
  btn: { borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnText: { color: '#fff', ...typography.bodyBold },
  closeText: { color: colors.textMuted, textAlign: 'center', ...typography.body },
});
