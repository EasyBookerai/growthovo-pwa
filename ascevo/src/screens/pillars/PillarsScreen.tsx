import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

interface Props {
  userId: string;
  subscriptionStatus: string;
  navigation?: any;
  route?: any;
}

const PILLARS = [
  { id: '1', emoji: '🧠', name: 'Mental', color: '#7C3AED' },
  { id: '2', emoji: '💬', name: 'Relations', color: '#DB2777' },
  { id: '3', emoji: '💼', name: 'Career', color: '#EA580C' },
  { id: '4', emoji: '💪', name: 'Fitness', color: '#16A34A' },
  { id: '5', emoji: '💰', name: 'Finance', color: '#F59E0B' },
  { id: '6', emoji: '🎨', name: 'Hobbies', color: '#2563EB' },
];

const LESSONS: Record<string, Array<{ id: string; title: string; subtitle: string; status: 'not_started' | 'in_progress' | 'completed' }>> = {
  '1': [
    { id: 'l1', title: 'Understanding Anxiety', subtitle: 'Learn the science behind anxiety', status: 'completed' },
    { id: 'l2', title: 'Box Breathing Technique', subtitle: 'Master this calming practice', status: 'in_progress' },
    { id: 'l3', title: 'Cognitive Reframing 101', subtitle: 'Change your thought patterns', status: 'not_started' },
    { id: 'l4', title: 'Building Emotional Awareness', subtitle: 'Recognize your emotions', status: 'not_started' },
  ],
  '2': [
    { id: 'l5', title: 'Active Listening Skills', subtitle: 'Truly hear what others say', status: 'completed' },
    { id: 'l6', title: 'Setting Boundaries', subtitle: 'Protect your energy', status: 'not_started' },
    { id: 'l7', title: 'Conflict Resolution', subtitle: 'Navigate disagreements', status: 'not_started' },
  ],
  '3': [
    { id: 'l8', title: 'Goal Setting Framework', subtitle: 'Define your career path', status: 'completed' },
    { id: 'l9', title: 'Networking Essentials', subtitle: 'Build meaningful connections', status: 'in_progress' },
    { id: 'l10', title: 'Personal Branding', subtitle: 'Stand out professionally', status: 'not_started' },
  ],
  '4': [
    { id: 'l11', title: 'Morning Mobility Routine', subtitle: '10-minute daily practice', status: 'not_started' },
    { id: 'l12', title: 'Building Consistency', subtitle: 'Make fitness a habit', status: 'not_started' },
  ],
  '5': [
    { id: 'l13', title: 'Budgeting Basics', subtitle: 'Track your spending', status: 'not_started' },
    { id: 'l14', title: 'Emergency Fund Strategy', subtitle: 'Build financial security', status: 'not_started' },
  ],
  '6': [
    { id: 'l15', title: 'Finding Your Creative Outlet', subtitle: 'Discover what brings you joy', status: 'not_started' },
    { id: 'l16', title: 'Making Time for Hobbies', subtitle: 'Schedule creative time', status: 'not_started' },
  ],
};

export default function PillarsScreen({ userId, subscriptionStatus, navigation, route }: Props) {
  const [selectedPillar, setSelectedPillar] = useState(route?.params?.selectedPillar || '1');

  const currentPillar = PILLARS.find((p) => p.id === selectedPillar) || PILLARS[0];
  const lessons = LESSONS[selectedPillar] || [];

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
        {PILLARS.map((pillar) => (
          <TouchableOpacity
            key={pillar.id}
            style={[
              styles.chip,
              selectedPillar === pillar.id && {
                backgroundColor: pillar.color,
              },
            ]}
            onPress={() => setSelectedPillar(pillar.id)}
          >
            <Text style={styles.chipEmoji}>{pillar.emoji}</Text>
            <Text
              style={[
                styles.chipText,
                selectedPillar === pillar.id && styles.chipTextSelected,
              ]}
            >
              {pillar.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lessons List */}
      <ScrollView
        contentContainerStyle={styles.lessonsList}
        showsVerticalScrollIndicator={false}
      >
        {lessons.map((lesson) => (
          <TouchableOpacity key={lesson.id} style={styles.lessonCard}>
            <View
              style={[
                styles.lessonIcon,
                { backgroundColor: currentPillar.color + '33' },
              ]}
            >
              <Text style={styles.lessonIconEmoji}>{currentPillar.emoji}</Text>
            </View>
            <View style={styles.lessonContent}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonSubtitle}>{lesson.subtitle}</Text>
              <View style={styles.lessonMeta}>
                <Text style={styles.lessonDuration}>5 min</Text>
              </View>
            </View>
            <View style={styles.lessonAction}>
              {lesson.status === 'completed' ? (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✓</Text>
                </View>
              ) : lesson.status === 'in_progress' ? (
                <View style={styles.progressRing}>
                  <Text style={styles.progressText}>60%</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.startButton}>
                  <Text style={styles.startButtonText}>Start →</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Daily Challenge */}
        <View style={[styles.challengeCard, { borderLeftColor: currentPillar.color }]}>
          <Text style={styles.challengeLabel}>TODAY'S {currentPillar.name.toUpperCase()} CHALLENGE</Text>
          <Text style={styles.challengeTitle}>
            {selectedPillar === '1' && 'Practice 5 minutes of mindful breathing'}
            {selectedPillar === '2' && 'Have a meaningful conversation with someone'}
            {selectedPillar === '3' && 'Update your LinkedIn profile'}
            {selectedPillar === '4' && 'Do 20 push-ups'}
            {selectedPillar === '5' && 'Review your monthly budget'}
            {selectedPillar === '6' && 'Spend 30 minutes on a creative project'}
          </Text>
          <View style={styles.challengeFooter}>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>+30 XP</Text>
            </View>
            <TouchableOpacity style={styles.acceptButton}>
              <Text style={styles.acceptButtonText}>Accept Challenge →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  progressRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
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
});
