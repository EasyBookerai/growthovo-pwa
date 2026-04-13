import { supabase } from './supabaseClient';
import type { SOSEvent, SOSType, SOSOutcome } from '../types';

// ─── startSOSEvent ─────────────────────────────────────────────────────────────

/**
 * Inserts a new SOS event with outcome='started' and returns the created record.
 * Requirements: 6.4, 6.5
 */
export async function startSOSEvent(userId: string, type: SOSType): Promise<SOSEvent> {
  const { data, error } = await supabase
    .from('sos_events')
    .insert({
      user_id: userId,
      type,
      timestamp: new Date().toISOString(),
      outcome: 'started' as SOSOutcome,
      duration_seconds: 0,
      notes: null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to start SOS event: ${error?.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    timestamp: data.timestamp,
    durationSeconds: data.duration_seconds,
    outcome: data.outcome,
    notes: data.notes,
  } as SOSEvent;
}

// ─── completeSOSEvent ──────────────────────────────────────────────────────────

/**
 * Updates an SOS event with the final outcome, calculated duration, and optional notes.
 * Duration is calculated from the event's original timestamp to now.
 * Requirements: 6.5, 6.6
 */
export async function completeSOSEvent(
  eventId: string,
  outcome: SOSOutcome,
  notes?: string
): Promise<void> {
  // Fetch the event to get its original timestamp
  const { data: existing, error: fetchError } = await supabase
    .from('sos_events')
    .select('timestamp')
    .eq('id', eventId)
    .single();

  if (fetchError || !existing) {
    throw new Error(`Failed to fetch SOS event for completion: ${fetchError?.message}`);
  }

  const startedAt = new Date(existing.timestamp).getTime();
  const durationSeconds = Math.round((Date.now() - startedAt) / 1000);

  const updatePayload: Record<string, unknown> = { outcome, duration_seconds: durationSeconds };
  if (notes !== undefined) {
    updatePayload.notes = notes;
  }

  const { error } = await supabase
    .from('sos_events')
    .update(updatePayload)
    .eq('id', eventId);

  if (error) {
    throw new Error(`Failed to complete SOS event: ${error.message}`);
  }
}

// ─── getAnxietyHistoryCount ────────────────────────────────────────────────────

/**
 * Returns the number of anxiety_spike SOS events for a user in the last N days.
 * Requirement: 7.6
 */
export async function getAnxietyHistoryCount(userId: string, days: number): Promise<number> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('sos_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'anxiety_spike')
    .gte('timestamp', since);

  if (error) {
    console.error('getAnxietyHistoryCount error:', error);
    return 0;
  }

  return count ?? 0;
}

// ─── getSOSFallback ────────────────────────────────────────────────────────────

/**
 * Returns a pre-written fallback message for each SOS type.
 * Used when the Edge Function times out or fails.
 * Requirement: 11.6
 */
export function getSOSFallback(type: SOSType): string {
  const fallbacks: Record<SOSType, string> = {
    anxiety_spike:
      "Your nervous system is doing its job — it detected a threat. Take a slow breath in for 4 counts, hold for 7, out for 8. You are safe right now.",
    about_to_react:
      "Pause. Whatever you send in the next 90 seconds cannot be unsent. The version of you that waits is always stronger than the one that reacts.",
    zero_motivation:
      "You don't need to feel motivated to move. Pick one thing — the smallest possible action — and do only that. Momentum follows movement, not the other way around.",
    hard_conversation:
      "Start with curiosity, not conclusions. Lead with 'I noticed…' or 'Help me understand…' and listen twice as long as you speak.",
    habit_urge:
      "This urge is a wave — it will peak and pass in 10–20 minutes. You've surfed it before. Ride it out. Your future self is watching.",
    overwhelmed:
      "You cannot do everything. Pick the one thing that, if done today, makes everything else easier or irrelevant. Start there.",
  };

  return fallbacks[type];
}

// ─── isAnxietyPatternTriggered ─────────────────────────────────────────────────

/**
 * Pure function. Returns true if the anxiety spike count meets or exceeds the
 * pattern threshold of 3 events.
 * Requirements: 7.6, 11.6
 */
export function isAnxietyPatternTriggered(count: number): boolean {
  return count >= 3;
}
