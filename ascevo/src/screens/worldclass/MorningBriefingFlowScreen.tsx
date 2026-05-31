import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import {
  getUserName,
  getSelectedPillars,
  getDailyQuote,
  getYesterdayActivity,
  generateRexMorningMessage,
  markMorningBriefingDone,
  addWeeklyXp,
  isBeforeNoon,
  saveDailyIntention,
} from '../../services/growthovoExperienceService';

const PILLAR_LABELS: Record<string, { emoji: string; lesson: string }> = {
  mind: { emoji: '🧠', lesson: 'Morning Mindfulness Reset' },
  discipline: { emoji: '🔥', lesson: 'Build Your Daily Routine' },
  communication: { emoji: '💬', lesson: 'Active Listening Basics' },
  money: { emoji: '💰', lesson: 'Track Your Spending Today' },
  relationships: { emoji: '❤️', lesson: 'Reach Out to Someone You Care About' },
  career: { emoji: '🚀', lesson: 'Set One Career Micro-Goal' },
};

interface Props {
  onClose: () => void;
}

export default function MorningBriefingFlowScreen({ onClose }: Props) {
  const { streak, updateXP } = useAppContext();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Champion');
  const [pillars, setPillars] = useState<string[]>([]);
  const [yesterday, setYesterday] = useState({ xp: 0, lessons: 0, mood: null as string | null });
  const [intention, setIntention] = useState('');
  const [plan, setPlan] = useState<string[]>([]);
  const [voiceSupported] = useState(
    Platform.OS === 'web' && typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
  );

  useEffect(() => {
    if (!isBeforeNoon()) return;
    (async () => {
      setName(await getUserName());
      setPillars(await getSelectedPillars());
      setYesterday(await getYesterdayActivity());
    })();
  }, []);

  if (!isBeforeNoon()) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centered}>
          <Text style={styles.blocked}>Come back tomorrow morning ☀️</Text>
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const topPillars = pillars.slice(0, 2);
  const rexMessage = generateRexMorningMessage({
    name,
    streak,
    yesterdayMood: yesterday.mood,
    dayOfWeek: new Date().getDay(),
  });

  async function finish() {
    await updateXP(20);
    await addWeeklyXp(20);
    await markMorningBriefingDone();
    if (intention.trim()) await saveDailyIntention(intention);
    onClose();
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        {step === 0 && (
          <>
            <Text style={styles.heading}>Good morning {name} ☀️</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
            <Text style={styles.quote}>"{getDailyQuote()}"</Text>
            <Text style={styles.streak}>Your streak: {streak} days 🔥</Text>
          </>
        )}
        {step === 1 && (
          <>
            <Text style={styles.heading}>Yesterday&apos;s recap</Text>
            {yesterday.xp === 0 && yesterday.lessons === 0 ? (
              <Text style={styles.body}>Fresh start today 💪</Text>
            ) : (
              <>
                <Text style={styles.body}>XP earned: {yesterday.xp}</Text>
                <Text style={styles.body}>Lessons completed: {yesterday.lessons}</Text>
                <Text style={styles.body}>Mood: {yesterday.mood ?? 'Not logged'}</Text>
              </>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <Text style={styles.heading}>Suggested for you</Text>
            {topPillars.map((p) => {
              const info = PILLAR_LABELS[p] ?? PILLAR_LABELS.mind;
              const inPlan = plan.includes(p);
              return (
                <View key={p} style={styles.lessonCard}>
                  <Text style={styles.body}>{info.emoji} {info.lesson}</Text>
                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={() => setPlan((prev) => (inPlan ? prev.filter((x) => x !== p) : [...prev, p]))}
                  >
                    <Text style={styles.linkText}>{inPlan ? 'Added ✓' : "Add to today's plan →"}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}
        {step === 3 && (
          <>
            <Text style={styles.heading}>Today I will...</Text>
            <TextInput
              style={styles.input}
              placeholder="Today I will..."
              placeholderTextColor={colors.textMuted}
              value={intention}
              onChangeText={setIntention}
              multiline
            />
            {voiceSupported && (
              <Text style={styles.hint}>🎤 Voice note available on supported browsers</Text>
            )}
          </>
        )}
        {step === 4 && (
          <>
            <Text style={styles.heading}>Rex says</Text>
            <Text style={styles.rexBubble}>{rexMessage}</Text>
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        {step < 4 ? (
          <TouchableOpacity style={styles.btn} onPress={() => setStep((s) => s + 1)}>
            <Text style={styles.btnText}>Continue →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btn} onPress={finish}>
            <Text style={styles.btnText}>Start your day →</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onClose} style={styles.skip}>
          <Text style={styles.skipText}>Close</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: 120 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  blocked: { ...typography.h2, color: colors.text, textAlign: 'center', marginBottom: spacing.lg },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  date: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  quote: { ...typography.body, color: colors.textSecondary, fontStyle: 'italic', marginBottom: spacing.lg },
  streak: { ...typography.h3, color: colors.primary },
  body: { ...typography.body, color: colors.text, marginBottom: spacing.sm },
  lessonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkBtn: { marginTop: spacing.sm },
  linkText: { color: colors.primary, fontWeight: '700' },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
  rexBubble: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.primary + '22',
    padding: spacing.lg,
    borderRadius: radius.lg,
    lineHeight: 24,
  },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  btnText: { ...typography.bodyBold, color: '#fff' },
  skip: { alignItems: 'center', marginTop: spacing.md },
  skipText: { color: colors.textMuted },
});
