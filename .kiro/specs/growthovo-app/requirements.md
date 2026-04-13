# Requirements Document

## Introduction

Growthovo is a mobile-first self-improvement app targeting teenagers and people in their late 20s. It delivers real-world life skills (confidence, discipline, public speaking, money, marketing, anxiety, relationships) through short swipeable lessons and daily real-world challenges. The app uses Duolingo-style gamification mechanics (streaks, hearts, XP, leagues) to drive daily engagement and habit formation. The tech stack is React Native (Expo), Supabase (auth, database, realtime, edge functions, storage), OpenAI API (AI coach), Stripe (subscriptions), and Expo Notifications.

## Glossary

- **App**: The Growthovo React Native (Expo) mobile application
- **User**: A registered person using the App
- **Pillar**: One of six skill categories (Mind, Discipline, Communication, Money, Career, Relationships)
- **Unit**: A group of 8 lessons within a Pillar (5 units per Pillar)
- **Lesson**: A 5-card swipeable learning module within a Unit
- **Card**: A single swipeable screen within a Lesson
- **Challenge**: A real-world daily task assigned at the end of a Lesson
- **Streak**: A consecutive-day counter tracking daily lesson or check-in completion
- **Heart**: A limited daily resource consumed when a User skips content or answers incorrectly
- **XP**: Experience points earned through lessons, challenges, and check-ins
- **League**: A weekly competitive group of up to 20 Users ranked by XP
- **Squad**: A group of exactly 5 Users sharing a Pillar and a leaderboard
- **Rex**: The AI coach mascot powered by OpenAI
- **Streak Freeze**: A consumable item that protects a Streak from breaking on a missed day
- **Spider Chart**: A hexagonal radar chart visualising User strength across all 6 Pillars
- **Supabase**: The backend platform providing auth, Postgres database, realtime, edge functions, and storage
- **Stripe**: The payment processor handling subscriptions and trials
- **RevenueCat**: Subscription management layer (referenced in concept; Stripe is the implementation)
- **RLS**: Row Level Security enforced on all Supabase Postgres tables
- **Premium**: A paid subscription tier unlocking all Pillars, unlimited Hearts, Streak Freezes, and no ads
- **Free Tier**: The default unpaid tier with access to 1 Pillar, 5 Hearts/day, and ads
- **Check-in**: An evening prompt asking the User whether they completed their daily Challenge
- **XP_Transaction**: A record of a single XP earning event
- **Onboarding**: The first-run flow where a User selects weak spots and sets a daily goal

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As a new user, I want to create an account and sign in, so that my progress is saved and synced across devices.

#### Acceptance Criteria

1. THE App SHALL support email and password registration via Supabase Auth.
2. THE App SHALL support Google OAuth sign-in via Supabase Auth.
3. WHEN a User registers with email, THE App SHALL send a confirmation email before granting full access.
4. WHEN a User signs in successfully, THE App SHALL navigate to the Home screen.
5. IF authentication fails, THEN THE App SHALL display a descriptive error message without exposing internal details.
6. WHEN a User signs out, THE App SHALL clear local session data and navigate to the sign-in screen.
7. THE App SHALL enforce RLS on all Supabase tables so that Users can only read and write their own data.

---

### Requirement 2: Onboarding Flow

**User Story:** As a new user, I want to complete a personalised onboarding flow, so that the app focuses on the skills I care about most.

#### Acceptance Criteria

1. WHEN a User opens the App for the first time after registration, THE App SHALL present the Onboarding flow.
2. THE Onboarding flow SHALL allow the User to select one or more Pillars as their weak spots.
3. THE Onboarding flow SHALL allow the User to set a daily goal of 5, 10, or 15 minutes.
4. WHEN the User completes Onboarding, THE App SHALL persist the selected Pillars and daily goal to the User's profile in Supabase.
5. WHEN the User completes Onboarding, THE App SHALL navigate to the Home screen.
6. THE App SHALL display the Onboarding flow exactly once per account.

---

### Requirement 3: The Six Pillars

**User Story:** As a user, I want to browse and access skill Pillars, so that I can choose which life area to develop.

#### Acceptance Criteria

1. THE App SHALL provide exactly six Pillars: Mind, Discipline, Communication, Money, Career, and Relationships.
2. WHILE a User is on the Free Tier, THE App SHALL restrict access to exactly one Pillar and display a paywall for the remaining five.
3. WHILE a User is on the Premium tier, THE App SHALL grant access to all six Pillars.
4. THE App SHALL display each Pillar with its designated colour: Mind=purple, Discipline=red, Communication=blue, Money=green, Career=orange, Relationships=pink.
5. THE App SHALL display each Pillar's current level (1–10) and XP progress on the Pillars map screen.

