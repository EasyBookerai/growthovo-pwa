import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { authColors, authSpacing, authRadius, authTypography } from '../../theme/authTokens';

interface AuthErrorBannerProps {
  message: string;
}

export default function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const prefersReducedMotion =
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    Animated.sequence([
      Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 4, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [message, shake]);

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateX: shake }] }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: authColors.errorBg,
    borderRadius: authRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    padding: authSpacing.md,
    marginBottom: authSpacing.md,
  },
  text: {
    ...authTypography.small,
    color: authColors.error,
    textAlign: 'center',
  },
});
