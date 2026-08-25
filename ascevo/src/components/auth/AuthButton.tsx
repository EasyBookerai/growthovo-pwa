import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { authColors, authSpacing, authRadius, authTypography, authAnimation } from '../../theme/authTokens';

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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (success) {
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [success, successAnim]);

  const handlePressIn = () => {
    if (!isDisabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        Platform.OS === 'web' && pressed && !isDisabled && styles.webPressed,
      ]}
    >
      <Animated.View
        style={[
          styles.base,
          variant === 'primary' && styles.primary,
          variant === 'google' && styles.google,
          variant === 'ghost' && styles.ghost,
          isDisabled && styles.disabled,
          success && styles.success,
          { transform: [{ scale: scaleAnim }] },
        ]}
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
          <Animated.View
            style={[
              styles.successRow,
              {
                transform: [{ scale: successAnim }],
              },
            ]}
          >
            <View style={styles.successCheck}>
              <Text style={styles.successCheckText}>✓</Text>
            </View>
            <Text style={[styles.label, styles.primaryLabel]}>Done</Text>
          </Animated.View>
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
      </Animated.View>
    </Pressable>
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
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease', userSelect: 'none' } as any : {}),
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
    ...(Platform.OS === 'web' ? { cursor: 'not-allowed' } as any : {}),
  },
  success: {
    backgroundColor: authColors.success,
  },
  webPressed: {
    opacity: 0.9,
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
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  successCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCheckText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export function GoogleIcon() {
  return (
    <Text style={{ fontSize: 18, fontWeight: '700', color: authColors.text }}>G</Text>
  );
}
