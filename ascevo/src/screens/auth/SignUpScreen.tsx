import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, Keyboard } from 'react-native';
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
  PasswordStrength,
} from '../../components/auth';
import AgeVerificationCheckbox from '../../components/legal/AgeVerificationCheckbox';
import { signUp, signInWithGoogle } from '../../services/authService';
import { logConsent } from '../../services/legalConsentService';
import { validateEmail, validatePassword } from '../../utils/passwordValidation';
import { syncWebPath } from '../../utils/authRedirect';
import { authColors, authSpacing, authTypography } from '../../theme/authTokens';

interface Props {
  onNavigateToSignIn: () => void;
}

export default function SignUpScreen({ onNavigateToSignIn }: Props) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ageVerified, setAgeVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const emailInputRef = useRef<any>(null);
  const passwordInputRef = useRef<any>(null);
  const confirmPasswordInputRef = useRef<any>(null);

  useEffect(() => {
    syncWebPath('/signup');
  }, []);

  // Real-time validation for touched fields
  useEffect(() => {
    if (!touchedFields.size) return;
    const errors: Record<string, string> = {};

    if (touchedFields.has('username')) {
      if (!username.trim()) errors.username = 'Username is required.';
      else if (username.trim().length < 3) errors.username = 'Username must be at least 3 characters.';
    }

    if (touchedFields.has('email')) {
      const emailErr = validateEmail(email);
      if (emailErr) errors.email = emailErr;
    }

    if (touchedFields.has('password')) {
      const passErr = validatePassword(password);
      if (passErr) errors.password = passErr;
    }

    if (touchedFields.has('confirmPassword')) {
      if (password !== confirmPassword && confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    setFieldErrors(errors);
  }, [username, email, password, confirmPassword, touchedFields]);

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!username.trim()) errors.username = 'Username is required.';
    else if (username.trim().length < 3) errors.username = 'Username must be at least 3 characters.';
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const passErr = validatePassword(password);
    if (passErr) errors.password = passErr;
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    if (!ageVerified) errors.age = 'You must confirm you are at least 13 years old.';
    if (!termsAccepted) errors.terms = 'You must accept the Terms & Conditions.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return false;
    }
    return true;
  }

  async function handleSignUp() {
    // Mark all fields as touched
    setTouchedFields(new Set(['username', 'email', 'password', 'confirmPassword']));
    if (!validateForm()) return;

    setError('');
    setLoading(true);
    try {
      const data = await signUp(email.trim().toLowerCase(), password, username.trim());
      if (data?.user?.id) {
        await Promise.all([
          logConsent(data.user.id, 'age_verification', '1.0', 'explicit_checkbox'),
          logConsent(data.user.id, 'terms_conditions', '1.0', 'explicit_checkbox'),
          logConsent(data.user.id, 'privacy_policy', '1.0', 'click_through'),
        ]);
      }
      setSuccess(true);
    } catch (e: any) {
      const message = e.message;
      if (message.toLowerCase().includes('already') || message.toLowerCase().includes('exists')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else {
        setError(message);
      }
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
      const message = e.message;
      if (message.toLowerCase().includes('popup') || message.toLowerCase().includes('cancelled')) {
        setError('Google sign-up was cancelled. Please try again.');
      } else {
        setError(message);
      }
      setGoogleLoading(false);
    }
  }

  const markTouched = (field: string) => {
    setTouchedFields((prev) => new Set([...prev, field]));
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (error) setError('');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) setError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) setError('');
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (error) setError('');
  };

  if (success) {
    return (
      <AuthLayout>
        <AuthHeader
          title={t('auth.verify_title', 'Check your email')}
          subtitle={t('auth.verify_sent', { email, defaultValue: `We've sent a verification link to ${email}. Click it to activate your account.` })}
        />
        <Text style={styles.successHint}>
          {t('auth.verify_hint', "Didn't receive it? Check your spam folder or sign in to resend.")}
        </Text>
        <AuthButton label={t('auth.back_to_sign_in', 'Back to Sign In')} onPress={onNavigateToSignIn} variant="google" />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthHeader
        title={t('auth.sign_up_title', 'Create your account')}
        subtitle={t('auth.sign_up_subtitle', 'Start your growth journey today.')}
      />

      {error ? <AuthErrorBanner message={error} /> : null}

      <AuthInput
        label={t('auth.username', 'Username')}
        icon="👤"
        value={username}
        onChangeText={handleUsernameChange}
        onBlur={() => markTouched('username')}
        autoCapitalize="none"
        autoComplete="username-new"
        returnKeyType="next"
        onSubmitEditing={() => emailInputRef.current?.focus()}
        error={touchedFields.has('username') ? fieldErrors.username : undefined}
        editable={!loading && !googleLoading}
      />
      <AuthInput
        ref={emailInputRef}
        label={t('auth.email', 'Email address')}
        icon="✉"
        value={email}
        onChangeText={handleEmailChange}
        onBlur={() => markTouched('email')}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={() => passwordInputRef.current?.focus()}
        error={touchedFields.has('email') ? fieldErrors.email : undefined}
        editable={!loading && !googleLoading}
      />
      <AuthInput
        ref={passwordInputRef}
        label={t('auth.password', 'Password')}
        icon="🔒"
        value={password}
        onChangeText={handlePasswordChange}
        onBlur={() => markTouched('password')}
        isPassword
        autoComplete="password-new"
        returnKeyType="next"
        onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
        error={touchedFields.has('password') ? fieldErrors.password : undefined}
        editable={!loading && !googleLoading}
      />
      <PasswordStrength password={password} showRequirements={password.length > 0} />
      <AuthInput
        ref={confirmPasswordInputRef}
        label={t('auth.confirm_password', 'Confirm password')}
        icon="🔒"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        onBlur={() => markTouched('confirmPassword')}
        isPassword
        autoComplete="password-new"
        returnKeyType="done"
        onSubmitEditing={() => {
          Keyboard.dismiss();
          handleSignUp();
        }}
        error={touchedFields.has('confirmPassword') ? fieldErrors.confirmPassword : undefined}
        success={confirmPassword.length > 0 && password === confirmPassword}
        editable={!loading && !googleLoading}
      />

      <AgeVerificationCheckbox
        checked={ageVerified}
        onToggle={() => setAgeVerified(!ageVerified)}
        onLearnMore={() => {}}
      />

      <AuthCheckbox
        checked={termsAccepted}
        onToggle={() => setTermsAccepted(!termsAccepted)}
        label={
          <Text style={styles.termsText}>
            {t('auth.terms_prefix', 'I accept the')}{' '}
            <Text style={styles.termsLink}>{t('auth.terms', 'Terms & Conditions')}</Text>
            {' '}{t('auth.and', 'and')}{' '}
            <Text style={styles.termsLink}>{t('auth.privacy', 'Privacy Policy')}</Text>
          </Text>
        }
      />

      <AuthButton
        label={t('auth.create_account', 'Create Account →')}
        onPress={handleSignUp}
        loading={loading}
        loadingLabel={t('auth.creating_account', 'Creating account...')}
        disabled={googleLoading}
      />

      <AuthDivider />

      <AuthButton
        label={t('auth.sign_up_google', 'Sign up with Google')}
        onPress={handleGoogle}
        loading={googleLoading}
        loadingLabel={t('auth.connecting_google', 'Connecting...')}
        disabled={loading}
        variant="google"
        icon={<GoogleIcon />}
      />

      <AuthLink
        text={t('auth.have_account_prefix', 'Already have an account?')}
        linkText={t('auth.sign_in', 'Sign in')}
        onPress={onNavigateToSignIn}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  successHint: {
    ...authTypography.body,
    color: authColors.textMuted,
    textAlign: 'center',
    marginBottom: authSpacing.lg,
  },
  termsText: {
    ...authTypography.small,
    color: authColors.textMuted,
    lineHeight: 20,
  },
  termsLink: {
    color: authColors.primaryLight,
    fontWeight: '600',
  },
});
