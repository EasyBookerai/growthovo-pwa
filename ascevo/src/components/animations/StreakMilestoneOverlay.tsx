import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay, withSequence, withRepeat,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../theme';

interface Props {
  days: number;
  xpBonus: number;
  rexMessage?: string;
  onClose: () => void;
}

export default function StreakMilestoneOverlay({ days, xpBonus, rexMessage, onClose }: Props) {
  const scale = useSharedValue(0);
  const fireScale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(100, withSpring(1, { damping: 10, stiffness: 180 }));
    fireScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      true
    );
  }, []);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const fireStyle = useAnimatedStyle(() => ({ transform: [{ scale: fireScale.value }] }));

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Animated.Text style={[styles.fireEmoji, fireStyle]}>🔥</Animated.Text>
        <Text style={styles.milestoneLabel}>{days}-DAY STREAK</Text>
        <Text style={styles.congrats}>You're on fire.</Text>
        {xpBonus > 0 && <Text style={styles.xpBonus}>+{xpBonus} XP</Text>}
        {rexMessage ? (
          <View style={styles.rexCard}>
            <Text style={styles.rexLabel}>Rex says:</Text>
            <Text style={styles.rexMessage}>{rexMessage}</Text>
          </View>
        ) : null}
        <TouchableOpacity style={styles.btn} onPress={onClose} accessibilityRole="button">
          <Text style={styles.btnText}>Keep the streak alive →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000CC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', gap: spacing.md,
    borderWidth: 2, borderColor: colors.streakOrange, width: '85%',
  },
  fireEmoji: { fontSize: 72 },
  milestoneLabel: { ...typography.caption, color: colors.streakOrange, letterSpacing: 4 },
  congrats: { ...typography.h2, color: colors.text },
  xpBonus: { ...typography.bodyBold, color: colors.xpGold, fontSize: 20 },
  rexCard: {
    backgroundColor: colors.surfaceElevated, borderRadius: radius.md,
    padding: spacing.md, width: '100%',
  },
  rexLabel: { ...typography.caption, color: colors.primary, marginBottom: 4 },
  rexMessage: { ...typography.body, color: colors.text },
  btn: {
    backgroundColor: colors.streakOrange, borderRadius: radius.md,
    padding: spacing.md, paddingHorizontal: spacing.xl,
  },
  btnText: { color: '#fff', ...typography.bodyBold },
});
