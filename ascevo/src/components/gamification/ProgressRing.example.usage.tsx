/**
 * ProgressRing Usage Examples with Progress Visualization Utilities
 * 
 * This file demonstrates how to use the ProgressRing component with
 * the progress visualization utilities for color mapping and completion animations.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressRing from './ProgressRing';
import {
  getProgressColor,
  shouldTriggerCompletionAnimation,
  normalizeProgress,
} from '../../utils/progressVisualization';
import { colors } from '../../theme';

/**
 * Example 1: Basic Progress Ring with Dynamic Color
 * Color changes based on progress level (low, medium, high, complete)
 */
export function DynamicColorProgressRing() {
  const [progress, setProgress] = useState(0);
  
  // Convert 0-1 range to 0-100 for color mapping
  const progressPercentage = progress * 100;
  const color = getProgressColor(progressPercentage);
  
  return (
    <View style={styles.container}>
      <ProgressRing
        progress={progress}
        size={120}
        strokeWidth={12}
        color={color}
      >
        <Text style={styles.percentageText}>{Math.round(progressPercentage)}%</Text>
      </ProgressRing>
    </View>
  );
}

/**
 * Example 2: Progress Ring with Completion Animation
 * Triggers celebration when progress reaches 100%
 */
export function CompletionAnimationProgressRing() {
  const [progress, setProgress] = useState(0);
  const [previousProgress, setPreviousProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  useEffect(() => {
    const progressPercentage = progress * 100;
    const previousPercentage = previousProgress * 100;
    
    // Check if completion animation should trigger
    if (shouldTriggerCompletionAnimation(previousPercentage, progressPercentage)) {
      setShowCelebration(true);
      // Hide celebration after 2 seconds
      setTimeout(() => setShowCelebration(false), 2000);
    }
    
    setPreviousProgress(progress);
  }, [progress]);
  
  const progressPercentage = progress * 100;
  const color = getProgressColor(progressPercentage);
  
  return (
    <View style={styles.container}>
      <ProgressRing
        progress={progress}
        size={120}
        strokeWidth={12}
        color={color}
      >
        <Text style={styles.percentageText}>{Math.round(progressPercentage)}%</Text>
      </ProgressRing>
      
      {showCelebration && (
        <View style={styles.celebration}>
          <Text style={styles.celebrationText}>🎉 Complete!</Text>
        </View>
      )}
    </View>
  );
}

/**
 * Example 3: Daily Goal Progress with Color Levels
 * Shows different colors for different progress levels
 */
export function DailyGoalProgress({ currentValue, targetValue }: { currentValue: number; targetValue: number }) {
  // Calculate progress and normalize to 0-100 range
  const rawProgress = (currentValue / targetValue) * 100;
  const progress = normalizeProgress(rawProgress);
  
  // Get color based on progress level
  const color = getProgressColor(progress);
  
  // Determine progress level text
  let levelText = 'Just Started';
  if (progress >= 100) {
    levelText = 'Complete!';
  } else if (progress >= 50) {
    levelText = 'Almost There!';
  } else if (progress >= 25) {
    levelText = 'Making Progress';
  }
  
  return (
    <View style={styles.container}>
      <ProgressRing
        progress={progress / 100} // Convert back to 0-1 range
        size={100}
        strokeWidth={10}
        color={color}
      >
        <View style={styles.goalContent}>
          <Text style={styles.goalValue}>{currentValue}</Text>
          <Text style={styles.goalTarget}>/ {targetValue}</Text>
        </View>
      </ProgressRing>
      
      <Text style={[styles.levelText, { color }]}>{levelText}</Text>
    </View>
  );
}

/**
 * Example 4: Multiple Progress Rings with Different Levels
 * Demonstrates all four color levels
 */
export function MultiLevelProgressDisplay() {
  const progressLevels = [
    { label: 'Low', progress: 15, description: '0-24%' },
    { label: 'Medium', progress: 35, description: '25-49%' },
    { label: 'High', progress: 75, description: '50-99%' },
    { label: 'Complete', progress: 100, description: '100%' },
  ];
  
  return (
    <View style={styles.multiContainer}>
      {progressLevels.map((level) => {
        const color = getProgressColor(level.progress);
        
        return (
          <View key={level.label} style={styles.levelItem}>
            <ProgressRing
              progress={level.progress / 100}
              size={80}
              strokeWidth={8}
              color={color}
            >
              <Text style={styles.smallPercentage}>{level.progress}%</Text>
            </ProgressRing>
            
            <Text style={styles.levelLabel}>{level.label}</Text>
            <Text style={styles.levelDescription}>{level.description}</Text>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Example 5: Animated Progress with Color Transitions
 * Simulates progress increasing over time with color changes
 */
export function AnimatedProgressDemo() {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const startAnimation = () => {
    setIsAnimating(true);
    setProgress(0);
    
    // Animate progress from 0 to 100 over 5 seconds
    const duration = 5000;
    const steps = 100;
    const interval = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setProgress(currentStep);
      
      if (currentStep >= 100) {
        clearInterval(timer);
        setIsAnimating(false);
      }
    }, interval);
  };
  
  const color = getProgressColor(progress);
  
  return (
    <View style={styles.container}>
      <ProgressRing
        progress={progress / 100}
        size={140}
        strokeWidth={14}
        color={color}
      >
        <View style={styles.animatedContent}>
          <Text style={styles.largePercentage}>{progress}%</Text>
          <Text style={styles.colorLabel}>
            {progress < 25 ? 'Low' : progress < 50 ? 'Medium' : progress < 100 ? 'High' : 'Complete'}
          </Text>
        </View>
      </ProgressRing>
      
      {!isAnimating && (
        <Text style={styles.startButton} onPress={startAnimation}>
          Start Animation
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  multiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20,
  },
  levelItem: {
    alignItems: 'center',
    margin: 10,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  smallPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  largePercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  goalContent: {
    alignItems: 'center',
  },
  goalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  goalTarget: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  levelText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  levelLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  levelDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  celebration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  celebrationText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.success,
  },
  animatedContent: {
    alignItems: 'center',
  },
  colorLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  startButton: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
