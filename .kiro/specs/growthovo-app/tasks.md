# Implementation Plan: Growthovo App

## Overview

Incremental implementation of the Growthovo React Native (Expo) app. Each task builds on the previous, starting with project scaffolding and Supabase integration, then gamification logic, then screens, then AI coach, then subscriptions, then notifications. The MVP ships with the Discipline pillar fully populated.

---

## Tasks

- [x] 1. Project scaffolding and Supabase setup
  - Initialise Expo project with TypeScript template (`npx create-expo-app growthovo --template expo-template-blank-typescript`)
  - Install core dependencies: `@supabase/supabase-js`, `zustand`, `react-native-svg`, `expo-notifications`, `expo-image-picker`, `react-native-gesture-handler`, `react-native-reanimated`
  - Create `src/services/supabaseClient.ts` with Supabase JS client singleton using env vars
  - Set up `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - Create Supabase project and run the full schema SQL from design.md (all 16 tables)
  - Enable RLS on all tables and write initial RLS policies (users can only CRUD their own rows)
  - Seed the 6 Pillars rows and the Discipline pillar's 5 Units, 40 Lessons, and 40 Challenges
  - _Requirements: 20.1, 20.2, 3.1_

- [x] 2. Authentication
  - [x] 2.1 Implement `src/services/authService.ts` with `signUp`, `signIn`, `signInWithGoogle`, `signOut`, `refreshSession`
    - Use Supabase Auth; on signUp also insert a row into `users` table
    - _Requirements: 1.1, 1.2, 1.6_
  - [ ]* 2.2 Write unit tests for authService
    - Test signUp creates user row, signIn returns session, signOut clears session, error messages are user-friendly
    - _Requirements: 1.5_
  - [x] 2.3 Build `SignInScreen` and `SignUpScreen` with email/password forms and Google OAuth button
    - Navigate to Home on success; display descriptive error on failure (no stack traces)
    - _Requirements: 1.4, 1.5_

- [x] 3. Onboarding flow
  - [x] 3.1 Build `OnboardingScreen` with pillar multi-select and daily goal picker (5/10/15 min)
    - On complete: write selected pillars and daily_goal_minutes to `users` table, set `onboarding_complete = true`, navigate to Home
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 3.2 Write property test: onboarding shown exactly once
    - Feature: growthovo-app, Property: onboarding_complete flag prevents re-display
    - For any user with onboarding_complete=true, the app should route to Home not Onboarding
    - _Requirements: 2.6_

- [x] 4. Core gamification services
  - [x] 4.1 Implement `src/services/heartService.ts`
    - `deductHeart(userId)`: decrement hearts, floor at 0, use Supabase RPC for atomic update
    - `refillHearts(userId)`: set count=5 only if last_refill_date < today (idempotent)
    - `getHearts(userId)`: fetch current count
    - Premium bypass: if subscription_status='active' or 'trialing', skip deduction
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ]* 4.2 Write property tests for heartService
    - Feature: growthovo-app, Property 3: Heart deduction never goes below zero
    - Feature: growthovo-app, Property 4: Daily heart refill is idempotent
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 4.3 Implement `src/services/streakService.ts`
    - `incrementStreak(userId)`: idempotent — only increments if last_activity_date < today
    - `handleMissedDay(userId)`: if freeze_count > 0 consume one freeze, else reset streak to 0
    - `addStreakFreeze(userId)`: increment freeze_count, cap at 5
    - `checkMilestone(streak)`: returns milestone XP bonus for 7/30/100 day milestones
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 9.1, 9.3, 9.4_
  - [ ]* 4.4 Write property tests for streakService
    - Feature: growthovo-app, Property 1: Streak increment is idempotent within a day
    - Feature: growthovo-app, Property 2: Streak freeze consumption preserves streak
    - Feature: growthovo-app, Property 12: Streak freeze inventory cap never exceeds 5
    - _Requirements: 5.1, 5.3, 9.4_
  - [x] 4.5 Implement `src/services/progressService.ts`
    - `awardXP(userId, amount, source, referenceId)`: insert XP_Transaction row
    - `getTotalXP(userId)`: sum all XP_Transaction amounts for user
    - `getPillarLevel(userId, pillarId)`: calculate level 1-10 from XP in that pillar
    - `checkLevelUp(userId, pillarId)`: returns true if XP crossed a level threshold
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 14.3_
  - [ ]* 4.6 Write property test for progressService
    - Feature: growthovo-app, Property 5: XP transactions sum equals total XP
    - For any sequence of awardXP calls, getTotalXP should equal the sum of all amounts
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 5. Checkpoint — core services
  - Ensure all tests pass. Verify Supabase RLS blocks cross-user data access with a manual test. Ask the user if questions arise.

- [x] 6. Lesson service and player
  - [x] 6.1 Implement `src/services/lessonService.ts`
    - `getLessonsForUnit(unitId)`: fetch lessons ordered by display_order
    - `completeLesson(userId, lessonId)`: upsert user_progress, call awardXP, unlock next lesson
    - `getNextLesson(userId, pillarId)`: find first incomplete lesson in pillar
    - `isLessonUnlocked(userId, lessonId)`: check prerequisite completion
    - _Requirements: 4.8, 4.9, 15.2, 15.3, 15.4_
  - [ ]* 6.2 Write property test for lessonService
    - Feature: growthovo-app, Property 6: Lesson unlock is monotonic
    - For any sequence of lesson completions, no previously unlocked lesson becomes locked
    - _Requirements: 4.9_
  - [x] 6.3 Build `LessonPlayerScreen` with `SwipeableCardDeck`
    - 5 card variants: Concept (≤60 words), Example, Mistake, Science, Challenge
    - Progress dots indicator, swipe left/right gesture with react-native-gesture-handler
    - On final card swipe: trigger completeLesson, show `LessonCompleteOverlay` with XP animation
    - Deduct heart on skip (swipe back past first card)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.10, 6.2_

- [x] 7. Pillars map screen
  - [x] 7.1 Build `PillarsMapScreen` with `PillarPath` scrollable vertical path
    - `LessonNode` component with three visual states: completed (filled), current (pulsing), locked (greyed)
    - `UnitNode` header with progress ring
    - `PillarTabBar` for switching between pillars
    - Tapping locked lesson shows prerequisite message; tapping current/completed navigates to LessonPlayer
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 3.4_

- [x] 8. Home screen
  - [x] 8.1 Build `HomeScreen` with all dashboard widgets
    - `StreakBadge`: current streak count, Rex weakened state when today not yet completed
    - `HeartBar`: heart count (hide/show based on subscription)
    - `XPProgressBar`: total XP and level progress
    - `DailyLessonCard`: tappable, navigates to next incomplete lesson
    - `LeagueSnapshot`: mini leaderboard (top 3 + user position)
    - _Requirements: 5.5, 6.6, 7.4, 8.5_

- [x] 9. Challenge and check-in flow
  - [x] 9.1 Implement `src/services/challengeService.ts`
    - `getTodayChallenge(userId)`: fetch challenge for today's lesson
    - `submitCheckIn(userId, challengeId, completed, proofPhotoUrl?)`: insert ChallengeCompletion, enforce one-per-day, award XP
    - _Requirements: 10.2, 10.3, 10.4, 10.6_
  - [ ]* 9.2 Write property test for challengeService
    - Feature: growthovo-app, Property 8: Check-in is submitted at most once per day
    - For any user, submitting check-in twice on same day should reject second call and not double XP
    - _Requirements: 10.6_
  - [x] 9.3 Build `CheckInScreen`
    - Display today's challenge text, yes/no completion toggle
    - On submit: call submitCheckIn, display Rex feedback card, show tomorrow's lesson preview
    - Upload proof photo to Supabase Storage if provided
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 20.3_

- [x] 10. Checkpoint — lesson and challenge flow
  - Ensure all tests pass. Manually verify a full lesson → check-in → XP flow end-to-end. Ask the user if questions arise.

- [x] 11. AI Coach — Rex
  - [x] 11.1 Create Supabase Edge Function `rex-chat`
    - Accepts `{ userId, userMessage, context }` POST body
    - Fetches last 10 rex_messages for user from DB to build conversation history
    - Calls OpenAI Chat Completions API with system prompt defining Rex's personality
    - Stores assistant response in rex_messages table
    - Returns generated response text
    - OpenAI API key stored as Supabase secret, never exposed to client
    - _Requirements: 13.1, 13.3, 13.7_
  - [x] 11.2 Implement `src/services/rexService.ts`
    - `getRexResponse(userId, trigger, context)`: calls `rex-chat` Edge Function
    - `getFallbackMessage(trigger)`: returns pre-written message from local pool for offline/error cases
    - Triggers: 'lesson_complete' | 'checkin_positive' | 'checkin_negative' | 'streak_risk' | 'level_up'
    - _Requirements: 13.2, 13.4, 13.5, 13.6_
  - [ ]* 11.3 Write unit tests for rexService
    - Test fallback message is returned on Edge Function timeout
    - Test prompt construction includes conversation history
    - _Requirements: 13.2, 13.7_

- [x] 12. League system
  - [x] 12.1 Implement `src/services/leagueService.ts`
    - `assignUserToLeague(userId)`: find or create a league for current week with < 20 members
    - `getLeagueRankings(leagueId)`: fetch league_members ordered by weekly_xp DESC, assign ranks
    - `processWeeklyReset()`: promote top 5, relegate bottom 5, create new leagues, reset weekly_xp
    - `updateWeeklyXP(userId, amount)`: increment league_members.weekly_xp
    - _Requirements: 8.1, 8.2, 8.3, 8.6_
  - [ ]* 12.2 Write property tests for leagueService
    - Feature: growthovo-app, Property 7: League ranking is a total order
    - For any league members array, getLeagueRankings should produce unique ranks with highest XP = rank 1
    - _Requirements: 8.2_
  - [x] 12.3 Build `LeagueScreen` with real-time leaderboard
    - Subscribe to league_members table via Supabase Realtime
    - `LeagueLeaderboard` with promotion zone (top 5, green) and relegation zone (bottom 5, red)
    - `WeeklyXPCounter` showing days until reset
    - _Requirements: 8.4, 8.5_

- [x] 13. Squad system
  - [x] 13.1 Implement `src/services/squadService.ts`
    - `createSquad(userId, pillarId, name)`: create squad with unique invite_code, add creator as member
    - `joinSquad(userId, inviteCode)`: validate squad exists, member count < 5, add member
    - `getSquadMembers(squadId)`: fetch members with streak and weekly XP
    - _Requirements: 12.1, 12.5_
  - [ ]* 13.2 Write property test for squadService
    - Feature: growthovo-app, Property 11: Squad size invariant never exceeds 5
    - For any sequence of joinSquad calls, squad member count should never exceed 5
    - _Requirements: 12.1_
  - [x] 13.3 Build `SquadScreen` with real-time leaderboard
    - Subscribe to squad_members via Supabase Realtime
    - `SquadLeaderboard`, `MemberCard` (streak + weekly XP), `SharedChallengeLog`
    - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [x] 14. Profile screen
  - [x] 14.1 Build `ProfileScreen`
    - `SpiderChart` using react-native-svg — hexagonal radar chart, 6 axes for pillars, updates from progressService
    - `PillarLevelBadge` grid showing level 1-10 per pillar
    - `StreakHistory` calendar heatmap
    - `AvatarUploader` — pick image, upload to Supabase Storage, update users.avatar_url
    - _Requirements: 14.1, 14.2, 14.3, 14.6, 14.7_
  - [x] 14.2 Implement shareable profile card and Level 10 certificate
    - `ShareableCard` component — snapshot of levels, streak, top skill; export as image via expo-sharing
    - WHEN pillar level reaches 10: show certificate overlay, award badge, enable share
    - _Requirements: 14.4, 14.5_

- [x] 15. Friend streaks
  - [x] 15.1 Implement friend invite and friendship service
    - `generateInviteLink(userId)`: create deep link with userId param
    - `acceptFriendInvite(userId, friendId)`: insert bidirectional friends rows
    - `getFriendsStreaks(userId)`: fetch friends' streak counts
    - _Requirements: 11.1, 11.2, 11.3_
  - [x] 15.2 Display friend streaks on Profile screen with Supabase Realtime subscription
    - _Requirements: 11.3, 11.4_

- [x] 16. Checkpoint — social and profile
  - Ensure all tests pass. Verify Realtime updates propagate for leagues and squads. Ask the user if questions arise.

- [x] 17. Stripe subscription integration
  - [x] 17.1 Create Supabase Edge Function `stripe-webhook`
    - Verify Stripe webhook signature using `STRIPE_WEBHOOK_SECRET` Supabase secret
    - Handle events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
    - Upsert `subscriptions` table and update `users.subscription_status`, `users.subscription_plan`, `users.trial_end_date`, `users.stripe_customer_id`
    - Return 200 on success, 400 on signature failure
    - _Requirements: 17.7, 17.8, 20.4_
  - [ ]* 17.2 Write property test for stripe-webhook Edge Function
    - Feature: growthovo-app, Property 9: Subscription status sync round-trip
    - For any valid Stripe webhook payload, the resulting DB subscription_status should match the Stripe status
    - _Requirements: 17.7, 17.8_
  - [x] 17.3 Implement `src/services/subscriptionService.ts`
    - `createCheckoutSession(userId, plan)`: call Stripe API to create Checkout session with trial_period_days=3
    - `getPortalLink(userId)`: create Stripe Customer Portal session URL
    - `getSubscriptionStatus(userId)`: fetch from Supabase subscriptions table
    - _Requirements: 17.5, 17.6, 17.11_
  - [x] 17.4 Build `PaywallScreen`
    - `PlanCard` for monthly (€8) and annual (€59) with "3 days free, no card needed" badge
    - `StripeCheckoutButton` opens Stripe Checkout in WebView
    - Trigger paywall when: free user taps locked pillar, or hearts reach 0
    - _Requirements: 17.1, 17.2, 17.3, 17.10_
  - [ ]* 17.5 Write property test for free tier access
    - Feature: growthovo-app, Property 10: Free tier pillar access is exactly one
    - For any user with subscription_status='free', accessible pillar count should equal 1
    - _Requirements: 3.2_

- [x] 18. Push notifications
  - [x] 18.1 Implement `src/services/notificationService.ts`
    - `registerPushToken(userId)`: get Expo push token, store in notifications table
    - `scheduleDefaultNotifications(userId)`: schedule 8am, 2pm, 9pm local time notifications
    - `scheduleDangerWindow(userId, time)`: schedule custom alert
    - `cancelAllNotifications(userId)`: cancel all scheduled notifications
    - Use Expo Notifications API throughout
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_
  - [x] 18.2 Wire notification scheduling into onboarding completion and settings changes
    - On onboarding complete: call scheduleDefaultNotifications
    - On settings toggle: call cancelAllNotifications or reschedule
    - _Requirements: 16.5_

- [x] 19. Settings screen
  - [x] 19.1 Build `SettingsScreen`
    - Notification toggles (morning/afternoon/evening) and custom danger window time picker
    - Streak Freeze inventory display (from streaks.freeze_count)
    - "Manage Subscription" button → opens Stripe Customer Portal via subscriptionService.getPortalLink
    - Sign out button → calls authService.signOut
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 20. Design system and animations
  - [x] 20.1 Create `src/theme/` with dark mode colour tokens, pillar colours, typography scale
    - Mind=purple (#7C3AED), Discipline=red (#DC2626), Communication=blue (#2563EB), Money=green (#16A34A), Career=orange (#EA580C), Relationships=pink (#DB2777)
    - _Requirements: 19.1, 19.2, 19.3, 19.6_
  - [x] 20.2 Implement XP gain, level-up, and streak milestone animations using react-native-reanimated
    - XP gain: floating +XP number animation
    - Level up: full-screen overlay with particle burst
    - Streak milestone: Rex mascot celebration overlay
    - _Requirements: 19.4, 19.5_

- [x] 21. Final checkpoint — full integration
  - Ensure all tests pass. Run through the complete daily loop: onboarding → lesson → check-in → XP → league update → notification. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with minimum 100 iterations (`fc.assert(..., { numRuns: 100 })`)
- Unit tests use Jest + React Native Testing Library
- The MVP ships with the Discipline pillar fully seeded (40 lessons, 40 challenges)
- All Supabase secrets (OpenAI key, Stripe keys) are stored as Supabase project secrets, never in client code
- Stripe webhook endpoint: `https://<project>.supabase.co/functions/v1/stripe-webhook`
- Rex Edge Function endpoint: `https://<project>.supabase.co/functions/v1/rex-chat`
