import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { signIn, signInWithGoogle } from '../../services/authService';
import { colors, typography } from '../../theme';

interface Props {
  onNavigateToSignUp: () => void;
}

export default function SignInScreen({ onNavigateToSignUp }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError(t('errors.generic'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e: any) {
      setError(e.message ?? t('errors.sign_in_failed'));
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
      setError(e.message ?? t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>Growthovo</Text>
        <Text style={styles.tagline}>Level up your life.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

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
          autoComplete="password"
        />

        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={handleSignIn}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={t('auth.sign_in')}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{t('auth.sign_in')}</Text>
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
          accessibilityLabel="Continue with Google"
        >
          <Text style={styles.btnTextDark}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNavigateToSignUp} accessibilityRole="button">
          <Text style={styles.link}>{t('auth.no_account')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { ...typography.h1, color: colors.primary, textAlign: 'center', marginBottom: 4 },
  tagline: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: 40 },
  error: { color: colors.error, marginBottom: 12, textAlign: 'center', ...typography.body },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnGoogle: { backgroundColor: '#fff' },
  btnText: { color: '#fff', ...typography.bodyBold },
  btnTextDark: { color: '#000', ...typography.bodyBold },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, marginHorizontal: 12, ...typography.small },
  link: { color: colors.textMuted, textAlign: 'center', marginTop: 16, ...typography.body },
  linkBold: { color: colors.primary, ...typography.bodyBold },
});
