import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import type { PremiumPillarKey } from '../types/pillars';
import { useButtonPressAnimation } from '../hooks/useButtonPressAnimation';

/**
 * DailyChallengeCard Props Interface
 * 
 * @property {PremiumPillarKey} pillarKey - The pillar key to determine challenge text
 * @property {boolean} isCompleted - Whether the challenge has been completed today
 * @property {function} onComplete - Callback when "Start Challenge" button is pressed
 */
interface DailyChallengeCardProps {
  pillarKey: PremiumPillarKey;
  isCompleted: boolean;
  onComplete: () => void;
}

/**
 * Challenge text mapping for each pillar
 * 
 * Each pillar has a specific daily challenge that aligns with its growth area.
 */
const CHALLENGE_TEXT: Record<PremiumPillarKey, string> = {
  'mental-health': 'Practice 5 minutes of mindful breathing today',
  'relationships': 'Send a meaningful message to someone you care about',
  'career': 'Spend 30 minutes on focused, deep work without distractions',
  'fitness': 'Complete a 10-minute workout or walk',
  'finance': 'Review your spending from the past 24 hours',
  'hobbies': 'Dedicate 15 minutes to a creative activity you enjoy',
};

/**
 * DailyChallengeCard Component
 * 
 * Displays a daily challenge specific to each pillar with completion tracking.
 * 
 * Features:
 * - Teal border (2px, #34D399) for visual distinction
 * - "Daily Challenge" title in bold 16px font
 * - "+30 XP" badge with teal background
 * - Two states:
 *   - Not completed: Purple "Start Challenge →" button
 *   - Completed: Green "✓ Completed" text
 * - Pillar-specific challenge descriptions
 * 
 * Visual Specifications:
 * - Border: 2px solid #34D399 (teal)
 * - Background: #1A1A2E (dark card)
 * - Title: 16px bold, white
 * - Challenge text: 14px, muted white
 * - XP badge: Teal background (#34D399), white text
 * - Button: Purple (#7C3AED) when not completed
 * - Completed text: Green (#34D399)
 * 
 * @param {DailyChallengeCardProps} props - Component props
 * @param {PremiumPillarKey} props.pillarKey - Pillar identifier
 * @param {boolean} props.isCompleted - Completion status
 * @param {function} props.onComplete - Completion callback
 * 
 * @example
 * ```tsx
 * <DailyChallengeCard
 *   pillarKey="mental-health"
 *   isCompleted={false}
 *   onComplete={() => handleChallengeComplete()}
 * />
 * ```
 */
export default function DailyChallengeCard({
  pillarKey,
  isCompleted,
  onComplete,
}: DailyChallengeCardProps) {
  const challengeText = CHALLENGE_TEXT[pillarKey];
  
  // Button press animation (Task 13.4)
  const { scaleAnim, handlePressIn, handlePressOut } = useButtonPressAnimation();

  return (
    <View style={styles.container} testID="daily-challenge-card">
      {/* Header Row: Title and XP Badge */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Daily Challenge</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>+30 XP</Text>
        </View>
      </View>

      {/* Challenge Description */}
      <Text style={styles.challengeText}>{challengeText}</Text>

      {/* Action: Button or Completed Text */}
      {isCompleted ? (
        <View style={styles.completedContainer}>
          <Text style={styles.completedText}>✓ Completed</Text>
        </View>
      ) : (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={onComplete}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            testID="start-challenge-button"
          >
            <Text style={styles.startButtonText}>Start Challenge →</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#34D399', // Teal border
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700', // Bold
    color: '#FFFFFF',
  },
  xpBadge: {
    backgroundColor: '#34D399', // Teal background
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  challengeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#7C3AED', // Purple
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completedContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34D399', // Green
  },
});
