import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  AuthLayout,
  AuthHeader,
  AuthInput,
  AuthButton,
  AuthErrorBanner,
  PasswordStrength,
} from '../../components/auth';
import { updatePassword } from '../../services/authService';
import { supabase } from '../../services/supabaseClient';
import { validatePassword } from '../../utils/passwordValidation';
import { syncWebPath } from '../../utils/authRedirect';
import { authColors, authSpacing, authTypography } from '../../theme/authTokens';

interface Props {
  onNavigateToSignIn: () => void;
  onNavigateToForgotPassword: () => void;
  onSuccess: () => void;
}

type TokenState = 'checking' | 'valid' | 'expired' | 'invalid';

export default function ResetPasswordScreen({ onNavigateToSignIn, onNavigateToForgotPassword, onSuccess }: Props) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenState, setTokenState] = useState<TokenState>('checking');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    syncWebPath('/reset-password');

    async function validateToken() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setTokenState('invalid');
          return;
        }

        // Supabase sets session from recovery link hash on web
        if (session) {
          setTokenState('valid');
          return;
        }

        // Check URL for recovery type
        if (typeof window !== 'undefined') {
          const hash = window.location.hash;
          const params = new URLSearchParams(hash.replace('#', '?'));
          const type = params.get('type');
          if (type === 'recovery') {
            const { data, error } = await supabase.auth.getSession();
            if (data.session) setTokenState('valid');
            else if (error?.message.includes('expired')) setTokenState('expired');
            else setTokenState('invalid');
            return;
          }
        }

        setTokenState('invalid');
      } catch {
        setTokenState('invalid');
      }
    }

    validateToken();
  }, []);

  async function handleReset() {
    const passErr = validatePassword(password);
    const errors: Record<string, string> = {};
    if (passErr) errors.password = passErr;
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setError('');
    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (tokenState === 'checking') {
    return (
      <AuthLayout>
        <View style={styles.center}>
          <ActivityIndicator color={authColors.primaryLight} size="large" />
          <Text style={styles.checking}>{t('auth.validating_link', 'Validating your link...')}</Text>
        </View>
      </AuthLayout>
    );
  }

  if (tokenState === 'expired' || tokenState === 'invalid') {
    return (
      <AuthLayout>
        <AuthHeader
          title={tokenState === 'expired'
            ? t('auth.link_expired_title', 'Link expired')
            : t('auth.link_invalid_title', 'Invalid link')}
          subtitle={t('auth.link_expired_body', 'This password reset link is no longer valid. Request a new one to continue.')}
        />
        <AuthButton label={t('auth.request_new_link', 'Request New Link')} onPress={onNavigateToForgotPassword} />
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout>
        <AuthHeader
          title={t('auth.password_updated', 'Password updated')}
          subtitle={t('auth.password_updated_body', 'Your password has been reset. Redirecting you to sign in...')}
        />
        <AuthButton label="✓" onPress={() => {}} success disabled />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthHeader
        title={t('auth.new_password_title', 'Set a new password')}
        subtitle={t('auth.new_password_subtitle', 'Choose a strong password for your account.')}
      />

      {error ? <AuthErrorBanner message={error} /> : null}

      <AuthInput
        label={t('auth.new_password', 'New password')}
        icon="🔒"
        value={password}
        onChangeText={(v) => { setPassword(v); setFieldErrors((e) => ({ ...e, password: undefined })); }}
        isPassword
        autoComplete="password-new"
        error={fieldErrors.password}
      />
      <PasswordStrength password={password} />
      <AuthInput
        label={t('auth.confirm_password', 'Confirm password')}
        icon="🔒"
        value={confirmPassword}
        onChangeText={(v) => { setConfirmPassword(v); setFieldErrors((e) => ({ ...e, confirmPassword: undefined })); }}
        isPassword
        autoComplete="password-new"
        error={fieldErrors.confirmPassword}
      />

      <AuthButton
        label={t('auth.reset_password', 'Reset Password →')}
        onPress={handleReset}
        loading={loading}
        loadingLabel={t('auth.updating', 'Updating...')}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    paddingVertical: authSpacing.xxl,
  },
  checking: {
    ...authTypography.body,
    color: authColors.textMuted,
    marginTop: authSpacing.md,
  },
});
