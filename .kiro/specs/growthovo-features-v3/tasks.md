co# Implementation Plan: GROWTHOVO Features V3

## Overview

Five features implemented in priority order: Onboarding Personality Quiz → Relapse Protection → Time Capsule → Home Screen Widget → GROWTHOVO Wrapped. Each feature builds on the existing React Native / Expo + Supabase stack with TypeScript throughout.

---

## Tasks

- [x] 1. Database migrations and type extensions
  - [x] 1.1 Add primary_pillar and secondary_pillar columns to users table
    - `ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_pillar TEXT; ADD COLUMN IF NOT EXISTS secondary_pillar TEXT;`
    - Add RLS: existing user RLS covers these columns
    - _Requirements: 1.10_
  - [x] 1.2 Create time_capsules table with RLS policies
    - Create table with columns: id, user_id, video_url, promise_1, promise_2, promise_3, primary_pillar, quiz_scores (JSONB), starting_xp, created_at, unlocked_at
    - Add INSERT policy (own user), SELECT policy (own user + 90-day gate), UPDATE policy (own user + 90-day gate)
    - _Requirements: 3.7, 3.10_
  - [x] 1.3 Create comeback_challenges table with RLS
    - Create table with columns: id, user_id, challenge_id, expires_at, completed, proof_url, streak_restored_to, created_at
    - Add comeback_used_at column to streaks table
    - Add RLS: all operations for own user only
    - _Requirements: 5.4, 5.5, 5.8_
  - [x] 1.4 Create wrapped_summaries table with RLS
    - Create table with columns: id, user_id, period, data_json (JSONB), rex_verdict, created_at; UNIQUE(user_id, period)
    - Add RLS: all operations for own user only
    - _Requirements: 4.7_

- [x] 2. TypeScript type extensions
  - [x] 2.1 Add new types to growthovo/src/types/index.ts
    - Add `PillarKey`, `QuizAnswer`, `QuizQuestion`, `WidgetData`, `TimeCapsule`, `CapsuleStatsSnapshot`, `WrappedPeriod`, `WrappedData`, `WrappedSummary`, `ComebackChallenge` interfaces
    - Add `FREEZE_COST_XP = 500` and `MAX_FREEZES = 3` constants
    - Extend `UserProfile` with `primaryPillar?: PillarKey` and `secondaryPillar?: PillarKey`
    - _Requirements: 1.6, 2.1, 3.7, 4.4, 5.4_

- [x] 3. Onboarding Personality Quiz — core service
  - [x] 3.1 Create growthovo/src/services/onboardingQuizService.ts
    - Implement `QUIZ_QUESTIONS` constant with all 5 questions and their answer-to-pillar mappings
    - Implement `scoreQuiz(answers: PillarKey[]): { primary: PillarKey; secondary: PillarKey }` with tie-break by first appearance
    - Implement `saveQuizResults(userId, primary, secondary, dailyGoal)` that upserts to Supabase users table
    - _Requirements: 1.6, 1.7, 1.10, 1.11_
  - [x] 3.2 Write property tests for scoreQuiz
    - **Property 1: Quiz scoring primary pillar is the most frequent answer**
    - **Property 2: Quiz scoring tie-break by first appearance**
    - Use fast-check to generate random PillarKey[] sequences of length 5
    - **Validates: Requirements 1.6, 1.7**

