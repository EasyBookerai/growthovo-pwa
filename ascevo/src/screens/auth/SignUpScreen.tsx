import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { signUp, signInWithGoogle } from '../../services/authService';
import { logConsent } from '../../services/legalConsentService';
import AgeVerificationCheckbox from '../../components/legal/AgeVerificationCheckbox';
import { colors, typography, spacing, radius } from '../../theme';

interface Props {
  onNavigateToSignIn: () => void;
}

export default function SignUpScreen({ onNavigateToSignIn }: Props) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageVerified, setAgeVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSignUp() {
    if (!username.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!ageVerified) {
      setError('You must confirm you are at least 13 years old.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the Terms & Conditions to continue.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await signUp(email.trim().toLowerCase(), password, username.trim());
      
      // Log legal consents
      if (data?.user?.id) {
        await Promise.all([
          logConsent(data.user.id, 'age_verification', '1.0', 'explicit_checkbox'),
          logConsent(data.user.id, 'terms_conditions', '1.0', 'explicit_checkbox'),
          logConsent(data.user.id, 'privacy_policy', '1.0', 'click_through'),
        ]);
      }
      
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.successIcon}>📬</Text>
        <Text style={styles.successTitle}>Check your email</Text>
        <Text style={styles.successBody}>
          We sent a confirmation link to {email}. Click it to activate your account.
        </Text>
        <TouchableOpacity onPress={onNavigateToSignIn} accessibilityRole="button">
          <Text style={styles.link}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>Growthovo</Text>
        <Text style={styles.tagline}>Your journey starts here.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoComplete="username-new"
        />
        <TextInput
          style={styles.input}
          placeholder={t('auth.email')}
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder={t('auth.password')}
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password-new"
        />

        {/* Age Verification */}
        <View style={styles.legalSection}>
          <AgeVerificationCheckbox
            checked={ageVerified}
            onToggle={() => setAgeVerified(!ageVerified)}
            onLearnMore={() => {
              // TODO: Navigate to age policy explanation
            }}
          />
        </View>

        {/* Terms & Conditions */}
        <View style={styles.legalSection}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setTermsAccepted(!termsAccepted)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: termsAccepted }}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I accept the{' '}
              <Text
                style={styles.link}
                onPress={(e) => {
                  e.stopPropagation();
                  // TODO: Navigate to Terms & Conditions
                }}
              >
                Terms & Conditions
              </Text>
              {' '}and{' '}
              <Text
                style={styles.link}
                onPress={(e) => {
                  e.stopPropagation();
                  // TODO: Navigate to Privacy Policy
                }}
              >
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={handleSignUp}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={t('auth.sign_up')}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{t('auth.sign_up')}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.btn, styles.btnGoogle]}
          onPress={handleGoogle}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Sign up with Google"
        >
          <Text style={styles.btnTextDark}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNavigateToSignIn} accessibilityRole="button">
          <Text style={styles.footerLink}>{t('auth.have_account')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { ...typography.h1, color: colors.primary, textAlign: 'center', marginBottom: 4 },
  tagline: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: 40 },
  error: { color: colors.error, marginBottom: 12, textAlign: 'center', ...typography.body },
  successIcon: { fontSize: 48, marginBottom: 16 },
  successTitle: { ...typography.h2, color: colors.text, marginBottom: 8 },
  successBody: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: 24 },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legalSection: {
    marginBottom: spacing.md,
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
  checkboxLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  btn: {
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnGoogle: { backgroundColor: '#fff' },
  btnText: { color: '#fff', ...typography.bodyBold },
  btnTextDark: { color: '#000', ...typography.bodyBold },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, marginHorizontal: spacing.sm, ...typography.small },
  link: { color: colors.primary, ...typography.bodyBold },
  linkBold: { color: colors.primary, ...typography.bodyBold },
  footerLink: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md, ...typography.body },
});
