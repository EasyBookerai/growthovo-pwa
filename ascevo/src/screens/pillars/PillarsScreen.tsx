import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabaseClient';
import { getLessonsForUnit, getCompletedLessonIds, isLessonUnlocked } from '../../services/lessonService';
import { getTodayChallenge, submitCheckIn, getTodayCompletion } from '../../services/challengeService';
import LessonPlayerScreen from '../lesson/LessonPlayerScreen';
import type { Lesson, Challenge, Pillar, Unit } from '../../types';
import { PILLAR_COLORS, type PremiumPillarKey } from '../../types/pillars';
import { LESSON_CONTENT, type LessonData } from '../../data/lessonContent';
import { loadCompletedLessons, loadPillarProgress } from '../../services/pillarStorageService';
import { completeLesson } from '../../services/pillarLessonService';
import { registerSyncStatusCallback, unregisterSyncStatusCallback, isSyncing } from '../../services/pillarChallengeService';
import LessonModal from './LessonModal';
import { useAppContext } from '../../context/AppContext';
import Toast from '../../components/Toast';
import { useButtonPressAnimation } from '../../hooks/useButtonPressAnimation';
import { useReducedMotion, getAnimationDuration } from '../../hooks/useReducedMotion';

/**
 * PillarsScreen Props Interface
 * 
 * @property {string} userId - Authenticated user ID for fetching lessons and progress
 * @property {string} subscriptionStatus - User's subscription tier
 * @property {any} [navigation] - React Navigation object (optional, framework-specific type)
 * @property {any} [route] - React Navigation route (optional, framework-specific type)
 */
interface Props {
  userId: string;
  subscriptionStatus: string;
  navigation?: any;
  route?: any;
}

/**
 * Pillar display data
 * 
 * Represents a growth pillar with visual and progress information.
 * 
 * @property {string} key - Unique pillar identifier (e.g., 'mind', 'discipline')
 * @property {string} emoji - Emoji icon for the pillar
 * @property {string} name - Display name of the pillar
 * @property {string} color - Hex color code for theming
 * @property {number} progress - Completion progress (0.0 to 1.0)
 * @property {string} accentColor - Pillar-specific accent color for borders
 */
interface PillarDisplay {
  key: string;
  emoji: string;
  name: string;
  color: string;
  progress: number;
  accentColor: string;
}

/**
 * Map current pillar keys to premium pillar keys for accent colors and lesson content
 */
const PILLAR_KEY_MAPPING: Record<string, PremiumPillarKey> = {
  'mind': 'mental-health',
  'communication': 'relationships',
  'money': 'career',
  'relationships': 'fitness',
  'finance': 'finance',
  'hobbies': 'hobbies',
};

/**
 * PillarCard Props Interface
 * 
 * Props for the memoized PillarCard component.
 * 
 * @property {PillarDisplay} pillar - Pillar data to display
 * @property {number} index - Index in the pillar array (for animation)
 * @property {Animated.Value} scaleAnim - Animated value for scale transform
 * @property {function} onPress - Callback when card is pressed
 * @property {boolean} reduceMotionEnabled - Whether reduced motion is enabled
 */
interface PillarCardProps {
  pillar: PillarDisplay;
  index: number;
  scaleAnim: Animated.Value;
  onPress: (pillar: PillarDisplay, index: number) => void;
  reduceMotionEnabled: boolean;
}

/**
 * Memoized pillar card component to prevent unnecessary re-renders
 * Only re-renders when pillar data, scale animation, or reduced motion setting changes
 */