- [x] 4. Onboarding Personality Quiz — UI screens
  - [x] 4.1 Create growthovo/src/screens/onboarding/QuizWelcomeScreen.tsx
    - Full-screen welcome with GROWTHOVO logo, tagline "Let's build your personal growth path", and Start button
    - Horizontal slide-in animation via react-native-reanimated
    - _Requirements: 1.2_
  - [x] 4.2 Create growthovo/src/screens/onboarding/QuizQuestionScreen.tsx
    - Full-screen layout: progress bar (top), emoji + bold question text, 4–5 tappable answer cards
    - Selected card highlights in pillar accent color; 300ms delay before advancing
    - No back button
    - _Requirements: 1.3, 1.4, 1.5, 1.14_
  - [x] 4.3 Create growthovo/src/screens/onboarding/PillarResultScreen.tsx
    - Display primary pillar name, accent color, emoji, and secondary pillar recommendation
    - Animated reveal using react-native-reanimated (fade + scale)
    - _Requirements: 1.8_
  - [x] 4.4 Create growthovo/src/screens/onboarding/QuizDailyGoalScreen.tsx
    - Three tappable cards: 5 / 10 / 15 minutes
    - Reuse existing goal card styling from OnboardingScreen
    - On confirm: call `saveQuizResults`; show error + retry on failure
    - _Requirements: 1.9, 1.10, 1.11_
  - [x] 4.5 Wire quiz flow into App.tsx navigation
    - Check `onboarding_complete` on auth; if false, route to QuizWelcomeScreen
    - After QuizDailyGoalScreen: route to NotificationPermissionScreen (existing notificationService.registerPushToken)
    - After notification: route to existing PaywallScreen
    - After paywall: route to main app + trigger Time Capsule flow
    - _Requirements: 1.1, 1.12, 1.13_

- [x] 5. Checkpoint — Quiz feature complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Relapse Protection — core service
  - [x] 6.1 Create growthovo/src/services/relapseService.ts
    - Implement `detectStreakBreak(userId): Promise<{ broke: boolean; originalStreak: number }>` — checks last_activity_date vs today
    - Implement `getStreakBrokeRexLine(streak: number): string` for 1–7, 8–30, 31+ ranges
    - Implement `canUseComebackChallenge(comebackUsedAt: string | null): boolean` — 30-day cooldown
    - Implement `createComebackChallenge(userId, challengeId): Promise<ComebackChallenge>` — sets expires_at to now + 24h
    - Implement `completeComebackChallenge(userId, proofUrl): Promise<number>` — restores streak to floor(original/2), updates comeback_used_at
    - Implement `calculateRestoredStreak(original: number): number` — pure function
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_
  - [x] 6.2 Write property tests for relapseService pure functions
    - **Property 5: Streak restoration is always 50% rounded down**
    - **Property 6: Comeback challenge cooldown enforcement**
    - Use fast-check to generate positive integers and timestamps
    - **Validates: Requirements 5.6, 5.8**

- [x] 7. Relapse Protection — freeze service
  - [x] 7.1 Create growthovo/src/services/freezeService.ts
    - Implement `purchaseStreakFreeze(userId, currentXp, currentFreezes): Promise<void>` — deducts 500 XP, increments freeze_count; throws on insufficient XP or max freezes
    - Implement `autoActivateFreeze(userId): Promise<boolean>` — consumes one freeze if available, sends push notification
    - Reuse existing `awardXP` (negative amount) from progressService for XP deduction
    - _Requirements: 5.11, 5.12, 5.13, 5.14, 5.15, 5.16_
  - [x] 7.2 Write property tests for freezeService
    - **Property 7: Freeze purchase XP deduction round-trip**
    - **Property 8: Freeze cap enforcement**
    - Use fast-check to generate valid XP and freeze count states
    - **Validates: Requirements 5.11, 5.12, 5.16**

- [x] 8. Relapse Protection — UI screens
  - [x] 8.1 Create growthovo/src/screens/relapse/StreakBrokeScreen.tsx
    - Display struck-through streak number (large, bold, strikethrough style)
    - Rex line based on streak length
    - "You get one chance" CTA button
    - _Requirements: 5.3_
  - [x] 8.2 Create growthovo/src/screens/relapse/ComebackChallengeScreen.tsx
    - Display challenge description, 24-hour countdown timer (updates every second)
    - Accept button and "I'll start fresh instead" option
    - If comeback_used_at within 30 days: skip to StartFreshScreen directly
    - _Requirements: 5.4, 5.8, 5.9_
  - [x] 8.3 Create growthovo/src/screens/relapse/ComebackSuccessScreen.tsx
    - Display restored streak count, Rex message, confetti animation in primary pillar color
    - Share button: "I broke my streak and came back. @growthovo"
    - _Requirements: 5.6, 5.10_
  - [x] 8.4 Create growthovo/src/screens/relapse/StartFreshScreen.tsx
    - "Starting fresh. Day 1." with Rex line
    - Resets streak to 0 via existing streakService
    - _Requirements: 5.9_
  - [x] 8.5 Create RelapseDetectionGate component and wire into HomeScreen
    - On HomeScreen mount: call `detectStreakBreak`; if broke and no freeze, navigate to StreakBrokeScreen
    - Store detection result in AsyncStorage key `@growthovo_relapse_shown_{date}` to prevent duplicate fires
    - Add freeze inventory count display to HomeScreen and SettingsScreen
    - _Requirements: 5.1, 5.2, 5.14_

