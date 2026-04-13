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
import type { DocumentUpdateStatus } from '../../services/legalDocumentUpdateService';

interface LegalDocumentUpdateNotificationProps {
  visible: boolean;
  updates: DocumentUpdateStatus[];
  onViewDocument: (documentType: string) => void;
  onAcknowledge: (documentType: string) => void;
  onDismiss?: () => void;
}

/**
 * LegalDocumentUpdateNotification
 * 
 * Modal or banner displayed when legal documents have been updated.
 * Shows change summary and requires acknowledgment for Terms updates.
 * 
 * Requirements: 11.2-11.4 (Document Update Notifications)
 * Task: 8.2 (Create update notification UI)
 */
export default function LegalDocumentUpdateNotification({
  visible,
  updates,
  onViewDocument,
  onAcknowledge,
  onDismiss,
}: LegalDocumentUpdateNotificationProps) {
  const { t } = useTranslation();

  if (updates.length === 0) return null;

  // Check if any updates require acknowledgment (Terms and Conditions)
  const requiresAcknowledgment = updates.some(
    (update) => update.document_type === 'terms_conditions'
  );

  const getDocumentTitle = (documentType: string): string => {
    const titles: Record<string, string> = {
      privacy_policy: t('legal.documents.privacyPolicy'),
      terms_conditions: t('legal.documents.termsConditions'),
      cookie_policy: t('legal.documents.cookiePolicy'),
      subscription_terms: t('legal.documents.subscriptionTerms'),
      ai_transparency: t('legal.documents.aiTransparency'),
      crisis_disclaimer: t('legal.documents.crisisDisclaimer'),
    };
    return titles[documentType] || documentType;
  };

  const getDocumentIcon = (documentType: string): string => {
    const icons: Record<string, string> = {
      privacy_policy: '🔒',
      terms_conditions: '📋',
      cookie_policy: '🍪',
      subscription_terms: '💳',
      ai_transparency: '🤖',
      crisis_disclaimer: '🆘',
    };
    return icons[documentType] || '📄';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={requiresAcknowledgment ? undefined : onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.emoji}>📢</Text>
            <Text style={styles.title}>
              {t('legal.updateNotification.title')}
            </Text>
            <Text style={styles.subtitle}>
              {requiresAcknowledgment
                ? t('legal.updateNotification.subtitleRequired')
                : t('legal.updateNotification.subtitleOptional')}
            </Text>

            {updates.map((update) => (
              <View key={update.document_type} style={styles.updateCard}>
                <View style={styles.updateHeader}>
                  <Text style={styles.updateIcon}>
                    {getDocumentIcon(update.document_type)}
                  </Text>
                  <View style={styles.updateTitleContainer}>
                    <Text style={styles.updateTitle}>
                      {getDocumentTitle(update.document_type)}
                    </Text>
                    <Text style={styles.updateVersion}>
                      {t('legal.updateNotification.version', {
                        version: update.current_version,
                      })}
                    </Text>
                  </View>
                </View>

                {update.change_summary && (
                  <View style={styles.changeSummary}>
                    <Text style={styles.changeSummaryLabel}>
                      {t('legal.updateNotification.whatsNew')}
                    </Text>
                    <Text style={styles.changeSummaryText}>
                      {update.change_summary}
                    </Text>
                  </View>
                )}

                <View style={styles.updateActions}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => onViewDocument(update.document_type)}
                    accessibilityRole="button"
                    accessibilityLabel={t('legal.updateNotification.viewDocument')}
                  >
                    <Text style={styles.viewButtonText}>
                      {t('legal.updateNotification.viewDocument')}
                    </Text>
                  </TouchableOpacity>

                  {update.document_type === 'terms_conditions' && (
                    <TouchableOpacity
                      style={styles.acknowledgeButton}
                      onPress={() => onAcknowledge(update.document_type)}
                      accessibilityRole="button"
                      accessibilityLabel={t('legal.updateNotification.acknowledge')}
                    >
                      <Text style={styles.acknowledgeButtonText}>
                        {t('legal.updateNotification.acknowledge')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {requiresAcknowledgment && (
              <View style={styles.requirementNotice}>
                <Text style={styles.requirementText}>
                  ⚠️ {t('legal.updateNotification.requirementNotice')}
                </Text>
              </View>
            )}
          </ScrollView>

          {!requiresAcknowledgment && onDismiss && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={onDismiss}
                accessibilityRole="button"
                accessibilityLabel={t('legal.updateNotification.dismiss')}
              >
                <Text style={styles.dismissButtonText}>
                  {t('legal.updateNotification.dismiss')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    width: '100%',
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollView: {
    maxHeight: '100%',
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  updateCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  updateIcon: {
    fontSize: 24,
  },
  updateTitleContainer: {
    flex: 1,
  },
  updateTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  updateVersion: {
    ...typography.small,
    color: colors.textMuted,
  },
  changeSummary: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  changeSummaryLabel: {
    ...typography.smallBold,
    color: colors.primary,
  },
  changeSummaryText: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  updateActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  viewButton: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  viewButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 14,
  },
  acknowledgeButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  acknowledgeButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 14,
  },
  requirementNotice: {
    backgroundColor: colors.warning + '20',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  requirementText: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 18,
  },
  actions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dismissButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dismissButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
});
