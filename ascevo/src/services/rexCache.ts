import { createHash } from 'crypto';
import { SupabaseClient } from '@supabase/supabase-js';
import type { SupportedLanguage } from './i18nService';

interface RexCacheRow {
  cache_key: string;
  response: string;
  language: string;
  created_at: string;
}

const CACHE_TTL_DAYS = 7;

export function getStreakBracket(streakDays: number): '1-7' | '8-30' | '31-100' | '100+' {
  if (streakDays <= 7) return '1-7';
  if (streakDays <= 30) return '8-30';
  if (streakDays <= 100) return '31-100';
  return '100+';
}

/**
 * Compute a language-aware cache key.
 * Including language ensures a cached German response is never served to a French user.
 */
export function computeCacheKey(
  challengeText: string,
  completed: boolean,
  streakDays: number,
  language: SupportedLanguage = 'en'
): string {
  const bracket = getStreakBracket(streakDays);
  const raw = `${challengeText}|${completed}|${bracket}|${language}`;
  return createHash('sha256').update(raw).digest('hex');
}

export async function getCachedResponse(
  cacheKey: string,
  language: SupportedLanguage = 'en',
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase
    .from('rex_cache')
    .select('response, created_at')
    .eq('cache_key', cacheKey)
    .eq('language', language)  // Filter by language to prevent cross-language hits
    .single<RexCacheRow>();

  if (error || !data) return null;

  const createdAt = new Date(data.created_at);
  const diffDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays > CACHE_TTL_DAYS) return null;

  return data.response;
}

export async function setCachedResponse(
  cacheKey: string,
  response: string,
  language: SupportedLanguage = 'en',
  supabase: SupabaseClient
): Promise<void> {
  const { error } = await supabase
    .from('rex_cache')
    .upsert({
      cache_key: cacheKey,
      response,
      language,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Rex cache write failed:', error);
  }
}
