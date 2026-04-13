import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { getStreakBrokeRexLine } from '../../services/relapseService';
import { getActivePair } from '../../services/partnerService';
import { supabase } from '../../services/supabaseClient';
import { colors, typography, spacing, radius } from '../../theme';

interface Props {
  streakCount: number;
  onContinue: () => void;
  userId?: string;
}

export default function StreakBrokeScreen({ streakCount, onContinue, userId }: Props) {
  const { t } = useTranslation();
  const rexLine = getStreakBrokeRexLine(streakCount);
  const [comebackMessage, setComebackMessage] = useState<{ message: string; senderId: string } | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const pair = await getActivePair(userId);
        if (!pair) return;
        const { data } = await supabase
          .from('partner_messages')
          .select('message, sender_id')
          .eq('pair_id', pair.id)
          .eq('message_type', 'comeback')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) {
          setComebackMessage({ message: data.message, senderId: data.sender_id });
        }
      } catch {
        // Silently ignore — comeback message is optional
      }
    })();
  }, [userId]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Partner comeback message */}
        {comebackMessage && (
          <View style={styles.comebackCard}>
            <Text style={styles.comebackLabel}>{t('relapse.partner_says')}</Text>
            <Text style={styles.comebackMessage}>{comebackMessage.message}</Text>
          </View>
        )}

        {/* Broken streak display */}
        <View style={styles.streakSection}>
          <Text style={styles.streakIcon}>💀</Text>
          <Text style={styles.streakNumber}>{streakCount}</Text>
          <Text style={styles.streakLabel}>{t('relapse.day_streak')}</Text>
        </View>

        {/* Rex message */}
        <View style={styles.rexCard}>
          <Text style={styles.rexLabel}>{t('relapse.rex_says')}</Text>
          <Text style={styles.rexMessage}>{rexLine}</Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel={t('relapse.one_chance_cta')}
        >
          <Text style={styles.ctaButtonText}>{t('relapse.one_chance_cta')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  streakSection: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  streakNumber: {
    ...typography.h1,
    fontSize: 72,
    color: colors.text,
    textDecorationLine: 'line-through',
    textDecorationColor: colors.error,
    textDecorationStyle: 'solid',
  },
  streakLabel: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  rexCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    width: '100%',
    maxWidth: 400,
  },
  rexLabel: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  rexMessage: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  ctaButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  comebackCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    width: '100%',
    maxWidth: 400,
  },
  comebackLabel: {
    ...typography.caption,
    color: '#F59E0B',
    marginBottom: spacing.sm,
  },
  comebackMessage: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
  },
});