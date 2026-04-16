/**
 * Rex Service — core AI interaction gateway.
 * Calls GROWTHOVO Edge Functions for AI responses.
 */

import { supabase } from './supabaseClient';
import type { RexTrigger } from '../types';

// ─── Fallback messages (offline / error) ─────────────────────────────────────

const FALLBACKS: Record<RexTrigger, string[]> = {
  lesson_complete: [
    "Lesson done. Now go actually use what you just learned.",
    "Knowledge without action is just trivia. Apply it today.",
    "You read it. Now live it. That's the whole point.",
  ],
  checkin_positive: [
    "You did the thing. Most people just think about doing the thing. You're not most people.",
    "That's what I'm talking about. Keep this energy.",
    "Proof that you're serious. Stack another one tomorrow.",
  ],
  checkin_negative: [
    "Didn't happen today. That's fine. Tomorrow it does. No excuses.",
    "One miss doesn't define you. Two misses starts a pattern. Don't let it.",
    "Honest answer. Now be honest about what got in the way and fix it.",
  ],
  streak_risk: [
    "Your streak is sitting there waiting. Don't be the person who quits on day {streak}.",
    "You've come too far to let today be the day it ends.",
    "Five minutes. That's all it takes to keep this alive.",
  ],
  level_up: [
    "Level up. The bar just moved. Time to meet it.",
    "You earned that. Now raise your own expectations.",
    "New level, new standard. Don't get comfortable.",
  ],
};

// ─── Get Rex Response ─────────────────────────────────────────────────────────
// Calls the rex-chat Edge Function. Falls back to local messages on error.

export async function getRexResponse(
  userId: string,
  trigger: RexTrigger,
  context?: Record<string, any>
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('rex-chat', {
      body: { userId, trigger, context: context ?? {} },
    });

    if (error || !data?.message) {
      return getFallbackMessage(trigger, context);
    }

    return data.message as string;
  } catch {
    return getFallbackMessage(trigger, context);
  }
}

// ─── Get Fallback Message ─────────────────────────────────────────────────────

export function getFallbackMessage(trigger: RexTrigger, context?: Record<string, any>): string {
  const pool = FALLBACKS[trigger] ?? FALLBACKS.lesson_complete;
  const message = pool[Math.floor(Math.random() * pool.length)];

  // Replace template variables
  if (context?.streak) {
    return message.replace('{streak}', String(context.streak));
  }
  return message;
}
