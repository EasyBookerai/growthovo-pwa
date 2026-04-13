import { supabase } from './supabaseClient';
import { awardXP } from './progressService';
import { XP_AWARDS } from '../types';
import type { Lesson } from '../types';
import type { SupportedLanguage } from './i18nService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get the active language from the language store without importing the store
 * directly (avoids circular deps). Falls back to 'en'.
 */
function getActiveLanguage(): SupportedLanguage {
  try {
    // Dynamic require to avoid circular dependency at module load time
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useLanguageStore } = require('../store');
    return useLanguageStore.getState().language ?? 'en';
  } catch {
    return 'en';
  }
}

/**
 * Fetch lessons with language filter. If no rows are returned for the
 * requested language, retries with 'en' as fallback.
 */
async function fetchLessonsWithFallback(
  query: () => Promise<{ data: any[] | null; error: any }>,
  fallbackQuery: () => Promise<{ data: any[] | null; error: any }>
): Promise<any[]> {
  const { data, error } = await query();
  if (error) throw new Error('Failed to fetch lessons.');
  if (data && data.length > 0) return data;

  // Fallback to English
  const { data: fallbackData, error: fallbackError } = await fallbackQuery();
  if (fallbackError) throw new Error('Failed to fetch lessons (fallback).');
  return fallbackData ?? [];
}

// ---------------------------------------------------------------------------
// Get Lessons For Unit
// ---------------------------------------------------------------------------

export async function getLessonsForUnit(
  unitId: string,
  language?: SupportedLanguage
): Promise<Lesson[]> {
  const lang = language ?? getActiveLanguage();

  const rows = await fetchLessonsWithFallback(
    () =>
      supabase
        .from('lessons')
        .select('*')
        .eq('unit_id', unitId)
        .eq('language', lang)
        .order('display_order', { ascending: true }),
    () =>
      supabase
        .from('lessons')
        .select('*')
        .eq('unit_id', unitId)
        .eq('language', 'en')
        .order('display_order', { ascending: true })
  );

  return rows.map(mapLesson);
}

// ---------------------------------------------------------------------------
// Complete Lesson
// ---------------------------------------------------------------------------

export async function completeLesson(userId: string, lessonId: string): Promise<number> {
  const xpAmount = XP_AWARDS.LESSON_COMPLETE;

  const { data: existing } = await supabase
    .from('user_progress')
    .select('id, xp_earned')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (existing?.xp_earned && existing.xp_earned > 0) {
    return existing.xp_earned;
  }

  const { error } = await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
      xp_earned: xpAmount,
    },
    { onConflict: 'user_id,lesson_id' }
  );

  if (error) throw new Error('Failed to record lesson completion.');

  await awardXP(userId, xpAmount, 'lesson', lessonId);
  return xpAmount;
}

// ---------------------------------------------------------------------------
// Get Next Lesson
// ---------------------------------------------------------------------------

export async function getNextLesson(
  userId: string,
  pillarId: string,
  language?: SupportedLanguage
): Promise<Lesson | null> {
  const lang = language ?? getActiveLanguage();

  const fetchLessons = (lng: string) =>
    supabase
      .from('lessons')
      .select('*, units!inner(pillar_id, display_order)')
      .eq('units.pillar_id', pillarId)
      .eq('language', lng)
      .order('units.display_order', { ascending: true })
      .order('display_order', { ascending: true });

  let { data: lessons, error } = await fetchLessons(lang);
  if (error) throw new Error('Failed to fetch lessons.');

  // Fallback to English if no lessons in requested language
  if (!lessons || lessons.length === 0) {
    const fallback = await fetchLessons('en');
    if (fallback.error) throw new Error('Failed to fetch lessons (fallback).');
    lessons = fallback.data ?? [];
  }

  if (!lessons || lessons.length === 0) return null;

  const lessonIds = lessons.map((l: any) => l.id);
  const { data: progress } = await supabase
    .from('user_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds)
    .not('completed_at', 'is', null);

  const completedIds = new Set((progress ?? []).map((p: any) => p.lesson_id));
  const next = lessons.find((l: any) => !completedIds.has(l.id));
  return next ? mapLesson(next) : null;
}

// ---------------------------------------------------------------------------
// Is Lesson Unlocked
// ---------------------------------------------------------------------------

export async function isLessonUnlocked(
  userId: string,
  lessonId: string,
  language?: SupportedLanguage
): Promise<boolean> {
  const lang = language ?? getActiveLanguage();

  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('display_order, unit_id')
    .eq('id', lessonId)
    .eq('language', lang)
    .single();

  if (error) throw new Error('Failed to fetch lesson.');
  if (lesson.display_order === 1) return true;

  const { data: prev } = await supabase
    .from('lessons')
    .select('id')
    .eq('unit_id', lesson.unit_id)
    .eq('language', lang)
    .eq('display_order', lesson.display_order - 1)
    .single();

  if (!prev) return true;

  const { data: progressData } = await supabase
    .from('user_progress')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('lesson_id', prev.id)
    .maybeSingle();

  return !!progressData?.completed_at;
}

// ---------------------------------------------------------------------------
// Get Completed Lesson IDs
// ---------------------------------------------------------------------------

export async function getCompletedLessonIds(
  userId: string,
  pillarId: string,
  language?: SupportedLanguage
): Promise<Set<string>> {
  const lang = language ?? getActiveLanguage();

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, units!inner(pillar_id)')
    .eq('units.pillar_id', pillarId)
    .eq('language', lang);

  const lessonIds = (lessons ?? []).map((l: any) => l.id);
  if (lessonIds.length === 0) return new Set();

  const { data: progress } = await supabase
    .from('user_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds)
    .not('completed_at', 'is', null);

  return new Set((progress ?? []).map((p: any) => p.lesson_id));
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function mapLesson(row: any): Lesson {
  return {
    id: row.id,
    unitId: row.unit_id,
    title: row.title,
    displayOrder: row.display_order,
    cardConcept: row.card_concept,
    cardExample: row.card_example,
    cardMistake: row.card_mistake,
    cardScience: row.card_science,
    cardChallenge: row.card_challenge,
  };
}
