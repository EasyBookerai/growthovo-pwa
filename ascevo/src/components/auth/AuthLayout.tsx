import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authColors, authSpacing, authRadius } from '../../theme/authTokens';

interface AuthLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthLayout({ children, footer }: AuthLayoutProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const prefersReducedMotion =
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const cardMaxWidth = Math.min(width - authSpacing.lg * 2, 440);
  const webBgStyle = Platform.OS === 'web'
    ? ({
        backgroundImage: [
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124, 58, 237, 0.35) 0%, transparent 60%)',
          'radial-gradient(ellipse 60% 50% at 100% 100%, rgba(91, 33, 182, 0.2) 0%, transparent 50%)',
          'radial-gradient(ellipse 50% 40% at 0% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
          `linear-gradient(165deg, ${authColors.background} 0%, ${authColors.backgroundMid} 50%, #0D0820 100%)`,
        ].join(', '),
      } as any)
    : {};

  return (
    <View style={[styles.root, webBgStyle]}>
      {/* Ambient glow orbs — native fallback */}
      {Platform.OS !== 'web' && (
        <>
          <View style={styles.glowTop} />
          <View style={styles.glowBottom} />
        </>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: Math.max(insets.top, authSpacing.lg),
              paddingBottom: Math.max(insets.bottom, authSpacing.lg),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.card,
              { maxWidth: cardMaxWidth, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              Platform.OS === 'web' && styles.cardWeb,
            ]}
          >
            {children}
          </Animated.View>
          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: authSpacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: authColors.surface,
    borderRadius: authRadius.xl,
    borderWidth: 1,
    borderColor: authColors.surfaceBorder,
    padding: authSpacing.lg,
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' } as any
      : {}),
  },
  cardWeb: {
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255,255,255,0.04)',
  },
  glowTop: {
    position: 'absolute',
    top: -80,
    left: '20%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: authColors.backgroundGlow,
    opacity: 0.6,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(91, 33, 182, 0.12)',
  },
});
