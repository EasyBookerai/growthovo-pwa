import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../theme';

interface Props {
  days: number;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

/**
 * Animated streak flame component
 * Visual reminder of progress - triggers dopamine through consistency rewards
 * 
 * Size variants:
 * - small: Home screen badge (24px)
 * - medium: Profile header (32px)  
 * - large: Streak milestone celebration (48px)
 */
export default function StreakFlame({ days, size = 'medium', animated = true }: Props) {
  const flicker = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Flame flicker animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(flicker, {
            toValue: 1.15,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(flicker, {
            toValue: 0.95,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(flicker, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow pulse for milestones
      if (days % 7 === 0 && days > 0) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glow, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glow, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  }, [animated, days]);

  const sizeMap = {
    small: { fontSize: 24, containerSize: 40 },
    medium: { fontSize: 32, containerSize: 56 },
    large: { fontSize: 48, containerSize: 80 },
  };

  const { fontSize, containerSize } = sizeMap[size];

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  // Color changes based on streak length
  const getFlameColor = () => {
    if (days >= 30) return '#FF4500'; // Legendary orange-red
    if (days >= 14) return '#FF6347'; // Epic tomato
    if (days >= 7) return '#FF8C00'; // Rare dark orange
    return '#FFA500'; // Common orange
  };

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      {/* Glow effect for milestones */}
      {days % 7 === 0 && days > 0 && (
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowOpacity,
              backgroundColor: getFlameColor(),
            },
          ]}
        />
      )}

      {/* Flame */}
      <Animated.Text
        style={[
          styles.flame,
          {
            fontSize,
            transform: [{ scale: flicker }],
          },
        ]}
      >
        🔥
      </Animated.Text>

      {/* Streak count */}
      <View style={[styles.badge, { borderColor: getFlameColor() }]}>
        <Text style={[styles.count, { color: getFlameColor() }]}>{days}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    borderRadius: 999,
    opacity: 0.4,
  },
  flame: {
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.background,
    borderRadius: 999,
    borderWidth: 2,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  count: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
  },
});