- [ ] 9. Checkpoint — Relapse Protection complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Time Capsule — core service
  - [x] 10.1 Create growthovo/src/services/capsuleService.ts
    - Implement `createCapsule(userId, videoUri, promises, primaryPillar, quizScores): Promise<TimeCapsule>` — uploads video to Supabase Storage, inserts row
    - Implement `getCapsuleStatus(userId): Promise<{ exists: boolean; daysRemaining: number; unlocked: boolean }>`
    - Implement `unlockCapsule(userId): Promise<TimeCapsule>` — sets unlocked_at, returns full record
    - Implement `getCapsuleRexReaction(currentStreak: number): string` — pure function for 3 streak ranges
    - _Requirements: 3.1, 3.5, 3.7, 3.8, 3.9, 3.11, 3.15, 3.17_
  - [x] 10.2 Write unit tests for capsuleService pure functions
    - Test `getCapsuleRexReaction` with streak values 0, 29, 30, 60, 61
    - Test `getCapsuleStatus` daysRemaining calculation
    - _Requirements: 3.15_

- [x] 11. Time Capsule — UI screens
  - [x] 11.1 Create growthovo/src/screens/capsule/TimeCapsuleIntroScreen.tsx
    - "Meet your Day 1 self" title, subtitle, and Start Recording button
    - _Requirements: 3.1, 3.2_
  - [x] 11.2 Create growthovo/src/screens/capsule/VideoRecordScreen.tsx
    - Open front camera via expo-camera; display prompt text overlay
    - 60-second max recording with countdown indicator
    - Record, preview, and re-record options
    - On confirm: call `createCapsule` video upload step; show retry on failure
    - _Requirements: 3.3, 3.4, 3.5, 3.17_
  - [x] 11.3 Create growthovo/src/screens/capsule/WrittenPromisesScreen.tsx
    - Three TextInput fields with pre-filled prompt starters
    - All three required before proceeding
    - _Requirements: 3.6, 3.7_
  - [x] 11.4 Create growthovo/src/screens/capsule/CapsuleCreatedScreen.tsx
    - Sealed capsule visual (lock icon, countdown to day 90)
    - _Requirements: 3.9, 3.11_
  - [x] 11.5 Create growthovo/src/screens/capsule/CapsuleUnlockScreen.tsx
    - Full-screen unlock animation (react-native-reanimated), auto-play video
    - Promises revealed one by one with staggered animation
    - Side-by-side stats comparison (day 1 vs current)
    - Rex reaction message, share button
    - _Requirements: 3.13, 3.14, 3.15, 3.16_
  - [x] 11.6 Add capsule countdown to ProfileScreen
    - Show "Opens in X days" if capsule exists and is sealed
    - Show "Open your capsule" CTA if day 90+ reached
    - _Requirements: 3.11_
  - [x] 11.7 Schedule day-90 push notification when capsule is created
    - Use expo-notifications to schedule a one-time notification 90 days from creation at 8:00 AM
    - _Requirements: 3.12_

- [ ] 12. Checkpoint — Time Capsule complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Home Screen Widget — AsyncStorage sync
  - [x] 13.1 Create growthovo/src/services/widgetService.ts
    - Implement `syncWidgetData(userId): Promise<void>` — fetches streak, XP, hearts, challenge, league position, primary pillar; writes to `@growthovo_widget_data`
    - Implement `getRexDailyLine(streak: number): string` — selects line by `dayOfYear % 7`, interpolates streak into lines with `{X}` placeholder
    - Implement `isWidgetDataStale(data: WidgetData): boolean` — pure function, 24h threshold
    - Call `syncWidgetData` in App.tsx on every app foreground event (AppState change)
    - _Requirements: 2.1, 2.2, 2.7, 2.8, 2.11_
  - [x] 13.2 Write property tests for widgetService pure functions
    - **Property 3: Widget data staleness detection**
    - **Property 4: Rex daily line rotation is deterministic and covers all 7 lines**
    - Use fast-check to generate timestamps and day-of-year integers
    - **Validates: Requirements 2.8, 2.11**

