import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ProgressRing from './ProgressRing';
import { colors } from '../../theme';

/**
 * ProgressRing Component Examples
 * 
 * Demonstrates various use cases for the ProgressRing component:
 * - Basic progress ring
 * - With text content in center
 * - Different sizes and colors
 * - Animated progress updates
 * - Daily goal tracking
 */

export default function ProgressRingExamples() {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Simulate progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedProgress((prev) => {
        const next = prev + 0.1;
        return next > 1 ? 0 : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ProgressRing Examples</Text>

      {/* Example 1: Basic Progress Ring */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Basic Progress Ring (50%)</Text>
        <ProgressRing
          progress={0.5}
          size={100}
          strokeWidth={8}
          color={colors.primary}
        />
      </View>

      {/* Example 2: With Text Content */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>With Text Content</Text>
        <ProgressRing
          progress={0.75}
          size={120}
          strokeWidth={10}
          color={colors.success}
        >
          <Text style={styles.progressText}>75%</Text>
          <Text style={styles.progressLabel}>Complete</Text>
        </ProgressRing>
      </View>

      {/* Example 3: Daily Goal Tracker */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Daily Goal Tracker</Text>
        <ProgressRing
          progress={0.6}
          size={140}
          strokeWidth={12}
          color={colors.xpGold}
        >
          <Text style={styles.goalValue}>3/5</Text>
          <Text style={styles.goalLabel}>Lessons</Text>
        </ProgressRing>
      </View>

      {/* Example 4: Animated Progress */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Animated Progress</Text>
        <ProgressRing
          progress={animatedProgress}
          size={120}
          strokeWidth={10}
          color={colors.info}
          animated={true}
        >
          <Text style={styles.progressText}>
            {Math.round(animatedProgress * 100)}%
          </Text>
        </ProgressRing>
      </View>

      {/* Example 5: Different Sizes */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Different Sizes</Text>
        <View style={styles.row}>
          <ProgressRing
            progress={0.8}
            size={60}
            strokeWidth={6}
            color={colors.streakOrange}
          >
            <Text style={styles.smallText}>80%</Text>
          </ProgressRing>
          <ProgressRing
            progress={0.8}
            size={100}
            strokeWidth={8}
            color={colors.streakOrange}
          >
            <Text style={styles.progressText}>80%</Text>
          </ProgressRing>
          <ProgressRing
            progress={0.8}
            size={140}
            strokeWidth={10}
            color={colors.streakOrange}
          >
            <Text style={styles.largeText}>80%</Text>
          </ProgressRing>
        </View>
      </View>

      {/* Example 6: Different Colors */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Different Colors</Text>
        <View style={styles.row}>
          <ProgressRing
            progress={0.9}
            size={80}
            strokeWidth={8}
            color={colors.success}
          >
            <Text style={styles.smallText}>✓</Text>
          </ProgressRing>
          <ProgressRing
            progress={0.5}
            size={80}
            strokeWidth={8}
            color={colors.warning}
          >
            <Text style={styles.smallText}>⚠️</Text>
          </ProgressRing>
          <ProgressRing
            progress={0.2}
            size={80}
            strokeWidth={8}
            color={colors.error}
          >
            <Text style={styles.smallText}>!</Text>
          </ProgressRing>
        </View>
      </View>

      {/* Example 7: XP Progress */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>XP Progress to Next Level</Text>
        <ProgressRing
          progress={0.65}
          size={160}
          strokeWidth={14}
          color={colors.xpGold}
          backgroundColor="rgba(245, 158, 11, 0.15)"
        >
          <Text style={styles.xpValue}>650</Text>
          <Text style={styles.xpLabel}>/ 1000 XP</Text>
          <Text style={styles.levelLabel}>Level 5</Text>
        </ProgressRing>
      </View>

      {/* Example 8: No Animation */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Without Animation</Text>
        <ProgressRing
          progress={0.85}
          size={100}
          strokeWidth={8}
          color={colors.primary}
          animated={false}
        >
          <Text style={styles.progressText}>85%</Text>
        </ProgressRing>
      </View>

      {/* Example 9: Interactive Progress */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Interactive Progress</Text>
        <InteractiveProgressRing />
      </View>
    </View>
  );
}

/**
 * Interactive example with buttons to control progress
 */
function InteractiveProgressRing() {
  const [progress, setProgress] = useState(0.5);

  const increaseProgress = () => {
    setProgress((prev) => Math.min(prev + 0.1, 1));
  };

  const decreaseProgress = () => {
    setProgress((prev) => Math.max(prev - 0.1, 0));
  };

  const resetProgress = () => {
    setProgress(0);
  };

  return (
    <View style={styles.interactiveContainer}>
      <ProgressRing
        progress={progress}
        size={120}
        strokeWidth={10}
        color={colors.primary}
      >
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}%
        </Text>
      </ProgressRing>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={decreaseProgress}
        >
          <Text style={styles.buttonText}>-10%</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={resetProgress}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={increaseProgress}
        >
          <Text style={styles.buttonText}>+10%</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  example: {
    marginBottom: 32,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 16,
  },
  progressText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
  },
  goalValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  smallText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  largeText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  xpValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.xpGold,
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 8,
  },
  interactiveContainer: {
    alignItems: 'center',
    gap: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
