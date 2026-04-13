# Implementation Plan: Multilingual Support

## Overview

Incremental implementation of i18next-based multilingual support across the Growthovo app. Each task builds on the previous, ending with full wiring. The design document at `.kiro/specs/multilingual-support/design.md` and requirements at `.kiro/specs/multilingual-support/requirements.md` are the authoritative references throughout.

## Tasks

- [x] 1. Install dependencies and scaffold translation files
  - Install `i18next`, `react-i18next`, `expo-localization`, and `i18next-scanner` via npm
  - Create `locales/{en,ro,it,fr,de,es,pt,nl}/translation.json` with the full key structure defined in the design (onboarding, navigation, settings, errors, rex, streak, xp, paywall namespaces)
  - Populate the `en` file with all English strings extracted from existing screens
  - Leave non-English files with the same keys but placeholder values (English text) — they will be filled by the auto-translate script in task 9
  - _Requirements: 4.1, 4.2_

- [x] 2. Implement core i18n service and language utilities
  - [x] 2.1 Create `src/services/i18nService.ts`
    - Define `SupportedLanguage` type and `SUPPORTED_LANGUAGES` / `LANGUAGE_OPTIONS` constants
    - Implement `resolveLanguage(locale: string): SupportedLanguage` — maps BCP-47 locale to supported code, falls back to `'en'`
    - Implement `initI18n(userId?: string): Promise<SupportedLanguage>` — resolution order: AsyncStorage → Supabase → expo-localization → `'en'`
    - Configure i18next with `react-i18next`, `initReactI18next`, and all 8 translation file imports
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.2 Write property test for `resolveLanguage`
    - **Property 1: resolveLanguage always returns a supported language**
    - **Validates: Requirements 1.1, 1.2**
    - Use `fast-check` to generate arbitrary strings; assert result is always in `SUPPORTED_LANGUAGES`
    - **Property 2: Unknown locales fall back to 'en'**
    - **Validates: Requirements 1.2**
    - Generate strings not starting with any supported prefix; assert result is `'en'`
    - **Property 6: resolveLanguage is idempotent on valid codes**
    - **Validates: Requirements 1.1**
    - For each supported code, assert `resolveLanguage(code) === code`

  - [x] 2.3 Create `src/services/localeUtils.ts`
    - Implement `formatDate(isoDate: string, locale: string): string` using `Intl.DateTimeFormat`
    - Implement `formatNumber(value: number, locale: string): string` using `Intl.NumberFormat`
    - Implement `formatCurrency(amount: number, currency: string, locale: string): string`
    - _Requirements: 9.1, 9.2_

  - [x] 2.4 Write property test for locale formatting utilities
    - **Property 7: Locale formatting produces non-empty output**
    - **Validates: Requirements 9.1, 9.2**
    - Use `fast-check` to generate valid ISO date strings and finite numbers; for each supported Language_Code assert `formatDate` and `formatNumber` return non-empty strings

- [x] 3. Implement language persistence service and Zustand store slice
  - [x] 3.1 Create `src/services/languageService.ts`
    - Implement `getStoredLanguage(): Promise<SupportedLanguage | null>` — reads `@growthovo/language` from AsyncStorage
    - Implement `setLanguage(code: SupportedLanguage, userId?: string): Promise<void>` — writes to AsyncStorage and, if `userId` provided, to `users.language` in Supabase
    - Implement `getLanguageFromSupabase(userId: string): Promise<SupportedLanguage | null>`
    - Implement `syncLanguageToSupabase(code: SupportedLanguage, userId: string): Promise<void>`
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 3.2 Write property test for language persistence round-trip
    - **Property 3: Language persistence round-trip**
    - **Validates: Requirements 10.1**
    - Mock AsyncStorage; for each of the 8 supported codes call `setLanguage(code)` then `getStoredLanguage()`; assert equality

  - [x] 3.3 Add `useLanguageStore` slice to `src/store/index.ts`
    - Add `LanguageSlice` interface with `language: SupportedLanguage` and `setLanguage` action
    - `setLanguage` calls `languageService.setLanguage`, then `i18n.changeLanguage`, then updates store state
    - _Requirements: 3.2, 3.3_

- [x] 4. Database migrations
  - [x] 4.1 Create migration `supabase/migrations/20240010_multilingual_support.sql`
    - `ALTER TABLE users ADD COLUMN language VARCHAR(5) DEFAULT 'en' CHECK (...)`
    - `ALTER TABLE lessons ADD COLUMN language VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (...)`
    - Drop old `lessons` primary key; add composite `PRIMARY KEY (id, language)`
    - Add indexes `idx_lessons_language` and `idx_lessons_unit_language`
    - `ALTER TABLE rex_cache ADD COLUMN language VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (...)`
    - Update `rex_cache` unique constraint to `(cache_key, language)`
    - `ALTER TABLE notifications ADD COLUMN language VARCHAR(5) DEFAULT 'en' CHECK (...)`
    - _Requirements: 5.1, 5.2, 6.3, 7.1, 8.1_

- [x] 5. Update lesson service for language-filtered queries
  - [x] 5.1 Modify `src/services/lessonService.ts`
    - Add `language` parameter to all lesson fetch functions
    - Filter all queries with `.eq('language', language)`
    - Implement English fallback: if query returns 0 rows, retry with `language = 'en'`
    - _Requirements: 5.3, 5.4, 5.5_

  - [x] 5.2 Write unit test for lesson language fallback
    - Mock Supabase to return empty array for non-English language
    - Assert service retries with `'en'` and returns those results
    - _Requirements: 5.4_

