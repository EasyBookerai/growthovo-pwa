# Implementation Plan: Rex AI Coach

## Overview

Implement the Rex AI coach system by building the TypeScript service layer, Supabase migrations, Edge Functions, and fallback/caching infrastructure. Each task builds incrementally on the previous, ending with full integration into the existing UI.

## Tasks

- [x] 1. Create TypeScript types and interfaces for Rex
  - Add `RexCheckInParams`, `RexWeeklySummaryParams`, `RexStreakWarningParams`, `RexCacheEntry`, `AiUsageRecord`, `AiCostRecord`, `WeeklySummaryRecord` to `growthovo/src/types/index.ts`
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 2. Implement Rex Fallback Service
  - [x] 2.1 Create `growthovo/src/services/rexFallback.ts` with the three fallback pools and `getCheckInFallback`, `getStreakWarningFallback`, `getWeeklySummaryFallback` functions
    - Implement `[streakDays]` and `[hoursLeft]` template variable substitution
    - Use random selection from each pool
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [x] 2.2 Write property test for fallback template substitution completeness
    - **Property 4: Fallback template substitution completeness**
    - **Validates: Requirements 6.4, 6.5**
  - [x] 2.3 Write property test for fallback always returns non-empty string
    - **Property 5: Fallback always returns non-empty string**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.6**

- [x] 3. Implement Rex Cache Service
  - [x] 3.1 Create `growthovo/src/services/rexCache.ts` with `getStreakBracket`, `computeCacheKey`, `getCachedResponse`, `setCachedResponse`
    - `computeCacheKey` uses SHA-256 via `crypto.subtle` (Deno) or `crypto` (Node) on `challengeText + completed + streakBracket`
    - `getCachedResponse` filters entries older than 7 days as cache misses
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 3.2 Write property test for streak bracket exhaustive and non-overlapping
    - **Property 1: Streak bracket is exhaustive and non-overlapping**
    - **Validates: Requirements 5.4**
  - [x] 3.3 Write property test for cache key determinism
    - **Property 2: Cache key determinism**
    - **Validates: Requirements 5.1**
  - [x] 3.4 Write property test for cache key sensitivity to inputs
    - **Property 3: Cache key sensitivity to inputs**
    - **Validates: Requirements 5.1**

- [x] 4. Create Supabase migrations
  - [x] 4.1 Create migration file `growthovo/supabase/migrations/20240001_rex_cache.sql` — `rex_cache` table with `cache_key`, `response`, `created_at`; add RLS policy (no user reads, service role only)
    - _Requirements: 10.4, 10.5_
  - [x] 4.2 Create migration file `growthovo/supabase/migrations/20240002_ai_usage.sql` — `ai_usage` table with `user_id`, `date`, `count`, unique constraint on `(user_id, date)`; RLS: users can read own rows
    - _Requirements: 10.1, 10.5_
  - [x] 4.3 Create migration file `growthovo/supabase/migrations/20240003_ai_costs.sql` — `ai_costs` table with `date`, `calls`, `estimated_cost_eur`, unique on `date`; RLS: service role only
    - _Requirements: 10.3, 10.5_
  - [x] 4.4 Create migration file `growthovo/supabase/migrations/20240004_weekly_summaries.sql` — `weekly_summaries` table with `user_id`, `week_start`, `summary_text`, `push_sent`, `created_at`, unique on `(user_id, week_start)`; RLS: users can read own rows
    - _Requirements: 10.2, 10.5_

