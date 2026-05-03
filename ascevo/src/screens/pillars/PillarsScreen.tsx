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
  Modal,
  Pressable,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabaseClient';
import { getLessonsForUnit, getCompletedLessonIds, isLessonUnlocked } from '../../services/lessonService';
import { getTodayChallenge, submitCheckIn, getTodayCompletion } from '../../services/challengeService';
import LessonPlayerScreen from '../lesson/LessonPlayerScreen';
import type { Lesson, Challenge, Pillar, Unit } from '../../types';

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
 */
interface PillarDisplay {
  key: string;
  emoji: string;
  name: string;
  color: string;
  progress: number;
}

/**
 * PillarCard Props Interface
 * 
 * Props for the memoized PillarCard component.
 * 
 * @property {PillarDisplay} pillar - Pillar data to display
 * @property {number} index - Index in the pillar array (for animation)
 * @property {Animated.Value} scaleAnim - Animated value for scale transform
 * @property {function} onPress - Callback when card is pressed
 */
interface PillarCardProps {
  pillar: PillarDisplay;
  index: number;
  scaleAnim: Animated.Value;
  onPress: (pillar: PillarDisplay, index: number) => void;
}

/**
 * Memoized pillar card component to prevent unnecessary re-renders
 * Only re-renders when pillar data or scale animation changes
 */
