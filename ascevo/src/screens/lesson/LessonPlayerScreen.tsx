import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Animated,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { completeLesson } from '../../services/lessonService';
import { deductHeart } from '../../services/heartService';
import { incrementStreak, checkMilestone } from '../../services/streakService';
import { checkAchievements, ACHIEVEMENT_DEFINITIONS } from '../../services/gamificationService';
import { useCelebration } from '../../hooks/useCelebration';
import CelebrationModal from '../../components/gamification/CelebrationModal';
import GlassCard from '../../components/glass/GlassCard';
import { colors, typography, spacing, radius } from '../../theme';
import type { Lesson, AchievementEvent } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const CARD_TYPES = ['concept', 'example', 'mistake', 'science', 'challenge'] as const;
type CardType = typeof CARD_TYPES[number];

const CARD_META: Record<CardType, { label: string; emoji: string; accent: string }> = {
  concept:   { label: 'Core Concept',      emoji: '💡', accent: colors.primary },
  example:   { label: 'Real Example',      emoji: '👤', accent: colors.pillars.communication },
  mistake:   { label: 'Common Mistake',    emoji: '⚠️', accent: colors.pillars.discipline },
  science:   { label: 'The Science',       emoji: '🔬', accent: colors.pillars.mind },
  challenge: { label: "Today's Challenge", emoji: '🎯', accent: colors.pillars.career },
};

interface Props {
  lesson: Lesson;
  userId: string;
  pillarColour: string;
  onComplete: (xpEarned: number, milestone?: { days: number; xpBonus: number }) => void;
  onClose: () => void;
}

