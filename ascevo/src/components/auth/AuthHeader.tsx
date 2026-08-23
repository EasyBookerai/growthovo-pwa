import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { authColors, authSpacing, authTypography } from '../../theme/authTokens';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.logo} accessibilityRole="header">Growthovo</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

interface AuthLinkProps {
  text: string;
  linkText: string;
  onPress: () => void;
}

export function AuthLink({ text, linkText, onPress }: AuthLinkProps) {
  return (
    <View style={styles.linkRow}>
      <Text style={styles.linkText}>{text} </Text>
      <TouchableOpacity onPress={onPress} accessibilityRole="link" hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
        <Text style={styles.linkAction}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
}

interface AuthCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: React.ReactNode;
  accessibilityLabel?: string;
}

export function AuthCheckbox({ checked, onToggle, label, accessibilityLabel }: AuthCheckboxProps) {
  return (
    <TouchableOpacity
      style={styles.checkboxRow}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <View style={styles.checkboxLabelWrap}>{typeof label === 'string' ? <Text style={styles.checkboxLabel}>{label}</Text> : label}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: authSpacing.xl,
    alignItems: 'center',
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: authColors.primaryLight,
    letterSpacing: -0.5,
    marginBottom: authSpacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: authColors.text,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: authSpacing.sm,
  },
  subtitle: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    textAlign: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: authSpacing.md,
    flexWrap: 'wrap',
  },
  linkText: {
    ...authTypography.body,
    color: authColors.textMuted,
  },
  linkAction: {
    ...authTypography.link,
    color: authColors.primaryLight,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: authSpacing.sm,
    marginBottom: authSpacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: authColors.inputBorder,
    backgroundColor: authColors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: authColors.primary,
    borderColor: authColors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  checkboxLabelWrap: {
    flex: 1,
  },
  checkboxLabel: {
    ...authTypography.small,
    color: authColors.textMuted,
    lineHeight: 20,
  },
});
