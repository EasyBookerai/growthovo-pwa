/**
 * AppContext Synchronization Integration Example
 * 
 * This example demonstrates how to integrate AppContext synchronization
 * with the Premium Pillars Experience to ensure XP earned in Pillars
 * updates the Home screen stats.
 * 
 * Requirements: 17.1, 17.3
 * 
 * Key Concepts:
 * - Import useAppContext hook to access updateXP function
 * - Pass updateXP as callback to completeLesson and completeDailyChallenge
 * - XP changes propagate to AppContext automatically
 * - Error handling with fallback to localStorage
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { completeLesson } from '../services/pillarLessonService';
import { completeDailyChallenge } from '../services/pillarChallengeService';
import type { PremiumPillarKey } from '../types/pillars';

/**
 * Example component showing AppContext integration
 */
export default function AppContextSyncExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Get updateXP function from AppContext
  const { updateXP, xp, level } = useAppContext();

  /**
   * Handle lesson completion with AppContext sync
   * 
   * This demonstrates the correct pattern for integrating
   * lesson completion with AppContext synchronization.
   */
  const handleLessonComplete = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const pillarKey: PremiumPillarKey = 'mental-health';
      const lessonId = 'mental-health-lesson-1';

      // Complete lesson and pass updateXP callback for AppContext sync
      // The completeLesson function will:
      // 1. Save to localStorage
      // 2. Award 50 XP locally
      // 3. Call updateXP to sync with AppContext
      // 4. AppContext will update Supabase
      await completeLesson(pillarKey, lessonId, updateXP);

      setMessage('✅ Lesson completed! +50 XP');
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      setMessage('❌ Failed to complete lesson');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle daily challenge completion with AppContext sync
   * 
   * This demonstrates the correct pattern for integrating
   * challenge completion with AppContext synchronization.
   */
  const handleChallengeComplete = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const pillarKey: PremiumPillarKey = 'mental-health';

      // Complete challenge and pass updateXP callback for AppContext sync
      // The completeDailyChallenge function will:
      // 1. Save to localStorage
      // 2. Award 30 XP locally
      // 3. Call updateXP to sync with AppContext
      // 4. AppContext will update Supabase
      await completeDailyChallenge(pillarKey, updateXP);

      setMessage('✅ Challenge completed! +30 XP');
    } catch (error) {
      console.error('Failed to complete challenge:', error);
      setMessage('❌ Failed to complete challenge');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AppContext Sync Example</Text>
      
      {/* Display current XP and level from AppContext */}
      <View style={styles.statsContainer}>
        <Text style={styles.stat}>XP: {xp}</Text>
        <Text style={styles.stat}>Level: {level}</Text>
      </View>

      {/* Lesson completion button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLessonComplete}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Completing...' : 'Complete Lesson (+50 XP)'}
        </Text>
      </TouchableOpacity>

      {/* Challenge completion button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleChallengeComplete}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Completing...' : 'Complete Challenge (+30 XP)'}
        </Text>
      </TouchableOpacity>

      {/* Status message */}
      {message && <Text style={styles.message}>{message}</Text>}

      {/* Integration notes */}
      <View style={styles.notesContainer}>
        <Text style={styles.notesTitle}>Integration Notes:</Text>
        <Text style={styles.note}>
          1. Import useAppContext hook
        </Text>
        <Text style={styles.note}>
          2. Extract updateXP function
        </Text>
        <Text style={styles.note}>
          3. Pass updateXP to completeLesson/completeDailyChallenge
        </Text>
        <Text style={styles.note}>
          4. XP changes propagate to AppContext automatically
        </Text>
        <Text style={styles.note}>
          5. Home screen stats update in real-time
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0A0A12',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
  },
  stat: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#7C3AED',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    color: '#34D399',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  notesContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#7C3AED',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  note: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 5,
  },
});
