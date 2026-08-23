import React, { useEffect, useState, useCallback } from 'react';
import { Text, StyleSheet, Linking, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  AuthLayout,
  AuthHeader,
  AuthButton,
  AuthErrorBanner,
} from '../../components/auth';
import { resendVerificationEmail } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { syncWebPath } from '../../utils/authRedirect';
import { authColors, authSpacing, authTypography } from '../../theme/authTokens';

interface Props {
  onNavigateToSignIn: () => void;
}

const RESEND_COOLDOWN_SEC = 60;

export default function EmailVerificationScreen({ onNavigateToSignIn }: Props) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const email = user?.email ?? '';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    syncWebPath('/verify-email');
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (!email || cooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await resendVerificationEmail(email);
      setSuccess(true);
      setCooldown(RESEND_COOLDOWN_SEC);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [email, cooldown]);

  async function handleOpenEmail() {
    if (Platform.OS === 'web') {
      window.open('mailto:', '_blank');
      return;
    }
    const url = Platform.OS === 'ios' ? 'message://' : 'mailto:';
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) Linking.openURL(url);
  }

  return (
    <AuthLayout>
      <AuthHeader
        title={t('auth.verify_email_title', 'Verify your email')}
        subtitle={t('auth.verify_email_subtitle', {
          email,
          defaultValue: `We've sent a verification link to ${email}.`,
        })}
      />

      {error ? <AuthErrorBanner message={error} /> : null}
      {success ? (
        <Text style={styles.success}>{t('auth.verification_resent', 'Verification email sent!')}</Text>
      ) : null}

      <AuthButton
        label={t('auth.open_email', 'Open Email App')}
        onPress={handleOpenEmail}
        variant="google"
      />

      <Text style={styles.resendPrompt}>{t('auth.didnt_receive', "Didn't receive it?")}</Text>

      <AuthButton
        label={cooldown > 0
          ? t('auth.resend_cooldown', { seconds: cooldown, defaultValue: `Resend in ${cooldown}s` })
          : t('auth.resend_email', 'Resend email')}
        onPress={handleResend}
        loading={loading}
        loadingLabel={t('auth.sending', 'Sending...')}
        disabled={cooldown > 0}
        variant="ghost"
      />

      <AuthButton
        label={t('auth.sign_out_change', 'Sign out / use different email')}
        onPress={async () => { await signOut(); onNavigateToSignIn(); }}
        variant="ghost"
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  success: {
    ...authTypography.body,
    color: authColors.success,
    textAlign: 'center',
    marginBottom: authSpacing.md,
  },
  resendPrompt: {
    ...authTypography.small,
    color: authColors.textMuted,
    textAlign: 'center',
    marginTop: authSpacing.md,
    marginBottom: authSpacing.sm,
  },
});
