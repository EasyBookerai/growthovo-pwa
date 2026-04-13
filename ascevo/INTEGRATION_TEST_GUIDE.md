# Growthovo App — Final Integration Test Guide

## Task 21: Final Checkpoint — Full Integration

This document provides a comprehensive testing checklist for verifying the complete daily loop and all integrated features.

---

## Prerequisites

Before starting integration tests:

- [ ] Supabase project is set up with schema.sql deployed
- [ ] RLS policies from rls.sql are applied
- [ ] Seed data from seed.sql is loaded (6 Pillars, Discipline pillar with 5 Units and 40 Lessons)
- [ ] .env file is configured with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
- [ ] Supabase Edge Functions are deployed (rex-chat, stripe-webhook)
- [ ] Supabase secrets are set (OPENAI_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)

---

## Complete Daily Loop Test

### 1. Authentication Flow

**Test: New User Sign Up**
- [ ] Open the app
- [ ] Navigate to Sign Up screen
- [ ] Enter email, password, and unique username
- [ ] Submit sign up form
- [ ] Verify: User is created in Supabase auth.users
- [ ] Verify: User row is created in users table
- [ ] Verify: Streak row is created with current_streak=0
- [ ] Verify: Hearts row is created with count=5
- [ ] Expected: User is redirected to Onboarding screen

**Test: Existing User Sign In**
- [ ] Sign out if signed in
- [ ] Navigate to Sign In screen
- [ ] Enter valid credentials
- [ ] Submit sign in form
- [ ] Expected: User is redirected to Home screen (if onboarding complete) or Onboarding screen

**Test: Authentication Error Handling**
- [ ] Try signing in with incorrect password
- [ ] Verify: Friendly error message is displayed (not raw error)
- [ ] Try signing up with existing email
- [ ] Verify: Friendly error message is displayed

---

### 2. Onboarding Flow

**Test: First-Time Onboarding**
- [ ] Sign up as a new user
- [ ] Verify: Onboarding screen is displayed
- [ ] Select one or more Pillars as weak spots
- [ ] Select daily goal (5, 10, or 15 minutes)
- [ ] Submit onboarding
- [ ] Verify: users.onboarding_complete is set to true in database
- [ ] Verify: Selected pillars and daily_goal_minutes are saved
- [ ] Verify: Push notification token is registered
- [ ] Verify: Default notifications are scheduled (8am, 2pm, 9pm)
- [ ] Expected: User is redirected to Home screen

**Test: Onboarding Shown Only Once**
- [ ] Complete onboarding
- [ ] Sign out and sign back in
- [ ] Verify: User goes directly to Home screen, not Onboarding

---

### 3. Lesson Flow

**Test: Complete First Lesson**
- [ ] Navigate to Pillars Map screen
- [ ] Select the Discipline pillar (or your unlocked pillar)
- [ ] Tap the first lesson (should be unlocked)
- [ ] Verify: Lesson Player opens with 5 cards
- [ ] Swipe through all 5 cards:
  - Card 1: Concept (≤60 words)
  - Card 2: Real example
  - Card 3: Common mistake
  - Card 4: Science fact
  - Card 5: Today's challenge
- [ ] Verify: Progress dots show current position
- [ ] Complete the lesson (swipe through all cards)
- [ ] Verify: Lesson Complete overlay appears with XP animation
- [ ] Verify: XP is awarded (check xp_transactions table)
- [ ] Verify: user_progress row is created with completed_at timestamp
- [ ] Verify: Next lesson is unlocked
- [ ] Verify: Streak is incremented (check streaks table)
- [ ] Expected: User returns to Pillars Map with lesson marked as completed

**Test: Lesson Unlock Sequence**
- [ ] Complete lesson 1
- [ ] Verify: Lesson 2 is now unlocked (visual state changes)
- [ ] Verify: Lesson 3 is still locked
- [ ] Try tapping lesson 3
- [ ] Verify: Message is displayed indicating prerequisite must be completed

**Test: Heart Deduction**
- [ ] Start a lesson
- [ ] Swipe back past the first card (skip action)
- [ ] Verify: Heart count decreases by 1
- [ ] Verify: hearts.count is updated in database
- [ ] Continue until hearts reach 0
- [ ] Verify: User cannot start new lessons
- [ ] Verify: Message is displayed about hearts refilling tomorrow

---

### 4. XP and Progress System

