import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  type PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { colors, typography, spacing, radius } from '../../theme';
import { getOrGenerateWrapped } from '../../services/wrappedService';
import type { WrappedSummary } from '../../types';
import {
  GrowthOverviewScreen,
  StreakCalendarScreen,
  StrongestPillarScreen,
  WeakestPillarScreen,
  GlobalRankScreen,
  RexVerdictScreen,
  WrappedShareCardScreen,
} from './WrappedScreens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_SCREENS = 7;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface Props {
  userId: string;
  period: string;
  onClose: () => void;
}

export default function WrappedNavigator({ userId, period, onClose }: Props) {
  const [summary, setSummary] = useState<WrappedSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const translateX = useSharedValue(0);
  const gestureActive = useRef(false);

  // ─── Fetch data on mount ────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getOrGenerateWrapped(userId, period)
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load Wrapped');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, period]);

  // ─── Navigation helpers ─────────────────────────────────────────────────────

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_SCREENS - 1, index));
    setCurrentIndex(clamped);
    translateX.value = withSpring(-clamped * SCREEN_WIDTH, {
      damping: 20,
      stiffness: 200,
    });
  };

  // ─── Gesture handler ────────────────────────────────────────────────────────

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    'worklet';
    if (!gestureActive.current) return;
    const base = -currentIndex * SCREEN_WIDTH;
    translateX.value = base + event.nativeEvent.translationX;
  };

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    const { state, translationX, velocityX } = event.nativeEvent;
    // State 4 = ACTIVE, State 5 = END
    if (state === 4) {
      gestureActive.current = true;
    } else if (state === 5) {
      gestureActive.current = false;
      const shouldGoNext =
        translationX < -SWIPE_THRESHOLD || velocityX < -500;
      const shouldGoPrev =
        translationX > SWIPE_THRESHOLD || velocityX > 500;

      if (shouldGoNext && currentIndex < TOTAL_SCREENS - 1) {
        runOnJS(goTo)(currentIndex + 1);
      } else if (shouldGoPrev && currentIndex > 0) {
        runOnJS(goTo)(currentIndex - 1);
      } else {
        // Snap back
        translateX.value = withSpring(-currentIndex * SCREEN_WIDTH, {
          damping: 20,
          stiffness: 200,
        });
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // ─── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Generating your Wrapped...</Text>
      </View>
    );
  }

  // ─── Error state ────────────────────────────────────────────────────────────

  if (error || !summary) {
    return (
      <View style={styles.loadingContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.errorText}>
          {error ?? 'Something went wrong. Please try again.'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onClose}>
          <Text style={styles.retryButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { dataJson, rexVerdict } = summary;

  // ─── Screens ────────────────────────────────────────────────────────────────

  const screens = [
    <GrowthOverviewScreen key="growth" data={dataJson} />,
    <StreakCalendarScreen key="streak" data={dataJson} />,
    <StrongestPillarScreen key="strongest" data={dataJson} />,
    <WeakestPillarScreen key="weakest" data={dataJson} />,
    <GlobalRankScreen key="rank" data={dataJson} />,
    <RexVerdictScreen key="rex" data={dataJson} rexVerdict={rexVerdict} />,
    <WrappedShareCardScreen key="share" data={dataJson} period={period} rexVerdict={rexVerdict} />,
  ];

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close Wrapped"
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      {/* Swipeable screens */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-20, 20]}
      >
        <Animated.View style={[styles.screensContainer, animatedStyle]}>
          {screens.map((screen, i) => (
            <View key={i} style={styles.screenSlot}>
              {screen}
            </View>
          ))}
        </Animated.View>
      </PanGestureHandler>

      {/* Dot indicator */}
      <View style={styles.dotsContainer} pointerEvents="none">
        {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  closeButton: {
    position: 'absolute',
    top: 52,
    right: spacing.lg,
    zIndex: 100,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  screensContainer: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * TOTAL_SCREENS,
    flex: 1,
  },
  screenSlot: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: colors.text,
    width: 18,
  },
});
