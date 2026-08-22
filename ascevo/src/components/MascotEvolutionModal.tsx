/**
 * MascotEvolutionModal Component
 * 
 * Full-screen celebration modal that shows when mascot evolves
 * Includes animations, particles, and haptic feedback
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MascotStage, MASCOT_STAGE_NAMES } from '../types/mascot';
import { MascotDisplay } from './MascotDisplay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MascotEvolutionModalProps {
  visible: boolean;
  fromStage: MascotStage;
  toStage: MascotStage;
  newLevel: number;
  onClose: () => void;
}

export const MascotEvolutionModal: React.FC<MascotEvolutionModalProps> = ({
  visible,
  fromStage,
  toStage,
  newLevel,
  onClose,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const [showNewStage, setShowNewStage] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Generate particles for celebration effect
  const generateParticles = () => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
    }));
    setParticles(newParticles);
  };

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Generate particles
      generateParticles();

      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Show evolution transition
      setTimeout(() => {
        setShowNewStage(true);
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      }, 1000);

      // Auto-close after celebration
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setShowNewStage(false);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Particle effects */}
        {particles.map((particle) => (
          <Particle key={particle.id} x={particle.x} y={particle.y} />
        ))}

        {/* Main content */}
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Evolution!</Text>

          {/* Stage transition */}
          <View style={styles.evolutionContainer}>
            <View style={styles.stageBox}>
              <MascotDisplay stage={fromStage} size={120} animated={false} />
              <Text style={styles.stageName}>
                {MASCOT_STAGE_NAMES[fromStage]}
              </Text>
            </View>

            <Text style={styles.arrow}>→</Text>

            <View style={styles.stageBox}>
              <MascotDisplay
                stage={toStage}
                size={140}
                animated={showNewStage}
                showGlow={showNewStage}
              />
              <Text style={styles.stageName}>
                {MASCOT_STAGE_NAMES[toStage]}
              </Text>
            </View>
          </View>

          <Text style={styles.levelText}>Level {newLevel} Reached!</Text>
          <Text style={styles.subtitle}>
            Your Growthovo has evolved! 🎉
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Particle component for celebration effect
const Particle: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          top: y,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH * 0.9,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 24,
    textAlign: 'center',
  },
  evolutionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 24,
    width: '100%',
  },
  stageBox: {
    alignItems: 'center',
  },
  stageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  arrow: {
    fontSize: 40,
    color: '#FFD700',
    marginHorizontal: 16,
  },
  levelText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
});

export default MascotEvolutionModal;
