/**
 * i18n Service — bootstraps i18next before the first render.
 * Resolution order: AsyncStorage → Supabase → expo-localization → 'en'
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { getStoredLanguage, getLanguageFromSupabase } from './languageService';

// Translation files
import en from '../../locales/en/translation.json';
import ro from '../../locales/ro/translation.json';
import it from '../../locales/it/translation.json';
import fr from '../../locales/fr/translation.json';
import de from '../../locales/de/translation.json';
import es from '../../locales/es/translation.json';
import pt from '../../locales/pt/translation.json';
import nl from '../../locales/nl/translation.json';

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

export type SupportedLanguage = 'en' | 'ro' | 'it' | 'fr' | 'de' | 'es' | 'pt' | 'nl';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'en', 'ro', 'it', 'fr', 'de', 'es', 'pt', 'nl',
];

export interface LanguageOption {
  code: SupportedLanguage;
  flag: string;
  nativeName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', flag: '🇬🇧', nativeName: 'English' },
  { code: 'ro', flag: '🇷🇴', nativeName: 'Română' },
  { code: 'it', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'fr', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'es', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'pt', flag: '🇵🇹', nativeName: 'Português' },
  { code: 'nl', flag: '🇳🇱', nativeName: 'Nederlands' },
];

const SUPPORTED_PREFIXES = new Set<string>(SUPPORTED_LANGUAGES);

// ---------------------------------------------------------------------------
// resolveLanguage
// ---------------------------------------------------------------------------

/**
 * Maps a BCP-47 locale string to the closest supported SupportedLanguage.
 * e.g. 'ro-RO' → 'ro', 'zh-CN' → 'en', '' → 'en'
 */
export function resolveLanguage(locale: string): SupportedLanguage {
  if (!locale) return 'en';

  // Exact match first (handles bare codes like 'en', 'de')
  const lower = locale.toLowerCase();
  if (SUPPORTED_PREFIXES.has(lower as SupportedLanguage)) {
    return lower as SupportedLanguage;
  }

  // Match by prefix (e.g. 'ro-RO' → 'ro')
  const prefix = lower.split('-')[0].split('_')[0];
  if (SUPPORTED_PREFIXES.has(prefix as SupportedLanguage)) {
    return prefix as SupportedLanguage;
  }

  return 'en';
}

// ---------------------------------------------------------------------------
// i18next initialisation
// ---------------------------------------------------------------------------

let _initialised = false;

/**
 * Initialise i18next. Safe to call multiple times — subsequent calls are no-ops.
 * Must be awaited before the root component renders.
 *
 * Resolution order:
 *   1. AsyncStorage (previously stored preference)
 *   2. Supabase users.language (cross-device sync, if userId provided)
 *   3. expo-localization device locale
 *   4. 'en' fallback
 */
export async function initI18n(userId?: string): Promise<SupportedLanguage> {
  let resolved: SupportedLanguage = 'en';

  // 1. AsyncStorage
  try {
    const stored = await getStoredLanguage();
    if (stored) {
      resolved = stored;
    } else {
      // 2. Supabase (only if no local preference and user is authenticated)
      if (userId) {
        try {
          const remote = await getLanguageFromSupabase(userId);
          if (remote) {
            resolved = remote;
          }
        } catch {
          // Supabase unavailable — fall through
        }
      }

      // 3. Device locale
      if (resolved === 'en') {
        try {
          const locales = Localization.getLocales();
          const deviceLocale = locales?.[0]?.languageTag ?? '';
          resolved = resolveLanguage(deviceLocale);
        } catch {
          // expo-localization unavailable — fall through to 'en'
        }
      }
    }
  } catch {
    // AsyncStorage unavailable — fall through
  }

  if (!_initialised) {
    await i18n
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          ro: { translation: ro },
          it: { translation: it },
          fr: { translation: fr },
          de: { translation: de },
          es: { translation: es },
          pt: { translation: pt },
          nl: { translation: nl },
        },
        lng: resolved,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false, // React already escapes
        },
        // Log missing keys in development
        saveMissing: __DEV__,
        missingKeyHandler: __DEV__
          ? (lngs, ns, key) => {
              console.warn(`[i18n] Missing key: "${key}" for language(s): ${lngs.join(', ')}`)
            }
          : undefined,
      });
    _initialised = true;
  } else {
    // Already initialised — just switch language
    await i18n.changeLanguage(resolved);
  }

  return resolved;
}

export { i18n };
export default i18n;