const PillarCard = memo(({ pillar, index, scaleAnim, onPress, reduceMotionEnabled }: PillarCardProps) => {
  // Animation values for hover/press feedback
  const [translateYAnim] = useState(new Animated.Value(0));
  const [borderOpacityAnim] = useState(new Animated.Value(0.2));

  const handlePress = useCallback(() => {
    onPress(pillar, index);
  }, [pillar, index, onPress]);

  const handlePressIn = useCallback(() => {
    // Animate translateY to -2 and border opacity to 0.3
    // Use reduced motion support (Task 16.4)
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: -2,
        duration: getAnimationDuration(200, reduceMotionEnabled),
        useNativeDriver: true,
      }),
      Animated.timing(borderOpacityAnim, {
        toValue: 0.3,
        duration: getAnimationDuration(200, reduceMotionEnabled),
        useNativeDriver: false, // opacity on border requires false
      }),
    ]).start();
  }, [translateYAnim, borderOpacityAnim, reduceMotionEnabled]);

  const handlePressOut = useCallback(() => {
    // Return to original state
    // Use reduced motion support (Task 16.4)
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: getAnimationDuration(200, reduceMotionEnabled),
        useNativeDriver: true,
      }),
      Animated.timing(borderOpacityAnim, {
        toValue: 0.2,
        duration: getAnimationDuration(200, reduceMotionEnabled),
        useNativeDriver: false,
      }),
    ]).start();
  }, [translateYAnim, borderOpacityAnim, reduceMotionEnabled]);

  // Interpolate border color with animated opacity
  const animatedBorderColor = borderOpacityAnim.interpolate({
    inputRange: [0.2, 0.3],
    outputRange: [pillar.accentColor + '33', pillar.accentColor + '4D'], // 33 = 0.2 opacity, 4D = 0.3 opacity in hex
  });

  return (
    <Animated.View
      style={[
        styles.pillarCardWrapper,
        { 
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
          ],
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${pillar.name} pillar. Level 1. ${Math.round(pillar.progress * 500)} out of 500 XP.`}
        accessibilityHint="Double tap to view lessons and challenges"
      >
        <Animated.View
          style={[
            styles.pillarCard,
            { 
              borderColor: animatedBorderColor,
              borderLeftColor: pillar.accentColor,
              borderLeftWidth: 3,
            },
          ]}
        >
          {/* Glassmorphism background */}
          <View style={[styles.pillarCardGlow, { backgroundColor: pillar.color + '11' }]} />
          
          {/* Level Badge - Top Right */}
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lvl 1</Text>
          </View>
          
          {/* Content */}
          <View style={styles.pillarCardContent}>
            <View style={[styles.pillarEmojiContainer, { backgroundColor: pillar.color + '22' }]}>
              <Text style={styles.pillarEmoji}>{pillar.emoji}</Text>
            </View>
            <Text style={styles.pillarName}>{pillar.name}</Text>
            
            {/* XP Progress bar */}
            <View style={styles.xpProgressContainer}>
              <View style={styles.xpProgressBar}>
                <View
                  style={[
                    styles.xpProgressFill,
                    {
                      width: `${pillar.progress * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.xpProgressText}>
                {Math.round(pillar.progress * 500)} / 500 XP
              </Text>
            </View>
            
            {/* Lesson Count */}
            <Text style={styles.lessonCountText}>4 lessons</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

const PILLAR_DISPLAY: PillarDisplay[] = [
  { key: 'mind', emoji: '🧠', name: 'Mental', color: '#7C3AED', progress: 0.3, accentColor: PILLAR_COLORS['mental-health'] },
  { key: 'communication', emoji: '💬', name: 'Relations', color: '#EA580C', progress: 0.5, accentColor: PILLAR_COLORS['relationships'] },
  { key: 'money', emoji: '💼', name: 'Career', color: '#F59E0B', progress: 0.2, accentColor: PILLAR_COLORS['career'] },
  { key: 'relationships', emoji: '💪', name: 'Fitness', color: '#16A34A', progress: 0.7, accentColor: PILLAR_COLORS['fitness'] },
  { key: 'finance', emoji: '💰', name: 'Finance', color: '#F59E0B', progress: 0.4, accentColor: PILLAR_COLORS['finance'] },
  { key: 'hobbies', emoji: '🎨', name: 'Hobbies', color: '#EC4899', progress: 0.1, accentColor: PILLAR_COLORS['hobbies'] },
];

/**
 * LessonCardButton Component
 * 
 * Wrapper for lesson card with button press animation.
 * Applies scale animation (1.0 → 0.95 → 1.0) on press.
 * 
 * Task: 13.4 Add button press feedback
 */
interface LessonCardButtonProps {
  lesson: LessonData;
  status: 'completed' | 'locked' | 'available';
  accentColor: string;
  onPress: () => void;
}

const LessonCardButton = memo(({ lesson, status, accentColor, onPress }: LessonCardButtonProps) => {
  const { scaleAnim, handlePressIn, handlePressOut } = useButtonPressAnimation();
  const isLocked = status === 'locked';
  
  // Create accessibility label based on status
  const getAccessibilityLabel = () => {
    const baseLabel = `${lesson.title}. ${lesson.duration}. ${lesson.difficulty}.`;
    if (status === 'completed') {
      return `${baseLabel} Completed`;
    } else if (status === 'locked') {
      return `${baseLabel} Locked`;
    } else {
      return `${baseLabel} Not started`;
    }
  };
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.detailLessonCard,
          isLocked && styles.detailLessonCardLocked,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLocked}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityHint={isLocked ? "This lesson is locked" : "Double tap to open lesson"}
      >
        {/* Colored number circle using pillar accent color */}
        <View
          style={[
            styles.detailLessonNumberCircle,
            { backgroundColor: accentColor },
          ]}
        >
          <Text style={styles.detailLessonNumber}>{lesson.number}</Text>
        </View>
        <View style={styles.detailLessonContent}>
          <Text style={[styles.detailLessonTitle, isLocked && styles.detailLessonTitleLocked]}>
            {lesson.title}
          </Text>
          <Text style={styles.detailLessonSubtitle}>
            {status === 'completed' ? '✓ Completed' : status === 'locked' ? '🔒 Locked' : `${lesson.duration} · ${lesson.difficulty}`}
          </Text>
        </View>
        <View style={styles.detailLessonAction}>
          {status === 'completed' ? (
            <View style={styles.completedCheckmark}>
              <Text style={styles.completedText}>✓</Text>
            </View>
          ) : status === 'locked' ? (
            <View style={styles.lockedBadge}>
              <Text style={styles.lockedText}>🔒</Text>
            </View>
          ) : (
            <Text style={[styles.startText, { color: '#7C3AED' }]}>Start →</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

/**
 * PillarsScreen Component
 * 
 * Displays 6 growth pillar cards in a 2-column grid layout.
 * Tapping a pillar opens a detail modal with lessons for that pillar.
 * 
 * Features:
 * - 2-column responsive grid of pillar cards
 * - Animated card press feedback with scale transform
 * - Modal detail view with lesson list
 * - Progress bars showing completion percentage
 * - Lesson locking/unlocking logic
 * - Empty states and error handling
 * - Loading indicators during data fetch
 * 
 * Performance optimizations:
 * - Memoized PillarCard components
 * - Animated values for smooth interactions
 * - Lazy loading of lesson data
 * 
 * @param {Props} props - Component props
 * @param {string} props.userId - Authenticated user ID
 * @param {string} props.subscriptionStatus - User's subscription tier
 * @param {any} props.navigation - React Navigation object (optional)
 * @param {any} props.route - React Navigation route (optional)
 * 
 * @example
 * ```tsx
 * <PillarsScreen
 *   userId={user.id}
 *   subscriptionStatus="premium"
 *   navigation={navigation}
 *   route={route}
 * />
 * ```
 */
export default function PillarsScreen({ userId, subscriptionStatus, navigation, route }: Props) {
  // Get AppContext for global XP synchronization (Requirement 17.1)
  const { updateXP } = useAppContext();
  
  // Check for reduced motion preference (Task 16.4)
  const reduceMotionEnabled = useReducedMotion();
  
  const [selectedPillar, setSelectedPillar] = useState<PillarDisplay | null>(null);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [unlockedMap, setUnlockedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLessonData, setSelectedLessonData] = useState<LessonData | null>(null);
  const [pillarData, setPillarData] = useState<Pillar | null>(null);
  const [currentXP, setCurrentXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [progressAnim] = useState(new Animated.Value(0));
  const [scaleAnims] = useState(() => 
    PILLAR_DISPLAY.map(() => new Animated.Value(1))
  );
  const [showPillarCompleteBanner, setShowPillarCompleteBanner] = useState(false);
  const [levelBadgeScale] = useState(new Animated.Value(1));
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSyncingState, setIsSyncingState] = useState(false);
  
  // Button press animations for DetailView buttons (Task 13.4)
  const backButtonAnim = useButtonPressAnimation();
  const retryButtonAnim = useButtonPressAnimation();

  // Register sync status callback on mount (Task 14.2)
  useEffect(() => {
    // Set initial sync status
    setIsSyncingState(isSyncing());
    
    // Register callback to be notified of sync status changes
    registerSyncStatusCallback((syncing) => {
      setIsSyncingState(syncing);
    });
    
    // Cleanup on unmount
    return () => {
      unregisterSyncStatusCallback();
    };
  }, []);

  useEffect(() => {
    if (selectedPillar) {
      loadPillarLessons(selectedPillar);
    }
  }, [selectedPillar, userId]);

  /**
   * Load lessons for a selected pillar
   * 
   * Loads 4 lessons per pillar from LESSON_CONTENT constant.
   * Checks completion status from localStorage.
   * All lessons are unlocked by default (no locking logic for premium content).
   * 
   * Algorithm:
   * 1. Map pillar key to premium pillar key
   * 2. Filter LESSON_CONTENT for lessons matching the pillar
   * 3. Take first 4 lessons
   * 4. Load completed lesson IDs from localStorage
   * 5. Load pillar progress (XP, level) from localStorage
   * 6. Mark all lessons as unlocked
   * 
   * @async
   * @param {PillarDisplay} pillar - The pillar to load lessons for
   * @returns {Promise<void>} Resolves when lessons are loaded
   */
  async function loadPillarLessons(pillar: PillarDisplay) {
    try {
      setLoading(true);
      setError(null);
      
      // Map pillar key to premium pillar key
      const premiumPillarKey = PILLAR_KEY_MAPPING[pillar.key];
      
      if (!premiumPillarKey) {
        console.error('No premium pillar key mapping for:', pillar.key);
        setError('Unable to load lessons for this pillar.');
        setLessons([]);
        setLoading(false);
        return;
      }
      
      // Get all lessons for this pillar from LESSON_CONTENT
      const pillarLessons = Object.values(LESSON_CONTENT).filter(
        (lesson) => lesson.pillarKey === premiumPillarKey
      );
      
      // Sort by lesson number and take first 4
      const sortedLessons = pillarLessons
        .sort((a, b) => a.number - b.number)
        .slice(0, 4);
      
      setLessons(sortedLessons);
      
      // Load completed lesson IDs from localStorage
      const completedLessonsData = await loadCompletedLessons();
      const completedSet = new Set(completedLessonsData.lessonIds);
      setCompletedIds(completedSet);
      
      // Load pillar progress (XP, level) from localStorage
      const pillarProgress = await loadPillarProgress(premiumPillarKey);
      setCurrentXP(pillarProgress.xp);
      setCurrentLevel(pillarProgress.level);
      
      // Calculate progress percentage for animation
      const progressPercentage = ((pillarProgress.xp % 500) / 500) * 100;
      
      // Animate progress bar to reflect current XP (Task 13.2)
      // Use 300ms ease transition for smooth XP updates
      // Use reduced motion support (Task 16.4)
      Animated.timing(progressAnim, {
        toValue: progressPercentage,
        duration: getAnimationDuration(300, reduceMotionEnabled),
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
      
      // All lessons are unlocked for premium content
      const unlocked: Record<string, boolean> = {};
      for (const lesson of sortedLessons) {
        unlocked[lesson.id] = true;
      }
      setUnlockedMap(unlocked);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load pillar lessons:', error);
      setError('Something went wrong. Please try again.');
      setLessons([]);
      setLoading(false);
    }
  }

  const handlePillarPress = useCallback((pillar: PillarDisplay, index: number) => {
    // Animate card press with reduced motion support (Task 16.4)
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: getAnimationDuration(100, reduceMotionEnabled),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: getAnimationDuration(100, reduceMotionEnabled),
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedPillar(pillar);
  }, [scaleAnims, reduceMotionEnabled]);

  function handleLessonPress(lesson: LessonData) {
    if (!unlockedMap[lesson.id]) {
      return; // Lesson is locked
    }
    // Open lesson modal
    setSelectedLessonData(lesson);
  }

  function handleLessonComplete(xpEarned: number) {
    setSelectedLesson(null);
    if (selectedPillar) {
      loadPillarLessons(selectedPillar); // Reload to update completion status
    }
  }

  async function handleLessonModalComplete() {
    if (!selectedLessonData || !selectedPillar) {
      return;
    }

    try {
      // Map pillar key to premium pillar key
      const premiumPillarKey = PILLAR_KEY_MAPPING[selectedPillar.key];
      
      if (!premiumPillarKey) {
        console.error('No premium pillar key mapping for:', selectedPillar.key);
        return;
      }

      // Store old level before completion
      const oldLevel = currentLevel;

      // Complete lesson (awards 50 XP, updates localStorage)
      // Pass updateXP callback for AppContext synchronization (Requirement 17.1)
      await completeLesson(premiumPillarKey, selectedLessonData.id, updateXP);

      // Close modal
      setSelectedLessonData(null);

      // Reload lessons to update completion status
      await loadPillarLessons(selectedPillar);

      // Check if all 4 lessons are completed (Requirement 15.5)
      const pillarProgress = await loadPillarProgress(premiumPillarKey);
      const allLessonsCompleted = pillarProgress.completedLessons.length >= 4;

      if (allLessonsCompleted) {
        // Show pillar completion celebration banner
        setShowPillarCompleteBanner(true);
        
        // Auto-hide banner after 3 seconds
        setTimeout(() => {
          setShowPillarCompleteBanner(false);
        }, 3000);
      }

      // Check if level increased (Requirement 15.6)
      const newLevel = pillarProgress.level;
      if (newLevel > oldLevel) {
        triggerLevelUpAnimation(newLevel);
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      // Still close modal even if completion fails
      setSelectedLessonData(null);
    }
  }

  function handleLessonModalClose() {
    setSelectedLessonData(null);
  }

  /**
   * Trigger level-up animation
   * 
   * Animates the level badge with a spring effect when user levels up.
   * Shows a celebration message.
   * Uses reduced motion support (Task 16.4).
   * 
   * Algorithm:
   * 1. Animate progress bar to 100%
   * 2. Reset progress bar to 0% for new level
   * 3. Scale level badge (1.0 → 1.2 → 1.0) using spring animation
   * 4. Display "🎉 Level {level} reached!" toast
   * 
   * Validates: Requirements 15.6
   * 
   * @param newLevel - The new level reached
   */
  function triggerLevelUpAnimation(newLevel: number) {
    // Animate progress bar to 100% (Task 13.2: use ease easing)
    // Use reduced motion support (Task 16.4)
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: getAnimationDuration(500, reduceMotionEnabled),
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(() => {
      // Reset to 0% for new level
      progressAnim.setValue(0);
      
      // Show level up badge animation with reduced motion support
      Animated.sequence([
        Animated.spring(levelBadgeScale, {
          toValue: 1.2,
          useNativeDriver: true,
          // Spring animations don't have duration, but we can disable them
          // by setting stiffness very high when reduced motion is enabled
          ...(reduceMotionEnabled ? { stiffness: 10000, damping: 500 } : {}),
        }),
        Animated.spring(levelBadgeScale, {
          toValue: 1,
          useNativeDriver: true,
          ...(reduceMotionEnabled ? { stiffness: 10000, damping: 500 } : {}),
        }),
      ]).start();
      
      // Display "🎉 Level {level} reached!" toast
      setToastMessage(`🎉 Level ${newLevel} reached!`);
      setToastVisible(true);
    });
  }

  function handleCloseDetailView() {
    setSelectedPillar(null);
    setLessons([]);
  }

  const getLessonStatus = (lesson: LessonData): 'completed' | 'locked' | 'available' => {
    if (completedIds.has(lesson.id)) return 'completed';
    if (!unlockedMap[lesson.id]) return 'locked';
    return 'available';
  };

  // Render lesson player if lesson is selected
  if (selectedLesson && selectedPillar) {
    return (
      <LessonPlayerScreen
        lesson={selectedLesson}
        userId={userId}
        pillarColour={selectedPillar.color}
        onComplete={handleLessonComplete}
        onClose={() => setSelectedLesson(null)}
      />
    );
  }

  // Render detail view modal
  const renderDetailView = () => {
    if (!selectedPillar) return null;

    // Use loaded XP and level from localStorage
    const nextLevel = currentLevel + 1;
    const xpToNextLevel = 500 - (currentXP % 500);

    // Interpolate progress bar width from animated value
    const progressBarWidth = progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    return (
      <Modal
        visible={true}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseDetailView}
      >
        <SafeAreaView style={[styles.detailRoot, { backgroundColor: '#0A0A12' }]}>
          {/* Header */}
          <View style={[styles.detailHeader, { borderBottomColor: selectedPillar.color + '33' }]}>
            {/* Back button - Top Left */}
            <Animated.View style={{ transform: [{ scale: backButtonAnim.scaleAnim }] }}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleCloseDetailView}
                onPressIn={backButtonAnim.handlePressIn}
                onPressOut={backButtonAnim.handlePressOut}
                activeOpacity={1}
                accessibilityRole="button"
                accessibilityLabel="Back to Pillars"
                accessibilityHint="Double tap to return to pillars overview"
              >
                <Text style={styles.backButtonText}>← Pillars</Text>
              </TouchableOpacity>
            </Animated.View>
            
            {/* Pillar emoji at 48px */}
            <Text style={styles.detailPillarEmoji}>{selectedPillar.emoji}</Text>
            
            {/* Pillar name + level in 24px bold */}
            <View style={styles.detailTitleRow}>
              <Text style={styles.detailTitle}>{selectedPillar.name}</Text>
              <Animated.View style={{ transform: [{ scale: levelBadgeScale }] }}>
                <Text style={styles.detailLevel}>Level {currentLevel}</Text>
              </Animated.View>
            </View>
            
            {/* Full-width progress bar (8px height, teal fill) */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressBarWidth,
                    },
                  ]}
                />
              </View>
              {/* XP text below progress bar */}
              <Text style={styles.progressText}>
                {currentXP} / 500 XP to Level {nextLevel}
              </Text>
            </View>
          </View>

          {/* Stats Row - Three Mini Cards */}
          <View style={styles.statsRow}>
            {/* Streak Card */}
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            
            {/* Completion Card */}
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={styles.statValue}>{completedIds.size}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
            
            {/* Time Card */}
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⏱</Text>
              <Text style={styles.statValue}>~{(4 - completedIds.size) * 5}</Text>
              <Text style={styles.statLabel}>min left today</Text>
            </View>
          </View>

          {/* Pillar Complete Celebration Banner - Requirement 15.5 */}
          {showPillarCompleteBanner && (
            <View style={styles.celebrationBanner}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={styles.celebrationText}>Pillar Complete!</Text>
            </View>
          )}

          {/* Lessons List */}
          <ScrollView
            style={styles.detailContent}
            contentContainerStyle={styles.detailContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={selectedPillar.color} />
                <Text style={styles.loadingText}>Loading lessons...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorState}>
                <Text style={styles.errorEmoji}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Animated.View style={{ transform: [{ scale: retryButtonAnim.scaleAnim }] }}>
                  <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: selectedPillar.color }]}
                    onPress={() => loadPillarLessons(selectedPillar)}
                    onPressIn={retryButtonAnim.handlePressIn}
                    onPressOut={retryButtonAnim.handlePressOut}
                    activeOpacity={1}
                    accessibilityRole="button"
                    accessibilityLabel="Try again"
                    accessibilityHint="Double tap to reload lessons"
                  >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            ) : lessons.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📚</Text>
                <Text style={styles.emptyText}>No lessons available yet</Text>
                <Text style={styles.emptySubtext}>Check back soon for new content!</Text>
              </View>
            ) : (
              <>
                {/* Lessons Section Header - Requirement 7.1 */}
                <View style={styles.lessonsSectionHeader}>
                  <Text style={styles.lessonsTitle}>Lessons</Text>
                  <Text style={styles.lessonsCount}>{lessons.length} lessons</Text>
                </View>
                {lessons.map((lesson, index) => {
                  const status = getLessonStatus(lesson);
                  
                  return (
                    <LessonCardButton
                      key={lesson.id}
                      lesson={lesson}
                      status={status}
                      accentColor={selectedPillar.accentColor}
                      onPress={() => handleLessonPress(lesson)}
                    />
                  );
                })}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.root} testID="pillars-screen">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Your Pillars</Text>
          {/* Syncing indicator - Task 14.2 */}
          {isSyncingState && (
            <View style={styles.syncingIndicator}>
              <ActivityIndicator size="small" color="#34D399" />
              <Text style={styles.syncingText}>Syncing...</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSubtitle}>Choose your growth area</Text>
      </View>

      {/* Pillar Grid (2 columns) */}
      <ScrollView
        contentContainerStyle={styles.pillarGrid}
        showsVerticalScrollIndicator={false}
      >
        {PILLAR_DISPLAY.map((pillar, index) => (
          <PillarCard
            key={pillar.key}
            pillar={pillar}
            index={index}
            scaleAnim={scaleAnims[index]}
            onPress={handlePillarPress}
            reduceMotionEnabled={reduceMotionEnabled}
          />
        ))}
      </ScrollView>

      {/* Detail View Modal */}
      {renderDetailView()}

      {/* Lesson Modal - Task 9.1 */}
      {selectedLessonData && selectedPillar && (
        <LessonModal
          visible={!!selectedLessonData}
          lesson={selectedLessonData}
          pillarColor={selectedPillar.color}
          onComplete={handleLessonModalComplete}
          onClose={handleLessonModalClose}
        />
      )}

      {/* Level-up Toast - Task 13.1 */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        duration={2000}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A12',
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  syncingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  syncingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34D399',
  },
  headerSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Pillar Grid Styles
  pillarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    paddingBottom: 100,
    gap: spacing.md,
  },
  pillarCardWrapper: {
    width: '48%',
  },
  pillarCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 160,
  },
  pillarCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  pillarCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  pillarEmojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  pillarEmoji: {
    fontSize: 28,
  },
  pillarName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pillarProgressContainer: {
    marginTop: spacing.sm,
  },
  pillarProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  pillarProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  pillarProgressText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  xpProgressContainer: {
    marginTop: spacing.sm,
  },
  xpProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: '#34D399',
    borderRadius: 2,
  },
  xpProgressText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  lessonCountText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 4,
  },
  levelBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },

  // Detail View Styles
  detailRoot: {
    flex: 1,
  },
  detailHeader: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.sm,
    marginBottom: spacing.md,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    ...typography.body,
    color: '#7C3AED',
    fontWeight: '600',
  },
  detailPillarEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  detailLevel: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34D399',
    borderRadius: 4,
  },
  progressText: {
    ...typography.small,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  
  // Stats Row Styles
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  
  detailContent: {
    flex: 1,
  },
  detailContentContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  // Lessons Section Header Styles - Requirement 7.1
  lessonsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  lessonsTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  lessonsCount: {
    ...typography.body,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  
  detailLessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.sm,
    minHeight: 72,
  },
  detailLessonCardLocked: {
    opacity: 0.5,
  },
  detailLessonNumberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLessonNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  detailLessonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLessonIconEmoji: {
    fontSize: 22,
  },
  detailLessonContent: {
    flex: 1,
  },
  detailLessonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  detailLessonTitleLocked: {
    color: 'rgba(255,255,255,0.4)',
  },
  detailLessonSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  detailLessonAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCheckmark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: '#34D399',
    fontSize: 20,
    fontWeight: '700',
  },
  lockedBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedText: {
    fontSize: 14,
  },
  startText: {
    fontSize: 15,
    fontWeight: '600',
  },
  startBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBadgeText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: 'rgba(255,255,255,0.5)',
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 100,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  
  // Celebration Banner Styles - Requirement 15.5
  celebrationBanner: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#34D399',
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  celebrationEmoji: {
    fontSize: 24,
  },
  celebrationText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
