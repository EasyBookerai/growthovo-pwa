// 📚 Example Usage of useSpringAnimation Hook
// This file demonstrates how to use the useSpringAnimation hook in real components

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSpringAnimation } from '../useSpringAnimation';

/**
 * Example 1: Simple Scale Animation
 * Demonstrates basic usage with scale transform
 */
export function ScaleAnimationExample() {
  const { value, start, reset } = useSpringAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: value.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Text style={styles.text}>Tap to Scale</Text>
      </Animated.View>
      
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => start(1.5)}
        >
          <Text>Scale Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => reset()}
        >
          <Text>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Example 2: Opacity Animation
 * Demonstrates using the hook for fade effects
 */
export function OpacityAnimationExample() {
  const { value, start, reset } = useSpringAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: value.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Text style={styles.text}>Fade Animation</Text>
      </Animated.View>
      
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => start(1)}
        >
          <Text>Fade In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => reset()}
        >
          <Text>Fade Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Example 3: Custom Spring Configuration
 * Demonstrates using bouncy spring physics
 */
export function BouncyAnimationExample() {
  const { value, start, reset } = useSpringAnimation({
    damping: 10,
    stiffness: 100,
    overshootClamping: false,
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: value.value },
      { rotate: `${value.value * 360}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Text style={styles.text}>Bouncy!</Text>
      </Animated.View>
      
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => start(1.2)}
        >
          <Text>Bounce</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => reset()}
        >
          <Text>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Example 4: Multiple Animations
 * Demonstrates using multiple hooks for complex animations
 */
export function MultipleAnimationsExample() {
  const scale = useSpringAnimation();
  const opacity = useSpringAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value.value }],
    opacity: opacity.value.value,
  }));

  const handlePress = () => {
    scale.start(1.3);
    opacity.start(1);
  };

  const handleReset = () => {
    scale.reset();
    opacity.reset();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Text style={styles.text}>Multi-Animation</Text>
      </Animated.View>
      
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handlePress}
        >
          <Text>Animate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleReset}
        >
          <Text>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  box: {
    width: 150,
    height: 150,
    backgroundColor: '#6366f1',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});