export default function LessonPlayerScreen({ lesson, userId, pillarColour, onComplete, onClose }: Props) {
  const [cardIndex, setCardIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const [completing, setCompleting] = useState(false);
  
  // 🎉 Celebration hook for managing celebration queue
  const { trigger, isPlaying, currentCelebration, skip } = useCelebration();

  const cards: { type: CardType; content: string }[] = [
    { type: 'concept',   content: lesson.cardConcept },
    { type: 'example',   content: lesson.cardExample },
    { type: 'mistake',   content: lesson.cardMistake },
    { type: 'science',   content: lesson.cardScience },
    { type: 'challenge', content: lesson.cardChallenge },
  ];

  const currentCard = cards[cardIndex];
  const meta = CARD_META[currentCard.type];
  const isLast = cardIndex === cards.length - 1;
  const isFirst = cardIndex === 0;

  function animateOut(direction: 'left' | 'right', callback: () => void) {
    // Add fade out effect for smooth glass transition
    const fadeAnim = new Animated.Value(1);
    
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      translateX.setValue(direction === 'left' ? SCREEN_WIDTH : -SCREEN_WIDTH);
      callback();
      
      // Fade in new card
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }

  async function goNext() {
    if (completing) return;
    if (isLast) {
      setCompleting(true);
      try {
        // Complete the lesson and get XP earned
        const xp = await completeLesson(userId, lesson.id);
        
        // Increment streak and check for milestone
        const newStreak = await incrementStreak(userId);
        const milestone = checkMilestone(newStreak);
        
        // 🎉 Trigger lesson completion celebration
        trigger('lesson_complete', {
          title: 'Lesson Complete!',
          subtitle: lesson.title,
          xpEarned: xp,
          intensity: 'medium',
        });
        
        // 🎉 Check for streak milestone celebration
        if (milestone.isMilestone) {
          trigger('streak_milestone', {
            title: 'Streak Milestone!',
            subtitle: `${milestone.days} days in a row!`,
            streakMilestone: milestone.days,
            xpEarned: milestone.xpBonus,
            intensity: 'high',
          });
        }
        
        // 🎉 Check for newly unlocked achievements
        const newAchievements = await checkAchievements(userId, {
          type: 'lesson_complete',
          lessonId: lesson.id,
        } as AchievementEvent);
        
        // Trigger achievement celebrations
        for (const achievement of newAchievements) {
          const achievementDef = ACHIEVEMENT_DEFINITIONS[achievement.achievementId];
          if (achievementDef) {
            trigger('achievement', {
              title: 'Achievement Unlocked!',
              subtitle: achievementDef.title,
              achievements: [{
                id: achievementDef.id,
                title: achievementDef.title,
                icon: achievementDef.icon,
              }],
              intensity: achievementDef.category === 'special' ? 'high' : 'medium',
            });
          }
        }
        
        // Call onComplete callback after celebrations are queued
        onComplete(xp, milestone.isMilestone ? { days: milestone.days, xpBonus: milestone.xpBonus } : undefined);
      } catch (e) {
        console.error('Failed to complete lesson:', e);
        setCompleting(false);
      }
      return;
    }
    animateOut('left', () => setCardIndex((i) => i + 1));
  }

  async function goPrev() {
    if (isFirst) {
      // Swiping back on first card = skip = deduct heart
      await deductHeart(userId).catch(() => {});
      onClose();
      return;
    }
    animateOut('right', () => setCardIndex((i) => i - 1));
  }

  function onGestureEvent({ nativeEvent }: any) {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX < -SWIPE_THRESHOLD) goNext();
      else if (nativeEvent.translationX > SWIPE_THRESHOLD) goPrev();
      else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      }
    } else if (nativeEvent.state === State.ACTIVE) {
      translateX.setValue(nativeEvent.translationX);
    }
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close lesson">
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Progress dots */}
      <View style={styles.progressRow}>
        {cards.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < cardIndex && { backgroundColor: pillarColour },
              i === cardIndex && { backgroundColor: pillarColour, transform: [{ scale: 1.3 }] },
              i > cardIndex && { backgroundColor: colors.border },
            ]}
          />
        ))}
      </View>

      {/* Card */}
      <PanGestureHandler onHandlerStateChange={onGestureEvent}>
        <Animated.View style={[styles.cardWrapper, { transform: [{ translateX }] }]}>
          <GlassCard
            intensity="medium"
            style={styles.card}
          >
            <View style={[styles.cardInner, { borderTopColor: meta.accent }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>{meta.emoji}</Text>
                <Text style={[styles.cardLabel, { color: meta.accent }]}>{meta.label}</Text>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.cardContent}>{currentCard.content}</Text>
              </ScrollView>
            </View>
          </GlassCard>
        </Animated.View>
      </PanGestureHandler>

      {/* Navigation buttons */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnSecondary]}
          onPress={goPrev}
          accessibilityRole="button"
          accessibilityLabel={isFirst ? 'Close' : 'Previous card'}
        >
          <Text style={styles.navBtnTextSecondary}>{isFirst ? 'Close' : '← Back'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: pillarColour }, completing && styles.navBtnDisabled]}
          onPress={goNext}
          disabled={completing}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Complete lesson' : 'Next card'}
        >
          <Text style={styles.navBtnText}>{isLast ? 'Done ✓' : 'Next →'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.swipeHint}>Swipe left/right to navigate</Text>
      
      {/* 🎉 Celebration Modal */}
      {currentCelebration && (
        <CelebrationModal
          visible={isPlaying}
          data={currentCelebration}
          onComplete={skip}
          achievementDefinitions={Object.values(ACHIEVEMENT_DEFINITIONS)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: 56,
  },
  closeBtn: { color: colors.textMuted, fontSize: 20, width: 32, textAlign: 'center' },
  lessonTitle: { ...typography.bodyBold, color: colors.text, flex: 1, textAlign: 'center' },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  card: {
    flex: 1,
    borderRadius: radius.xl,
    padding: 0, // Remove padding from GlassCard, add to inner
  },
  cardInner: {
    flex: 1,
    padding: spacing.lg,
    borderTopWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  cardEmoji: { fontSize: 28 },
  cardLabel: { ...typography.caption },
  cardContent: { ...typography.body, color: colors.text, lineHeight: 28 },
  navRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  navBtn: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  navBtnSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  navBtnDisabled: { opacity: 0.5 },
  navBtnText: { color: '#fff', ...typography.bodyBold },
  navBtnTextSecondary: { color: colors.textSecondary, ...typography.bodyBold },
  swipeHint: { ...typography.small, color: colors.textMuted, textAlign: 'center', paddingBottom: spacing.lg },
});