**Test: XP Accumulation**
- [ ] Complete a lesson
- [ ] Verify: XP transaction is recorded in xp_transactions table
- [ ] Verify: Total XP is displayed correctly on Home screen
- [ ] Verify: XP progress bar updates
- [ ] Complete multiple lessons
- [ ] Verify: Total XP equals sum of all xp_transactions

**Test: Pillar Level Progression**
- [ ] Complete multiple lessons in one pillar
- [ ] Navigate to Profile screen
- [ ] Verify: Pillar level increases as XP accumulates
- [ ] Verify: Spider chart updates to reflect new level
- [ ] Verify: Level is calculated correctly (1-10 based on XP thresholds)

**Test: Level Up Animation**
- [ ] Complete enough lessons to cross a level threshold
- [ ] Verify: Level-up animation is displayed
- [ ] Verify: Bonus XP is awarded for level up
- [ ] Verify: Rex celebration message appears

---

### 5. Streak System

**Test: Streak Increment**
- [ ] Complete a lesson on day 1
- [ ] Verify: Streak increments to 1
- [ ] Verify: streaks.last_activity_date is set to today
- [ ] Complete another lesson on the same day
- [ ] Verify: Streak remains at 1 (idempotent within a day)
- [ ] Wait until next day (or manually update last_activity_date in DB)
- [ ] Complete a lesson on day 2
- [ ] Verify: Streak increments to 2

**Test: Streak Milestone**
- [ ] Manually set streak to 6 in database
- [ ] Complete a lesson to reach 7-day streak
- [ ] Verify: Milestone animation is displayed
- [ ] Verify: Bonus XP is awarded (check xp_transactions)
- [ ] Verify: Rex celebration message appears

**Test: Streak Freeze**
- [ ] Have at least one streak freeze (manually add to database if needed)
- [ ] Miss a day (manually set last_activity_date to 2 days ago)
- [ ] Complete a lesson
- [ ] Verify: Streak freeze is consumed (freeze_count decreases by 1)
- [ ] Verify: Streak is preserved (current_streak unchanged)

**Test: Streak Reset**
- [ ] Have 0 streak freezes
- [ ] Miss a day (manually set last_activity_date to 2 days ago)
- [ ] Complete a lesson
- [ ] Verify: Streak is reset to 1
- [ ] Verify: Rex guilt-trip message is displayed

---

### 6. Challenge and Check-In Flow

