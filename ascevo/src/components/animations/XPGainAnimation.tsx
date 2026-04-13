import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSequence, runOnJS, Easing,
} from 'react-native-reanimated';
import { colors, typography } from '../../theme';

interface Props {
  amount: number;
  x?: number;
  y?: number;
  onDone?: () => void;
}

export default function XPGainAnimation({ amount, x = 0, y = 0, onDone }: Props) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withTiming(1.2, { duration: 150, easing: Easing.out(Easing.back(2)) });
    translateY.value = withSequence(
      withTiming(-60, { duration: 800, easing: Easing.out(Easing.quad) }),
      withTiming(-80, { duration: 400 })
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 600 }, (finished) => {
        if (finished && onDone) runOnJS(onDone)();
      })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.text, animStyle, { left: x, top: y }]}>
      +{amount} XP
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    ...typography.bodyBold,
    color: colors.xpGold,
    fontSize: 20,
    zIndex: 999,
  },
});
