import { PillarKey, QuizQuestion } from '../types';
import { supabase } from './supabaseClient';

// ─── Quiz Questions ───────────────────────────────────────────────────────────

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    emoji: '🧠',
    text: "What's holding you back the most right now?",
    answers: [
      { text: 'I overthink everything and anxiety controls me', pillar: 'mind' },
      { text: 'I know what to do but never actually do it', pillar: 'discipline' },
      { text: 'I struggle to express myself and connect with people', pillar: 'communication' },
      { text: "I'm broke or terrible with money", pillar: 'money' },
      { text: "I don't know who I am or what I want", pillar: 'relationships' },
    ],
  },
  {
    emoji: '👥',
    text: 'How would your closest friend describe you?',
    answers: [
      { text: 'The overthinker who needs everything to be perfect', pillar: 'mind' },
      { text: 'Full of potential but inconsistent as hell', pillar: 'discipline' },
      { text: "Smart but too quiet when it matters", pillar: 'communication' },
      { text: 'Impulsive, especially with money', pillar: 'money' },
      { text: 'Still figuring it out', pillar: 'relationships' },
    ],
  },
  {
    emoji: '🎯',
    text: 'What do you want most in the next 90 days?',
    answers: [
      { text: 'To finally feel calm and in control of my mind', pillar: 'mind' },
      { text: 'To build habits that actually stick this time', pillar: 'discipline' },
      { text: 'To speak up, lead, and stop fading into the background', pillar: 'communication' },
      { text: 'To understand money and start making more of it', pillar: 'money' },
      { text: "To know exactly who I'm becoming and why", pillar: 'relationships' },
    ],
  },
  {
    emoji: '🚪',
    text: 'When do you usually give up on self-improvement?',
    answers: [
      { text: 'When anxiety or overthinking kicks in', pillar: 'mind' },
      { text: 'When motivation disappears after day 3', pillar: 'discipline' },
      { text: 'When I have to do it in front of or because of other people', pillar: 'communication' },
      { text: 'When it costs money or feels financially risky', pillar: 'money' },
      { text: "When I don't see results fast enough", pillar: 'relationships' },
    ],
  },
  {
    emoji: '🪞',
    text: "Be honest — what's your biggest weakness?",
    answers: [
      { text: 'My mind works against me', pillar: 'mind' },
      { text: 'My discipline is inconsistent', pillar: 'discipline' },
      { text: 'My communication holds me back', pillar: 'communication' },
      { text: 'My relationship with money is broken', pillar: 'money' },
      { text: 'I lack direction and identity', pillar: 'relationships' },
    ],
  },
];

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Scores a completed quiz by counting pillar frequencies.
 * Ties are broken by first appearance in the answer sequence.
 * If only one unique pillar exists, secondary equals primary.
 */
export function scoreQuiz(answers: PillarKey[]): { primary: PillarKey; secondary: PillarKey } {
  const counts = new Map<PillarKey, number>();
  const firstSeen = new Map<PillarKey, number>();

  answers.forEach((pillar, index) => {
    counts.set(pillar, (counts.get(pillar) ?? 0) + 1);
    if (!firstSeen.has(pillar)) firstSeen.set(pillar, index);
  });

  const sorted = [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return (firstSeen.get(a[0]) ?? 99) - (firstSeen.get(b[0]) ?? 99);
  });

  const primary = sorted[0][0];
  const secondary = sorted[1]?.[0] ?? primary;

  return { primary, secondary };
}

// ─── Persistence ──────────────────────────────────────────────────────────────

/**
 * Upserts quiz results to the Supabase users table.
 * Throws on failure so the UI can surface an error and allow retry.
 */
export async function saveQuizResults(
  userId: string,
  primary: PillarKey,
  secondary: PillarKey,
  dailyGoalMinutes: number,
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      primary_pillar: primary,
      secondary_pillar: secondary,
      daily_goal_minutes: dailyGoalMinutes,
      onboarding_complete: true,
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to save quiz results: ${error.message}`);
  }
}
