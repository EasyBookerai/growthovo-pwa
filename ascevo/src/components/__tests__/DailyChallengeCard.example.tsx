/**
 * DailyChallengeCard Visual Example
 * 
 * This file demonstrates the DailyChallengeCard component in both states:
 * - Not completed (with "Start Challenge →" button)
 * - Completed (with "✓ Completed" text)
 * 
 * This is for documentation and visual testing purposes.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import DailyChallengeCard from '../DailyChallengeCard';
import type { PremiumPillarKey } from '../../types/pillars';

/**
 * Example component showing DailyChallengeCard in different states
 */
export default function DailyChallengeCardExample() {
  const [completedStates, setCompletedStates] = useState<Record<PremiumPillarKey, boolean>>({
    'mental-health': false,
    'relationships': false,
    'career': false,
    'fitness': false,
    'finance': false,
    'hobbies': false,
  });

  const handleComplete = (pillarKey: PremiumPillarKey) => {
    setCompletedStates((prev) => ({
      ...prev,
      [pillarKey]: true,
    }));
  };

  const pillars: Array<{ key: PremiumPillarKey; name: string }> = [
    { key: 'mental-health', name: 'Mental Health' },
    { key: 'relationships', name: 'Relationships' },
    { key: 'career', name: 'Career' },
    { key: 'fitness', name: 'Fitness' },
    { key: 'finance', name: 'Finance' },
    { key: 'hobbies', name: 'Hobbies' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>DailyChallengeCard Examples</Text>
      <Text style={styles.subtitle}>Tap "Start Challenge" to see the completed state</Text>

      {pillars.map(({ key, name }) => (
        <View key={key} style={styles.exampleSection}>
          <Text style={styles.pillarName}>{name}</Text>
          <DailyChallengeCard
            pillarKey={key}
            isCompleted={completedStates[key]}
            onComplete={() => handleComplete(key)}
          />
        </View>
      ))}

      <View style={styles.specSection}>
        <Text style={styles.specTitle}>Component Specifications:</Text>
        <Text style={styles.specText}>• Teal border: 2px, #34D399</Text>
        <Text style={styles.specText}>• Title: "Daily Challenge" in bold 16px</Text>
        <Text style={styles.specText}>• XP Badge: "+30 XP" with teal background</Text>
        <Text style={styles.specText}>• Not completed: Purple button "Start Challenge →"</Text>
        <Text style={styles.specText}>• Completed: Green text "✓ Completed"</Text>
        <Text style={styles.specText}>• Pillar-specific challenge descriptions</Text>
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
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
  },
  exampleSection: {
    marginBottom: 24,
  },
  pillarName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  specSection: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  specTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  specText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 6,
    lineHeight: 20,
  },
});
