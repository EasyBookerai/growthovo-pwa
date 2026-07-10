import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, typography, spacing, radius } from '../theme';
import { launchConfetti, triggerHaptic } from '../services/webThemeService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  visible: boolean;
  level: number;
  perks: string[];
  onClose: () => void;
}

/**
 * Full-screen level up celebration modal
 * Major dopamine hit with confetti, haptics, and perk unlocks
 * 
 * Triggers when user levels up after XP gain
 */
export default function LevelUpModal({ visible, level, perks, onClose }: Props) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      triggerHaptic('success');
      launchConfetti();

      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.timing(sparkleRotate, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      scale.setValue(0);
      opacity.setValue(0);
    }
  }, [visible]);

  const rotation = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
          {/* Sparkles */}
          <Animated.Text style={[styles.sparkle, styles.sparkleTopLeft, { transform: [{ rotate: rotation }] }]}>
            ✨
          </Animated.Text>
          <Animated.Text style={[styles.sparkle, styles.sparkleTopRight, { transform: [{ rotate: rotation }] }]}>
            ✨
          </Animated.Text>
          <Animated.Text style={[styles.sparkle, styles.sparkleBottomLeft, { transform: [{ rotate: rotation }] }]}>
            🎊
          </Animated.Text>
          <Animated.Text style={[styles.sparkle, styles.sparkleBottomRight, { transform: [{ rotate: rotation }] }]}>
            🎉
          </Animated.Text>

          {/* Main Content */}
          <Text style={styles.title}>LEVEL UP!</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{level}</Text>
          </View>
          
          <Text style={styles.subtitle}>You're on fire! 🔥</Text>

          {perks.length > 0 && (
            <View style={styles.perksContainer}>
              <Text style={styles.perksTitle}>New Perks Unlocked:</Text>
              {perks.map((perk, index) => (
                <View key={index} style={styles.perkRow}>
                  <Text style={styles.perkBullet}>•</Text>
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              triggerHaptic('light');
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="Close level up modal"
          >
            <Text style={styles.buttonText}>Continue Growing →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 32,
  },
  sparkleTopLeft: {
    top: -10,
    left: -10,
  },
  sparkleTopRight: {
    top: -10,
    right: -10,
  },
  sparkleBottomLeft: {
    bottom: -10,
    left: -10,
  },
  sparkleBottomRight: {
    bottom: -10,
    right: -10,
  },
  title: {
    ...typography.h1,
    fontSize: 36,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    letterSpacing: 2,
  },
  levelBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 4,
    borderColor: colors.text,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  levelNumber: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  perksContainer: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  perksTitle: {
    ...typography.bodyBold,
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  perkBullet: {
    ...typography.body,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  perkText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 16,
  },
});
