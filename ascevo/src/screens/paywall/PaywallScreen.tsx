import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';
import { createCheckoutSession } from '../../services/subscriptionService';
import SubscriptionTermsModal from '../../components/legal/SubscriptionTermsModal';
import { colors, typography, spacing, radius } from '../../theme';

interface Props {
  userId: string;
  reason?: 'locked_pillar' | 'no_hearts' | 'general';
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaywallScreen({ userId, reason = 'general', onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);

  const reasonMessages: Record<string, string> = {
    locked_pillar: 'Unlock all 6 pillars with Premium.',
    no_hearts: 'You ran out of hearts. Go unlimited with Premium.',
    general: 'Level up your life with Growthovo Premium.',
  };

  async function handleSubscribe() {
    setError('');
    setLoading(true);
    try {
      const url = await createCheckoutSession(userId, selectedPlan);
      setCheckoutUrl(url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleWebViewNav(navState: any) {
    if (navState.url?.includes('subscription/success')) {
      setCheckoutUrl(null);
      onSuccess();
    } else if (navState.url?.includes('subscription/cancel')) {
      setCheckoutUrl(null);
    }
  }

  return (
    <View style={styles.root}>
      {/* Checkout WebView */}
      <Modal visible={!!checkoutUrl} animationType="slide">
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={styles.webviewClose} onPress={() => setCheckoutUrl(null)} accessibilityRole="button">
            <Text style={styles.webviewCloseText}>✕ Close</Text>
          </TouchableOpacity>
          {checkoutUrl && (
            <WebView
              source={{ uri: checkoutUrl }}
              onNavigationStateChange={handleWebViewNav}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityRole="button">
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.emoji}>🚀</Text>
        <Text style={styles.title}>{t('paywall.title')}</Text>
        <Text style={styles.subtitle}>{reasonMessages[reason]}</Text>

        {/* Feature list */}
        <View style={styles.features}>
          {[
            '✅ All 6 pillars unlocked',
            '✅ Unlimited hearts',
            '✅ Streak freezes',
            '✅ No ads',
            '✅ Exclusive boss challenges',
            '✅ AI coach Rex — full access',
          ].map((f) => (
            <Text key={f} style={styles.feature}>{f}</Text>
          ))}
        </View>

        {/* Plan cards */}
        <View style={styles.plans}>
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('monthly')}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedPlan === 'monthly' }}
          >
            <Text style={styles.planName}>{t('paywall.monthly')}</Text>
            <Text style={styles.planPrice}>$14.99/month</Text>
            <Text style={styles.planTrial}>3 days free</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'annual' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('annual')}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedPlan === 'annual' }}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
            <Text style={styles.planName}>{t('paywall.annual')}</Text>
            <Text style={styles.planPrice}>$119.99/year</Text>
            <Text style={styles.planSaving}>Save $59.88 vs monthly</Text>
            <Text style={styles.planTrial}>3 days free</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.trialNote}>
          No credit card required to start. Card charged after 3-day trial.
        </Text>

        {/* Subscription Terms Link */}
        <TouchableOpacity
          style={styles.termsLink}
          onPress={() => setShowTermsModal(true)}
          accessibilityRole="button"
        >
          <Text style={styles.termsLinkText}>
            View Subscription Terms & Refund Policy
          </Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.subscribeBtn}
          onPress={handleSubscribe}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Start free trial"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.subscribeBtnText}>{t('paywall.cta')}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.legal}>
          Cancel anytime. No commitment.
        </Text>
      </ScrollView>

      {/* Subscription Terms Modal */}
      <SubscriptionTermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onViewFullTerms={() => {
          setShowTermsModal(false);
          // TODO: Navigate to full Terms & Conditions
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingTop: 60, alignItems: 'center', gap: spacing.md },
  closeBtn: { position: 'absolute', top: 16, right: 16 },
  closeBtnText: { color: colors.textMuted, fontSize: 20 },
  emoji: { fontSize: 56 },
  title: { ...typography.h1, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  features: { width: '100%', gap: 8 },
  feature: { ...typography.body, color: colors.text },
  plans: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  planCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center', borderWidth: 2, borderColor: colors.border,
    gap: 4, position: 'relative',
  },
  planCardSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '11' },
  planName: { ...typography.bodyBold, color: colors.text },
  planPrice: { ...typography.h3, color: colors.text },
  planSaving: { ...typography.small, color: colors.success },
  planTrial: { ...typography.small, color: colors.textMuted },
  bestValueBadge: {
    position: 'absolute', top: -10, backgroundColor: colors.primary,
    borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2,
  },
  bestValueText: { ...typography.caption, color: '#fff', fontSize: 9 },
  trialNote: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
  termsLink: { paddingVertical: spacing.xs },
  termsLinkText: { ...typography.small, color: colors.primary, textAlign: 'center', textDecorationLine: 'underline' },
  error: { color: colors.error, ...typography.body, textAlign: 'center' },
  subscribeBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center', width: '100%',
  },
  subscribeBtnText: { color: '#fff', ...typography.bodyBold, fontSize: 18 },
  legal: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
  webviewClose: { padding: spacing.md, backgroundColor: colors.background },
  webviewCloseText: { color: colors.text, ...typography.body },
});
