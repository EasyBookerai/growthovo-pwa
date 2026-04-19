import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabaseClient';
import { getLessonsForUnit, getCompletedLessonIds, isLessonUnlocked } from '../../services/lessonService';
import { getTodayChallenge, submitCheckIn, getTodayCompletion } from '../../services/challengeService';
import { useAppContext } from '../../context/AppContext';
import LessonPlayerScreen from '../lesson/LessonPlayerScreen';
import type { Lesson, Challenge, Pillar, Unit } from '../../types';

interface Props {
  userId: string;
  subscriptionStatus: string;
  navigation?: any;
  route?: any;
}

const PILLAR_DISPLAY = [
  { key: 'mind', emoji: '🧠', name: 'Mental', color: '#7C3AED' },
  { key: 'discipline', emoji: '🎯', name: 'Discipline', color: '#DB2777' },
  { key: 'communication', emoji: '💬', name: 'Relations', color: '#EA580C' },
  { key: 'money', emoji: '💰', name: 'Finance', color: '#F59E0B' },
  { key: 'relationships', emoji: '💪', name: 'Fitness', color: '#16A34A' },
];

export default function PillarsScreen({ userId, subscriptionStatus, navigation, route }: Props) {
  const { state, dispatch } = useAppContext();
  const [selectedPillarKey, setSelectedPillarKey] = useState(route?.params?.selectedPillar || 'mind');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [unlockedMap, setUnlockedMap] = useState<Record<string, boolean>>({});
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [pillarData, setPillarData] = useState<Pillar | null>(null);

  useEffect(() => {
    loadPillarData();
  }, [selectedPillarKey, userId]);

  async function loadPillarData() {
    try {
      setLoading(true);

      // Get pillar from database
      const { data: pillarRow } = await supabase
        .from('pillars')
        .select('*')
        .eq('name', selectedPillarKey)
        .single();

      if (!pillarRow) {
        setLoading(false);
        return;
      }

      setPillarData(pillarRow);

      // Get units for this pillar
      const { data: units } = await supabase
        .from('units')
        .select('*')
        .eq('pillar_id', pillarRow.id)
        .order('display_order', { ascending: true });

      if (!units || units.length === 0) {
        setLessons([]);
        setLoading(false);
        return;
      }

      // Get lessons for all units
      const allLessons: Lesson[] = [];
      for (const unit of units) {
        const unitLessons = await getLessonsForUnit(unit.id);
        allLessons.push(...unitLessons);
      }

      setLessons(allLessons);

      // Get completed lesson IDs
      const completed = await getCompletedLessonIds(userId, pillarRow.id);
      setCompletedIds(completed);

      // Check which lessons are unlocked
      const unlocked: Record<string, boolean> = {};
      for (const lesson of allLessons) {
        unlocked[lesson.id] = await isLessonUnlocked(userId, lesson.id);
      }
      setUnlockedMap(unlocked);

      // Get today's challenge
      const todayChallenge = await getTodayChallenge(userId);
      setChallenge(todayChallenge);

      // Check if challenge is completed today
      if (todayChallenge) {
        const completion = await getTodayCompletion(userId, todayChallenge.id);
        setChallengeCompleted(!!completion);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load pillar data:', error);
      setLoading(false);
    }
  }

  async function handleAcceptChallenge() {
    if (!challenge) return;
    
    try {
      const { xpAwarded } = await submitCheckIn(userId, challenge.id, true);
      dispatch({ type: 'ADD_XP', payload: xpAwarded });
      setChallengeCompleted(true);
    } catch (error) {
      console.error('Failed to accept challenge:', error);
    }
  }

  function handleLessonPress(lesson: Lesson) {
    if (!unlockedMap[lesson.id]) {
      return; // Lesson is locked
    }
    setSelectedLesson(lesson);
  }

  function handleLessonComplete(xpEarned: number) {
    dispatch({ type: 'ADD_XP', payload: xpEarned });
    setSelectedLesson(null);
    loadPillarData(); // Reload to update completion status
  }

  function getLessonStatus(lesson: Lesson): 'completed' | 'locked' | 'available' {
    if (completedIds.has(lesson.id)) return 'completed';
    if (!unlockedMap[lesson.id]) return 'locked';
    return 'available';
  }

  const currentPillar = PILLAR_DISPLAY.find(p => p.key === selectedPillarKey) || PILLAR_DISPLAY[0];

  if (selectedLesson && pillarData) {
    return (
      <LessonPlayerScreen
        lesson={selectedLesson}
        userId={userId}
        pillarColour={currentPillar.color}
        onComplete={handleLessonComplete}
        onClose={() => setSelectedLesson(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Pillars</Text>
        <Text style={styles.headerSubtitle}>Choose your growth area</Text>
      </View>

      {/* Pillar Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
      >
        {PILLAR_DISPLAY.map((pillar) => (
          <TouchableOpacity
            key={pillar.key}
            style={[
              styles.chip,
              selectedPillarKey === pillar.key && {
                backgroundColor: pillar.color,
              },
            ]}
            onPress={() => setSelectedPillarKey(pillar.key)}
          >
            <Text style={styles.chipEmoji}>{pillar.emoji}</Text>
            <Text
              style={[
                styles.chipText,
                selectedPillarKey === pillar.key && styles.chipTextSelected,
              ]}
            >
              {pillar.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading lessons...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.lessonsList}
          showsVerticalScrollIndicator={false}
        >
          {lessons.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyText}>No lessons available yet</Text>
              <Text style={styles.emptySubtext}>Check back soon for new content!</Text>
            </View>
          ) : (
            lessons.map((lesson, index) => {
              const status = getLessonStatus(lesson);
              const isLocked = status === 'locked';
              
              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonCard,
                    isLocked && styles.lessonCardLocked,
                  ]}
                  onPress={() => handleLessonPress(lesson)}
                  disabled={isLocked}
                >
                  <View
                    style={[
                      styles.lessonIcon,
                      { backgroundColor: currentPillar.color + '33' },
                    ]}
                  >
                    <Text style={styles.lessonIconEmoji}>{currentPillar.emoji}</Text>
                  </View>
                  <View style={styles.lessonContent}>
                    <Text style={[styles.lessonTitle, isLocked && styles.lessonTitleLocked]}>
                      {lesson.title}
                    </Text>
                    <Text style={styles.lessonSubtitle}>
                      {status === 'completed' ? 'Completed' : status === 'locked' ? 'Locked' : 'Start lesson'}
                    </Text>
                    <View style={styles.lessonMeta}>
                      <Text style={styles.lessonDuration}>5 min</Text>
                    </View>
                  </View>
                  <View style={styles.lessonAction}>
                    {status === 'completed' ? (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>✓</Text>
                      </View>
                    ) : status === 'locked' ? (
                      <View style={styles.lockedBadge}>
                        <Text style={styles.lockedText}>🔒</Text>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.startButton}>
                        <Text style={styles.startButtonText}>Start →</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {/* Daily Challenge */}
          {challenge && (
            <View style={[styles.challengeCard, { borderLeftColor: currentPillar.color }]}>
              <Text style={styles.challengeLabel}>TODAY'S {currentPillar.name.toUpperCase()} CHALLENGE</Text>
              <Text style={styles.challengeTitle}>{challenge.description}</Text>
              <View style={styles.challengeFooter}>
                <View style={styles.xpBadge}>
                  <Text style={styles.xpBadgeText}>+15 XP</Text>
                </View>
                {!challengeCompleted ? (
                  <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptChallenge}>
                    <Text style={styles.acceptButtonText}>Accept Challenge →</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.completedChallenge}>
                    <Text style={styles.completedChallengeText}>✓ Completed</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
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
  },
  headerSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.5)',
  },
  filterChips: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 100,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.5)',
  },
  chipTextSelected: {
    color: colors.text,
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
  lessonsList: {
    padding: spacing.md,
    paddingBottom: 100,
    gap: spacing.sm,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  lessonCardLocked: {
    opacity: 0.5,
  },
  lessonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonIconEmoji: {
    fontSize: 20,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: 2,
  },
  lessonTitleLocked: {
    color: 'rgba(255,255,255,0.4)',
  },
  lessonSubtitle: {
    ...typography.small,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonDuration: {
    ...typography.small,
    color: 'rgba(255,255,255,0.4)',
  },
  lessonAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1DB88A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  lockedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedText: {
    fontSize: 14,
  },
  startButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  startButtonText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  },
  challengeCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: spacing.md,
    marginTop: spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  challengeLabel: {
    ...typography.caption,
    color: '#1DB88A',
    marginBottom: spacing.sm,
  },
  challengeTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  challengeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  xpBadge: {
    backgroundColor: '#1DB88A',
    borderRadius: 100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  xpBadgeText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  },
  acceptButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  acceptButtonText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  },
  completedChallenge: {
    backgroundColor: '#1DB88A',
    borderRadius: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  completedChallengeText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  },
});
