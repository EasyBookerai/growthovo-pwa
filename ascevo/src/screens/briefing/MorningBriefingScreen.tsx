import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import {
  getDailyQuote,
  getUserName,
  getSelectedPillars,
  getStreakCount,
  getYesterdayActivity,
  generateRexMorningMessage,
  markMorningBriefingDone,
  saveDailyIntention,
  isBeforeNoon,
  type YesterdayActivity,
} from '../../services/growthovoExperienceService';
import { getNextLesson } from '../../services/lessonService';
import type { PillarKey, Lesson } from '../../types';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  userId: string;
  onComplete: () => void;
}

interface SuggestedLesson {
  pillar: PillarKey;
  lesson: Lesson | null;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MorningBriefingScreen({ userId, onComplete }: Props) {
  const { updateXP } = useAppContext();
  
  // State
  const [currentPart, setCurrentPart] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Part 1 data
  const [userName, setUserName] = useState('Champion');
  const [quote, setQuote] = useState('');
  const [streak, setStreak] = useState(0);
  
  // Part 2 data
  const [yesterdayActivity, setYesterdayActivity] = useState<YesterdayActivity>({ xp: 0, lessons: 0, mood: null });
  
  // Part 3 data
  const [suggestedLessons, setSuggestedLessons] = useState<SuggestedLesson[]>([]);
  
  // Part 4 data
  const [intention, setIntention] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  // Part 5 data
  const [rexMessage, setRexMessage] = useState('');
  
  // Completing state
  const [completing, setCompleting] = useState(false);

  // ── Load data on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    loadBriefingData();
  }, []);

  async function loadBriefingData() {
    try {
      setLoading(true);
      
      // Load Part 1 data
      const name = await getUserName();
      const dailyQuote = getDailyQuote();
      const currentStreak = await getStreakCount();
      
      setUserName(name);
      setQuote(dailyQuote);
      setStreak(currentStreak);
      
      // Load Part 2 data
      const yesterday = await getYesterdayActivity();
      setYesterdayActivity(yesterday);
      
      // Load Part 3 data - get top 2 pillars and their next lessons
      const pillars = await getSelectedPillars();
      const top2Pillars = pillars.slice(0, 2);
      
      const lessons: SuggestedLesson[] = [];
      for (const pillar of top2Pillars) {
        const nextLesson = await getNextLesson(userId, pillar);
        lessons.push({ pillar, lesson: nextLesson });
      }
      setSuggestedLessons(lessons);
      
      // Load Part 5 data - generate Rex message
      const dayOfWeek = new Date().getDay();
      const yesterdayMood = yesterday.mood;
      const message = generateRexMorningMessage({
        name,
        streak: currentStreak,
        yesterdayMood,
        dayOfWeek,
      });
      setRexMessage(message);
      
      // Check Web Speech API support
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        setVoiceSupported(true);
      }
      
    } catch (error) {
      console.error('Failed to load briefing data:', error);
    } finally {
      setLoading(false);
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  function goToNextPart() {
    if (currentPart < 5) {
      setCurrentPart(currentPart + 1);
    }
  }

  function goToPreviousPart() {
    if (currentPart > 1) {
      setCurrentPart(currentPart - 1);
    }
  }

  // ── Complete briefing ──────────────────────────────────────────────────────
  async function handleComplete() {
    try {
      setCompleting(true);
      
      // Save intention if provided
      if (intention.trim()) {
        await saveDailyIntention(intention.trim());
      }
      
      // Mark briefing as done
      await markMorningBriefingDone();
      
      // Award 20 XP
      await updateXP(20);
      
      onComplete();
    } catch (error) {
      console.error('Failed to complete briefing:', error);
      setCompleting(false);
    }
  }

  // ── Render loading state ───────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.root}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Preparing your morning briefing...</Text>
        </View>
      </View>
    );
  }

  // ── Render parts ───────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((part) => (
            <View
              key={part}
              style={[
                styles.progressDot,
                part === currentPart && styles.progressDotActive,
                part < currentPart && styles.progressDotComplete,
              ]}
            />
          ))}
        </View>

        {/* Part 1: Morning greeting with quote */}
        {currentPart === 1 && (
          <View style={styles.partContainer}>
            <Text style={styles.greeting}>Good morning {userName} ☀️</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
            
            <View style={styles.quoteCard}>
              <Text style={styles.quote}>{quote}</Text>
            </View>
            
            <View style={styles.streakCard}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>Your streak: {streak} days</Text>
            </View>
            
            <TouchableOpacity
              style={styles.nextButton}
              onPress={goToNextPart}
              accessibilityRole="button"
              accessibilityLabel="Continue to next part"
            >
              <Text style={styles.nextButtonText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Part 2: Yesterday's recap */}
        {currentPart === 2 && (
          <View style={styles.partContainer}>
            <Text style={styles.partTitle}>Yesterday's Recap</Text>
            
            {yesterdayActivity.xp === 0 && yesterdayActivity.lessons === 0 ? (
              <View style={styles.freshStartCard}>
                <Text style={styles.freshStartEmoji}>💪</Text>
                <Text style={styles.freshStartText}>Fresh start today</Text>
              </View>
            ) : (
              <View style={styles.recapCard}>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>XP Earned</Text>
                  <Text style={styles.recapValue}>{yesterdayActivity.xp}</Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>Lessons Completed</Text>
                  <Text style={styles.recapValue}>{yesterdayActivity.lessons}</Text>
                </View>
                {yesterdayActivity.mood && (
                  <View style={styles.recapRow}>
                    <Text style={styles.recapLabel}>Mood Logged</Text>
                    <Text style={styles.recapValue}>{yesterdayActivity.mood}</Text>
                  </View>
                )}
              </View>
            )}
            
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={goToPreviousPart}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={goToNextPart}
                accessibilityRole="button"
                accessibilityLabel="Continue to next part"
              >
                <Text style={styles.nextButtonText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Part 3: Suggested lessons */}
        {currentPart === 3 && (
          <View style={styles.partContainer}>
            <Text style={styles.partTitle}>Suggested Lessons</Text>
            <Text style={styles.partSubtitle}>From your top pillars</Text>
            
            {suggestedLessons.length === 0 ? (
              <View style={styles.noLessonsCard}>
                <Text style={styles.noLessonsText}>No lessons available yet</Text>
              </View>
            ) : (
              <View style={styles.lessonsContainer}>
                {suggestedLessons.map((item, index) => (
                  <View key={index} style={styles.lessonCard}>
                    <Text style={styles.lessonPillar}>{item.pillar.toUpperCase()}</Text>
                    {item.lesson ? (
                      <>
                        <Text style={styles.lessonTitle}>{item.lesson.title}</Text>
                        <TouchableOpacity
                          style={styles.addToPlanButton}
                          accessibilityRole="button"
                          accessibilityLabel={`Add ${item.lesson.title} to today's plan`}
                        >
                          <Text style={styles.addToPlanText}>Add to today's plan →</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text style={styles.lessonComplete}>All lessons completed! 🎉</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={goToPreviousPart}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={goToNextPart}
                accessibilityRole="button"
                accessibilityLabel="Continue to next part"
              >
                <Text style={styles.nextButtonText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Part 4: Daily intention input */}
        {currentPart === 4 && (
          <View style={styles.partContainer}>
            <Text style={styles.partTitle}>Set Your Intention</Text>
            <Text style={styles.partSubtitle}>What will you focus on today?</Text>
            
            <TextInput
              style={styles.intentionInput}
              placeholder="Today I will..."
              placeholderTextColor={colors.textMuted}
              value={intention}
              onChangeText={setIntention}
              multiline
              numberOfLines={3}
              maxLength={200}
              accessibilityLabel="Daily intention input"
            />
            
            {voiceSupported && (
              <View style={styles.voiceNoteHint}>
                <Text style={styles.voiceNoteText}>🎤 Voice note available</Text>
              </View>
            )}
            
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={goToPreviousPart}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={goToNextPart}
                accessibilityRole="button"
                accessibilityLabel="Continue to next part"
              >
                <Text style={styles.nextButtonText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Part 5: Rex personalized message */}
        {currentPart === 5 && (
          <View style={styles.partContainer}>
            <Text style={styles.partTitle}>Message from Rex</Text>
            
            <View style={styles.rexMessageCard}>
              <Text style={styles.rexEmoji}>🤖</Text>
              <Text style={styles.rexMessageText}>{rexMessage}</Text>
            </View>
            
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={goToPreviousPart}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.completeButton, completing && styles.completeButtonDisabled]}
                onPress={handleComplete}
                disabled={completing}
                accessibilityRole="button"
                accessibilityLabel="Start your day"
              >
                {completing ? (
                  <ActivityIndicator color={colors.text} size="small" />
                ) : (
                  <Text style={styles.completeButtonText}>Start your day →</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },
  container: {
    padding: spacing.md,
    paddingTop: 60,
    paddingBottom: 48,
  },
  
  // Progress indicator
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  progressDotComplete: {
    backgroundColor: colors.success,
  },
  
  // Part container
  partContainer: {
    gap: spacing.lg,
  },
  
  // Part 1: Greeting
  greeting: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  date: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -spacing.md,
  },
  quoteCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  quote: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  streakCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakText: {
    ...typography.h3,
    color: colors.text,
  },
  
  // Part 2: Recap
  partTitle: {
    ...typography.h2,
    color: colors.text,
  },
  partSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: -spacing.md,
  },
  freshStartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  freshStartEmoji: {
    fontSize: 48,
  },
  freshStartText: {
    ...typography.h3,
    color: colors.text,
  },
  recapCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapLabel: {
    ...typography.body,
    color: colors.textMuted,
  },
  recapValue: {
    ...typography.h3,
    color: colors.text,
  },
  
  // Part 3: Lessons
  lessonsContainer: {
    gap: spacing.md,
  },
  lessonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  lessonPillar: {
    ...typography.caption,
    color: colors.primary,
  },
  lessonTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  lessonComplete: {
    ...typography.body,
    color: colors.success,
  },
  addToPlanButton: {
    marginTop: spacing.sm,
  },
  addToPlanText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  noLessonsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  noLessonsText: {
    ...typography.body,
    color: colors.textMuted,
  },
  
  // Part 4: Intention
  intentionInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  voiceNoteHint: {
    alignItems: 'center',
  },
  voiceNoteText: {
    ...typography.small,
    color: colors.textMuted,
  },
  
  // Part 5: Rex message
  rexMessageCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  rexEmoji: {
    fontSize: 48,
  },
  rexMessageText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
    textAlign: 'center',
  },
  
  // Navigation buttons
  navigationButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  backButtonText: {
    ...typography.bodyBold,
    color: colors.textMuted,
  },
  nextButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  nextButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  completeButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  completeButtonDisabled: {
    backgroundColor: colors.surface,
  },
  completeButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
});