**Test: Evening Check-In**
- [ ] Complete a lesson (which assigns today's challenge)
- [ ] Navigate to Check-In screen (or wait for evening notification)
- [ ] Verify: Today's challenge text is displayed
- [ ] Select "Yes, I completed it"
- [ ] Submit check-in
- [ ] Verify: ChallengeCompletion row is created with completed=true
- [ ] Verify: Bonus XP is awarded
- [ ] Verify: Rex positive feedback message is displayed
- [ ] Verify: Tomorrow's lesson preview is shown

**Test: Check-In Negative Response**
- [ ] Complete a lesson
- [ ] Navigate to Check-In screen
- [ ] Select "No, I didn't complete it"
- [ ] Submit check-in
- [ ] Verify: ChallengeCompletion row is created with completed=false
- [ ] Verify: Reduced XP is awarded (for honesty)
- [ ] Verify: Rex gentle roast message is displayed

**Test: Check-In Once Per Day**
- [ ] Submit a check-in
- [ ] Try submitting another check-in on the same day
- [ ] Verify: Second submission is rejected
- [ ] Verify: No additional XP is awarded

---

### 7. League System

**Test: League Assignment**
- [ ] Sign up as a new user and complete onboarding
- [ ] Verify: User is assigned to a league (check league_members table)
- [ ] Verify: League has up to 20 members
- [ ] Navigate to League screen
- [ ] Verify: Leaderboard is displayed with all members

**Test: League Ranking**
- [ ] Complete lessons to earn XP
- [ ] Verify: Weekly XP is updated in league_members table
- [ ] Verify: Rank is calculated correctly (highest XP = rank 1)
- [ ] Verify: Leaderboard updates in real-time (Supabase Realtime)
- [ ] Verify: Promotion zone (top 5) is highlighted in green
- [ ] Verify: Relegation zone (bottom 5) is highlighted in red

**Test: Weekly Reset**
- [ ] Manually trigger weekly reset (or wait for Monday)
- [ ] Verify: Weekly XP counters are reset to 0
- [ ] Verify: Top 5 users are promoted to next tier
- [ ] Verify: Bottom 5 users are relegated to lower tier
- [ ] Verify: New leagues are created for the new week

---

### 8. Squad System

**Test: Create Squad**
- [ ] Navigate to Squad screen
- [ ] Create a new squad
- [ ] Select a pillar for the squad
- [ ] Enter squad name
- [ ] Submit
- [ ] Verify: Squad row is created in squads table
- [ ] Verify: Unique invite_code is generated
- [ ] Verify: Creator is added as first member

**Test: Join Squad**
- [ ] Get invite code from an existing squad
- [ ] Navigate to Squad screen
- [ ] Enter invite code
- [ ] Join squad
- [ ] Verify: SquadMember row is created
- [ ] Verify: Squad member count does not exceed 5
- [ ] Verify: Squad leaderboard displays all members

**Test: Squad Leaderboard**
- [ ] Join a squad with multiple members
- [ ] Complete lessons to earn XP
- [ ] Verify: Squad leaderboard updates in real-time
- [ ] Verify: Members are ranked by weekly XP
- [ ] Verify: Each member's streak and weekly XP are displayed

---

### 9. AI Coach — Rex

**Test: Rex Lesson Complete Response**
- [ ] Complete a lesson
- [ ] Verify: Rex response is displayed on Lesson Complete overlay
- [ ] Verify: Response is generated by OpenAI (check rex_messages table)
- [ ] Verify: Response tone is brutally honest and funny

**Test: Rex Check-In Feedback**
- [ ] Submit a check-in (positive or negative)
- [ ] Verify: Rex feedback is displayed
- [ ] Verify: Response references user's history (if available)
- [ ] Verify: Response is stored in rex_messages table

**Test: Rex Fallback on Error**
- [ ] Simulate OpenAI API timeout (disconnect internet or block API)
- [ ] Complete a lesson
- [ ] Verify: Fallback Rex message is displayed from local pool
- [ ] Verify: App does not crash

---

### 10. Profile and Social

**Test: Profile Spider Chart**
- [ ] Navigate to Profile screen
- [ ] Verify: Spider chart displays all 6 pillars
- [ ] Verify: Each pillar shows current level (1-10)
- [ ] Complete lessons in different pillars
- [ ] Verify: Spider chart updates in real-time

**Test: Shareable Profile Card**
- [ ] Navigate to Profile screen
- [ ] Tap "Share Profile" button
- [ ] Verify: Shareable card is generated with levels, streak, and top skill
- [ ] Verify: Card can be exported as image

**Test: Level 10 Certificate**
- [ ] Manually set a pillar to level 10 (or complete 40 lessons)
- [ ] Verify: Certificate overlay is displayed
- [ ] Verify: Badge is awarded
- [ ] Verify: Certificate can be shared

**Test: Friend Streaks**
- [ ] Generate friend invite link
- [ ] Share link with another user
- [ ] Have friend accept invite
- [ ] Verify: Bidirectional friendship rows are created
- [ ] Navigate to Profile screen
- [ ] Verify: Friend's streak is displayed
- [ ] Verify: Friend streak updates in real-time

---

### 11. Subscription and Paywall

**Test: Free Tier Restrictions**
- [ ] Sign up as a new user (free tier)
- [ ] Verify: Only 1 pillar is accessible
- [ ] Try tapping a locked pillar
- [ ] Verify: Paywall screen is displayed
- [ ] Verify: Hearts are limited to 5 per day
- [ ] Use all 5 hearts
- [ ] Verify: Paywall screen is displayed when trying to start a new lesson

**Test: Stripe Checkout**
- [ ] Trigger paywall screen
- [ ] Select monthly plan (€8/month)
- [ ] Tap "Start 3-Day Free Trial"
- [ ] Verify: Stripe Checkout opens in WebView
- [ ] Complete checkout (use Stripe test card: 4242 4242 4242 4242)
- [ ] Verify: Subscription is created in Stripe
- [ ] Verify: Webhook is received by stripe-webhook Edge Function
- [ ] Verify: users.subscription_status is updated to 'trialing'
- [ ] Verify: users.trial_end_date is set to 3 days from now

**Test: Premium Access**
- [ ] Subscribe to Premium
- [ ] Verify: All 6 pillars are now accessible
- [ ] Verify: Hearts are unlimited (no heart deduction)
- [ ] Verify: No ads are displayed

**Test: Subscription Cancellation**
- [ ] Navigate to Settings screen
- [ ] Tap "Manage Subscription"
- [ ] Verify: Stripe Customer Portal opens
- [ ] Cancel subscription
- [ ] Verify: Webhook is received
- [ ] Verify: users.subscription_status is updated to 'canceled'
- [ ] Verify: User is downgraded to free tier after trial/period ends

---

### 12. Notifications

**Test: Push Notification Registration**
- [ ] Complete onboarding
- [ ] Verify: Push token is registered (check notifications table)
- [ ] Verify: Default notifications are scheduled (8am, 2pm, 9pm)

**Test: Morning Notification**
- [ ] Wait for 8am (or manually trigger notification)
- [ ] Verify: Morning notification is received with streak-motivating message

**Test: Evening Notification**
- [ ] Wait for 9pm (or manually trigger notification)
- [ ] Verify: Evening notification is received warning about streak risk

**Test: Notification Settings**
- [ ] Navigate to Settings screen
- [ ] Disable morning notifications
- [ ] Verify: Morning notifications are canceled
- [ ] Re-enable morning notifications
- [ ] Verify: Morning notifications are rescheduled

---

### 13. Settings Screen

**Test: Settings Display**
- [ ] Navigate to Settings screen
- [ ] Verify: Notification toggles are displayed
- [ ] Verify: Streak freeze inventory is displayed
- [ ] Verify: "Manage Subscription" button is displayed
- [ ] Verify: Sign out button is displayed

**Test: Sign Out**
- [ ] Tap sign out button
- [ ] Verify: User is signed out
- [ ] Verify: Local session data is cleared
- [ ] Verify: User is redirected to Sign In screen

---

### 14. Design System and Animations

**Test: Dark Mode Theme**
- [ ] Navigate through all screens
- [ ] Verify: Dark mode is applied consistently
- [ ] Verify: High contrast colors are used
- [ ] Verify: Bold typography is used

**Test: Pillar Colors**
- [ ] Navigate to Pillars Map
- [ ] Verify: Each pillar uses its designated color:
  - Mind = purple (#7C3AED)
  - Discipline = red (#DC2626)
  - Communication = blue (#2563EB)
  - Money = green (#16A34A)
  - Career = orange (#EA580C)
  - Relationships = pink (#DB2777)

**Test: Animations**
- [ ] Complete a lesson
- [ ] Verify: XP gain animation is displayed (floating +XP number)
- [ ] Level up
- [ ] Verify: Level-up animation is displayed (particle burst)
- [ ] Reach streak milestone
- [ ] Verify: Streak milestone animation is displayed (Rex celebration)

---

### 15. Data Security and RLS

**Test: Row Level Security**
- [ ] Sign in as User A
- [ ] Complete a lesson
- [ ] Note the user_progress row ID
- [ ] Sign out and sign in as User B
- [ ] Try to query User A's user_progress row directly (via Supabase client)
- [ ] Verify: Query returns no data (RLS blocks access)
- [ ] Verify: User B can only see their own data

**Test: Session Management**
- [ ] Sign in
- [ ] Wait for session to expire (or manually invalidate token)
- [ ] Try to perform an action (e.g., complete a lesson)
- [ ] Verify: Session is automatically refreshed
- [ ] Verify: Action completes successfully

---

## Complete Daily Loop Summary

**End-to-End Flow:**
1. ✅ Sign up → Onboarding → Select pillars and daily goal
2. ✅ Home screen → View streak, hearts, XP, daily lesson card
3. ✅ Pillars Map → Select unlocked lesson
4. ✅ Lesson Player → Swipe through 5 cards → Complete lesson
5. ✅ XP awarded → Streak incremented → Next lesson unlocked
6. ✅ Evening notification → Check-In screen → Submit challenge completion
7. ✅ Rex feedback → Bonus XP awarded
8. ✅ League leaderboard updates with weekly XP
9. ✅ Profile spider chart updates with new level
10. ✅ Notifications scheduled for next day

---

## Known Issues and Edge Cases

Document any issues found during testing:

- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]
- [ ] Issue 3: [Description]

---

## Test Results

**Date:** _______________
**Tester:** _______________
**Overall Status:** ⬜ Pass | ⬜ Fail | ⬜ Partial

**Notes:**
