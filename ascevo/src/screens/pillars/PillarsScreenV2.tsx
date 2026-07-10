import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react';
import { colors, typography, spacing, radius } from '../../theme';
import { PILLAR_COLORS, type PremiumPillarKey } from '../../types/pillars';
import { LESSON_CONTENT, type LessonData } from '../../data/lessonContent';
import { loadCompletedLessons } from '../../services/pillarStorageService';
import LessonModal from './LessonModal';
import { useAppContext } from '../../context/AppContext';
import { completeLesson } from '../../services/pillarLessonService';
import { useButtonPressAnimation } from '../../hooks/useButtonPressAnimation';

/**
 * Enhanced PillarsScreen V2
 * 
 * Layout:
 * - Header: "Your Pillars" + subtitle
 * - Horizontal filter chips for all 6 pillars
 * - Vertical list of lessons for selected pillar
 * - Daily Challenge card at bottom
 * 
 * Features:
 * - Realistic lesson content per pillar
 * - Smart lesson generation with varied difficulty
 * - Progress tracking (completed, in-progress, not started)
 * - Daily challenges with +30 XP reward
 * - Premium UX with micro-interactions
 */

interface Props {
  userId: string;
  subscriptionStatus: string;
  navigation?: any;
  route?: any;
}

interface PillarData {
  key: PremiumPillarKey;
  emoji: string;
  name: string;
  color: string;
}

const PILLARS: PillarData[] = [
  { key: 'mental-health', emoji: '🧠', name: 'Mental', color: PILLAR_COLORS['mental-health'] },
  { key: 'relationships', emoji: '💬', name: 'Relations', color: PILLAR_COLORS['relationships'] },
  { key: 'career', emoji: '💼', name: 'Career', color: PILLAR_COLORS['career'] },
  { key: 'fitness', emoji: '💪', name: 'Fitness', color: PILLAR_COLORS['fitness'] },
  { key: 'finance', emoji: '💰', name: 'Finance', color: PILLAR_COLORS['finance'] },
  { key: 'hobbies', emoji: '🎨', name: 'Hobbies', color: PILLAR_COLORS['hobbies'] },
];

/**
 * Realistic lesson library for each pillar
 * 4-6 lessons per pillar with realistic titles, durations, and difficulty
 */