- [x] 14. Home Screen Widget — native extensions
  - [x] 14.1 Create iOS WidgetKit extension (Swift)
    - Add `GrowthovoWidget` target in Xcode; configure App Group `group.com.growthovo.app`
    - Implement `GrowthovoEntry`, `GrowthovoProvider` (30-min refresh timeline)
    - Implement `SmallWidgetView`, `MediumWidgetView`, `LargeWidgetView` reading from shared UserDefaults
    - Handle missing/stale data with fallback view
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 2.9, 2.11_
  - [x] 14.2 Create Android Glance widget (Kotlin)
    - Add `GrowthovoWidget` Glance AppWidget; read from SharedPreferences written by RN AsyncStorage
    - Implement three size variants using `SizeMode.Responsive`
    - Handle missing/stale data with fallback view
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 2.10, 2.11_

- [ ] 15. Checkpoint — Widget complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. GROWTHOVO Wrapped — Edge Function and service
  - [x] 16.1 Create Supabase Edge Function growthovo/supabase/functions/generate-wrapped/index.ts
    - Accept `{ userId, period }` payload
    - Check `wrapped_summaries` for existing record; return cached if found (idempotency)
    - Aggregate data from user_progress, challenge_completions, streaks, xp_transactions for the period
    - Compute all 12 data points defined in WrappedData
    - Call rex-response Edge Function for GPT-4o verdict; use fallback on failure
    - Upsert into wrapped_summaries
    - _Requirements: 4.4, 4.6, 4.7, 4.8, 4.11_
  - [x] 16.2 Create growthovo/src/services/wrappedService.ts
    - Implement `getOrGenerateWrapped(userId, period): Promise<WrappedSummary>` — calls Edge Function
    - Implement `isEligibleForMonthlyWrapped(activeDaysThisMonth: number): boolean` — threshold 7 days
    - Implement `getShareCaption(data: WrappedData, period: WrappedPeriod): string` — pre-written caption template
    - _Requirements: 4.1, 4.3, 4.9, 4.10, 4.12_
  - [x] 16.3 Write property test for wrapped idempotency
    - **Property 9: Wrapped summary idempotency**
    - Mock Edge Function; assert two calls return identical data_json and rex_verdict
    - **Validates: Requirements 4.8**

- [ ] 17. GROWTHOVO Wrapped — UI screens
  - [x] 17.1 Create growthovo/src/screens/wrapped/WrappedNavigator.tsx
    - Horizontal swipeable container (react-native-reanimated PanGestureHandler) for 7 screens
    - Loading state with animation while data fetches; disable share until loaded
    - _Requirements: 4.5, 4.12_
  - [x] 17.2 Create the 7 Wrapped screen components
    - `GrowthOverviewScreen` — animated lesson count reveal
    - `StreakCalendarScreen` — calendar heatmap of active days, longest streak highlighted
    - `StrongestPillarScreen` — pillar color takeover, XP front and center
    - `WeakestPillarScreen` — Rex-coded honest copy, CTA to start that pillar
    - `GlobalRankScreen` — animated percentile counter
    - `RexVerdictScreen` — display rex_verdict text with typewriter animation
    - `WrappedShareCardScreen` — 1080×1920 rendered card, share + save to camera roll
    - _Requirements: 4.5, 4.9, 4.10_
  - [ ] 17.3 Schedule Wrapped push notifications
    - Monthly: schedule notification for last day of each month at 8:00 PM (only if eligible)
    - Yearly: schedule December 31st notification for all users
    - _Requirements: 4.2, 4.3_

- [x] 18. Final checkpoint — All features complete
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- All tasks including tests are required for comprehensive coverage
- Each task references specific requirements for traceability
- Property tests use **fast-check** with minimum 100 iterations each
- Unit tests cover pure functions, edge cases, and error conditions
- Native widget extensions (tasks 14.1, 14.2) require Xcode and Android Studio respectively
- The `generate-wrapped` Edge Function should be deployed before testing the Wrapped UI
