/**
 * LessonModal Component
 * 
 * Bottom sheet modal displaying lesson content with completion tracking.
 * Implements slide-up animation, handle bar for drag-to-close, and lesson content display.
 * 
 * Features:
 * - Bottom sheet modal with slide-up animation (300ms ease)
 * - Handle bar (40px width, 4px height, gray pill) at top for drag-to-close gesture
 * - Lesson title in bold 20px font
 * - "5 min read" duration badge next to title
 * - 3-4 paragraphs of educational content (150-250 words)
 * - Key takeaway box with dark background (#1A1A2E)
 * - "Mark as Complete → +50 XP" button in purple (#7C3AED)
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import type { LessonData } from '../../data/lessonContent';
import { useButtonPressAnimation } from '../../hooks/useButtonPressAnimation';
import { useReducedMotion, getAnimationDuration } from '../../hooks/useReducedMotion';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * LessonModal Props Interface
 * 
 * @property {boolean} visible - Whether the modal is visible
 * @property {LessonData} lesson - Lesson data to display
 * @property {string} pillarColor - Pillar-specific accent color for theming
 * @property {function} onComplete - Callback when lesson is marked complete
 * @property {function} onClose - Callback when modal is closed
 */
interface LessonModalProps {
  visible: boolean;
  lesson: LessonData;
  pillarColor: string;
  onComplete: () => void;
  onClose: () => void;
}

/**
 * LessonModal Component
 * 
 * Displays lesson content in a bottom sheet modal with slide-up animation.
 * Users can read the content and mark the lesson as complete to earn 50 XP.
 * 
 * Animation:
 * - Slides up from bottom on open (300ms ease)
 * - Slides down on close (300ms ease)
 * - Supports drag-to-close gesture on handle bar
 * 
 * Layout:
 * - Handle bar at top (40px × 4px gray pill)
 * - Lesson title (20px bold)
 * - Duration badge ("5 min read")
 * - Content paragraphs (3-4 paragraphs)
 * - Key takeaway box (dark background with 💡 icon)
 * - Complete button (full width, purple, +50 XP)
 * 
 * @param {LessonModalProps} props - Component props
 * 
 * @example
 * ```tsx
 * <LessonModal
 *   visible={true}
 *   lesson={lessonData}
 *   pillarColor="#7C3AED"
 *   onComplete={() => handleComplete()}
 *   onClose={() => setModalVisible(false)}
 * />
 * ```
 */
export default function LessonModal({
  visible,
  lesson,
  pillarColor,
  onComplete,
  onClose,
}: LessonModalProps) {
  // Animation value for slide-up/down
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  
  // Check for reduced motion preference (Task 16.4)
  const reduceMotionEnabled = useReducedMotion();
  
  // Button press animation (Task 13.4)
  const { scaleAnim, handlePressIn, handlePressOut } = useButtonPressAnimation();
  
  // Pan responder for drag-to-close gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward drags
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Close if dragged down more than 100px
        if (gestureState.dy > 100) {
          handleClose();
        } else {
          // Snap back to open position
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Animate modal open/close
  useEffect(() => {
    if (visible) {
      // Slide up animation with reduced motion support (Task 16.4)
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: getAnimationDuration(300, reduceMotionEnabled),
        useNativeDriver: true,
      }).start();
    } else {
      // Reset to bottom
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, slideAnim, reduceMotionEnabled]);

  /**
   * Handle modal close
   * Animates modal down and calls onClose callback
   * Uses reduced motion support (Task 16.4)
   */
  function handleClose() {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: getAnimationDuration(300, reduceMotionEnabled),
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }

  /**
   * Handle lesson completion
   * Closes modal and calls onComplete callback
   */
  function handleComplete() {
    handleClose();
    // Call onComplete after a short delay to allow animation to finish
    setTimeout(() => {
      onComplete();
    }, 350);
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      >
        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            {/* Handle Bar - Requirement 14.2 */}
            <View style={styles.handleBarContainer} {...panResponder.panHandlers}>
              <View style={styles.handleBar} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              {/* Lesson Title - Requirement 14.3 */}
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              
              {/* Duration Badge - Requirement 14.4 */}
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>5 min read</Text>
              </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Lesson Content Paragraphs */}
              {lesson.content.paragraphs.map((paragraph, index) => (
                <Text key={index} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}

              {/* Key Takeaway Box */}
              <View style={styles.takeawayBox}>
                <Text style={styles.takeawayLabel}>💡 Key Takeaway</Text>
                <Text style={styles.takeawayText}>{lesson.content.keyTakeaway}</Text>
              </View>

              {/* Complete Button */}
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  style={[styles.completeButton, { backgroundColor: '#7C3AED' }]}
                  onPress={handleComplete}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={1}
                  accessibilityRole="button"
                  accessibilityLabel={`Complete ${lesson.title}. Earn 50 XP.`}
                  accessibilityHint="Double tap to mark this lesson as complete"
                >
                  <Text style={styles.completeButtonText}>Mark as Complete → +50 XP</Text>
                </TouchableOpacity>
              </Animated.View>
            </ScrollView>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.9,
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
  },
  
  // Handle Bar Styles - Requirement 14.2
  handleBarContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  
  // Header Styles
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  
  // Lesson Title - Requirement 14.3
  lessonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  
  // Duration Badge - Requirement 14.4
  durationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A78BFA',
  },
  
  // Scrollable Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  
  // Content Paragraphs
  paragraph: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  
  // Key Takeaway Box
  takeawayBox: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  takeawayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
    marginBottom: spacing.xs,
  },
  takeawayText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  
  // Complete Button
  completeButton: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 48,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
