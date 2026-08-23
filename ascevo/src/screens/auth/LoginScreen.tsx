import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

  useEffect(() => {
    syncWebPath('/login');
    getRememberedEmail().then((saved) => {
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    });
  }, []);

  async function handleSignIn() {
    const emailErr = validateEmail(email);
    const passwordErr = !password ? 'Password is required.' : null;
    setFieldErrors({ email: emailErr ?? undefined, password: passwordErr ?? undefined });
    if (emailErr || passwordErr) return;

    setError('');
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password, rememberMe);
      if (!rememberMe) await setRememberedEmail(null);
    } catch (e: any) {
      setError(e.message ?? t('errors.sign_in_failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError(e.message ?? t('errors.generic'));
      setGoogleLoading(false);
    }
  }

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
        onChangeText={(v) => { setEmail(v); setFieldErrors((e) => ({ ...e, email: undefined })); }}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        error={fieldErrors.email}
      />
      <AuthInput
        label={t('auth.password', 'Password')}
        icon="🔒"
        value={password}
        onChangeText={(v) => { setPassword(v); setFieldErrors((e) => ({ ...e, password: undefined })); }}
        isPassword
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSignIn}
        error={fieldErrors.password}
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
        >
          <Text style={styles.forgot}>{t('auth.forgot_password', 'Forgot password?')}</Text>
        </TouchableOpacity>
      </View>

      <AuthButton
        label={`${t('auth.sign_in', 'Sign In')} →`}
        onPress={handleSignIn}
        loading={loading}
        loadingLabel={t('auth.signing_in', 'Signing in...')}
        disabled={googleLoading}
      />

      <AuthDivider />

      <AuthButton
        label={t('auth.sign_in_google', 'Sign in with Google')}
        onPress={handleGoogle}
        loading={googleLoading}
        loadingLabel={t('auth.connecting_google', 'Connecting...')}
        disabled={loading}
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
});
