import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInputProps,
} from 'react-native';
import { authColors, authSpacing, authRadius, authTypography } from '../../theme/authTokens';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: string;
  isPassword?: boolean;
}

export default function AuthInput({
  label,
  error,
  icon,
  isPassword,
  style,
  ...props
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const borderColor = error
    ? authColors.inputBorderError
    : focused
      ? authColors.inputBorderFocus
      : authColors.inputBorder;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label} accessibilityElementsHidden importantForAccessibility="no">
        {label}
      </Text>
      <View style={[styles.inputRow, { borderColor }, error && styles.inputRowError]}>
        {icon ? <Text style={styles.icon} accessibilityElementsHidden>{icon}</Text> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={authColors.textSubtle}
          secureTextEntry={isPassword && !visible}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          accessibilityHint={error ?? undefined}
          {...props}
        />
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
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite" role="alert">
          {error}
        </Text>
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
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: authColors.inputBg,
    borderRadius: authRadius.md,
    borderWidth: 1,
    paddingHorizontal: authSpacing.md,
    minHeight: 52,
    ...(Platform.OS === 'web' ? { transition: 'border-color 0.2s ease' } as any : {}),
  },
  inputRowError: {
    backgroundColor: authColors.errorBg,
  },
  icon: {
    fontSize: 16,
    marginRight: authSpacing.sm,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    ...authTypography.body,
    color: authColors.text,
    paddingVertical: Platform.OS === 'web' ? 14 : 12,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  toggle: {
    padding: authSpacing.xs,
    marginLeft: authSpacing.sm,
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