- [x] 5. Implement `rex-response` Supabase Edge Function
  - [x] 5.1 Create `growthovo/supabase/functions/rex-response/index.ts` replacing `rex-chat`
    - Handle `type: 'checkin' | 'weekly_summary' | 'streak_warning'` in request body
    - Implement free-user short-circuit (return `{ fallback: true }` immediately)
    - Implement rate limit check against `ai_usage` table; return `{ fallback: true }` if count >= 3
    - Implement cache lookup for check-in type using `rexCache` logic
    - Call OpenAI with correct model (`gpt-4o-mini` for checkin/warning, `gpt-4o` for weekly_summary), token limits (120/80/300), temperature 0.85, and the exact Rex system prompt
    - Store check-in responses in `rex_cache`
    - Upsert into `ai_usage` (increment count)
    - Upsert into `ai_costs` (increment calls and estimated_cost_eur)
    - Apply 8-second timeout via `AbortController`
    - _Requirements: 1.1, 1.5, 1.6, 1.7, 2.1, 2.3, 3.2, 4.1, 5.2, 5.3, 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2_
  - [x] 5.2 Write integration test: free user never triggers OpenAI
    - **Property 5: Free user never triggers OpenAI**
    - **Validates: Requirements 7.1**
  - [x] 5.3 Write property test: rate limit gate — OpenAI called iff count < 3
    - **Property 6 & 7: Premium user daily cap enforcement**
    - **Validates: Requirements 7.3, 7.4**
  - [x] 5.4 Write property test: cost log math accuracy
    - **Property 8: Cost log accuracy**
    - **Validates: Requirements 9.1, 9.2**

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement `rex.ts` client service
  - Create `growthovo/src/services/rex.ts` with `getRexCheckInResponse`, `getRexWeeklySummary`, `getRexStreakWarning`
  - Each function invokes the `rex-response` Edge Function via `supabase.functions.invoke`
  - Read `subscriptionStatus` from the Redux store and pass it in the request body
  - Apply an 8-second client-side timeout; on timeout or error, call the appropriate `rexFallback` function
  - If Edge Function returns `{ fallback: true }`, call the appropriate `rexFallback` function
  - _Requirements: 1.1, 1.7, 2.4, 2.5, 3.3, 3.4_

- [x] 8. Implement `weekly-rex-summary` Edge Function
  - [x] 8.1 Create `growthovo/supabase/functions/weekly-rex-summary/index.ts`
    - Query all Premium_Users
    - For each user, check if current time in their timezone is Sunday 20:00 ± 30 min
    - Count active days this week from `user_progress` and `challenge_completions`
    - Skip users with fewer than 3 active days
    - Gather weekly stats and call OpenAI with `gpt-4o` and the Rex system prompt
    - Insert result into `weekly_summaries`
    - Send push notification via Expo Push API: "Rex has your weekly report. You might not like it."
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
  - [x] 8.2 Write property test: weekly summary skips low-activity users
    - **Property 9: Weekly summary skips low-activity users**
    - **Validates: Requirements 8.5**

- [x] 9. Implement `admin-ai-costs` Edge Function
  - Create `growthovo/supabase/functions/admin-ai-costs/index.ts`
  - Protect with `Authorization` header check against `ADMIN_SECRET` env var; return 401 if missing/invalid
  - Query `ai_costs` for last 7 days (weekly) and last 30 days (monthly) totals
  - Return `{ weekly, monthly, daily_breakdown }`
  - Check if today's `estimated_cost_eur` exceeds €50; if so, send alert email via configured webhook
  - _Requirements: 9.3, 9.4_

- [x] 10. Wire Rex into existing UI screens
  - [x] 10.1 Update `growthovo/src/screens/checkin/CheckInScreen.tsx` to call `getRexCheckInResponse` from `rex.ts` instead of `getRexResponse` from `rexService.ts`
    - Pass `challengeText`, `streakDays`, `pillar`, and `recentHistory` from available state
    - _Requirements: 1.1_
  - [x] 10.2 Update `growthovo/src/screens/home/HomeScreen.tsx` to display the weekly summary card on Monday mornings
    - Query `weekly_summaries` for the current user and current week; render as a card if present
    - _Requirements: 8.4_
  - [x] 10.3 Update streak-at-risk notification logic to call `getRexStreakWarning` from `rex.ts`
    - Pass `streakDays`, `hoursLeft`, and `lastChallenge`
    - _Requirements: 3.1, 3.3_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All test tasks are required — comprehensive coverage from the start
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) with minimum 100 iterations each
- The `rex-chat` Edge Function is superseded by `rex-response` — do not delete it until `rex-response` is confirmed working
- All OpenAI calls live in Edge Functions; the client (`rex.ts`) never calls OpenAI directly
- Migrations must be applied in order (20240001 → 20240004)
