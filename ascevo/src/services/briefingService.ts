import { supabase } from './supabaseClient';
import { awardXP } from './progressService';
import { sendPartnerCheckinNotification } from './notificationService';
import type { MentalState } from '../types';

// ─── Fallback pools ────────────────────────────────────────────────────────────

// 14 entries: 2 per day of week (0=Sunday … 6=Saturday)
const FALLBACK_TRUTHS: Record<number, [string, string]> = {
  0: [
    "Sunday is the day most people waste. You're already ahead by being here.",
    "Rest is part of the work. Use today to prepare, not to disappear.",
  ],
  1: [
    "Monday sets the tone for the whole week. Don't negotiate with yourself today.",
    "Everyone starts fresh on Monday. The difference is who actually follows through.",
  ],
  2: [
    "Tuesday is where momentum either builds or dies. Keep the pressure on.",
    "The week is young. What you do today compounds into Friday's results.",
  ],
  3: [
    "Midweek is where most people slow down. That's exactly when you speed up.",
    "Wednesday is the test. If you're still showing up, you're already winning.",
  ],
  4: [
    "Thursday means the finish line is close. Don't ease up now.",
    "You've made it to Thursday. One more push and the week is yours.",
  ],
  5: [
    "Friday is not the finish line — it's the last chance to make the week count.",
    "Look back at this week. What did you actually do? Be honest.",
  ],
  6: [
    "Saturday is for people who do the work when no one's watching.",
    "The weekend is where discipline separates from motivation. Which one are you running on?",
  ],
};

// 6 entries per pillar
const FALLBACK_FOCUS: Record<string, string[]> = {
  mind: [
    "Before 10am: write down the one thought that's been distracting you most. Then close the notebook.",
    "Tonight: spend 10 minutes reading something that challenges how you think — not confirms it.",
    "Before lunch: identify one belief you're holding that might be wrong. Sit with it.",
    "This morning: do 5 minutes of focused breathing before you open any app.",
    "Before 2pm: write one sentence about what you want your mind to be like in 6 months.",
    "Tonight: put your phone in another room for 1 hour and just think.",
  ],
  discipline: [
    "Before 9am: do the one task you've been avoiding for more than 3 days.",
    "Tonight: lay out everything you need for tomorrow so there are zero excuses.",
    "Before noon: complete your hardest task of the day — not the easiest.",
    "This morning: set a timer for 25 minutes and work on one thing with zero interruptions.",
    "Before 3pm: say no to one thing that doesn't align with your goals today.",
    "Tonight: review what you said you'd do today. Did you do it? Be honest.",
  ],
  communication: [
    "Before 2pm: send one message you've been putting off — keep it direct and clear.",
    "Tonight: have one real conversation without checking your phone once.",
    "This morning: think about the last misunderstanding you had. What would you say differently?",
    "Before noon: ask someone a question you actually want the answer to.",
    "Before 5pm: give one piece of honest feedback to someone who needs it.",
    "Tonight: write down what you want to say in a conversation you've been avoiding.",
  ],
  money: [
    "Before noon: check your last 7 days of spending. Find one thing to cut.",
    "Tonight: write down one financial decision you've been avoiding. Make it.",
    "This morning: calculate how much your biggest time-waster costs you per year.",
    "Before 3pm: research one thing you could do to earn more in the next 30 days.",
    "Before 5pm: set a specific savings target for this month — not a vague one.",
    "Tonight: review your subscriptions. Cancel one you don't actually use.",
  ],
  career: [
    "Before noon: do one thing that moves your career forward — not just your inbox.",
    "Tonight: write down the skill gap between where you are and where you want to be.",
    "This morning: reach out to one person in your field you haven't spoken to in months.",
    "Before 2pm: work on a project that showcases your best work, even for 30 minutes.",
    "Before 5pm: identify one thing at work you've been doing out of habit, not purpose.",
    "Tonight: write down what you want your career to look like in 2 years. Be specific.",
  ],
  relationships: [
    "Before tonight: check in on one person you care about — a real message, not a reaction.",
    "Tonight: have dinner or a call with someone important without any screens.",
    "This morning: think about one relationship you've been neglecting. Take one step today.",
    "Before 3pm: tell someone something you appreciate about them. Out loud or in writing.",
    "Before 5pm: resolve one small tension you've been letting sit. Don't let it grow.",
    "Tonight: ask someone close to you how they're actually doing — and listen.",
  ],
};

