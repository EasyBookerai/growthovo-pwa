import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { getActivePair, generateInviteMessage, deactivatePair } from '../../services/partnerService';
import { colors, typography, spacing, radius } from '../../theme';
import type { AccountabilityPair } from '../../types';

const INVITE_LINK = 'https://growthovo.app/invite';

interface Props {
  userId: string;
  primaryPillar: string;
  onClose: () => void;
}

export default function PartnerSetupScreen({ userId, primaryPillar, onClose }: Props) {
  const [pair, setPair] = useState<AccountabilityPair | null>(null);
  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const activePair = await getActivePair(userId);
      setPair(activePair);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    const message = generateInviteMessage(primaryPillar, INVITE_LINK);
    try {
      await Share.share({ message });
    } catch {
      // user dismissed or error — no-op
    }
  }

  async function handleDeactivate() {
    if (!pair) return;
    Alert.alert(
      'Deactivate Partner',
      'Are you sure you want to remove your accountability partner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            setDeactivating(true);
            try {
              await deactivatePair(pair.id);
              setPair(null);
            } catch {
              Alert.alert('Error', 'Failed to deactivate pair. Please try again.');
            } finally {
              setDeactivating(false);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accountability Partner</Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      {pair ? (
        <View style={styles.pairedCard}>
          <Text style={styles.pairedLabel}>Currently paired</Text>
          <Text style={styles.pairedPillar}>{pair.pillar}</Text>
          <Text style={styles.pairedStatus}>
            Status: <Text style={styles.activeText}>Active</Text>
          </Text>
          <TouchableOpacity
            style={styles.deactivateBtn}
            onPress={handleDeactivate}
            disabled={deactivating}
          >
            {deactivating ? (
              <ActivityIndicator color={colors.error} size="small" />
            ) : (
              <Text style={styles.deactivateBtnText}>Deactivate</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inviteCard}>
          <Text style={styles.inviteHeading}>Invite a partner</Text>
          <Text style={styles.inviteBody}>
            {generateInviteMessage(primaryPillar, INVITE_LINK)}
          </Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>Share Invite</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  closeBtn: {
    ...typography.body,
    color: colors.textMuted,
  },
  pairedCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  pairedLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  pairedPillar: {
    ...typography.h3,
    color: colors.text,
    textTransform: 'capitalize',
  },
  pairedStatus: {
    ...typography.body,
    color: colors.textSecondary,
  },
  activeText: {
    color: colors.success,
    fontWeight: '700',
  },
  deactivateBtn: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  deactivateBtnText: {
    ...typography.bodyBold,
    color: colors.error,
  },
  inviteCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  inviteHeading: {
    ...typography.h3,
    color: colors.text,
  },
  inviteBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  shareBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  shareBtnText: {
    ...typography.bodyBold,
    color: colors.text,
  },
});