---

### Requirement 4: Lesson Structure and Content

**User Story:** As a user, I want to complete short swipeable lessons, so that I can learn real-world skills in under 15 minutes a day.

#### Acceptance Criteria

1. THE App SHALL structure each Lesson as exactly 5 swipeable Cards.
2. THE Lesson_Player SHALL display Card 1 as the core concept in plain language with a maximum of 60 words.
3. THE Lesson_Player SHALL display Card 2 as a real example from someone aged 17–25.
4. THE Lesson_Player SHALL display Card 3 as a common mistake to avoid.
5. THE Lesson_Player SHALL display Card 4 as a one-sentence science fact.
6. THE Lesson_Player SHALL display Card 5 as today's IRL Challenge, specific and completable that day.
7. THE App SHALL provide 5 Units per Pillar, 8 Lessons per Unit, totalling 40 Lessons per Pillar and 240 Lessons at launch.
8. WHEN a User completes a Lesson, THE App SHALL award XP and update the User's progress record in Supabase.
9. WHEN a User completes a Lesson, THE App SHALL unlock the next Lesson in sequence if it was previously locked.
10. THE Lesson_Player SHALL display a progress bar indicating the current Card position within the Lesson.

---

### Requirement 5: Gamification — Streaks

**User Story:** As a user, I want a daily streak counter, so that I am motivated to open the app every day.

#### Acceptance Criteria

1. THE App SHALL maintain a Streak counter that increments by 1 each calendar day the User completes at least one Lesson or Check-in.
2. WHEN a User misses a calendar day without a Streak Freeze active, THE App SHALL reset the Streak counter to 0.
3. WHEN a User misses a calendar day and has at least one Streak Freeze, THE App SHALL consume one Streak Freeze and preserve the Streak counter.
4. THE App SHALL visually represent the mascot Rex in a weakened state when the Streak is at risk (not yet completed for the current day).
5. THE App SHALL display the current Streak count prominently on the Home screen.
6. WHEN a User reaches a Streak milestone (7, 30, 100 days), THE App SHALL display a celebratory animation and award bonus XP.

---

### Requirement 6: Gamification — Hearts

**User Story:** As a user, I want a heart system, so that I am encouraged to engage thoughtfully with lessons and reflections.

#### Acceptance Criteria

1. THE App SHALL grant each User 5 Hearts at the start of each calendar day.
2. WHEN a User skips a Card or answers a reflection incorrectly, THE App SHALL deduct 1 Heart.
3. WHILE a User has 0 Hearts, THE App SHALL prevent the User from starting new Lessons until Hearts refill.
4. THE App SHALL refill Hearts to 5 at midnight local time each day.
5. WHILE a User is on the Premium tier, THE App SHALL grant unlimited Hearts and not enforce the Heart limit.
6. THE App SHALL display the current Heart count on the Home screen and Lesson Player.

---

### Requirement 7: Gamification — XP System

**User Story:** As a user, I want to earn XP for my activity, so that I can track my overall progress and compete in leagues.

#### Acceptance Criteria

1. WHEN a User completes a Lesson, THE App SHALL award a fixed amount of XP and record an XP_Transaction in Supabase.
2. WHEN a User completes a Challenge Check-in with a positive response, THE App SHALL award bonus XP and record an XP_Transaction.
3. WHEN a User completes a daily Check-in, THE App SHALL award XP regardless of Challenge outcome and record an XP_Transaction.
4. THE App SHALL display the User's total XP and an XP progress bar on the Home screen.
5. THE App SHALL aggregate XP_Transactions weekly to determine League rankings.
6. WHEN a User levels up within a Pillar, THE App SHALL display a level-up animation and award bonus XP.

---

### Requirement 8: Gamification — Weekly Leagues

**User Story:** As a user, I want to compete in weekly leagues, so that I am motivated by friendly competition.

#### Acceptance Criteria

1. THE App SHALL assign each User to a League of up to 20 randomly selected Users at the start of each week.
2. THE App SHALL rank League members by XP earned during the current week.
3. WHEN the week ends, THE App SHALL promote the top 5 Users in each League to the next tier and relegate the bottom 5 to the lower tier.
4. THE App SHALL display the League leaderboard in real time using Supabase Realtime.
5. THE App SHALL display the User's current League position, weekly XP, and promotion/relegation zone on the League screen.
6. WHEN a new League week begins, THE App SHALL reset weekly XP counters and reassign League memberships.

---

### Requirement 9: Gamification — Streak Freezes

