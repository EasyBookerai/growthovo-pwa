import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius } from '../../theme';

interface CrisisDisclaimerBannerProps {
  onViewResources?: () => void;
}

/**
 * CrisisDisclaimerBanner
 * 
 * Prominent warning banner displayed on panic/help screens.
 * Shows emergency contact numbers and clarifies that Growthovo is not an emergency service.
 * 
 * Requirements: 7.1-7.7 (Crisis and Safety Disclaimer)
 */
export default function CrisisDisclaimerBanner({
  onViewResources,
}: CrisisDisclaimerBannerProps) {
  const { t } = useTranslation();

  const handleEmergencyCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      // Handle error silently - user may not have phone capability
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.warningHeader}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningTitle}>
          {t('legal.crisisDisclaimer.title')}
        </Text>
      </View>

      <Text style={styles.description}>
        {t('legal.crisisDisclaimer.description')}
      </Text>

      <View style={styles.emergencySection}>
        <Text style={styles.emergencyTitle}>
          🚨 {t('legal.crisisDisclaimer.emergency.title')}
        </Text>
        
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => handleEmergencyCall('112')}
          accessibilityRole="button"
          accessibilityLabel={t('legal.crisisDisclaimer.emergency.eu')}
        >
          <Text style={styles.emergencyButtonText}>
            {t('legal.crisisDisclaimer.emergency.eu')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.helplinesSection}>
        <Text style={styles.helplinesTitle}>
          🆘 {t('legal.crisisDisclaimer.helplines.title')}
        </Text>
        
        <TouchableOpacity
          style={styles.helplineButton}
          onPress={() => handleEmergencyCall('0800801200')}
          accessibilityRole="button"
        >
          <Text style={styles.helplineText}>
            {t('legal.crisisDisclaimer.helplines.mental')}
          </Text>
          <Text style={styles.helplineNumber}>0800 801 200</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.helplineButton}
          onPress={() => handleEmergencyCall('116123')}
          accessibilityRole="button"
        >
          <Text style={styles.helplineText}>
            {t('legal.crisisDisclaimer.helplines.suicide')}
          </Text>
          <Text style={styles.helplineNumber}>116 123</Text>
        </TouchableOpacity>
      </View>

      {onViewResources && (
        <TouchableOpacity
          style={styles.resourcesButton}
          onPress={onViewResources}
          accessibilityRole="button"
        >
          <Text style={styles.resourcesButtonText}>
            {t('legal.crisisDisclaimer.viewResources')}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.footer}>
        {t('legal.crisisDisclaimer.footer')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.error + '22',
    borderWidth: 2,
    borderColor: colors.error,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  warningIcon: {
    fontSize: 24,
  },
  warningTitle: {
    ...typography.bodyBold,
    color: colors.error,
    flex: 1,
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  emergencySection: {
    gap: spacing.sm,
  },
  emergencyTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  emergencyButton: {
    backgroundColor: colors.error,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  emergencyButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 18,
  },
  helplinesSection: {
    gap: spacing.sm,
  },
  helplinesTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  helplineButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helplineText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  helplineNumber: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  resourcesButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  resourcesButtonText: {
    ...typography.body,
    color: colors.primary,
  },
  footer: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
