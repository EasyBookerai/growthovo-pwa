import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInputProps,
  Animated,
} from 'react-native';
import { authColors, authSpacing, authRadius, authTypography, authAnimation } from '../../theme/authTokens';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  success?: boolean;
  icon?: string;
  isPassword?: boolean;
}

export default function AuthInput({
  label,
  error,
  success,
  icon,
  isPassword,
  style,
  ...props
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: focused ? 1 : 0,
      duration: authAnimation.normal,
      useNativeDriver: false,
    }).start();
  }, [focused, focusAnim]);

  useEffect(() => {
    if (error) {
      // Shake animation on error
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      // Error fade in
      Animated.timing(errorAnim, {
        toValue: 1,
        duration: authAnimation.fast,
        useNativeDriver: true,
      }).start();
    } else {
      errorAnim.setValue(0);
    }
  }, [error, shakeAnim, errorAnim]);

  const borderColor = error
    ? authColors.inputBorderError
    : success
      ? authColors.success
      : focused
        ? authColors.inputBorderFocus
        : authColors.inputBorder;

  const glowColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(124, 58, 237, 0)', 'rgba(124, 58, 237, 0.15)'],
  });

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, focused && styles.labelFocused]} accessibilityElementsHidden importantForAccessibility="no">
        {label}
      </Text>
      <Animated.View
        style={[
          styles.inputRow,
          { borderColor, transform: [{ translateX: shakeAnim }] },
          error && styles.inputRowError,
          success && styles.inputRowSuccess,
          Platform.OS === 'web' && { boxShadow: glowColor } as any,
        ]}
      >
        {icon ? (
          <Text style={[styles.icon, focused && styles.iconFocused]} accessibilityElementsHidden>
            {icon}
          </Text>
        ) : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={authColors.textSubtle}
          secureTextEntry={isPassword && !visible}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChangeText={(text) => {
            setHasValue(text.length > 0);
            props.onChangeText?.(text);
          }}
          accessibilityLabel={label}
          accessibilityHint={error ?? undefined}
          {...props}
        />
        {success && !isPassword ? (
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
        ) : null}
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setVisible((v) => !v)}
            style={styles.toggle}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.toggleText}>{visible ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        ) : null}
      </Animated.View>
      {error ? (
        <Animated.Text
          style={[styles.error, { opacity: errorAnim }]}
          accessibilityLiveRegion="polite"
          role="alert"
        >
          {error}
        </Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: authSpacing.md,
  },
  label: {
    ...authTypography.label,
    color: authColors.textMuted,
    marginBottom: authSpacing.sm,
    ...(Platform.OS === 'web' ? { transition: 'color 0.2s ease' } as any : {}),
  },
  labelFocused: {
    color: authColors.primaryLight,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: authColors.inputBg,
    borderRadius: authRadius.md,
    borderWidth: 1,
    paddingHorizontal: authSpacing.md,
    minHeight: 52,
    ...(Platform.OS === 'web' ? { transition: 'border-color 0.2s ease, background-color 0.2s ease' } as any : {}),
  },
  inputRowError: {
    backgroundColor: authColors.errorBg,
  },
  inputRowSuccess: {
    backgroundColor: authColors.successBg,
  },
  icon: {
    fontSize: 16,
    marginRight: authSpacing.sm,
    opacity: 0.6,
    ...(Platform.OS === 'web' ? { transition: 'opacity 0.2s ease' } as any : {}),
  },
  iconFocused: {
    opacity: 0.9,
  },
  input: {
    flex: 1,
    ...authTypography.body,
    color: authColors.text,
    paddingVertical: Platform.OS === 'web' ? 14 : 12,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  successIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: authColors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: authSpacing.sm,
  },
  successIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  toggle: {
    padding: authSpacing.xs,
    marginLeft: authSpacing.sm,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } as any : {}),
  },
  toggleText: {
    fontSize: 16,
    opacity: 0.7,
  },
  error: {
    ...authTypography.small,
    color: authColors.error,
    marginTop: authSpacing.xs,
  },
});
