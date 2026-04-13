import { supabase } from './supabaseClient';
import type { WeeklyRexReport, WeeklyReportNumbers, SOSType } from '../types';

// ─── Fallback pools ───────────────────────────────────────────────────────────

const VERDICT_FALLBACKS: string[] = [
  "You showed up more than most. That's not nothing — but you know there's a gap between showing up and actually pushing. Close it this week.",
  "The numbers don't lie, and neither does Rex. You had the tools, you had the time. What you didn't have was urgency. Find it.",
  "Solid week on paper. But you and I both know you coasted on Tuesday and Wednesday. One real day of locked-in effort beats five half-hearted ones.",
  "You're building something. It's slow, it's messy, and some days it barely looks like progress. Keep going anyway — that's the whole game.",
  "Not your best week. Not your worst. The question isn't how you did — it's whether you're going to let average become your standard.",
];

const PATTERN_ANALYSIS_FALLBACKS: string[] = [
  "You tend to start the week strong and fade by Thursday. Your energy isn't the problem — your pacing is. Front-load the hard stuff on Monday.",
  "Your SOS usage spikes mid-week, which tells me Wednesday is your pressure point. Build a buffer into Tuesday evening so Wednesday doesn't catch you off guard.",
  "Evening debriefs are your weakest habit. You skip them when you're tired — which is exactly when you need them most. Set a 60-second minimum and stick to it.",
  "Your morning check-ins show a pattern: low state on Mondays, locked-in by Wednesday. You're slow to start but you do find your rhythm. The goal is to find it faster.",
  "Challenge completion drops when your streak is under pressure. You're playing defence instead of offence. Protect the streak by doing the challenge first, not last.",
];

// ─── getOrGenerateWeeklyReport ────────────────────────────────────────────────

/**
 * Fetches the weekly report for the given user and week.
 * If no cached report exists, calls the generate-weekly-report Edge Function
 * to create one, then returns the result.
 */
