import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors, typography, spacing, radius } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onStartTrial: () => void;
}

export default function PaywallModal({ visible, onClose, onStartTrial }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>🚀 Unlock Growthovo Pro</Text>
          {[
            '✓ Unlimited Rex conversations — 24/7',
            '✓ All 24 lessons across every pillar',
            '✓ Public Speaking Trainer unlimited',
          ].map((line) => (
            <Text key={line} style={styles.bullet}>{line}</Text>
          ))}

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.planBtn, plan === 'monthly' && styles.planBtnActive]}
              onPress={() => setPlan('monthly')}
            >
              <Text style={styles.planLabel}>Monthly</Text>
              <Text style={styles.planPrice}>€9.99/mo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.planBtn, plan === 'yearly' && styles.planBtnActive]}
              onPress={() => setPlan('yearly')}
            >
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Most Popular</Text>
              </View>
              <Text style={styles.planLabel}>Yearly</Text>
              <Text style={styles.planPrice}>€79.99/yr</Text>
              <Text style={styles.planSub}>€6.67/mo · Save 33%</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cta} onPress={onStartTrial} accessibilityRole="button">
            <Text style={styles.ctaText}>Start 7-Day Free Trial →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.later}>
            <Text style={styles.laterText}>Maybe later</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  bullet: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  toggleRow: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.lg },
  planBtn: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  planBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
  planLabel: { ...typography.bodyBold, color: colors.text },
  planPrice: { ...typography.h3, color: colors.primary, marginTop: 4 },
  planSub: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  badge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ctaText: { ...typography.bodyBold, color: '#fff', fontSize: 17 },
  later: { alignItems: 'center', marginTop: spacing.md, padding: spacing.sm },
  laterText: { color: colors.textMuted, ...typography.body },
});
