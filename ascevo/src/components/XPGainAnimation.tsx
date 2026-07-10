import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors, typography } from '../theme';

interface Props {
  amount: number;
  x: number;
  y: number;
  onComplete?: () => void;
}

/**
 * Floating XP gain animation
 * Triggers on every XP-earning action for instant gratification
 * 
 * Usage:
 * <XPGainAnimation amount={25} x={100} y={200} onComplete={() => setShow(false)} />
 */
export default function XPGainAnimation({ amount, x, y, onComplete }: Props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -60,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1.2,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x,
          top: y,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Text style={styles.text}>+{amount} XP ✨</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9999,
  },
  text: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