**User Story:** As a user, I want to earn and use streak freezes, so that I can protect my streak during busy days.

#### Acceptance Criteria

1. THE App SHALL allow Users to earn Streak Freezes by completing bonus Challenges.
2. THE App SHALL display the User's current Streak Freeze inventory on the Settings screen.
3. WHEN a User misses a day and has at least one Streak Freeze, THE App SHALL automatically consume one Streak Freeze to protect the Streak.
4. THE App SHALL cap the Streak Freeze inventory at a maximum of 5 per User.

---

### Requirement 10: Evening Check-in

**User Story:** As a user, I want an evening check-in prompt, so that I can log whether I completed my daily challenge and earn XP.

#### Acceptance Criteria

1. THE App SHALL send an evening push notification prompting the User to complete their Check-in.
2. WHEN a User opens the Check-in screen, THE App SHALL display the day's Challenge and ask whether the User completed it.
3. WHEN a User confirms Challenge completion, THE App SHALL award bonus XP and record a ChallengeCompletion in Supabase.
4. WHEN a User reports Challenge non-completion, THE App SHALL display a gentle roast message from Rex and award reduced XP for honesty.
5. THE App SHALL display a preview of tomorrow's lesson after the Check-in is submitted.
6. THE App SHALL allow exactly one Check-in submission per User per calendar day.

---

### Requirement 11: Friend Streaks and Social

**User Story:** As a user, I want to see my friends' streaks, so that I feel silent competitive motivation.

#### Acceptance Criteria

1. THE App SHALL allow Users to invite friends via a shareable invite link.
2. WHEN a User accepts a friend invite, THE App SHALL create a bidirectional friendship record in Supabase.
3. THE App SHALL display friends' current Streak counts on the Profile or social feed area.
4. THE App SHALL update friend Streak data in real time using Supabase Realtime.

---

### Requirement 12: Squad Mode

**User Story:** As a user, I want to join a Squad of 5 users in the same Pillar, so that I can share challenges and compete on a shared leaderboard.

#### Acceptance Criteria

1. THE App SHALL allow a User to create or join a Squad of exactly 5 members focused on the same Pillar.
2. THE App SHALL display a shared leaderboard for Squad members ranked by weekly XP on the Squad screen.
3. THE App SHALL update Squad leaderboard data in real time using Supabase Realtime.
4. WHEN a Squad member completes a Challenge, THE App SHALL reflect the completion on the Squad screen.
5. THE App SHALL display each Squad member's current Streak and weekly XP on the Squad screen.

---

### Requirement 13: AI Coach — Rex

**User Story:** As a user, I want an AI coach called Rex, so that I receive personalised, motivating feedback that feels human.

#### Acceptance Criteria

1. THE App SHALL integrate with the OpenAI API to generate Rex's responses.
2. WHEN a User submits a Challenge Check-in, THE App SHALL send the User's history and Check-in result to the OpenAI API and display Rex's personalised response.
3. THE App SHALL maintain a conversation history per User so Rex can reference past interactions (e.g., "Last week you said you'd work on eye contact").
4. WHEN a User completes a Lesson, THE App SHALL display a Rex reaction message (hype or roast) generated by OpenAI.
5. WHEN a User's Streak is at risk, THE App SHALL display a Rex guilt-trip message.
6. Rex's tone SHALL be brutally honest, funny, and non-corporate — like a cool older sibling.
7. THE App SHALL store Rex conversation history in Supabase and include relevant context in each OpenAI API call.

---

### Requirement 14: User Profile and Progression

**User Story:** As a user, I want a profile page showing my progress across all pillars, so that I can see how I'm growing and share my achievements.

#### Acceptance Criteria

1. THE App SHALL display a Spider Chart on the Profile screen showing the User's strength across all 6 Pillars.
2. THE Spider Chart SHALL update in real time as the User completes Lessons and earns XP.
3. THE App SHALL display the User's level (1–10) per Pillar on the Profile screen.
4. WHEN a User reaches Level 10 in any Pillar, THE App SHALL award a shareable certificate and badge.
5. THE App SHALL provide a shareable Profile Card showing the User's levels, current Streak, and top skill.
6. THE App SHALL display the User's Streak history on the Profile screen.
7. THE App SHALL allow the User to upload a profile picture stored in Supabase Storage.

---

### Requirement 15: Pillars Map (Duolingo-style Path)

**User Story:** As a user, I want a visual map of units and lessons per pillar, so that I can see my progress and what's coming next.

#### Acceptance Criteria

