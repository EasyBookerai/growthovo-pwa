# Requirements Document

## Introduction

Rex is the AI coach inside the Levels (Growthovo) self-improvement app. Rex delivers brutally honest, warm, personality-driven responses at key moments in the user journey: after check-ins, when streaks are at risk, and in weekly summaries. The existing `rex-chat` edge function and `rexService.ts` provide a basic trigger-based response system. This feature replaces and extends that foundation with structured service functions, a Supabase caching layer, rate limiting by subscription tier, a weekly summary pipeline, cost tracking, and a robust fallback system — all while preserving Rex's distinct voice.

## Glossary

- **Rex_Service**: The TypeScript module at `growthovo/src/services/rex.ts` that exposes the three primary Rex response functions.
- **Rex_Cache_Service**: The module at `growthovo/src/services/rexCache.ts` responsible for reading and writing cached Rex responses in Supabase.
- **Rex_Fallback_Service**: The module at `growthovo/src/services/rexFallback.ts` that returns pre-written responses when OpenAI is unavailable or rate limits are reached.
- **OpenAI_Client**: The HTTP client used inside Supabase Edge Functions to call the OpenAI Chat Completions API.
- **Weekly_Summary_Function**: The Supabase Edge Function that generates and stores Rex weekly summaries every Sunday at 8 pm user local time.
- **Admin_Endpoint**: The Supabase Edge Function at `GET /admin/ai-costs` that returns AI spend data.
- **Streak_Bracket**: A grouping of streak lengths used as a cache key component: 1–7, 8–30, 31–100, or 100+ days.
- **Premium_User**: A user whose `subscription_status` is `active` or `trialing`.
- **Free_User**: A user whose `subscription_status` is `free` or `canceled`.
- **Cache_Key**: A deterministic hash derived from `challengeText + completed + streakBracket`.
- **AI_Usage_Table**: The Supabase table `ai_usage(user_id, date, count)` tracking daily OpenAI calls per user.
- **AI_Costs_Table**: The Supabase table `ai_costs(date, calls, estimated_cost_eur)` tracking aggregate daily OpenAI spend.
- **Weekly_Summaries_Table**: The Supabase table `weekly_summaries` storing generated Rex weekly summaries.
- **Rex_Cache_Table**: The Supabase table `rex_cache` storing cached Rex responses keyed by `Cache_Key`.

---

## Requirements

### Requirement 1: Rex Check-In Response

**User Story:** As a user, I want Rex to respond to my daily check-in with a personalised, honest message, so that I feel accountable and motivated to continue.

#### Acceptance Criteria

1. WHEN a user submits a check-in, THE Rex_Service SHALL call `getRexCheckInResponse` with `userId`, `challengeCompleted`, `challengeText`, `streakDays`, `pillar`, and `recentHistory`.
2. WHEN `getRexCheckInResponse` is called, THE Rex_Service SHALL return a response of at most 120 tokens.
3. WHEN `challengeCompleted` is `true`, THE Rex_Service SHALL return a response that acknowledges the completion and ends with a forward-looking statement.
4. WHEN `challengeCompleted` is `false`, THE Rex_Service SHALL return a response that acknowledges the miss, identifies the smallest win, and pushes the user forward.
5. THE Rex_Service SHALL use the model `gpt-4o-mini` for all `getRexCheckInResponse` calls.
6. THE Rex_Service SHALL use temperature `0.85` for all OpenAI calls.
7. IF the OpenAI call exceeds 8 seconds, THEN THE Rex_Service SHALL return a fallback response from Rex_Fallback_Service.

---

### Requirement 2: Rex Weekly Summary

**User Story:** As a premium user, I want a weekly summary from Rex every Monday morning, so that I can reflect on my progress and know where to improve.

#### Acceptance Criteria

1. WHEN `getRexWeeklySummary` is called, THE Rex_Service SHALL use the model `gpt-4o`.
2. WHEN `getRexWeeklySummary` is called, THE Rex_Service SHALL return a response of at most 300 tokens.
3. THE Rex_Service SHALL use temperature `0.85` for `getRexWeeklySummary` calls.
4. IF the OpenAI call exceeds 8 seconds, THEN THE Rex_Service SHALL return a fallback response from Rex_Fallback_Service.
5. WHEN `getRexWeeklySummary` is called, THE Rex_Service SHALL accept `userId`, `lessonsCompleted`, `challengesCompleted`, `streakDays`, `xpEarned`, `strongestPillar`, `weakestPillar`, and `previousWeekLessons` as parameters.

