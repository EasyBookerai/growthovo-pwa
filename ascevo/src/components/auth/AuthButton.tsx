import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { authColors, authSpacing, authRadius, authTypography } from '../../theme/authTokens';

type AuthButtonVariant = 'primary' | 'google' | 'ghost';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: AuthButtonVariant;
  icon?: React.ReactNode;
  loadingLabel?: string;
  success?: boolean;
  accessibilityLabel?: string;
}

export default function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  loadingLabel,
  success = false,
  accessibilityLabel,
}: AuthButtonProps) {
  const isDisabled = disabled || loading || success;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'google' && styles.google,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        success && styles.success,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? authColors.ctaText : authColors.text}
          />
          <Text style={[styles.label, variant === 'primary' ? styles.primaryLabel : styles.googleLabel]}>
            {loadingLabel ?? label}
          </Text>
        </View>
      ) : success ? (
        <Text style={[styles.label, styles.primaryLabel]}>✓ Done</Text>
      ) : (
        <View style={styles.contentRow}>
          {icon}
          <Text
            style={[
              styles.label,
              variant === 'primary' ? styles.primaryLabel : styles.googleLabel,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: authRadius.md,
    paddingVertical: 15,
    paddingHorizontal: authSpacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: authSpacing.sm,
    minHeight: 52,
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'opacity 0.15s ease, transform 0.1s ease' } as any : {}),
  },
  primary: {
    backgroundColor: authColors.cta,
    ...(Platform.OS === 'web'
      ? { boxShadow: `0 4px 24px ${authColors.primaryGlow}` } as any
      : {}),
  },
  google: {
    backgroundColor: authColors.googleBg,
    borderWidth: 1,
    borderColor: authColors.googleBorder,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  success: {
    backgroundColor: authColors.success,
  },
  label: {
    ...authTypography.bodyBold,
  },
  primaryLabel: {
    color: authColors.ctaText,
  },
  googleLabel: {
    color: authColors.text,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
  },
});

export function GoogleIcon() {
  return (
    <Text style={{ fontSize: 18, fontWeight: '700', color: authColors.text }}>G</Text>
  );
}
