import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PASSWORD_REQUIREMENTS, getPasswordStrength } from '../../utils/passwordValidation';
import { authColors, authSpacing, authRadius, authTypography } from '../../theme/authTokens';

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

const STRENGTH_COLORS = {
  weak: authColors.strengthWeak,
  fair: authColors.strengthFair,
  good: authColors.strengthGood,
  strong: authColors.strengthStrong,
};

export default function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
  if (!password) return null;

  const { label, score, metCount, total } = getPasswordStrength(password);
  const color = STRENGTH_COLORS[label];

  return (
    <View style={styles.wrapper}>
      <View style={styles.barTrack} accessibilityElementsHidden>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.barSegment,
              { backgroundColor: score * total > i ? color : authColors.inputBorder },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color }]}>
        {label.charAt(0).toUpperCase() + label.slice(1)} password
      </Text>

      {showRequirements ? (
        <View style={styles.requirements}>
          {PASSWORD_REQUIREMENTS.map((req) => {
            const met = req.test(password);
            return (
              <View key={req.id} style={styles.reqRow}>
                <Text style={[styles.reqIcon, { color: met ? authColors.success : authColors.textSubtle }]}>
                  {met ? '✓' : '○'}
                </Text>
                <Text style={[styles.reqText, met && styles.reqMet]}>{req.label}</Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: authSpacing.md,
    marginTop: -authSpacing.sm,
  },
  barTrack: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: authSpacing.xs,
  },
  barSegment: {
    flex: 1,
    height: 3,
    borderRadius: authRadius.full,
  },
  strengthLabel: {
    ...authTypography.small,
    marginBottom: authSpacing.sm,
  },
  requirements: {
    gap: 4,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  reqIcon: {
    fontSize: 11,
    width: 14,
    textAlign: 'center',
  },
  reqText: {
    ...authTypography.small,
    color: authColors.textSubtle,
  },
  reqMet: {
    color: authColors.textMuted,
  },
});
