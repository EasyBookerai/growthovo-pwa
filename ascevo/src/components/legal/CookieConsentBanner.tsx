import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius } from '../../theme';

interface CookieConsentBannerProps {
  visible: boolean;
  onAcceptAll: () => void;
  onEssentialOnly: () => void;
  onCustomize?: () => void;
  onViewPolicy?: () => void;
}

/**
 * CookieConsentBanner
 * 
 * Banner displayed on first app launch for cookie consent.
 * Provides options to accept all, essential only, or customize preferences.
 * 
 * Requirements: 9.1-9.6 (Cookie and Tracking Notice)
 */
export default function CookieConsentBanner({
  visible,
  onAcceptAll,
  onEssentialOnly,
  onCustomize,
  onViewPolicy,
}: CookieConsentBannerProps) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {t('legal.cookieConsent.title')}
        </Text>
        <Text style={styles.description}>
          {t('legal.cookieConsent.description')}
        </Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>
            {t('legal.cookieConsent.essential.title')}
          </Text>
          <Text style={styles.infoText}>
            {t('legal.cookieConsent.essential.description')}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>
            {t('legal.cookieConsent.analytics.title')}
          </Text>
          <Text style={styles.infoText}>
            {t('legal.cookieConsent.analytics.description')}
          </Text>
        </View>

        {onViewPolicy && (
          <TouchableOpacity
            onPress={onViewPolicy}
            accessibilityRole="button"
            accessibilityLabel={t('legal.cookieConsent.viewPolicy')}
          >
            <Text style={styles.policyLink}>
              {t('legal.cookieConsent.viewPolicy')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={onAcceptAll}
          accessibilityRole="button"
          accessibilityLabel={t('legal.cookieConsent.acceptAll')}
        >
          <Text style={styles.acceptButtonText}>
            {t('legal.cookieConsent.acceptAll')}
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onEssentialOnly}
            accessibilityRole="button"
            accessibilityLabel={t('legal.cookieConsent.essentialOnly')}
          >
            <Text style={styles.secondaryButtonText}>
              {t('legal.cookieConsent.essentialOnly')}
            </Text>
          </TouchableOpacity>

          {onCustomize && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onCustomize}
              accessibilityRole="button"
              accessibilityLabel={t('legal.cookieConsent.customize')}
            >
              <Text style={styles.secondaryButtonText}>
                {t('legal.cookieConsent.customize')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  content: {
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  infoSection: {
    gap: spacing.xs,
  },
  infoTitle: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 14,
  },
  infoText: {
    ...typography.small,
    color: colors.textMuted,
    lineHeight: 18,
  },
  policyLink: {
    ...typography.small,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  actions: {
    gap: spacing.sm,
  },
  acceptButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  acceptButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
});
