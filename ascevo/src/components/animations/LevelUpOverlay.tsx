import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../theme';

interface Props {
  pillarName: string;
  pillarIcon: string;
  newLevel: number;
  pillarColour: string;
  xpBonus: number;
  onClose: () => void;
}

export default function LevelUpOverlay({ pillarName, pillarIcon, newLevel, pillarColour, xpBonus, onClose }: Props) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 200 }));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.card, { borderColor: pillarColour }, containerStyle]}>
        <Text style={styles.levelUpLabel}>LEVEL UP!</Text>
        <Text style={styles.icon}>{pillarIcon}</Text>
        <Text style={[styles.pillarName, { color: pillarColour }]}>{pillarName}</Text>
        <Text style={styles.level}>Level {newLevel}</Text>
        {xpBonus > 0 && <Text style={styles.xpBonus}>+{xpBonus} XP bonus</Text>}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: pillarColour }]}
          onPress={onClose}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>Keep going →</Text>
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
    borderWidth: 2, width: '80%',
  },
  levelUpLabel: { ...typography.caption, color: colors.xpGold, letterSpacing: 4 },
  icon: { fontSize: 64 },
  pillarName: { ...typography.h2 },
  level: { ...typography.h1, color: colors.text },
  xpBonus: { ...typography.bodyBold, color: colors.xpGold },
  btn: { borderRadius: radius.md, padding: spacing.md, paddingHorizontal: spacing.xl },
  btnText: { color: '#fff', ...typography.bodyBold },
});
