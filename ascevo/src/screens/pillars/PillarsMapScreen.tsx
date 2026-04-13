import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal,
} from 'react-native';
import { supabase } from '../../services/supabaseClient';
import { getCompletedLessonIds, isLessonUnlocked } from '../../services/lessonService';
import LessonPlayerScreen from '../lesson/LessonPlayerScreen';
import { colors, typography, spacing, radius, getPillarColor } from '../../theme';
import type { Lesson, Pillar, Unit } from '../../types';

interface Props {
  userId: string;
  subscriptionStatus: string;
  onPaywall: () => void;
}

const FREE_PILLAR_NAME = 'Discipline';

export default function PillarsMapScreen({ userId, subscriptionStatus, onPaywall }: Props) {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [activePillarIndex, setActivePillarIndex] = useState(0);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const isPremium = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  useEffect(() => {
    loadPillars();
  }, []);

  useEffect(() => {
    if (pillars.length > 0) loadPillarContent(pillars[activePillarIndex]);
  }, [activePillarIndex, pillars]);

  async function loadPillars() {
    const { data } = await supabase.from('pillars').select('*').order('display_order');
    if (data) setPillars(data.map(mapPillar));
    setLoading(false);
  }

  async function loadPillarContent(pillar: Pillar) {
    setLoading(true);
    const { data: unitData } = await supabase
      .from('units')
      .select('*')
      .eq('pillar_id', pillar.id)
      .order('display_order');

    const unitList = (unitData ?? []).map(mapUnit);
    setUnits(unitList);

    if (unitList.length === 0) { setLessons([]); setLoading(false); return; }

    const unitIds = unitList.map((u) => u.id);
    const { data: lessonData } = await supabase
      .from('lessons')
      .select('*')
      .in('unit_id', unitIds)
      .order('display_order');

    const lessonList = (lessonData ?? []).map(mapLesson);
    setLessons(lessonList);

    const completed = await getCompletedLessonIds(userId, pillar.id);
    setCompletedIds(completed);
    setLoading(false);
  }

  async function handleLessonTap(lesson: Lesson) {
    const pillar = pillars[activePillarIndex];
    if (!isPremium && pillar.name !== FREE_PILLAR_NAME) {
      onPaywall();
      return;
    }
    const unlocked = await isLessonUnlocked(userId, lesson.id);
    if (!unlocked) {
      // Show locked message — handled inline
      return;
    }
    setActiveLesson(lesson);
  }

  function getLessonState(lesson: Lesson, index: number): 'completed' | 'current' | 'locked' {
    if (completedIds.has(lesson.id)) return 'completed';
    // Current = first non-completed
    const firstIncomplete = lessons.find((l) => !completedIds.has(l.id));
    if (firstIncomplete?.id === lesson.id) return 'current';
    return 'locked';
  }

  const activePillar = pillars[activePillarIndex];
  const pillarColour = activePillar ? getPillarColor(activePillar.name) : colors.primary;

  return (
    <View style={styles.root}>
      {/* Pillar tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {pillars.map((p, i) => {
          const locked = !isPremium && p.name !== FREE_PILLAR_NAME;
          const colour = getPillarColor(p.name);
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.tab, activePillarIndex === i && { borderBottomColor: colour, borderBottomWidth: 2 }]}
              onPress={() => {
                if (locked) { onPaywall(); return; }
                setActivePillarIndex(i);
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: activePillarIndex === i }}
              accessibilityLabel={p.name}
            >
              <Text style={styles.tabIcon}>{p.icon}</Text>
              <Text style={[styles.tabLabel, activePillarIndex === i && { color: colour }]}>
                {p.name}
              </Text>
              {locked && <Text style={styles.lockIcon}>🔒</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={pillarColour} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.path}>
          {units.map((unit) => {
            const unitLessons = lessons.filter((l) => l.unitId === unit.id);
            const completedCount = unitLessons.filter((l) => completedIds.has(l.id)).length;
            return (
              <View key={unit.id}>
                {/* Unit header */}
                <View style={styles.unitHeader}>
                  <View style={[styles.unitProgressRing, { borderColor: pillarColour }]}>
                    <Text style={[styles.unitProgressText, { color: pillarColour }]}>
                      {completedCount}/{unitLessons.length}
                    </Text>
                  </View>
                  <Text style={styles.unitTitle}>{unit.title}</Text>
                </View>

                {/* Lesson nodes */}
                <View style={styles.lessonColumn}>
                  {unitLessons.map((lesson, idx) => {
                    const state = getLessonState(lesson, idx);
                    return (
                      <TouchableOpacity
                        key={lesson.id}
                        style={[
                          styles.lessonNode,
                          state === 'completed' && { backgroundColor: pillarColour },
                          state === 'current' && { backgroundColor: pillarColour + '33', borderColor: pillarColour, borderWidth: 2 },
                          state === 'locked' && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                        ]}
                        onPress={() => {
                          if (state === 'locked') return;
                          handleLessonTap(lesson);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`${lesson.title} — ${state}`}
                        accessibilityState={{ disabled: state === 'locked' }}
                      >
                        <Text style={styles.lessonNodeIcon}>
                          {state === 'completed' ? '✓' : state === 'current' ? '▶' : '🔒'}
                        </Text>
                        <Text
                          style={[
                            styles.lessonNodeTitle,
                            state === 'locked' && { color: colors.textMuted },
                          ]}
                          numberOfLines={2}
                        >
                          {lesson.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Lesson player modal */}
      <Modal visible={!!activeLesson} animationType="slide" presentationStyle="fullScreen">
        {activeLesson && (
          <LessonPlayerScreen
            lesson={activeLesson}
            userId={userId}
            pillarColour={pillarColour}
            onComplete={(xp) => {
              setCompletedIds((prev) => new Set([...prev, activeLesson.id]));
              setActiveLesson(null);
            }}
            onClose={() => setActiveLesson(null)}
          />
        )}
      </Modal>
    </View>
  );
}

function mapPillar(row: any): Pillar {
  return { id: row.id, name: row.name, colour: row.colour, icon: row.icon, displayOrder: row.display_order };
}
function mapUnit(row: any): Unit {
  return { id: row.id, pillarId: row.pillar_id, title: row.title, displayOrder: row.display_order };
}
function mapLesson(row: any): Lesson {
  return {
    id: row.id, unitId: row.unit_id, title: row.title, displayOrder: row.display_order,
    cardConcept: row.card_concept, cardExample: row.card_example, cardMistake: row.card_mistake,
    cardScience: row.card_science, cardChallenge: row.card_challenge,
  };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  tabBar: { maxHeight: 72, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabBarContent: { paddingHorizontal: spacing.sm, alignItems: 'center' },
  tab: { alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minWidth: 72 },
  tabIcon: { fontSize: 20 },
  tabLabel: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  lockIcon: { fontSize: 10, position: 'absolute', top: 4, right: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  path: { padding: spacing.md, paddingBottom: 80 },
  unitHeader: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg, gap: spacing.md },
  unitProgressRing: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  unitProgressText: { ...typography.smallBold },
  unitTitle: { ...typography.h3, color: colors.text, flex: 1 },
  lessonColumn: { gap: 10, paddingLeft: spacing.md },
  lessonNode: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderRadius: radius.md, padding: spacing.md,
  },
  lessonNodeIcon: { fontSize: 16, width: 24, textAlign: 'center' },
  lessonNodeTitle: { ...typography.body, color: colors.text, flex: 1 },
});
