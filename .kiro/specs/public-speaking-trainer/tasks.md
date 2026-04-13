# Implementation Plan: Public Speaking Trainer

## Overview

Incremental implementation of the Public Speaking Trainer feature. Each task builds on the previous. AI calls go through the `analyze-speech` Edge Function. Pure metric functions are implemented and tested first, then the Edge Function, then screens, then progress/dashboard, then gamification.

## Tasks

- [x] 1. Database migration and TypeScript types
  - Create migration file `supabase/migrations/20240030_public_speaking_trainer.sql`
  - Add `speech_sessions` table with all columns from design
  - Add `speech_progress` table with all columns from design
  - Add `weekly_speaking_challenges` table
  - Add indexes: `idx_speech_sessions_user`, `idx_speech_sessions_created`, `idx_speech_sessions_user_created`
  - Add `SpeakingLevel`, `SpeechSession`, `SpeechProgress`, `FillerPosition`, `MilestoneAlert`, `WeeklyChallenge`, `SPEAKING_LEVEL_CONFIG` to `src/types/index.ts`
  - Extend `XPSource` union type with `'speaking_session'` and `'speaking_challenge'`
  - _Requirements: 11.1, 13.1, 15.1_

- [x] 2. Pure metric calculation functions
  - [x] 2.1 Create `src/services/speakingMetrics.ts` with all pure calculation functions
    - `calculatePaceScore(wpm: number): number`
    - `calculateFillerFreeRate(fillersPerMinute: number): number`
    - `calculateLanguageStrength(weakCount: number, strongCount: number): number`
    - `calculateSilenceGapScore(anxiousPauses: number): number`
    - `calculateConfidenceScore(components): number`
    - `getConfidenceColor(score: number): string`
    - `getMetricStatus(score: number): 'STRONG' | 'GOOD' | 'NEEDS WORK' | 'WEAK'`
    - `detectFillers(words: WhisperWord[]): { fillerWords: Record<string, number>; fillerPositions: FillerPosition[] }`
    - `detectSilenceGaps(words: WhisperWord[], threshold: number): SilenceGap[]`
    - `extractOpeningWords(words: WhisperWord[], seconds: number): WhisperWord[]`
    - `extractClosingWords(words: WhisperWord[], duration: number, seconds: number): WhisperWord[]`
    - `checkLevelUnlock(totalSessions, avgConfidence, currentLevel): SpeakingLevel`
    - `checkMilestones(sessionNumber, confidenceScore, previousBest, milestonesTriggered): MilestoneAlert[]`
    - _Requirements: 3.1–3.5, 4.1–4.4, 5.2–5.3, 6.2–6.3, 7.2–7.3, 8.1–8.3, 13.3–13.6, 14.1–14.10_

  - [x] 2.2 Write property test: pace score always in [0, 100]
    - **Property 1: Pace score is always in [0, 100]**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**
    - File: `src/__tests__/speakingMetrics.test.ts`

  - [x] 2.3 Write property test: pace score is 100 in optimal range [130, 160]
    - **Property 2: Pace score is 100 in the optimal range**
    - **Validates: Requirements 3.2**

  - [x] 2.4 Write property test: pace score is monotonically decreasing outside optimal range
    - **Property 3: Pace score is monotonically decreasing outside optimal range**
    - **Validates: Requirements 3.3, 3.4**

  - [x] 2.5 Write property test: filler detection completeness
    - **Property 4: Filler detection completeness**
    - **Validates: Requirements 4.1, 4.2, 4.4**

  - [x] 2.6 Write property test: fillers per minute formula
    - **Property 5: Fillers per minute formula**
    - **Validates: Requirements 4.3**

  - [x] 2.7 Write property test: silence gap detection and classification invariant
    - **Property 6: Silence gap detection and classification invariant**
    - **Validates: Requirements 2.4, 6.2**

  - [x] 2.8 Write property test: language strength formula and bounds
    - **Property 7: Language strength formula and bounds**
    - **Validates: Requirements 5.2, 5.3**

  - [x] 2.9 Write property test: confidence score formula and bounds
    - **Property 8: Confidence score formula and bounds**
    - **Validates: Requirements 8.1, 8.3**

  - [x] 2.10 Write property test: filler-free rate formula and bounds
    - **Property 9: Filler-free rate formula and bounds**
    - **Validates: Requirements 8.2**

  - [x] 2.11 Write property test: confidence score color mapping is exhaustive
    - **Property 10: Confidence score color mapping is exhaustive**
    - **Validates: Requirements 8.5**

  - [x] 2.12 Write property test: metric status label is exhaustive
    - **Property 11: Metric status label is exhaustive**
    - **Validates: Requirements 10.2**

  - [x] 2.13 Write property test: opening and closing section extraction correctness
    - **Property 12: Opening and closing section extraction correctness**
    - **Validates: Requirements 7.2, 7.3**

  - [x] 2.14 Write property test: silence gap score formula and bounds
    - **Property 18: Silence gap score formula and bounds**
    - **Validates: Requirements 6.3**

  - [x] 2.15 Write property test: level unlock is monotonically non-decreasing and correctly gated
    - **Property 15: Level unlock is monotonically non-decreasing and correctly gated**
    - **Validates: Requirements 13.3, 13.4, 13.5, 13.6**

  - [x] 2.16 Write property test: milestone triggers are idempotent
    - **Property 16: Milestone triggers are idempotent**
    - **Validates: Requirements 14.1–14.10**

