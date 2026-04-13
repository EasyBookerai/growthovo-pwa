# Requirements Document

## Introduction

Growthovo must support multiple languages from day one to maximise organic App Store discovery and serve a global user base. Users select their preferred language during onboarding and can change it at any time in Settings. The app auto-detects the device locale on first launch and pre-selects the closest supported language. All UI text, Rex AI responses, notifications, lesson content, and paywall copy are fully translated. Lesson content is stored per language in Supabase; Rex is instructed to respond in the user's chosen language on every OpenAI call.

## Glossary

- **I18n_System**: The combination of i18next, react-i18next, and expo-localization that manages language detection, storage, and string resolution.
- **Language_Code**: A BCP-47 language tag restricted to the eight supported values: `en`, `ro`, `it`, `fr`, `de`, `es`, `pt`, `nl`.
- **Translation_File**: A JSON file at `locales/{language_code}/translation.json` containing all UI string keys for one language.
- **Language_Store**: The Zustand slice that holds the active Language_Code in memory and exposes actions to change it.
- **Language_Service**: The service module responsible for persisting and loading the selected Language_Code from AsyncStorage and Supabase.
- **Rex**: The AI coach powered by OpenAI that generates personalised responses inside the app.
- **Fallback_Response**: A pre-written Rex response used when OpenAI is unavailable or the user is rate-limited.
- **Locale_Detector**: The expo-localization API used to read the device's system locale on first launch.
- **Lesson**: A content unit stored in the `lessons` Supabase table, now scoped to a specific Language_Code.
- **Rex_Cache**: The `rex_cache` Supabase table that stores cached OpenAI responses, keyed per language.

---

## Requirements

### Requirement 1: Language Initialisation

**User Story:** As a new user, I want the app to automatically detect my device language on first launch, so that I immediately see content in a familiar language without any manual setup.

#### Acceptance Criteria

1. WHEN the app launches for the first time and no language preference is stored, THE I18n_System SHALL read the device locale via the Locale_Detector and select the closest supported Language_Code.
2. IF the device locale does not match any supported Language_Code, THEN THE I18n_System SHALL default to `en`.
3. WHEN a Language_Code has been previously stored in AsyncStorage, THE I18n_System SHALL load that Language_Code on every subsequent launch without re-reading the device locale.
4. THE I18n_System SHALL initialise before any screen renders, so that no untranslated strings are visible during startup.

---

### Requirement 2: Onboarding Language Selection

**User Story:** As a new user, I want to choose my language on the first onboarding screen, so that the entire app experience is in my preferred language from the start.

#### Acceptance Criteria

1. WHEN the onboarding flow begins, THE Onboarding_Screen SHALL display a language picker as its first step, before pillar selection and goal setting.
2. THE Onboarding_Screen SHALL present each supported language as a large tappable card showing the country flag emoji and the language name written in that language (e.g. "Deutsch", "Français").
3. WHEN a user taps a language card, THE I18n_System SHALL switch the active Language_Code immediately so that all subsequent onboarding screens render in the chosen language.
4. THE Onboarding_Screen SHALL pre-select the Language_Code determined by Requirement 1 so the user sees a sensible default.
5. WHEN the user completes onboarding, THE Language_Service SHALL persist the chosen Language_Code to both AsyncStorage and the `language` column of the `users` Supabase table.

---

### Requirement 3: Settings Language Change

**User Story:** As an existing user, I want to change my language in Settings at any time, so that I can switch to a different language without losing any progress.

#### Acceptance Criteria

1. THE Settings_Screen SHALL include a "Language" section that displays the currently active Language_Code label and a control to change it.
2. WHEN a user selects a new Language_Code in Settings, THE I18n_System SHALL switch the active language immediately and re-render all visible UI in the new language.
3. WHEN a language change occurs, THE Language_Service SHALL persist the new Language_Code to both AsyncStorage and the `users` Supabase table.
4. WHILE a language change is in progress, THE Settings_Screen SHALL display a loading indicator until the new language resources are fully applied.
5. WHEN a language change occurs, THE app SHALL preserve all streak, XP, and progress data unchanged.

---

### Requirement 4: Translation File Coverage

**User Story:** As a developer, I want all user-visible strings to be managed through translation files, so that adding a new language requires only a new JSON file with no code changes.

#### Acceptance Criteria

1. THE I18n_System SHALL provide translation files for all eight supported Language_Codes: `en`, `ro`, `it`, `fr`, `de`, `es`, `pt`, `nl`.
2. THE Translation_File for each Language_Code SHALL contain keys covering: all navigation labels, all button labels, all error messages, all onboarding screen copy, all streak and XP messages, all paywall and subscription screen copy, and all Rex Fallback_Responses.
3. WHEN a translation key is missing in the active language's Translation_File, THE I18n_System SHALL fall back to the `en` Translation_File value for that key.
4. WHERE the app runs in development mode, THE I18n_System SHALL log a warning to the console for every missing translation key.

---

### Requirement 5: Lesson Content Localisation

**User Story:** As a user, I want to read lesson content in my chosen language, so that I can learn effectively without language barriers.

#### Acceptance Criteria

