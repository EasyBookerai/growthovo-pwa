/**
 * Locale formatting utilities.
 * Uses Intl.DateTimeFormat and Intl.NumberFormat for locale-aware formatting.
 */

import type { SupportedLanguage } from './i18nService';

// Map SupportedLanguage codes to full BCP-47 locale tags for Intl APIs
const LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-GB',
  ro: 'ro-RO',
  it: 'it-IT',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-PT',
  nl: 'nl-NL',
};

/**
 * Resolve a full BCP-47 locale string from a SupportedLanguage code or raw locale.
 * Falls back to 'en-GB' for unknown values.
 */
function resolveLocale(locale: string): string {
  return LOCALE_MAP[locale as SupportedLanguage] ?? locale ?? 'en-GB';
}

/**
 * Format an ISO date string using the locale's date conventions.
 * e.g. '2024-01-15' + 'de' → '15.01.2024'
 *      '2024-01-15' + 'en' → '15/01/2024'
 * Returns empty string on invalid input.
 */
export function formatDate(isoDate: string, locale: string): string {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(resolveLocale(locale), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch (err) {
    if (__DEV__) console.error('[localeUtils] formatDate error:', err);
    return '';
  }
}

/**
 * Format a number using the locale's decimal and thousands separators.
 * e.g. 1000.5 + 'de' → '1.000,5'
 *      1000.5 + 'en' → '1,000.5'
 * Returns empty string on non-finite input.
 */
export function formatNumber(value: number, locale: string): string {
  if (!isFinite(value)) return '';
  try {
    return new Intl.NumberFormat(resolveLocale(locale)).format(value);
  } catch (err) {
    if (__DEV__) console.error('[localeUtils] formatNumber error:', err);
    return '';
  }
}

/**
 * Format a currency amount using the locale's currency conventions.
 * Falls back to EUR if currency is not provided or invalid.
 * e.g. 9.99 + 'EUR' + 'de' → '9,99 €'
 */
export function formatCurrency(amount: number, currency: string, locale: string): string {
  if (!isFinite(amount)) return '';
  const safeCurrency = currency?.trim().toUpperCase() || 'EUR';
  try {
    return new Intl.NumberFormat(resolveLocale(locale), {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Invalid currency code — fall back to EUR
    try {
      return new Intl.NumberFormat(resolveLocale(locale), {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (err) {
      if (__DEV__) console.error('[localeUtils] formatCurrency error:', err);
      return '';
    }
  }
}
