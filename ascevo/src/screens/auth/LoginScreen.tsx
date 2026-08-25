import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  AuthLayout,
  AuthHeader,
  AuthInput,
  AuthButton,
  AuthDivider,
  AuthErrorBanner,
  AuthLink,
  AuthCheckbox,
  GoogleIcon,
} from '../../components/auth';
import { signIn, signInWithGoogle, getRememberedEmail, setRememberedEmail } from '../../services/authService';
import { validateEmail } from '../../utils/passwordValidation';
import { syncWebPath } from '../../utils/authRedirect';
import { authColors, authSpacing, authTypography } from '../../theme/authTokens';

interface Props {
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
}

export default function LoginScreen({ onNavigateToSignUp, onNavigateToForgotPassword }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [attemptCount, setAttemptCount] = useState(0);
  const passwordInputRef = useRef<any>(null);

  useEffect(() => {
    syncWebPath('/login');
    getRememberedEmail().then((saved) => {
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    });
  }, []);

  // Rate limiting UI feedback
  const isRateLimited = attemptCount >= 5;
  const rateLimitMessage = isRateLimited ? 'Too many attempts. Please wait a moment.' : '';

  async function handleSignIn() {
    if (isRateLimited) {
      setError(rateLimitMessage);
      return;
    }

    const emailErr = validateEmail(email);
    const passwordErr = !password ? 'Password is required.' : null;
    setFieldErrors({ email: emailErr ?? undefined, password: passwordErr ?? undefined });
    if (emailErr || passwordErr) return;

    setError('');
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password, rememberMe);
      if (!rememberMe) await setRememberedEmail(null);
      // Success - auth context will handle navigation
    } catch (e: any) {
      setAttemptCount((c) => c + 1);
      // User-friendly error messages
      const message = e.message ?? t('errors.sign_in_failed');
      if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('incorrect')) {
        setError('Email or password doesn't look right. Check your details and try again.');
      } else if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connection')) {
        setError('Something went wrong. Check your connection and try again.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (isRateLimited) {
      setError(rateLimitMessage);
      return;
    }

    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setAttemptCount((c) => c + 1);
      const message = e.message ?? t('errors.generic');
      if (message.toLowerCase().includes('popup') || message.toLowerCase().includes('cancelled')) {
        setError('Google sign-in was cancelled. Please try again.');
      } else {
        setError(message);
      }
      setGoogleLoading(false);
    }
  }

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setFieldErrors((e) => ({ ...e, email: undefined }));
    if (error) setError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setFieldErrors((e) => ({ ...e, password: undefined }));
    if (error) setError('');
  };

  const handleEmailSubmit = () => {
    passwordInputRef.current?.focus();
  };

  return (
    <AuthLayout>
      <AuthHeader
        title={t('auth.sign_in_title', 'Welcome Back')}
        subtitle={t('auth.sign_in_subtitle', 'Sign in to continue to Growthovo.')}
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
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={handleEmailSubmit}
        error={fieldErrors.email}
        editable={!loading && !googleLoading}
      />
      <AuthInput
        ref={passwordInputRef}
        label={t('auth.password', 'Password')}
        icon="🔒"
        value={password}
        onChangeText={handlePasswordChange}
        isPassword
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => {
          Keyboard.dismiss();
          handleSignIn();
        }}
        error={fieldErrors.password}
        editable={!loading && !googleLoading}
      />

      <View style={styles.row}>
        <View style={styles.rememberWrap}>
          <AuthCheckbox
            checked={rememberMe}
            onToggle={() => setRememberMe((v) => !v)}
            label={t('auth.remember_me', 'Remember me')}
            accessibilityLabel={t('auth.remember_me', 'Remember me')}
          />
        </View>
        <TouchableOpacity
          onPress={onNavigateToForgotPassword}
          accessibilityRole="link"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          disabled={loading || googleLoading}
        >
          <Text style={[styles.forgot, (loading || googleLoading) && styles.forgotDisabled]}>
            {t('auth.forgot_password', 'Forgot password?')}
          </Text>
        </TouchableOpacity>
      </View>

      <AuthButton
        label={`${t('auth.sign_in', 'Sign In')} →`}
        onPress={handleSignIn}
        loading={loading}
        loadingLabel={t('auth.signing_in', 'Signing in...')}
        disabled={googleLoading || isRateLimited}
      />

      <AuthDivider />

      <AuthButton
        label={t('auth.sign_in_google', 'Sign in with Google')}
        onPress={handleGoogle}
        loading={googleLoading}
        loadingLabel={t('auth.connecting_google', 'Connecting...')}
        disabled={loading || isRateLimited}
        variant="google"
        icon={<GoogleIcon />}
      />

      <AuthLink
        text={t('auth.no_account_prefix', "Don't have an account?")}
        linkText={t('auth.sign_up', 'Sign up')}
        onPress={onNavigateToSignUp}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: authSpacing.md,
    marginTop: -authSpacing.sm,
  },
  rememberWrap: {
    flex: 1,
  },
  forgot: {
    ...authTypography.link,
    color: authColors.primaryLight,
  },
  forgotDisabled: {
    opacity: 0.5,
  },
});
