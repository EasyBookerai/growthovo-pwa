/**
 * Daily Challenge Integration Example
 * 
 * This example demonstrates how to integrate the DailyChallengeCard
 * with the challenge completion logic in a pillar detail view.
 * 
 * Key features:
 * - Load challenge completion status from localStorage
 * - Handle "Start Challenge" button press
 * - Award 30 XP via awardXP function
 * - Update UI to show "✓ Completed" state
 * - Implement daily reset check
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import DailyChallengeCard from '../components/DailyChallengeCard';
import {
  completeDailyChallenge,
  isChallengeCompletedToday,
} from '../services/pillarChallengeService';
import { loadPillarProgress } from '../services/pillarStorageService';
import type { PremiumPillarKey } from '../types/pillars';

interface Props {
  pillarKey: PremiumPillarKey;
}

export default function DailyChallengeIntegrationExample({ pillarKey }: Props) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load challenge status and progress on mount
  useEffect(() => {
    loadChallengeStatus();
  }, [pillarKey]);

  async function loadChallengeStatus() {
    try {
      setLoading(true);
      setError(null);

      // Load pillar progress
      const progress = await loadPillarProgress(pillarKey);
      setXp(progress.xp);
      setLevel(progress.level);

      // Check if challenge is completed today
      const completed = await isChallengeCompletedToday(pillarKey);
      setIsCompleted(completed);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load challenge status:', err);
      setError('Failed to load challenge status');
      setLoading(false);
    }
  }

  async function handleChallengeComplete() {
    try {
      setError(null);

      // Complete the challenge (awards 30 XP)
      await completeDailyChallenge(pillarKey);

      // Update UI state
      setIsCompleted(true);

      // Reload progress to get updated XP and level
      const progress = await loadPillarProgress(pillarKey);
      setXp(progress.xp);
      setLevel(progress.level);

      console.log(`✅ Challenge completed! +30 XP (Total: ${progress.xp} XP, Level ${progress.level})`);
    } catch (err: any) {
      console.error('Failed to complete challenge:', err);
      
      if (err.message === 'Challenge already completed today') {
        setError('You\'ve already completed this challenge today!');
        setIsCompleted(true);
      } else {
        setError('Failed to complete challenge. Please try again.');
      }
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Daily Challenge Integration Example</Text>
      <Text style={styles.subtitle}>Pillar: {pillarKey}</Text>

      {/* Progress Display */}
      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Current Progress</Text>
        <Text style={styles.progressValue}>Level {level}</Text>
        <Text style={styles.progressXP}>{xp} XP</Text>
      </View>

      {/* Daily Challenge Card */}
      <DailyChallengeCard
        pillarKey={pillarKey}
        isCompleted={isCompleted}
        onComplete={handleChallengeComplete}
      />

      {/* Error Display */}
      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>How it works:</Text>
        <Text style={styles.instructionsText}>
          1. Tap "Start Challenge →" to complete the daily challenge
        </Text>
        <Text style={styles.instructionsText}>
          2. You'll earn 30 XP immediately
        </Text>
        <Text style={styles.instructionsText}>
          3. The challenge resets at midnight
        </Text>
        <Text style={styles.instructionsText}>
          4. You can only complete each challenge once per day
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A12',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 40,
  },
  progressCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 4,
  },
  progressXP: {
    fontSize: 16,
    color: '#34D399',
  },
  errorCard: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  instructionsCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 8,
  },
});
