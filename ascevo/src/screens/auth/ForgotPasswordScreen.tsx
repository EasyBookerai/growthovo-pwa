import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  AuthLayout,
  AuthHeader,
  AuthInput,
  AuthButton,
  AuthErrorBanner,
  AuthLink,
} from '../../components/auth';
import { sendPasswordResetEmail } from '../../services/authService';
import { validateEmail } from '../../utils/passwordValidation';
import { syncWebPath } from '../../utils/authRedirect';
import { authColors, authSpacing, authTypography } from '../../theme/authTokens';

interface Props {
  onNavigateToSignIn: () => void;
}

export default function ForgotPasswordScreen({ onNavigateToSignIn }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    syncWebPath('/forgot-password');
  }, []);

  const isRateLimited = attemptCount >= 3;

  async function handleSubmit() {
    if (isRateLimited) {
      setError('Too many attempts. Please wait a moment before trying again.');
      return;
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldError(emailErr);
      return;
    }

    setError('');
    setFieldError(undefined);
    setLoading(true);
    try {
      await sendPasswordResetEmail(email.trim().toLowerCase());
      setSuccess(true);
    } catch (e: any) {
      setAttemptCount((c) => c + 1);
      const message = e.message;
      if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connection')) {
        setError('Something went wrong. Check your connection and try again.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setFieldError(undefined);
    if (error) setError('');
  };

  if (success) {
    return (
      <AuthLayout>
        <AuthHeader
          title={t('auth.reset_sent_title', 'Check your email')}
          subtitle={t('auth.reset_sent_body', {
            email,
            defaultValue: `If an account exists for ${email}, we've sent password reset instructions.`,
          })}
        />
        <Text style={styles.hint}>
          {t('auth.reset_sent_hint', 'The link expires after a short time. Check your spam folder if you don\'t see it.')}
        </Text>
        <AuthButton label={t('auth.back_to_sign_in', 'Back to Sign In')} onPress={onNavigateToSignIn} variant="google" />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthHeader
        title={t('auth.forgot_title', 'Reset your password')}
        subtitle={t('auth.forgot_subtitle', "Enter your email and we'll send you a link to reset your password.")}
      />

      {error ? <AuthErrorBanner message={error} /> : null}

      <AuthInput
        label={t('auth.email', 'Email address')}
        icon="✉"
        value={email}
        onChangeText={handleEmailChange}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        returnKeyType="go"
        onSubmitEditing={() => {
          Keyboard.dismiss();
          handleSubmit();
        }}
        error={fieldError}
        editable={!loading}
      />

      <AuthButton
        label={t('auth.send_reset', 'Send Reset Email →')}
        onPress={handleSubmit}
        loading={loading}
        loadingLabel={t('auth.sending', 'Sending...')}
        disabled={isRateLimited}
      />

      <AuthLink
        text=""
        linkText={t('auth.back_to_sign_in', '← Back to Sign In')}
        onPress={onNavigateToSignIn}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  hint: {
    ...authTypography.body,
    color: authColors.textMuted,
    textAlign: 'center',
    marginBottom: authSpacing.lg,
  },
});