export async function getOrGenerateWeeklyReport(
  userId: string,
  weekStart: string,
): Promise<WeeklyRexReport> {
  // Check for cached report first
  const { data: cached, error: fetchError } = await supabase
    .from('weekly_rex_reports')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to fetch weekly report: ${fetchError.message}`);
  }

  if (cached) {
    return mapRowToReport(cached);
  }

  // Generate via Edge Function
  const { data, error } = await supabase.functions.invoke('generate-weekly-report', {
    body: { userId, weekStart },
  });

  if (error) {
    throw new Error(`Failed to generate weekly report: ${error.message}`);
  }

  return data as WeeklyRexReport;
}

// ─── getReportNumbers ─────────────────────────────────────────────────────────

/**
 * Aggregates WeeklyReportNumbers for the given user and week by querying
 * evening_debriefs, sos_events, daily_checkins, xp_transactions, and
 * challenge_completions directly.
 */
export async function getReportNumbers(
  userId: string,
  weekStart: string,
): Promise<WeeklyReportNumbers> {
  const weekEnd = getWeekEnd(weekStart);

  const [
    debriefResult,
    sosResult,
    checkinResult,
    xpResult,
    challengeResult,
  ] = await Promise.all([
    // Evening debriefs for the week
    supabase
      .from('evening_debriefs')
      .select('id, q1_answer')
      .eq('user_id', userId)
      .gte('date', weekStart)
      .lte('date', weekEnd),

    // SOS events for the week
    supabase
      .from('sos_events')
      .select('type')
      .eq('user_id', userId)
      .gte('timestamp', `${weekStart}T00:00:00Z`)
      .lte('timestamp', `${weekEnd}T23:59:59Z`),

    // Morning check-ins for the week (for streak calculation)
    supabase
      .from('daily_checkins')
      .select('date, briefing_viewed_at')
      .eq('user_id', userId)
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .order('date', { ascending: true }),

    // XP earned this week
    supabase
      .from('xp_transactions')
      .select('amount')
      .eq('user_id', userId)
      .gte('created_at', `${weekStart}T00:00:00Z`)
      .lte('created_at', `${weekEnd}T23:59:59Z`),

    // Challenge completions this week
    supabase
      .from('challenge_completions')
      .select('id, completed')
      .eq('user_id', userId)
      .gte('completed_at', `${weekStart}T00:00:00Z`)
      .lte('completed_at', `${weekEnd}T23:59:59Z`),
  ]);

  // Lessons completed — derived from xp_transactions with source='lesson'
  const { data: lessonXp } = await supabase
    .from('xp_transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('source', 'lesson')
    .gte('created_at', `${weekStart}T00:00:00Z`)
    .lte('created_at', `${weekEnd}T23:59:59Z`);

  const lessonsCompleted = lessonXp?.length ?? 0;

  // Challenges done / missed
  const allChallenges = challengeResult.data ?? [];
  const challengesDone = allChallenges.filter((c) => c.completed).length;
  const challengesMissed = allChallenges.filter((c) => !c.completed).length;

  // SOS by type
  const sosByType = buildSOSByType(sosResult.data ?? []);

  // Morning check-in streak (consecutive days with briefing_viewed_at set)
  const checkins = checkinResult.data ?? [];
  const morningCheckinStreak = calcMorningCheckinStreak(checkins);

  // Evening debrief rate (debriefs submitted / 7 days)
  const debriefCount = debriefResult.data?.length ?? 0;
  const eveningDebriefRate = Math.min(debriefCount / 7, 1.0);

  // Total XP earned
  const xpEarned = (xpResult.data ?? []).reduce((sum, row) => sum + (row.amount ?? 0), 0);

  return {
    lessonsCompleted,
    challengesDone,
    challengesMissed,
    sosByType,
    morningCheckinStreak,
    eveningDebriefRate,
    xpEarned,
  };
}

// ─── generateShareCard ────────────────────────────────────────────────────────

/**
 * Captures an off-screen share card as a PNG and returns its local URI.
 *
 * NOTE: The actual react-native-view-shot capture is wired in the UI screen
 * (WeeklyReportScreen) which passes a ref to the off-screen <View>. This
 * service function acts as a stub that the screen can call after performing
 * the capture, or the screen can call captureRef directly and pass the URI
 * here for any post-processing. For now it returns a placeholder URI so the
 * rest of the share flow can be developed independently.
 */
export async function generateShareCard(_report: WeeklyRexReport): Promise<string> {
  // Stub: actual capture is performed in WeeklyReportScreen via captureRef()
  // from react-native-view-shot. The screen calls captureRef on the off-screen
  // ShareableCard view and passes the resulting URI to the native share sheet.
  return 'file://share-card-placeholder.png';
}

// ─── Fallback helpers ─────────────────────────────────────────────────────────

/** Returns a random Rex-style verdict from the fallback pool. */
export function getReportFallbackVerdict(): string {
  return VERDICT_FALLBACKS[Math.floor(Math.random() * VERDICT_FALLBACKS.length)];
}

/** Returns a random pattern analysis string from the fallback pool. */
export function getReportFallbackPatternAnalysis(): string {
  return PATTERN_ANALYSIS_FALLBACKS[
    Math.floor(Math.random() * PATTERN_ANALYSIS_FALLBACKS.length)
  ];
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Returns the ISO date string for the last day of the week (weekStart + 6 days). */
function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}

/** Builds a Record<SOSType, number> from raw SOS event rows. */
function buildSOSByType(rows: Array<{ type: string }>): Record<SOSType, number> {
  const allTypes: SOSType[] = [
    'anxiety_spike',
    'about_to_react',
    'zero_motivation',
    'hard_conversation',
    'habit_urge',
    'overwhelmed',
  ];
  const counts = Object.fromEntries(allTypes.map((t) => [t, 0])) as Record<SOSType, number>;
  for (const row of rows) {
    if (row.type in counts) {
      counts[row.type as SOSType]++;
    }
  }
  return counts;
}

/**
 * Calculates the consecutive morning check-in streak within the week.
 * Counts from the most recent day backwards while briefing_viewed_at is set.
 */
function calcMorningCheckinStreak(
  checkins: Array<{ date: string; briefing_viewed_at: string | null }>,
): number {
  // Sort descending so we count from the most recent day
  const sorted = [...checkins].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  let streak = 0;
  for (const c of sorted) {
    if (c.briefing_viewed_at) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/** Maps a raw Supabase row to a WeeklyRexReport interface. */
function mapRowToReport(row: Record<string, unknown>): WeeklyRexReport {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    weekStart: row.week_start as string,
    numbersJson: (row.numbers_json ?? {}) as WeeklyReportNumbers,
    patternAnalysis: (row.pattern_analysis ?? '') as string,
    verdictText: (row.verdict_text ?? '') as string,
    audioUrl: (row.audio_url ?? null) as string | null,
    nextWeekFocusJson: (row.next_week_focus_json ?? {}) as WeeklyRexReport['nextWeekFocusJson'],
    createdAt: row.created_at as string,
  };
}