const PillarCard = memo(({ pillar, index, scaleAnim, onPress }: PillarCardProps) => {
  const handlePress = useCallback(() => {
    onPress(pillar, index);
  }, [pillar, index, onPress]);

  return (
    <Animated.View
      style={[
        styles.pillarCardWrapper,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.pillarCard,
          { borderColor: pillar.color + '33' },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Glassmorphism background */}
        <View style={[styles.pillarCardGlow, { backgroundColor: pillar.color + '11' }]} />
        
        {/* Content */}
        <View style={styles.pillarCardContent}>
          <View style={[styles.pillarEmojiContainer, { backgroundColor: pillar.color + '22' }]}>
            <Text style={styles.pillarEmoji}>{pillar.emoji}</Text>
          </View>
          <Text style={styles.pillarName}>{pillar.name}</Text>
          
          {/* Progress bar */}
          <View style={styles.pillarProgressContainer}>
            <View style={styles.pillarProgressBar}>
              <View
                style={[
                  styles.pillarProgressFill,
                  {
                    backgroundColor: pillar.color,
                    width: `${pillar.progress * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.pillarProgressText}>
              {Math.round(pillar.progress * 100)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const PILLAR_DISPLAY: PillarDisplay[] = [
  { key: 'mind', emoji: '🧠', name: 'Mental', color: '#7C3AED', progress: 0.3 },
  { key: 'communication', emoji: '💬', name: 'Relations', color: '#EA580C', progress: 0.5 },
  { key: 'money', emoji: '💼', name: 'Career', color: '#F59E0B', progress: 0.2 },
  { key: 'relationships', emoji: '💪', name: 'Fitness', color: '#16A34A', progress: 0.7 },
  { key: 'finance', emoji: '💰', name: 'Finance', color: '#F59E0B', progress: 0.4 },
  { key: 'hobbies', emoji: '🎨', name: 'Hobbies', color: '#EC4899', progress: 0.1 },
];

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
  const [selectedPillar, setSelectedPillar] = useState<PillarDisplay | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [unlockedMap, setUnlockedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [pillarData, setPillarData] = useState<Pillar | null>(null);
  const [scaleAnims] = useState(() => 
    PILLAR_DISPLAY.map(() => new Animated.Value(1))
  );

  useEffect(() => {
    if (selectedPillar) {
      loadPillarLessons(selectedPillar);
    }
  }, [selectedPillar, userId]);

  /**
   * Load lessons for a selected pillar
   * 
   * Fetches pillar data, units, and lessons from Supabase.
   * Limits to 4 lessons maximum for the detail view.
   * Also fetches completion status and unlock state for each lesson.
   * 
   * Algorithm:
   * 1. Fetch pillar by name from database
   * 2. Fetch units for that pillar (ordered by display_order)
   * 3. Fetch lessons for first 2 units (max 2 lessons per unit)
   * 4. Get completed lesson IDs for user
   * 5. Check unlock status for each lesson
   * 
   * @async
   * @param {PillarDisplay} pillar - The pillar to load lessons for
   * @returns {Promise<void>} Resolves when lessons are loaded
   */
  async function loadPillarLessons(pillar: PillarDisplay) {
    try {
      setLoading(true);
      setError(null);
      
      // Get pillar from database
      const { data: pillarFromDb, error: pillarError } = await supabase
        .from('pillars')
        .select('*')
        .eq('name', pillar.key)
        .single();
      
      if (pillarError) {
        console.error('Failed to load pillar:', pillarError);
        setError('Unable to load pillar data. Please check your connection.');
        setLessons([]);
        setLoading(false);
        return;
      }
      
      if (!pillarFromDb) {
        setLessons([]);
        setLoading(false);
        return;
      }
      
      setPillarData(pillarFromDb);
      
      // Get units for this pillar
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('id')
        .eq('pillar_id', pillarFromDb.id)
        .order('display_order', { ascending: true });
      
      if (unitsError) {
        console.error('Failed to load units:', unitsError);
        setError('Unable to load lessons. Please try again.');
        setLessons([]);
        setLoading(false);
        return;
      }
      
      if (!units || units.length === 0) {
        setLessons([]);
        setLoading(false);
        return;
      }
      
      // Get lessons for all units (limit to 4 for detail view)
      const allLessons: Lesson[] = [];
      for (const unit of units.slice(0, 2)) { // Max 2 units to get ~4 lessons
        const unitLessons = await getLessonsForUnit(unit.id);
        allLessons.push(...unitLessons.slice(0, 2)); // Max 2 lessons per unit
        if (allLessons.length >= 4) break;
      }
      
      setLessons(allLessons.slice(0, 4)); // Ensure max 4 lessons
      
      // Get completed lesson IDs
      const completed = await getCompletedLessonIds(userId, pillarFromDb.id);
      setCompletedIds(completed);
      
      // Check which lessons are unlocked
      const unlocked: Record<string, boolean> = {};
      for (const lesson of allLessons) {
        unlocked[lesson.id] = await isLessonUnlocked(userId, lesson.id);
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
    // Animate card press
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedPillar(pillar);
  }, [scaleAnims]);

  function handleLessonPress(lesson: Lesson) {
    if (!unlockedMap[lesson.id]) {
      return; // Lesson is locked
    }
    setSelectedLesson(lesson);
  }

  function handleLessonComplete(xpEarned: number) {
    setSelectedLesson(null);
    if (selectedPillar) {
      loadPillarLessons(selectedPillar); // Reload to update completion status
    }
  }

  function handleCloseDetailView() {
    setSelectedPillar(null);
    setLessons([]);
  }

  const getLessonStatus = (lesson: Lesson): 'completed' | 'locked' | 'available' => {
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
            <View style={styles.detailHeaderTop}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleCloseDetailView}
                activeOpacity={0.7}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <View style={[styles.pillarBadge, { backgroundColor: selectedPillar.color + '22' }]}>
                <Text style={styles.pillarBadgeEmoji}>{selectedPillar.emoji}</Text>
              </View>
            </View>
            <Text style={styles.detailTitle}>{selectedPillar.name}</Text>
            <Text style={styles.detailSubtitle}>Your growth journey</Text>
            
            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: selectedPillar.color,
                      width: `${selectedPillar.progress * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(selectedPillar.progress * 100)}% Complete
              </Text>
            </View>
          </View>

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
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: selectedPillar.color }]}
                  onPress={() => loadPillarLessons(selectedPillar)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : lessons.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📚</Text>
                <Text style={styles.emptyText}>No lessons available yet</Text>
                <Text style={styles.emptySubtext}>Check back soon for new content!</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Available Lessons</Text>
                {lessons.map((lesson, index) => {
                  const status = getLessonStatus(lesson);
                  const isLocked = status === 'locked';
                  
                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[
                        styles.detailLessonCard,
                        isLocked && styles.detailLessonCardLocked,
                      ]}
                      onPress={() => handleLessonPress(lesson)}
                      disabled={isLocked}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.detailLessonIcon,
                          { backgroundColor: selectedPillar.color + '33' },
                        ]}
                      >
                        <Text style={styles.detailLessonIconEmoji}>{selectedPillar.emoji}</Text>
                      </View>
                      <View style={styles.detailLessonContent}>
                        <Text style={[styles.detailLessonTitle, isLocked && styles.detailLessonTitleLocked]}>
                          {lesson.title}
                        </Text>
                        <Text style={styles.detailLessonSubtitle}>
                          {status === 'completed' ? '✓ Completed' : status === 'locked' ? '🔒 Locked' : '5 min'}
                        </Text>
                      </View>
                      <View style={styles.detailLessonAction}>
                        {status === 'completed' ? (
                          <View style={[styles.completedBadge, { backgroundColor: selectedPillar.color }]}>
                            <Text style={styles.completedText}>✓</Text>
                          </View>
                        ) : status === 'locked' ? (
                          <View style={styles.lockedBadge}>
                            <Text style={styles.lockedText}>🔒</Text>
                          </View>
                        ) : (
                          <View style={[styles.startBadge, { backgroundColor: selectedPillar.color }]}>
                            <Text style={styles.startBadgeText}>→</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Your Pillars</Text>
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
          />
        ))}
      </ScrollView>

      {/* Detail View Modal */}
      {renderDetailView()}
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
  headerTitle: {
    ...typography.h2,
    color: colors.text,
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

  // Detail View Styles
  detailRoot: {
    flex: 1,
  },
  detailHeader: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
  },
  detailHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  backButtonText: {
    ...typography.body,
    color: '#7C3AED',
    fontWeight: '600',
  },
  pillarBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarBadgeEmoji: {
    fontSize: 24,
  },
  detailTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 4,
  },
  detailSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: spacing.md,
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
    borderRadius: 4,
  },
  progressText: {
    ...typography.small,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
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
  },
  detailLessonCardLocked: {
    opacity: 0.5,
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
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: 4,
  },
  detailLessonTitleLocked: {
    color: 'rgba(255,255,255,0.4)',
  },
  detailLessonSubtitle: {
    ...typography.small,
    color: 'rgba(255,255,255,0.5)',
  },
  detailLessonAction: {
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
    color: colors.text,
    fontSize: 16,
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
  },
  retryButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
});