---

### Requirement 3: Rex Streak Warning

**User Story:** As a user, I want Rex to warn me when my streak is about to expire, so that I have a chance to act before losing it.

#### Acceptance Criteria

1. WHEN `getRexStreakWarning` is called, THE Rex_Service SHALL return a response of at most 80 tokens.
2. THE Rex_Service SHALL use the model `gpt-4o-mini` for all `getRexStreakWarning` calls.
3. WHEN `getRexStreakWarning` is called, THE Rex_Service SHALL accept `userId`, `streakDays`, `hoursLeft`, and `lastChallenge` as parameters.
4. IF the OpenAI call exceeds 8 seconds, THEN THE Rex_Service SHALL return a fallback response from Rex_Fallback_Service.

---

### Requirement 4: Rex System Prompt

**User Story:** As a product owner, I want Rex to always speak in a consistent, defined voice, so that the personality is never diluted by model drift.

#### Acceptance Criteria

1. THE Rex_Service SHALL include the exact Rex system prompt in every OpenAI request.
2. THE Rex_Service SHALL never include corporate praise terms ("Great job", "Amazing", "Fantastic") in any generated response.
3. WHEN generating check-in responses, THE Rex_Service SHALL limit responses to a maximum of 2 sentences.
4. WHEN generating streak warning responses, THE Rex_Service SHALL limit responses to a maximum of 1 sentence.
5. THE Rex_Service SHALL reference the user's specific challenge text or streak number in every personalised response.

---

### Requirement 5: Response Caching

**User Story:** As a system operator, I want Rex responses to be cached in Supabase, so that repeated similar inputs return instantly without incurring OpenAI costs.

#### Acceptance Criteria

1. WHEN a Rex response is requested, THE Rex_Cache_Service SHALL compute a Cache_Key by hashing `challengeText + completed + streakBracket`.
2. WHEN a Cache_Key matches an entry in Rex_Cache_Table that was created within the last 7 days, THE Rex_Cache_Service SHALL return the cached response without calling OpenAI.
3. WHEN no valid cache entry exists, THE Rex_Cache_Service SHALL call OpenAI, store the result in Rex_Cache_Table with the Cache_Key and a timestamp, and return the response.
4. THE Rex_Cache_Service SHALL group streak values into Streak_Brackets (1–7, 8–30, 31–100, 100+) before computing the Cache_Key.
5. WHEN a cached entry is older than 7 days, THE Rex_Cache_Service SHALL treat it as a cache miss and fetch a fresh response.

---

### Requirement 6: Fallback Responses

**User Story:** As a user, I want to always receive a Rex response even when the AI is unavailable, so that the experience is never broken.

#### Acceptance Criteria

1. WHEN `challengeCompleted` is `true` and a fallback is needed, THE Rex_Fallback_Service SHALL return a randomly selected response from the completed fallback pool.
2. WHEN `challengeCompleted` is `false` and a fallback is needed, THE Rex_Fallback_Service SHALL return a randomly selected response from the missed fallback pool.
3. WHEN a streak warning fallback is needed, THE Rex_Fallback_Service SHALL return a randomly selected response from the streak warning fallback pool.
4. WHEN a fallback response contains the placeholder `[streakDays]`, THE Rex_Fallback_Service SHALL replace it with the actual streak day count.
5. WHEN a fallback response contains the placeholder `[hoursLeft]`, THE Rex_Fallback_Service SHALL replace it with the actual hours remaining.
6. THE Rex_Fallback_Service SHALL never surface an error message to the user in place of a Rex response.

---

### Requirement 7: Rate Limiting by Subscription Tier

**User Story:** As a system operator, I want to limit OpenAI calls by subscription tier, so that free users do not incur AI costs and premium users have a fair daily cap.

#### Acceptance Criteria