- [x] 6. Update Rex service and Edge Function for multilingual support
  - [x] 6.1 Update `src/services/rex.ts`
    - Add `language: SupportedLanguage` to `invokeRexFunction` call body
    - Read active language from `useLanguageStore`
    - Update `getCheckInFallback`, `getStreakWarningFallback`, `getWeeklySummaryFallback` signatures to accept `language: SupportedLanguage`
    - Add fallback response strings for all 8 languages in `src/services/rexFallback.ts`
    - _Requirements: 6.4, 6.5_

  - [x] 6.2 Write property test for fallback response coverage
    - **Property 5: Fallback responses cover all languages**
    - **Validates: Requirements 6.4, 6.5**
    - For each combination of `SupportedLanguage` × response type, assert `getFallbackResponse` returns a non-empty string

  - [x] 6.3 Update `supabase/functions/rex-response/index.ts`
    - Accept `language` field in request body (default `'en'` for backwards compatibility)
    - Prepend `"Respond only in {language}. Maintain Rex's personality and tone in that language."` to `REX_SYSTEM_PROMPT`
    - Include `language` in `computeCacheKey` hash input
    - Store `language` in `rex_cache` row on write
    - Filter `rex_cache` lookups by `language` in addition to `cache_key`
    - _Requirements: 6.1, 6.2, 6.3, 8.2, 8.3_

  - [x] 6.4 Write property test for Rex cache key language sensitivity
    - **Property 4: Rex cache key is language-sensitive**
    - **Validates: Requirements 8.2, 6.3**
    - Use `fast-check` to generate `(challengeText, completed, streakBracket)` tuples; for each pair of distinct Language_Codes assert the two computed cache keys differ

- [x] 7. Checkpoint — Ensure all tests pass
  - Run `npm run test:run` and confirm all existing tests plus new property tests pass. Ask the user if any questions arise.

- [x] 8. Build LanguagePicker component and update Onboarding
  - [x] 8.1 Create `src/components/LanguagePicker.tsx`
    - Render a grid of large tappable cards, one per supported language
    - Each card shows flag emoji, native language name, and a checkmark badge when selected
    - Accept `selected: SupportedLanguage` and `onSelect: (code: SupportedLanguage) => void` props
    - _Requirements: 2.2_

  - [x] 8.2 Update `src/screens/onboarding/OnboardingScreen.tsx`
    - Add `'language'` as the first step in the step sequence: `'language' → 'pillars' → 'goal'`
    - Render `<LanguagePicker>` on the language step; call `useLanguageStore.setLanguage` on selection
    - Pre-select the language resolved by `initI18n` (passed as a prop or read from store)
    - On onboarding completion, ensure `languageService.setLanguage` is called with `userId`
    - Replace all hardcoded strings with `t('onboarding.*')` translation keys
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 9. Update Settings screen with language section
  - [x] 9.1 Update `src/screens/settings/SettingsScreen.tsx`
    - Add a "Language" section above "Notifications" showing current language flag + native name
    - Tapping the section opens a modal containing `<LanguagePicker>`
    - On selection, call `useLanguageStore.setLanguage(code, userId)`; show loading indicator while in progress
    - Replace all hardcoded strings with `t('settings.*')` translation keys
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 10. Replace hardcoded strings across all screens
  - [x] 10.1 Update all screens in `src/screens/` to use `useTranslation()` hook and `t()` calls
    - HomeScreen, LessonPlayerScreen, PillarsMapScreen, CheckInScreen, LeagueScreen, SquadScreen, ProfileScreen, PaywallScreen, SignInScreen, SignUpScreen
    - Replace every hardcoded user-visible string with the appropriate `t('namespace.key')` call
    - _Requirements: 4.1, 4.2_

  - [x] 10.2 Update notification service to use translated copy
    - In `src/services/notificationService.ts`, replace hardcoded notification strings with `i18n.t('notifications.*')` calls
    - Call `scheduleDefaultNotifications` after every language change (wire into `useLanguageStore.setLanguage`)
    - Store `language` column when inserting/updating notification rows in Supabase
    - _Requirements: 7.2, 7.3_

- [x] 11. Wire i18n initialisation into App.tsx
  - Call `initI18n(userId)` in `App.tsx` before rendering the navigation tree
  - Show a splash/loading screen until `initI18n` resolves to prevent untranslated flash
  - Pass resolved language to `useLanguageStore` initial state
  - On sign-in, call `languageService.getLanguageFromSupabase(userId)` and apply if present
  - _Requirements: 1.3, 1.4, 10.3, 10.4_

- [x] 12. Add i18next-scanner config and auto-translate script
  - [x] 12.1 Create `i18next-scanner.config.js` at project root
    - Configure to scan `src/**/*.{ts,tsx}` for `t('...')` calls
    - Output missing keys report to `locales/missing-keys.json`
    - _Requirements: 11.1_

  - [x] 12.2 Create `scripts/auto-translate.ts`
    - Read new keys from `locales/en/translation.json`
    - For each of the 7 non-English languages, call OpenAI API with the defined brand-voice translation prompt
    - Write translated values back to the respective `translation.json` files
    - _Requirements: 11.2, 11.3_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Run `npm run test:run` and confirm the full test suite passes. Ask the user if any questions arise.

## Notes

- Each task references specific requirements for traceability
- Property tests use `fast-check` which is already in `devDependencies`
- The `fast-check` property tests should run with a minimum of 100 iterations each
- Checkpoints ensure incremental validation at logical milestones