1. THE `lessons` Supabase table SHALL include a `language` column of type `VARCHAR` constrained to the eight supported Language_Codes.
2. THE `lessons` table SHALL use a composite primary key of `(lesson_id, language)` so that each lesson exists as a separate row per language.
3. WHEN the app fetches lessons, THE Lesson_Service SHALL query only rows where `language` matches the active Language_Code.
4. IF no lesson row exists for the active Language_Code, THEN THE Lesson_Service SHALL fall back to the `en` row for that lesson.
5. WHEN the active Language_Code changes, THE Lesson_Service SHALL re-fetch all lesson data in the new language.

---

### Requirement 6: Rex Multilingual Responses

**User Story:** As a user, I want Rex to respond in my chosen language, so that coaching feels natural and personal.

#### Acceptance Criteria

1. WHEN the `rex-response` Edge Function calls OpenAI, THE Edge_Function SHALL prepend the instruction "Respond only in {userLanguage}. Maintain Rex's personality and tone in that language." to the system prompt, where `{userLanguage}` is the user's active Language_Code.
2. THE `rex-response` Edge Function SHALL accept a `language` field in its request body and pass it to every OpenAI call.
3. THE Rex_Cache table SHALL include a `language` column of type `VARCHAR`, and THE Edge_Function SHALL include the Language_Code in the cache key computation so that responses are cached per language.
4. THE Language_Service SHALL provide Fallback_Responses pre-written in all eight supported Language_Codes for each Rex response type (check-in, streak warning, weekly summary).
5. WHEN OpenAI is unavailable or the user is rate-limited, THE Rex_Service SHALL return the Fallback_Response in the user's active Language_Code.

---

### Requirement 7: Notification Localisation

**User Story:** As a user, I want to receive push notifications in my chosen language, so that reminders feel relevant and natural.

#### Acceptance Criteria

1. THE `notifications` Supabase table SHALL include a `language` column of type `VARCHAR` to store the Language_Code at the time the notification was scheduled.
2. WHEN a push notification is scheduled, THE Notification_Service SHALL compose the notification copy using the translation key resolved against the user's active Language_Code.
3. WHEN the active Language_Code changes, THE Notification_Service SHALL reschedule all pending notifications using the new language's copy.

---

### Requirement 8: Rex Cache Language Isolation

**User Story:** As a developer, I want Rex cache entries to be isolated per language, so that a cached response in one language is never served to a user in a different language.

#### Acceptance Criteria

1. THE Rex_Cache table SHALL include a `language` column of type `VARCHAR`.
2. WHEN computing a cache key for a check-in response, THE Edge_Function SHALL include the Language_Code in the hash input alongside `challengeText`, `completed`, and `streakBracket`.
3. WHEN looking up a cached response, THE Edge_Function SHALL filter by both `cache_key` and `language` to prevent cross-language cache hits.

---

### Requirement 9: Date, Number, and Currency Formatting

**User Story:** As a user, I want dates, numbers, and prices displayed in my locale's format, so that the app feels native to my region.

#### Acceptance Criteria

1. WHEN displaying a date, THE I18n_System SHALL format it using the locale conventions provided by expo-localization (e.g. `DD/MM/YYYY` for European locales, `MM/DD/YYYY` for `en` US locale).
2. WHEN displaying a number, THE I18n_System SHALL format it using the locale's decimal and thousands separators (e.g. `1.000,00` for `de`, `1,000.00` for `en`).
3. WHEN displaying a subscription price, THE Paywall_Screen SHALL show the price in the currency provided by RevenueCat for the user's region; THE Paywall_Screen SHALL additionally display the RON equivalent for Romanian users and the GBP equivalent for UK users.
4. IF RevenueCat does not provide a localised price, THEN THE Paywall_Screen SHALL display the price in EUR as the default currency.

---

### Requirement 10: Language Persistence and Sync

**User Story:** As a user, I want my language preference to be remembered across app restarts and devices, so that I never have to re-select my language.

#### Acceptance Criteria

1. THE Language_Service SHALL write the selected Language_Code to AsyncStorage under the key `@growthovo/language` immediately after every language change.
2. THE Language_Service SHALL write the selected Language_Code to the `language` column of the `users` Supabase table whenever the user is authenticated.
3. WHEN a user signs in on a new device, THE I18n_System SHALL read the `language` column from the `users` Supabase table and apply it, overriding any device locale detection.
4. IF the Supabase read fails on sign-in, THEN THE I18n_System SHALL fall back to the value stored in AsyncStorage, and IF AsyncStorage is also empty, THEN THE I18n_System SHALL apply Requirement 1 locale detection.

---

### Requirement 11: Translation Workflow Tooling

**User Story:** As a developer, I want automated tooling to extract translation keys and generate translations, so that new content is never accidentally shipped untranslated.

#### Acceptance Criteria

1. THE project SHALL include an i18next-scanner configuration that scans all source files and outputs a list of all translation keys used in the codebase.
2. WHEN a new translation key is added to the `en` Translation_File, THE project SHALL provide a script that calls the OpenAI API to auto-translate the new key into all seven non-English Language_Codes using the defined translation prompt.
3. THE auto-translation prompt SHALL instruct the model to maintain a direct, honest, slightly edgy tone consistent with the Growthovo brand voice, and to return only the translated text.
4. WHERE the app runs in development mode, THE I18n_System SHALL visually flag any UI string that is rendered using the `en` fallback because its key is missing in the active Translation_File.
