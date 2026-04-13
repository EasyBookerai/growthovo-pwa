/**
 * Rex AI Coach — Client Service
 * Calls the rex-response Edge Function and falls back to pre-written responses
 * when the function is unavailable, times out, or the user is rate-limited.
 */

import { supabase } from './supabaseClient';
import { useAuthStore } from '../store';
import {
  getCheckInFallback,
  getStreakWarningFallback,
  getWeeklySummaryFallback,
} from './rexFallback';
import type {
  RexCheckInParams,
  RexWeeklySummaryParams,
  RexStreakWarningParams,
  SubscriptionStatus,
} from '../types';
import type { SupportedLanguage } from './i18nService';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CLIENT_TIMEOUT_MS = 8000;
const EDGE_FUNCTION_NAME = 'rex-response';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSubscriptionStatus(): SubscriptionStatus {
  const user = useAuthStore.getState().user;
  return user?.subscriptionStatus ?? 'free';
}

function getActiveLanguage(): SupportedLanguage {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useLanguageStore } = require('../store');
    return useLanguageStore.getState().language ?? 'en';
  } catch {
    return 'en';
  }
}

/**
 * Invokes the rex-response Edge Function with a client-side timeout.
 * Passes the active language so Rex responds in the user's chosen language.
 * Returns null on timeout or network error.
 */
async function invokeRexFunction(
  type: 'checkin' | 'weekly_summary' | 'streak_warning',
  userId: string,
  subscriptionStatus: SubscriptionStatus,
  language: SupportedLanguage,
  params: RexCheckInParams | RexWeeklySummaryParams | RexStreakWarningParams
): Promise<{ message?: string; fallback?: boolean } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
      body: { type, userId, subscriptionStatus, language, params },
    });

    if (error) {
      console.error(`[Rex] Edge function error (${type}):`, error);
      return null;
    }

    return data as { message?: string; fallback?: boolean };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn(`[Rex] Edge function timed out (${type})`);
    } else {
      console.error(`[Rex] Edge function threw (${type}):`, err);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getRexCheckInResponse(params: RexCheckInParams): Promise<string> {
  const subscriptionStatus = getSubscriptionStatus();
  const language = getActiveLanguage();

  const result = await invokeRexFunction('checkin', params.userId, subscriptionStatus, language, params);

  if (!result || result.fallback) {
    return getCheckInFallback(params.challengeCompleted, params.streakDays, language);
  }

  return result.message ?? getCheckInFallback(params.challengeCompleted, params.streakDays, language);
}

export async function getRexWeeklySummary(params: RexWeeklySummaryParams): Promise<string> {
  const subscriptionStatus = getSubscriptionStatus();
  const language = getActiveLanguage();

  const result = await invokeRexFunction('weekly_summary', params.userId, subscriptionStatus, language, params);

  if (!result || result.fallback) {
    return getWeeklySummaryFallback(language);
  }

  return result.message ?? getWeeklySummaryFallback(language);
}

export async function getRexStreakWarning(params: RexStreakWarningParams): Promise<string> {
  const subscriptionStatus = getSubscriptionStatus();
  const language = getActiveLanguage();

  const result = await invokeRexFunction('streak_warning', params.userId, subscriptionStatus, language, params);

  if (!result || result.fallback) {
    return getStreakWarningFallback(params.streakDays, params.hoursLeft, language);
  }

  return result.message ?? getStreakWarningFallback(params.streakDays, params.hoursLeft, language);
}