1. THE App SHALL display a scrollable Duolingo-style path for each Pillar showing all Units and Lessons.
2. THE App SHALL visually distinguish completed, current, and locked Lessons on the path.
3. WHEN a User taps a completed or current Lesson, THE App SHALL navigate to the Lesson Player.
4. WHEN a User taps a locked Lesson, THE App SHALL display a message indicating the prerequisite Lesson must be completed first.
5. THE App SHALL display Unit headers and progress indicators between Units on the path.

---

### Requirement 16: Notifications

**User Story:** As a user, I want timely push notifications, so that I am reminded to maintain my streak and complete challenges.

#### Acceptance Criteria

1. THE App SHALL send a morning notification at 8am local time with a streak-motivating message.
2. THE App SHALL send an afternoon notification at 2pm local time reminding the User to complete their Challenge.
3. THE App SHALL send an evening notification at 9pm local time warning the User their Streak is at risk.
4. THE App SHALL support custom danger-window alerts based on User-configured vulnerable times.
5. WHEN a User disables notifications in Settings, THE App SHALL stop sending push notifications to that User.
6. THE App SHALL use Expo Notifications to deliver all push notifications.
7. IF a push notification delivery fails, THEN THE App SHALL log the failure without crashing.

---

### Requirement 17: Subscription and Monetisation

**User Story:** As a user, I want to subscribe to Premium, so that I can unlock all pillars and remove limitations.

#### Acceptance Criteria

1. THE App SHALL offer a Free Tier with access to 1 Pillar, 5 Hearts/day, basic Streak, and ads.
2. THE App SHALL offer a Premium monthly plan at €8/month and a Premium annual plan at €59/year.
3. THE App SHALL offer a 3-day free trial on both Premium plans with no credit card required at signup.
4. WHEN the 3-day trial ends, THE App SHALL charge the User's card via Stripe.
5. THE App SHALL implement subscriptions using Stripe Checkout for web payments.
6. THE App SHALL provide a Stripe Customer Portal for cancellations and plan changes.
7. THE App SHALL handle Stripe Webhooks via a Supabase Edge Function to sync subscription status to Supabase in real time.
8. THE App SHALL store subscription status, plan type, trial end date, and stripe_customer_id in the Supabase users table.
9. WHEN a User's subscription lapses, THE App SHALL downgrade the User to the Free Tier immediately.
10. WHEN a User on the Free Tier attempts to access a locked Pillar or runs out of Hearts, THE App SHALL display a paywall screen.
11. THE App SHALL create Stripe subscriptions with trial_period_days set to 3.

---

### Requirement 18: Settings Screen

**User Story:** As a user, I want a settings screen, so that I can manage my subscription, notifications, and streak freeze inventory.

#### Acceptance Criteria

1. THE App SHALL display a Settings screen accessible from the Profile or navigation menu.
2. THE Settings screen SHALL allow the User to manage notification preferences (enable/disable, custom times).
3. THE Settings screen SHALL display the User's current Streak Freeze inventory.
4. THE Settings screen SHALL provide a link to the Stripe Customer Portal for subscription management.
5. THE Settings screen SHALL allow the User to sign out.

---

### Requirement 19: Design System and Animations

**User Story:** As a user, I want a visually engaging dark-mode app, so that using it feels like playing a game rather than a wellness app.

#### Acceptance Criteria

1. THE App SHALL use dark mode as the default and only theme.
2. THE App SHALL use bold typography and high contrast colours.
3. THE App SHALL apply the designated Pillar colour to all UI elements within that Pillar's context.
4. THE App SHALL display animations on XP gain, level-up events, and Streak milestones.
5. THE App SHALL display the Rex mascot at key moments: Lesson complete, Streak milestone, and Check-in response.
6. THE App SHALL avoid pastel colours and meditation-app aesthetics.

---

### Requirement 20: Data Persistence and Security

**User Story:** As a developer, I want all data stored securely in Supabase with RLS, so that user data is protected and the app is production-ready.

#### Acceptance Criteria

1. THE App SHALL use Supabase Postgres as the sole database for all persistent data.
2. THE App SHALL enable RLS on all Supabase tables: Users, Pillars, Units, Lessons, UserProgress, Streaks, Hearts, XP_Transactions, Leagues, LeagueMembers, Squads, SquadMembers, Challenges, ChallengeCompletions, Notifications, Subscriptions.
3. THE App SHALL use Supabase Storage for user profile pictures and challenge proof photos.
4. THE App SHALL use Supabase Edge Functions for Stripe webhook handling.
5. WHEN a User's session token expires, THE App SHALL automatically refresh it using Supabase Auth session management.
6. THE App SHALL never expose API keys or secrets in client-side code.
