import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius } from '../../theme';

interface AgeVerificationCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  onLearnMore?: () => void;
}

/**
 * AgeVerificationCheckbox
 * 
 * Checkbox component for age verification during signup.
 * Confirms user is at least 13 years old (GDPR requirement).
 * 
 * Requirements: 5.1-5.6 (Age Verification and Child Protection)
 */
export default function AgeVerificationCheckbox({
  checked,
  onToggle,
  onLearnMore,
}: AgeVerificationCheckboxProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={t('legal.ageVerification.label')}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.label}>
          {t('legal.ageVerification.label')}
        </Text>
      </TouchableOpacity>

      <Text style={styles.description}>
        {t('legal.ageVerification.description')}
      </Text>

      {onLearnMore && (
        <TouchableOpacity
          onPress={onLearnMore}
          accessibilityRole="button"
          accessibilityLabel={t('legal.ageVerification.learnMore')}
        >
          <Text style={styles.learnMoreText}>
            {t('legal.ageVerification.learnMore')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  label: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  description: {
    ...typography.small,
    color: colors.textMuted,
    lineHeight: 18,
    paddingLeft: 24 + spacing.sm,
  },
  learnMoreText: {
    ...typography.small,
    color: colors.primary,
    paddingLeft: 24 + spacing.sm,
  },
});
