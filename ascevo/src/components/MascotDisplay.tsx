/**
 * MascotDisplay Component
 * 
 * Dynamically renders the mascot based on user's current stage
 * Uses individual PNG images for each evolution stage
 */

import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Platform } from 'react-native';
import {
  MascotStage,
  MascotDisplayProps,
} from '../types/mascot';

// Individual mascot stage images
const MASCOT_IMAGES = {
  [MascotStage.EGG]: require('../../assets/images/mascot_stage_1.png'),
  [MascotStage.HATCHLING]: require('../../assets/images/mascot_stage_2.png'),
  [MascotStage.JUVENILE]: require('../../assets/images/mascot_stage_3.png'),
  [MascotStage.MASTER]: require('../../assets/images/mascot_stage_4.png'),
};

export const MascotDisplay: React.FC<MascotDisplayProps> = ({
  stage,
  size = 200,
  animated = false,
  showGlow = false,
  style,
}) => {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Glow animation effect
  useEffect(() => {
    if (showGlow) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [showGlow, glowAnim]);

  // Pop-in animation for stage changes
  useEffect(() => {
    if (animated) {
      scaleAnim.setValue(0.5);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [stage, animated, scaleAnim]);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Glow effect behind mascot */}
      {showGlow && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: size * 1.4,
              height: size * 1.4,
              borderRadius: size * 0.7,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7],
              }),
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            },
          ]}
        />
      )}

      {/* Mascot image */}
      <Animated.View
        style={[
          styles.mascotWrapper,
          {
            width: size,
            height: size,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={MASCOT_IMAGES[stage]}
          style={[
            styles.mascotImage,
            {
              width: size,
              height: size,
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 0 40px rgba(255, 215, 0, 0.8)',
      },
    }),
  },
  mascotWrapper: {
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    // Image will be displayed at specified size
  },
});

export default MascotDisplay;