1. WHEN a Free_User requests a Rex response, THE Rex_Service SHALL return a fallback response without making any OpenAI call.
2. WHEN a Premium_User requests a Rex response, THE Rex_Service SHALL check the AI_Usage_Table for the current date.
3. WHEN a Premium_User has made fewer than 3 OpenAI calls today, THE Rex_Service SHALL proceed with the OpenAI call and increment the count in AI_Usage_Table.
4. WHEN a Premium_User has reached 3 OpenAI calls today, THE Rex_Service SHALL silently return a fallback response without notifying the user.
5. THE Rex_Service SHALL record each OpenAI call in AI_Usage_Table with `user_id`, `date`, and incremented `count`.

---

### Requirement 8: Weekly Summary Trigger

**User Story:** As a premium user, I want Rex's weekly summary to be generated automatically every Sunday evening, so that it is ready for me on Monday morning without any manual action.

#### Acceptance Criteria

1. WHEN Sunday at 8 pm in the user's local time arrives, THE Weekly_Summary_Function SHALL trigger for all Premium_Users who had at least 3 active days that week.
2. WHEN the Weekly_Summary_Function runs, THE Weekly_Summary_Function SHALL call `getRexWeeklySummary` and store the result in Weekly_Summaries_Table.
3. WHEN a weekly summary is stored, THE Weekly_Summary_Function SHALL send a push notification with the message "Rex has your weekly report. You might not like it."
4. WHEN a user opens the app on Monday morning, THE Rex_Service SHALL surface the weekly summary as a card on the home screen.
5. IF a Premium_User had fewer than 3 active days that week, THEN THE Weekly_Summary_Function SHALL skip summary generation for that user.

---

### Requirement 9: Cost Tracking

**User Story:** As a system operator, I want every OpenAI call to be logged with its estimated cost, so that I can monitor spend and act before it becomes a problem.

#### Acceptance Criteria

1. WHEN an OpenAI call is made using `gpt-4o-mini`, THE Rex_Service SHALL log the call in AI_Costs_Table with an estimated cost of €0.0002.
2. WHEN an OpenAI call is made using `gpt-4o`, THE Rex_Service SHALL log the call in AI_Costs_Table with an estimated cost of €0.002.
3. WHEN the Admin_Endpoint receives a `GET /admin/ai-costs` request, THE Admin_Endpoint SHALL return weekly and monthly spend totals from AI_Costs_Table.
4. WHEN the daily estimated cost in AI_Costs_Table exceeds €50, THE Rex_Service SHALL send an alert email to the configured admin address.

---

### Requirement 10: Database Migrations

**User Story:** As a developer, I want all new Supabase tables to be created via migration files, so that the schema is version-controlled and reproducible.

#### Acceptance Criteria

1. THE Rex_Service SHALL require a migration that creates the `ai_usage` table with columns `user_id`, `date`, and `count`.
2. THE Rex_Service SHALL require a migration that creates the `weekly_summaries` table with columns for `user_id`, `week_start`, `summary_text`, `created_at`, and `push_sent`.
3. THE Rex_Service SHALL require a migration that creates the `ai_costs` table with columns `date`, `calls`, and `estimated_cost_eur`.
4. THE Rex_Service SHALL require a migration that creates the `rex_cache` table with columns `cache_key`, `response`, and `created_at`.
5. WHEN migrations are applied, THE Rex_Service SHALL enforce appropriate Row Level Security policies so users can only read their own data.

---

### Requirement 11: TypeScript Types

**User Story:** As a developer, I want full TypeScript types for all Rex functions and data structures, so that the codebase remains type-safe and self-documenting.

#### Acceptance Criteria

1. THE Rex_Service SHALL export TypeScript interfaces for all function parameter objects (`RexCheckInParams`, `RexWeeklySummaryParams`, `RexStreakWarningParams`).
2. THE Rex_Service SHALL export a `RexCacheEntry` interface representing a row in Rex_Cache_Table.
3. THE Rex_Service SHALL export an `AiUsageRecord` interface representing a row in AI_Usage_Table.
4. THE Rex_Service SHALL export an `AiCostRecord` interface representing a row in AI_Costs_Table.
5. THE Rex_Service SHALL export a `WeeklySummaryRecord` interface representing a row in Weekly_Summaries_Table.