- [x] 3. Checkpoint — Ensure all metric tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. `analyze-speech` Edge Function
  - [x] 4.1 Create `supabase/functions/analyze-speech/index.ts`
    - Implement CORS headers, request validation, and Supabase client setup following `submit-evening-debrief` pattern
    - Implement audio upload to Supabase Storage (`speech-audio` bucket)
    - Implement Whisper API call (`whisper-1`, `verbose_json`, with language param)
    - Implement pure metric calculations using functions from `speakingMetrics.ts` (duplicated in Deno context)
    - Implement free-tier short-circuit after pure metrics (return partial result, skip GPT/TTS)
    - _Requirements: 2.1–2.6, 3.1–3.5, 4.1–4.4, 16.2, 16.4, 18.6_

  - [x] 4.2 Implement GPT-4o-mini analysis with caching
    - Compute SHA-256 cache key from transcript text
    - Check `rex_cache` table for existing analysis (reuse existing cache table pattern)
    - If cache miss: call GPT-4o-mini with Rex system prompt, transcript, context, max_tokens: 600, temperature: 0.2
    - Parse and validate JSON response; retry once on invalid JSON
    - Store result in cache
    - _Requirements: 5.1–5.4, 6.1, 7.1, 7.4, 9.1–9.4, 9.9, 18.1–18.3_

  - [x] 4.3 Implement TTS generation with caching
    - Compute SHA-256 cache key from rex_verdict text
    - Check cache for existing TTS audio URL
    - If cache miss: call TTS API (`tts-1-hd`, voice: `onyx`), upload audio to Storage, store URL
    - _Requirements: 9.5–9.6, 9.10, 18.2–18.3_

  - [x] 4.4 Implement session persistence and progress update
    - Insert row into `speech_sessions` with all computed fields
    - Upsert `speech_progress`: increment total_sessions, recalculate rolling averages from last 7 sessions, update personal bests
    - Log costs to `ai_costs` and `ai_usage` using existing `increment_ai_costs` and `increment_ai_usage` RPCs
    - Store rex_memory entry (biggest_win + biggest_fix) using existing `rex_memory` table pattern
    - _Requirements: 9.11, 11.1–11.3, 17.5, 18.4–18.5_

  - [x] 4.5 Write unit test: free tier receives no GPT or TTS results
    - **Property 19: Free tier receives no GPT or TTS results**
    - **Validates: Requirements 16.2, 16.4, 18.6**
    - File: `src/__tests__/analyzeSpeech.test.ts`

  - [x] 4.6 Write property test: GPT and TTS caching is idempotent
    - **Property 17: GPT and TTS analysis caching is idempotent**
    - **Validates: Requirements 9.9, 9.10, 18.1, 18.3**

- [x] 5. `speakingService.ts` client service
  - Create `src/services/speakingService.ts`
  - Implement `submitSession`: read audio file, base64-encode, invoke `analyze-speech` Edge Function, return `SpeechAnalysisResult`
  - Implement `getSessionHistory(userId)`: query `speech_sessions` ordered by `created_at DESC`
  - Implement `getSpeechProgress(userId)`: query `speech_progress`
  - Implement `getSessionById(sessionId)`: query single `speech_sessions` row
  - Implement `getWeeklyChallenge()`: query `weekly_speaking_challenges` for current week number
  - Implement `checkLevelUnlock` and `checkMilestones` wrappers that call pure functions and trigger TTS for level unlock voice messages
  - _Requirements: 11.4–11.5, 13.7–13.8, 14.1–14.10, 15.1–15.6_

  - [x] 5.1 Write property test: personal best is the maximum of all session scores
    - **Property 13: Personal best is the maximum of all session scores**
    - **Validates: Requirements 11.3**
    - File: `src/__tests__/speakingService.test.ts`

  - [x] 5.2 Write property test: rolling average uses last 7 sessions
    - **Property 14: Rolling average uses last 7 sessions**
    - **Validates: Requirements 11.2**

- [x] 6. Checkpoint — Ensure all service and Edge Function tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Recording screen
  - [x] 7.1 Create `src/screens/speaking/RecordingScreen.tsx`
    - Display topic prompt and level badge
    - Implement countdown timer using `SPEAKING_LEVEL_CONFIG[level].maxDurationSeconds`
    - Implement record/stop controls using `expo-av` Audio API
    - Display elapsed time and remaining time while recording
    - Reject recordings shorter than 5 seconds with error message
    - Handle microphone permission denial with settings link
    - On stop: call `speakingService.submitSession`, navigate to FeedbackScreen with result
    - Show "Rex is listening..." loading state with waveform animation (react-native-reanimated) during Edge Function call
    - _Requirements: 1.1–1.7, 10.1_

