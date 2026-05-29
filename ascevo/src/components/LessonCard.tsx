/**
 * LessonCard Component
 * 
 * Displays individual lessons in the DetailView with:
 * - Colored number circle (1, 2, 3, 4) using pillar accent color
 * - Lesson title in bold 15px font
 * - Metadata "5 min · Beginner" in 13px muted text
 * - Three status indicators: "Start →" (purple), progress ring (50%), checkmark (green)
 * 
 * Validates Requirements 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

/**
 * Lesson status type
 * - 'not-started': Lesson has not been started yet
 * - 'in-progress': Lesson is partially completed (50% progress)
 * - 'completed': Lesson has been fully completed
 */
export type LessonStatus = 'not-started' | 'in-progress' | 'completed';

/**
 * LessonCard Props Interface
 * 
 * @property {number} number - Lesson number (1, 2, 3, or 4)
 * @property {string} title - Lesson title
 * @property {string} duration - Lesson duration (e.g., "5 min")
 * @property {string} difficulty - Lesson difficulty level (e.g., "Beginner")
 * @property {string} accentColor - Pillar-specific accent color for number circle
 * @property {LessonStatus} status - Current lesson status
 * @property {function} onPress - Callback when card is pressed
 * @property {boolean} [disabled] - Whether the card is disabled (optional)
 */
export interface LessonCardProps {
  number: number;
  title: string;
  duration: string;
  difficulty: string;
  accentColor: string;
  status: LessonStatus;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * LessonCard Component
 * 
 * Renders a lesson card with number circle, title, metadata, and status indicator.
 * 
 * Visual Specifications:
 * - Number circle: 40px diameter, pillar accent color background, white text
 * - Title: Bold 15px font, white color
 * - Metadata: 13px font, muted color (rgba(255,255,255,0.5))
 * - Status indicators:
 *   - Not started: "Start →" in purple (#7C3AED)
 *   - In progress: Progress ring showing 50% completion
 *   - Completed: Green checkmark (✓) in #34D399
 * 
 * @param {LessonCardProps} props - Component props
 * @returns {JSX.Element} Rendered lesson card
 * 
 * @example
 * ```tsx
 * <LessonCard
 *   number={1}
 *   title="Understanding Your Anxiety"
 *   duration="5 min"
 *   difficulty="Beginner"
 *   accentColor="#A78BFA"
 *   status="not-started"
 *   onPress={() => handleLessonPress(lesson)}
 * />
 * ```
 */
export default function LessonCard({
  number,
  title,
  duration,
  difficulty,
  accentColor,
  status,
  onPress,
  disabled = false,
}: LessonCardProps): JSX.Element {
  /**
   * Render status indicator based on lesson status
   * 
   * - Not started: Purple "Start →" text
   * - In progress: Circular progress ring at 50%
   * - Completed: Green checkmark
   */
  const renderStatusIndicator = () => {
    switch (status) {
      case 'not-started':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.startText}>Start →</Text>
          </View>
        );
      
      case 'in-progress':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.progressRing}>
              {/* Progress ring background (full circle) */}
              <View style={styles.progressRingBackground} />
              {/* Progress ring fill (50% arc) */}
              <View style={[styles.progressRingFill, { transform: [{ rotate: '180deg' }] }]} />
              {/* Center text showing percentage */}
              <View style={styles.progressRingCenter}>
                <Text style={styles.progressRingText}>50%</Text>
              </View>
            </View>
          </View>
        );
      
      case 'completed':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.checkmarkContainer}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      testID={`lesson-card-${number}`}
      style={[styles.card, disabled && styles.cardDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Lesson ${number}: ${title}. ${duration}, ${difficulty}. ${
        status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In progress' : 'Not started'
      }`}
      accessibilityHint="Double tap to view lesson"
    >
      {/* Number Circle */}
      <View style={[styles.numberCircle, { backgroundColor: accentColor }]}>
        <Text style={styles.numberText}>{number}</Text>
      </View>

      {/* Lesson Info */}
      <View style={styles.lessonInfo}>
        <Text style={styles.lessonTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.lessonMetadata}>
          {duration} · {difficulty}
        </Text>
      </View>

      {/* Status Indicator */}
      {renderStatusIndicator()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.sm,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  
  // Number Circle Styles
  numberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  
  // Lesson Info Styles
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  lessonMetadata: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Status Indicator Styles
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  
  // Start Status Styles
  startText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED', // Purple
  },
  
  // Progress Ring Styles
  progressRing: {
    width: 36,
    height: 36,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingBackground: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  progressRingFill: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#7C3AED', // Purple
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  progressRingCenter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text,
  },
  
  // Checkmark Status Styles
  checkmarkContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#34D399', // Green
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