const PILLAR_LESSONS: Record<PremiumPillarKey, Array<{
  title: string;
  subtitle: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}>> = {
  'mental-health': [
    { title: 'Understanding Anxiety', subtitle: 'Learn what triggers your anxiety', duration: '5 min', difficulty: 'Beginner' },
    { title: 'Box Breathing Technique', subtitle: 'Calm your nervous system instantly', duration: '5 min', difficulty: 'Beginner' },
    { title: 'Cognitive Reframing 101', subtitle: 'Change negative thought patterns', duration: '7 min', difficulty: 'Intermediate' },
    { title: 'Building Emotional Awareness', subtitle: 'Recognize and name your emotions', duration: '6 min', difficulty: 'Beginner' },
    { title: 'Managing Overwhelm', subtitle: 'Break down big stressors', duration: '8 min', difficulty: 'Intermediate' },
    { title: 'Sleep Hygiene Basics', subtitle: 'Build better sleep habits', duration: '5 min', difficulty: 'Beginner' },
  ],
  'relationships': [
    { title: 'Active Listening Basics', subtitle: 'Hear what others really mean', duration: '5 min', difficulty: 'Beginner' },
    { title: 'Setting Healthy Boundaries', subtitle: 'Say no without guilt', duration: '6 min', difficulty: 'Intermediate' },
    { title: 'Conflict Resolution Skills', subtitle: 'Argue without destroying trust', duration: '8 min', difficulty: 'Advanced' },
    { title: 'Expressing Appreciation', subtitle: 'Strengthen bonds through gratitude', duration: '5 min', difficulty: 'Beginner' },
    { title: 'Understanding Love Languages', subtitle: 'Connect on a deeper level', duration: '7 min', difficulty: 'Beginner' },
    { title: 'Repairing After Arguments', subtitle: 'Rebuild connection after conflict', duration: '6 min', difficulty: 'Intermediate' },
  ],
  'career': [
    { title: 'Set One Career Micro-Goal', subtitle: 'Start with small, actionable steps', duration: '5 min', difficulty: 'Beginner' },
    { title: 'Negotiation Fundamentals', subtitle: 'Ask for what you deserve', duration: '8 min', difficulty: 'Intermediate' },
    { title: 'Building Your Personal Brand', subtitle: 'Stand out in your field', duration: '7 min', difficulty: 'Intermediate' },
    { title: 'Time Management for Professionals', subtitle: 'Prioritize like a pro', duration: '6 min', difficulty: 'Beginner' },
    { title: 'Networking Without Awkwardness', subtitle: 'Build genuine connections', duration: '7 min', difficulty: 'Intermediate' },
    { title: 'Asking for Feedback', subtitle: 'Grow through constructive criticism', duration: '5 min', difficulty: 'Beginner' },
  ],
  'fitness': [
    { title: 'Morning Mobility Routine', subtitle: 'Wake up your body gently', duration: '5 min', difficulty: 'Beginner' },
    { title: 'Building a Workout Habit', subtitle: 'Make exercise automatic', duration: '6 min', difficulty: 'Beginner' },
    { title: 'Nutrition Basics for Beginners', subtitle: 'Understand macros and calories', duration: '8 min', difficulty: 'Beginner' },
    { title: 'Bodyweight Strength Training', subtitle: 'Build muscle without equipment', duration: '7 min', difficulty: 'Intermediate' },
    { title: 'Preventing Workout Injuries', subtitle: 'Stay safe while training', duration: '6 min', difficulty: 'Intermediate' },
    { title: 'Recovery and Rest Days', subtitle: 'Why rest makes you stronger', duration: '5 min', difficulty: 'Beginner' },
  ],
  'finance': [
    { title: 'Track Your Spending Today', subtitle: 'Know where your money goes', duration: '5 min', difficulty: 'Beginner' },
    { title: '50/30/20 Budget Rule', subtitle: 'Simple budgeting framework', duration: '6 min', difficulty: 'Beginner' },
    { title: 'Building an Emergency Fund', subtitle: 'Start your financial safety net', duration: '7 min', difficulty: 'Beginner' },
    { title: 'Understanding Credit Scores', subtitle: 'How credit works and why it matters', duration: '8 min', difficulty: 'Intermediate' },
    { title: 'Investing for Beginners', subtitle: 'Start growing your wealth', duration: '10 min', difficulty: 'Intermediate' },
    { title: 'Debt Payoff Strategies', subtitle: 'Get out of debt faster', duration: '7 min', difficulty: 'Intermediate' },
  ],
  'hobbies': [
    { title: 'Finding Your Creative Outlet', subtitle: 'Discover what makes you flow', duration: '5 min', difficulty: 'Beginner' },
    { title: 'Making Time for Play', subtitle: 'Schedule joy into your week', duration: '6 min', difficulty: 'Beginner' },
    { title: 'Learning a New Skill', subtitle: 'How to get started and stay motivated', duration: '7 min', difficulty: 'Beginner' },
    { title: 'Overcoming Creative Blocks', subtitle: 'Push through resistance', duration: '6 min', difficulty: 'Intermediate' },
    { title: 'Building a Practice Routine', subtitle: 'Get better through consistency', duration: '8 min', difficulty: 'Intermediate' },
    { title: 'Sharing Your Work', subtitle: 'Overcome fear of judgment', duration: '7 min', difficulty: 'Intermediate' },
  ],
};

/**
 * Daily challenges for each pillar
 * One-sentence actionable challenge with +30 XP reward
 */
const DAILY_CHALLENGES: Record<PremiumPillarKey, {
  title: string;
  description: string;
}> = {
  'mental-health': {
    title: "Today's Mental Challenge",
    description: 'Take 3 deep breaths before your next meeting or task',
  },
  'relationships': {
    title: "Today's Relations Challenge",
    description: 'Send a genuine compliment to someone you care about',
  },
  'career': {
    title: "Today's Career Challenge",
    description: 'Spend 10 minutes updating your resume or LinkedIn',
  },
  'fitness': {
    title: "Today's Fitness Challenge",
    description: 'Do 20 bodyweight squats or a 5-minute walk',
  },
  'finance': {
    title: "Today's Finance Challenge",
    description: 'Review your last 3 purchases and categorize them',
  },
  'hobbies': {
    title: "Today's Hobbies Challenge",
    description: 'Dedicate 15 minutes to something purely for fun',
  },
};

