import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius } from '../../theme';

interface SubscriptionTermsModalProps {
  visible: boolean;
  onClose: () => void;
  onViewFullTerms?: () => void;
}

/**
 * SubscriptionTermsModal
 * 
 * Modal displaying subscription terms, pricing, billing, and refund policy.
 * Shown before subscription purchase on PaywallScreen.
 * 
 * Requirements: 8.1-8.10 (Subscription Terms and Billing)
 */
export default function SubscriptionTermsModal({
  visible,
  onClose,
  onViewFullTerms,
}: SubscriptionTermsModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('legal.subscriptionTerms.title')}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('legal.subscriptionTerms.pricing.title')}
              </Text>
              <Text style={styles.body}>
                {t('legal.subscriptionTerms.pricing.description')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('legal.subscriptionTerms.autoRenewal.title')}
              </Text>
              <Text style={styles.body}>
                {t('legal.subscriptionTerms.autoRenewal.description')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('legal.subscriptionTerms.cancellation.title')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.subscriptionTerms.cancellation.anytime')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.subscriptionTerms.cancellation.access')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.subscriptionTerms.cancellation.noRefund')}
              </Text>
            </View>

            <View style={[styles.section, styles.highlightSection]}>
              <Text style={styles.sectionTitle}>
                {t('legal.subscriptionTerms.refund.title')}
              </Text>
              <Text style={styles.body}>
                {t('legal.subscriptionTerms.refund.guarantee')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.subscriptionTerms.refund.period')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.subscriptionTerms.refund.contact')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.subscriptionTerms.refund.processing')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('legal.subscriptionTerms.features.title')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.subscriptionTerms.features.unlimited')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.subscriptionTerms.features.premium')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.subscriptionTerms.features.support')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.subscriptionTerms.features.adFree')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('legal.subscriptionTerms.afterCancellation.title')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.subscriptionTerms.afterCancellation.data')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.subscriptionTerms.afterCancellation.resubscribe')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.subscriptionTerms.afterCancellation.freeTier')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('legal.subscriptionTerms.payment.title')}
              </Text>
              <Text style={styles.body}>
                {t('legal.subscriptionTerms.payment.description')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('legal.subscriptionTerms.questions.title')}
              </Text>
              <Text style={styles.body}>
                {t('legal.subscriptionTerms.questions.description')}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {onViewFullTerms && (
              <TouchableOpacity
                style={styles.fullTermsButton}
                onPress={onViewFullTerms}
                accessibilityRole="button"
              >
                <Text style={styles.fullTermsButtonText}>
                  {t('legal.subscriptionTerms.viewFullTerms')}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.closeFooterButton}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Text style={styles.closeFooterButtonText}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  closeButton: {
    ...typography.h3,
    color: colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.xs,
  },
  highlightSection: {
    backgroundColor: colors.success + '11',
    borderWidth: 1,
    borderColor: colors.success + '44',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bullet: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fullTermsButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  fullTermsButtonText: {
    ...typography.body,
    color: colors.primary,
  },
  closeFooterButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  closeFooterButtonText: {
    ...typography.body,
    color: colors.text,
  },
});
