import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { handleOAuthCallback } from '../../services/authService';
import { authColors, authSpacing, authTypography } from '../../theme/authTokens';
import AuthLayout from '../../components/auth/AuthLayout';

interface Props {
  onComplete: () => void;
  onError: (message: string) => void;
}

export default function AuthCallbackScreen({ onComplete, onError }: Props) {
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    let mounted = true;

    async function processCallback() {
      try {
        await handleOAuthCallback();
        if (mounted) {
          setMessage('Success! Redirecting...');
          setTimeout(onComplete, 500);
        }
      } catch (e: any) {
        if (mounted) onError(e.message ?? 'Authentication failed.');
      }
    }

    processCallback();
    return () => { mounted = false; };
  }, [onComplete, onError]);

  return (
    <AuthLayout>
      <View style={styles.center}>
        <ActivityIndicator color={authColors.primaryLight} size="large" />
        <Text style={styles.text}>{message}</Text>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    paddingVertical: authSpacing.xxl,
  },
  text: {
    ...authTypography.body,
    color: authColors.textMuted,
    marginTop: authSpacing.md,
    textAlign: 'center',
  },
});