// Pre-written Rex reactions per mental state (fallback when Edge Function unavailable)
const MENTAL_STATE_FALLBACKS: Record<MentalState, string> = {
  anxious: "Anxiety means something matters to you. Use that energy — don't fight it.",
  low: "Low days are data, not destiny. Show up anyway and see what happens.",
  neutral: "Neutral is fine. You don't need to be fired up — just consistent.",
  good: "Good. Now don't waste it. Channel it into something that matters today.",
  locked_in: "That's the state. Protect it. Don't let anything break your focus today.",
};

// ─── hasBriefingBeenShownToday ─────────────────────────────────────────────────

/**
 * Returns true if the user has already viewed the morning briefing today.
 * Checks for a non-null briefing_viewed_at in daily_checkins for today's date.
 */
export async function hasBriefingBeenShownToday(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('briefing_viewed_at')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (error) {
    console.error('hasBriefingBeenShownToday error:', error);
    return false;
  }

  return data?.briefing_viewed_at != null;
}

// ─── selectMentalState ────────────────────────────────────────────────────────

/**
 * Upserts the user's morning mental state into daily_checkins and returns
 * a Rex reaction. Tries the rex-response Edge Function first; falls back to
 * a pre-written reaction if the call fails or times out (3 seconds).
 */
export async function selectMentalState(userId: string, state: MentalState): Promise<string> {
  const today = new Date().toISOString().split('T')[0];

  // Generate Rex reaction — try Edge Function with 3-second timeout
  let reaction = MENTAL_STATE_FALLBACKS[state];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const { data, error } = await supabase.functions.invoke('rex-response', {
      body: {
        type: 'mental_state_reaction',
        userId,
        subscriptionStatus: 'active', // Edge Function handles free users gracefully
        params: { state, userId },
      },
    });

    clearTimeout(timeout);

    if (!error && data?.message) {
      reaction = data.message as string;
    }
  } catch {
    // Timeout or network error — use fallback silently
  }

  // Upsert daily_checkins with the selected state and reaction
  const { error: upsertError } = await supabase
    .from('daily_checkins')
    .upsert(
      {
        user_id: userId,
        date: today,
        morning_state: state,
        morning_rex_response: reaction,
      },
      { onConflict: 'user_id,date' }
    );

  if (upsertError) {
    console.error('selectMentalState upsert error:', upsertError);
  }

  return reaction;
}

// ─── dismissBriefing ──────────────────────────────────────────────────────────

/**
 * Records that the user has viewed the morning briefing (sets briefing_viewed_at)
 * and awards 10 XP via progressService.
 */
export async function dismissBriefing(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('daily_checkins')
    .upsert(
      {
        user_id: userId,
        date: today,
        briefing_viewed_at: now,
      },
      { onConflict: 'user_id,date' }
    );

  if (error) {
    console.error('dismissBriefing upsert error:', error);
    throw new Error('Failed to record briefing dismissal.');
  }

  await awardXP(userId, 10, 'morning_briefing');

  // Notify partner that user checked in (Requirement 20.2) — fire and forget
  try {
    const { data: profile } = await supabase
      .from('users')
      .select('username, current_streak')
      .eq('id', userId)
      .maybeSingle();

    if (profile) {
      const userName: string = profile.username ?? 'Your partner';
      const streakCount: number = profile.current_streak ?? 1;
      sendPartnerCheckinNotification(userId, userName, streakCount).catch(() => {});
    }
  } catch {
    // Non-critical — never block briefing dismissal
  }
}

// ─── getBriefingFallbackTruth ─────────────────────────────────────────────────

/**
 * Returns a fallback Rex Daily Truth for the given day of week (0=Sunday … 6=Saturday).
 * Pool has 14 entries (2 per day). Alternates between the two entries based on
 * the current week number to add variety.
 */
export function getBriefingFallbackTruth(dayOfWeek: number): string {
  const day = ((dayOfWeek % 7) + 7) % 7; // normalise to 0–6
  const entries = FALLBACK_TRUTHS[day];
  // Alternate between the two entries based on ISO week number
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return entries[weekNumber % 2];
}

// ─── getBriefingFallbackFocus ─────────────────────────────────────────────────

/**
 * Returns a fallback Today's Single Focus for the given pillar.
 * Pool has 6 entries per pillar. Rotates daily.
 */
export function getBriefingFallbackFocus(pillar: string): string {
  const key = pillar.toLowerCase();
  const entries = FALLBACK_FOCUS[key] ?? FALLBACK_FOCUS['discipline'];
  const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % entries.length;
  return entries[dayIndex];
}
