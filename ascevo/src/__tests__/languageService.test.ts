/**
 * Tests — Language Service
 *
 * Covers:
 *   Property 3: Language persistence round-trip
 *   Unit tests for getStoredLanguage / setLanguage
 */

import * as fc from 'fast-check';
import { SUPPORTED_LANGUAGES } from '../services/i18nService';

// ---------------------------------------------------------------------------
// Mock AsyncStorage — uses the module mapper mock at src/__mocks__/async-storage.ts
// We also need to control the internal store for round-trip tests
// ---------------------------------------------------------------------------

// Mock supabase — not needed for AsyncStorage-only tests
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: jest.fn(() => ({ eq: jest.fn(() => ({ error: null })) })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ single: jest.fn(async () => ({ data: null, error: null })) })),
      })),
    })),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredLanguage, setLanguage, LANGUAGE_STORAGE_KEY } from '../services/languageService';

beforeEach(() => {
  jest.clearAllMocks();
  // Reset the mock storage between tests
  (AsyncStorage.clear as jest.Mock)();
});

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

describe('getStoredLanguage — unit tests', () => {
  it('returns null when nothing is stored', async () => {
    expect(await getStoredLanguage()).toBeNull();
  });

  it('returns the stored language when valid', async () => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'de');
    expect(await getStoredLanguage()).toBe('de');
  });

  it('returns null for an invalid stored value', async () => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'xx');
    expect(await getStoredLanguage()).toBeNull();
  });
});

describe('setLanguage — unit tests', () => {
  it('persists the language to AsyncStorage', async () => {
    await setLanguage('fr');
    expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('fr');
  });

  it('overwrites a previously stored language', async () => {
    await setLanguage('de');
    await setLanguage('nl');
    expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('nl');
  });
});

// ---------------------------------------------------------------------------
// Property 3: Language persistence round-trip
// Validates: Requirements 10.1
// ---------------------------------------------------------------------------
describe('Property 3: Language persistence round-trip', () => {
  it('setLanguage then getStoredLanguage returns the same code for all supported languages', async () => {
    // Exhaustive check over all 8 supported codes
    for (const code of SUPPORTED_LANGUAGES) {
      await AsyncStorage.clear();
      await setLanguage(code);
      const retrieved = await getStoredLanguage();
      expect(retrieved).toBe(code);
    }
  });

  it('fast-check: round-trip holds for any supported language code', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom(...SUPPORTED_LANGUAGES), async (code) => {
        await AsyncStorage.clear();
        await setLanguage(code);
        const retrieved = await getStoredLanguage();
        return retrieved === code;
      }),
      { numRuns: 50 }
    );
  });
});