- [x] 8. Feedback screen
  - [x] 8.1 Create `src/screens/speaking/FeedbackScreen.tsx` with `ConfidenceHero` component
    - Animated counter counting up to `confidenceScore` using react-native-reanimated
    - Color the score using `getConfidenceColor`
    - Display trend vs previous session (delta with up/down arrow)
    - _Requirements: 8.4–8.6_

  - [x] 8.2 Implement `MetricCardGrid` component
    - 8 cards, each showing metric name, score/value, trend arrow, status label from `getMetricStatus`
    - Animate cards in one by one with 150ms staggered delay using react-native-reanimated
    - _Requirements: 10.2–10.3_

  - [x] 8.3 Implement `FillerHeatmap` component
    - Display full transcript text
    - Highlight every filler word in red using `fillerPositions` char offsets
    - Tap handler on highlighted words shows filler type and total count
    - _Requirements: 4.5–4.6, 10.4_

  - [x] 8.4 Implement `LanguageAnalysis`, `OpeningClosingCards`, `RexVerdictSection`, `OneFixCard` components
    - `LanguageAnalysis`: two-column layout, up to 3 strong (green) and 3 weak (red) exact quotes
    - `OpeningClosingCards`: side-by-side cards with score and one-sentence analysis
    - `RexVerdictSection`: auto-play `rexAudioUrl` via `expo-av` on mount, display `rexVerdict` text simultaneously
    - `OneFixCard`: large prominent card displaying `tomorrowFocus` in monospace font
    - _Requirements: 5.5, 9.7–9.8, 10.5–10.7_

  - [x] 8.5 Implement `GoAgainButton` and retry comparison
    - "Go again — apply the fix" button navigates to RecordingScreen with same topic
    - After retry session completes, display side-by-side score comparison (original vs retry)
    - _Requirements: 10.8–10.9_

- [x] 9. Speaking home screen and navigator
  - Create `src/screens/speaking/SpeakingHomeScreen.tsx`
    - Display current level with label and max duration
    - Display locked/unlocked state for each level (locked levels show unlock requirements)
    - Display today's topic prompt for the current level
    - Display weekly challenge card if available (premium only)
    - "Start Session" button navigates to RecordingScreen
    - Free tier: show session count (max 1/day) and upgrade prompt when limit reached
    - _Requirements: 13.1–13.2, 15.1–15.6, 16.1, 16.7_
  - Create `src/screens/speaking/SpeakingNavigator.tsx` wiring all speaking screens
  - Register navigator in main `App.tsx` navigation tree

- [x] 10. Progress dashboard
  - Create `src/screens/speaking/ProgressDashboard.tsx`
  - Implement `ConfidenceLineChart`: line chart of all sessions' confidence scores, green if trending up, red if trending down (react-native-svg)
  - Implement `FillersLineChart`: line chart of fillers_per_minute with target zone (<3/min) highlighted
  - Implement `PaceLineChart`: line chart of pace_wpm with optimal range (130–160) highlighted
  - Implement `MetricRadarChart`: spider chart with 3 lines — current session, personal best, first session
  - Implement `WeeklyBarChart`: bar chart of sessions per week
  - Implement `PersonalBestsTable`: best confidence, lowest fillers/min, best opening, best closing
  - Implement `SessionHistoryList`: scrollable list with date, topic, level, confidence score, trend; tap to view full session
  - Add "Speaking Progress" entry point in `ProfileScreen.tsx`
  - _Requirements: 12.1–12.7_

- [x] 11. XP, streak, and milestone integration
  - In `speakingService.ts`, after receiving `SpeechAnalysisResult`:
    - Call `progressService.awardXP(userId, 30, 'speaking_session', sessionId)`
    - Call `streakService` to update streak
    - Call `checkMilestones` and display any returned `MilestoneAlert` messages
    - Call `checkLevelUnlock` and if a new level is unlocked, trigger TTS voice message and display unlock screen
  - For weekly challenge completion: call `progressService.awardXP(userId, 100, 'speaking_challenge', challengeId)`
  - For session 100 milestone: call `ShareableCard` component with session stats
  - _Requirements: 14.1–14.10, 15.4–15.5, 17.1–17.5_

- [x] 12. Seed weekly speaking challenges
  - Add 5 weeks of challenge prompts to `supabase/seed.sql`:
    - Week 1: "Record explaining GROWTHOVO to an imaginary stranger"
    - Week 2: "Voice note to your accountability partner — tell them your biggest current struggle"
    - Week 3: "Present your 90-day goal out loud for 2 minutes"
    - Week 4: "Record yourself telling a story that made you laugh"
    - Week 5: "Pitch yourself for your dream job in 90 seconds"
  - _Requirements: 15.3_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive coverage
- Each task references specific requirements for traceability
- All AI calls go through the `analyze-speech` Edge Function — never directly from the client
- Pure metric functions in `speakingMetrics.ts` are duplicated in the Edge Function (Deno context) and the client (for display helpers)
- Property tests use `fast-check` with minimum 100 iterations per property
- The `analyze-speech` Edge Function follows the same pattern as `submit-evening-debrief` and `rex-response`
