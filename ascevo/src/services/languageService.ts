/**
 * Language Service — persists and syncs the user's selected language.
 * Local: AsyncStorage under '@growthovo/language'
 * Remote: Supabase users.language column
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import type { SupportedLanguage } from './i18nService';
import { SUPPORTED_LANGUAGES } from './i18nService';

export const LANGUAGE_STORAGE_KEY = '@growthovo/language';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function isValidLanguage(code: unknown): code is SupportedLanguage {
  return typeof code === 'string' && SUPPORTED_LANGUAGES.includes(code as SupportedLanguage);
}

// ---------------------------------------------------------------------------
// AsyncStorage
// ---------------------------------------------------------------------------

/**
 * Read the stored language from AsyncStorage.
 * Returns null if not set or if the stored value is invalid.
 */
export async function getStoredLanguage(): Promise<SupportedLanguage | null> {
  try {
    const value = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isValidLanguage(value)) return value;
    return null;
  } catch (err) {
    if (__DEV__) console.error('[languageService] getStoredLanguage error:', err);
    return null;
  }
}

/**
 * Persist the language to AsyncStorage and optionally sync to Supabase.
 * Writes AsyncStorage first (fast, local), then Supabase (async, best-effort).
 */
export async function setLanguage(
  code: SupportedLanguage,
  userId?: string
): Promise<void> {
  // Always write locally first
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch (err) {
    if (__DEV__) console.error('[languageService] AsyncStorage write error:', err);
    // Don't throw — local write failure is non-fatal
  }

  // Sync to Supabase if authenticated
  if (userId) {
    await syncLanguageToSupabase(code, userId);
  }
}

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

/**
 * Read the user's language preference from Supabase.
 * Returns null on error or if the column value is invalid.
 */
export async function getLanguageFromSupabase(
  userId: string
): Promise<SupportedLanguage | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('language')
      .eq('id', userId)
      .single();

    if (error) {
      if (__DEV__) console.error('[languageService] Supabase read error:', error);
      return null;
    }

    const lang = data?.language;
    if (isValidLanguage(lang)) return lang;
    return null;
  } catch (err) {
    if (__DEV__) console.error('[languageService] getLanguageFromSupabase error:', err);
    return null;
  }
}

/**
 * Write the language preference to Supabase.
 * Silently logs errors — AsyncStorage is the local source of truth.
 */
export async function syncLanguageToSupabase(
  code: SupportedLanguage,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ language: code })
      .eq('id', userId);

    if (error && __DEV__) {
      console.error('[languageService] Supabase write error:', error);
    }
  } catch (err) {
    if (__DEV__) console.error('[languageService] syncLanguageToSupabase error:', err);
    // Non-fatal — local value is still correct
  }
}