/**
 * FilterChip Component
 * Horizontal chip for pillar selection with press animation
 */
interface FilterChipProps {
  pillar: PillarData;
  isSelected: boolean;
  onPress: () => void;
}

const FilterChip = memo(({ pillar, isSelected, onPress }: FilterChipProps) => {
  const { scaleAnim, handlePressIn, handlePressOut } = useButtonPressAnimation();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.filterChip,
          isSelected && [styles.filterChipSelected, { backgroundColor: pillar.color }],
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={pillar.name}
        accessibilityState={{ selected: isSelected }}
      >
        <Text style={styles.filterChipEmoji}>{pillar.emoji}</Text>
        <Text
          style={[
            styles.filterChipText,
            isSelected && styles.filterChipTextSelected,
          ]}
        >
          {pillar.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

/**
 * LessonCard Component
 * Displays lesson with emoji, title, subtitle, duration, and status
 */
interface LessonCardProps {
  lesson: {
    title: string;
    subtitle: string;
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  };
  number: number;
  accentColor: string;
  status: 'completed' | 'in-progress' | 'not-started';
  onPress: () => void;
}

const LessonCard = memo(({ lesson, number, accentColor, status, onPress }: LessonCardProps) => {
  const { scaleAnim, handlePressIn, handlePressOut } = useButtonPressAnimation();

  const getStatusBadge = () => {
    if (status === 'completed') {
      return (
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: '#34D399' }]}>✓</Text>
        </View>
      );
    } else if (status === 'in-progress') {
      return (
        <View style={[styles.progressRing, { borderColor: accentColor }]}>
          <View style={[styles.progressRingInner, { borderTopColor: accentColor }]} />
        </View>
      );
    } else {
      return (
        <TouchableOpacity style={[styles.startButton, { backgroundColor: accentColor }]}>
          <Text style={styles.startButtonText}>Start →</Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.lessonCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`${lesson.title}. ${lesson.duration}. ${lesson.difficulty}. ${status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In progress' : 'Not started'}`}
      >
        {/* Left: Colored emoji circle */}
        <View style={[styles.lessonIconCircle, { backgroundColor: accentColor }]}>
          <Text style={styles.lessonIconNumber}>{number}</Text>
        </View>

        {/* Center: Title, subtitle, duration */}
        <View style={styles.lessonContent}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonSubtitle}>{lesson.subtitle}</Text>
          <View style={styles.lessonMeta}>
            <Text style={styles.lessonDuration}>{lesson.duration}</Text>
            <Text style={styles.lessonDot}>•</Text>
            <Text style={styles.lessonDifficulty}>{lesson.difficulty}</Text>
          </View>
        </View>

        {/* Right: Status badge */}
        <View style={styles.lessonAction}>
          {getStatusBadge()}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

/**
 * DailyChallengeCard Component
 * Teal-accented card with challenge description and +30 XP badge
 */
interface DailyChallengeCardProps {
  challenge: { title: string; description: string };
  onAccept: () => void;
}

const DailyChallengeCard = memo(({ challenge, onAccept }: DailyChallengeCardProps) => {
  const { scaleAnim, handlePressIn, handlePressOut } = useButtonPressAnimation();

  return (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>+30 XP</Text>
        </View>
      </View>
      <Text style={styles.challengeDescription}>{challenge.description}</Text>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.challengeButton}
          onPress={onAccept}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel="Accept Challenge"
        >
          <Text style={styles.challengeButtonText}>Accept Challenge →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

/**
 * Main PillarsScreen Component
 */
export default function PillarsScreenV2({ userId, subscriptionStatus }: Props) {
  const { updateXP } = useAppContext();
  const [selectedPillar, setSelectedPillar] = useState<PillarData>(PILLARS[0]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);

  useEffect(() => {
    loadCompletedLessonsData();
  }, []);

  async function loadCompletedLessonsData() {
    try {
      const data = await loadCompletedLessons();
      setCompletedIds(new Set(data.lessonIds));
    } catch (error) {
      console.error('Failed to load completed lessons:', error);
    }
  }

  const handlePillarSelect = useCallback((pillar: PillarData) => {
    setSelectedPillar(pillar);
  }, []);

  const handleLessonPress = useCallback((lessonData: { title: string; subtitle: string; duration: string; difficulty: string }, index: number) => {
    // Find corresponding lesson from LESSON_CONTENT
    const pillarLessons = Object.values(LESSON_CONTENT).filter(
      (lesson) => lesson.pillarKey === selectedPillar.key
    );
    const lessonContent = pillarLessons[index];
    
    if (lessonContent) {
      setSelectedLesson(lessonContent);
    }
  }, [selectedPillar]);

  const handleLessonComplete = useCallback(async () => {
    if (!selectedLesson) return;

    try {
      await completeLesson(selectedPillar.key, selectedLesson.id, updateXP);
      setSelectedLesson(null);
      await loadCompletedLessonsData();
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      setSelectedLesson(null);
    }
  }, [selectedLesson, selectedPillar, updateXP]);

  const handleLessonClose = useCallback(() => {
    setSelectedLesson(null);
  }, []);

  const handleChallengeAccept = useCallback(async () => {
    // Award +30 XP for accepting challenge
    await updateXP(30);
    // In production, you'd track challenge completion in localStorage/Supabase
  }, [updateXP]);

  // Get lessons for selected pillar
  const lessons = PILLAR_LESSONS[selectedPillar.key] || [];
  const challenge = DAILY_CHALLENGES[selectedPillar.key];

  // Mock status determination (in production, check completedIds and localStorage)
  const getLessonStatus = (index: number): 'completed' | 'in-progress' | 'not-started' => {
    // For demo, mark first lesson as completed, second as in-progress
    if (index === 0) return 'completed';
    if (index === 1) return 'in-progress';
    return 'not-started';
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Pillars</Text>
        <Text style={styles.headerSubtitle}>Choose your growth area</Text>
      </View>

      {/* Horizontal Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipContainer}
      >
        {PILLARS.map((pillar) => (
          <FilterChip
            key={pillar.key}
            pillar={pillar}
            isSelected={selectedPillar.key === pillar.key}
            onPress={() => handlePillarSelect(pillar)}
          />
        ))}
      </ScrollView>

      {/* Lessons List */}
      <ScrollView
        style={styles.lessonsContainer}
        contentContainerStyle={styles.lessonsContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {lessons.map((lesson, index) => (
          <LessonCard
            key={index}
            lesson={lesson}
            number={index + 1}
            accentColor={selectedPillar.color}
            status={getLessonStatus(index)}
            onPress={() => handleLessonPress(lesson, index)}
          />
        ))}

        {/* Daily Challenge Card */}
        {challenge && (
          <DailyChallengeCard
            challenge={challenge}
            onAccept={handleChallengeAccept}
          />
        )}
      </ScrollView>

      {/* Lesson Modal */}
      {selectedLesson && (
        <LessonModal
          visible={!!selectedLesson}
          lesson={selectedLesson}
          pillarColor={selectedPillar.color}
          onComplete={handleLessonComplete}
          onClose={handleLessonClose}
        />
      )}
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
    marginBottom: 4,
  },
  headerSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.5)',
  },

  // Filter Chips
  filterChipContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipSelected: {
    borderColor: 'transparent',
  },
  filterChipEmoji: {
    fontSize: 18,
  },
  filterChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },

  // Lessons Container
  lessonsContainer: {
    flex: 1,
  },
  lessonsContentContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },

  // Lesson Card
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  lessonIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonIconNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  lessonSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lessonDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  lessonDot: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },
  lessonDifficulty: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  lessonAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressRingInner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopWidth: 3,
    transform: [{ rotate: '45deg' }],
  },
  startButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Daily Challenge Card
  challengeCard: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#34D399',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#34D399',
  },
  xpBadge: {
    backgroundColor: '#34D399',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  challengeDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    lineHeight: 22,
  },
  challengeButton: {
    backgroundColor: '#34D399',
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
  },
  challengeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
