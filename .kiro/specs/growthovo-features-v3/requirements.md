# Requirements Document

## Introduction

This document defines requirements for five new features in the GROWTHOVO React Native / Expo self-improvement app:

1. **Onboarding Personality Quiz** — A swipeable, full-screen quiz that determines a user's primary and secondary growth pillars before the main app loads.
2. **Home Screen Widget** — iOS and Android home screen widgets (small, medium, large) showing streak, XP, and daily challenge data.
3. **Progress Time Capsule** — A day-1 video + written promise vault that locks until day 90, then reveals with a comparison screen.
4. **GROWTHOVO Wrapped** — Monthly and yearly Spotify-Wrapped-style cinematic recap screens with shareable cards.
5. **Relapse Protection System** — A streak-break detection flow with a comeback challenge, streak insurance via XP-purchased freezes, and Rex-coded copy.

All features use TypeScript, dark-mode-first design, GROWTHOVO brand colors, react-native-reanimated animations, and Supabase with RLS on every new table.

---

## Glossary

- **Quiz**: The onboarding personality quiz consisting of 5 questions.
- **Pillar**: One of five growth areas — Mind, Discipline, Communication, Money, Relationships.
- **Primary_Pillar**: The pillar with the highest answer count from the Quiz.
- **Secondary_Pillar**: The pillar with the second-highest answer count from the Quiz.
- **Widget**: A native home screen extension (iOS WidgetKit / Android Glance) that displays GROWTHOVO data.
- **Widget_Store**: AsyncStorage keys used to pass data from the app to the Widget.
- **Time_Capsule**: A sealed record containing a video message and three written promises created on day 1.
- **Capsule_Lock**: The RLS policy and in-app gate that prevents viewing the Time_Capsule before day 90.
- **Wrapped**: A swipeable cinematic recap of a user's activity over a month or year.
- **Wrapped_Summary**: A Supabase row storing the computed Wrapped data and Rex verdict for a given period.
- **Relapse_Flow**: The sequence of screens shown when a user opens the app after missing a full day.
- **Comeback_Challenge**: A harder-than-normal challenge offered during the Relapse_Flow that restores 50% of the lost streak if completed within 24 hours.
- **Streak_Freeze**: A consumable item purchased with XP that auto-activates to preserve a streak when a day is missed.
- **Rex**: The AI coach persona used throughout the app for motivational copy.
- **Onboarding_Quiz_Service**: The service responsible for scoring the Quiz and persisting pillar results.
- **Widget_Service**: The service responsible for writing Widget_Store data to AsyncStorage.
- **Capsule_Service**: The service responsible for creating, locking, and unlocking Time_Capsules.
- **Wrapped_Service**: The service responsible for computing and caching Wrapped_Summary records.
- **Relapse_Service**: The service responsible for detecting streak breaks and managing Comeback_Challenges.
- **Freeze_Service**: The service responsible for purchasing and consuming Streak_Freezes.

---

## Requirements

### Requirement 1: Onboarding Personality Quiz

**User Story:** As a new user, I want to complete a personality quiz during onboarding, so that the app can recommend the most relevant growth pillar for me to start with.

#### Acceptance Criteria

1. WHEN a new user launches the app for the first time, THE Onboarding_Quiz_Service SHALL present the Quiz before the main app loads.
2. THE Quiz SHALL consist of exactly 10 screens in order: Welcome, Question 1, Question 2, Question 3, Question 4, Question 5, Pillar Result, Daily Goal, Notification Permission, Paywall.
3. WHEN a user views a question screen, THE Quiz SHALL display a full-screen layout with a progress bar, a large emoji, bold question text, and exactly 4 tappable answer cards.
4. WHEN a user taps an answer card, THE Quiz SHALL highlight the selected card in the accent color of the mapped Pillar and advance to the next screen after a 300ms delay.
5. THE Quiz SHALL NOT display a back button on any question screen.
6. WHEN all 5 questions are answered, THE Onboarding_Quiz_Service SHALL count the Pillar mapped to each answer, assign the most-frequent Pillar as Primary_Pillar, and assign the second-most-frequent Pillar as Secondary_Pillar.
7. IF two or more Pillars are tied for the highest count, THEN THE Onboarding_Quiz_Service SHALL resolve the tie by selecting the Pillar that appears earliest in the answer sequence.
8. WHEN the Pillar Result screen is shown, THE Quiz SHALL display the Primary_Pillar name, its accent color, and a recommendation to start with that Pillar.
9. WHEN the Daily Goal screen is shown, THE Quiz SHALL allow the user to select 5, 10, or 15 minutes per day.
10. WHEN the user completes the Daily Goal screen, THE Onboarding_Quiz_Service SHALL persist primary_pillar, secondary_pillar, and daily_goal_minutes to the Supabase users table and mark onboarding_complete as true.
11. IF the Supabase write fails, THEN THE Onboarding_Quiz_Service SHALL display an error message and allow the user to retry without losing their answers.
12. WHEN the Notification Permission screen is shown, THE Quiz SHALL request system notification permission using the existing notificationService.
13. WHEN the Paywall screen is shown, THE Quiz SHALL display the existing PaywallScreen component offering a 3-day free trial.
14. WHILE the Quiz is in progress, THE Quiz SHALL animate transitions between screens using a horizontal slide powered by react-native-reanimated.

---

### Requirement 2: Home Screen Widget

**User Story:** As a returning user, I want a home screen widget, so that I can see my streak and daily challenge without opening the app.

#### Acceptance Criteria

1. THE Widget_Service SHALL write the following fields to AsyncStorage on every app open: streak, xp, hearts, challenge_title, league_position, primary_pillar, rex_daily_line.
2. WHEN the Widget is rendered, THE Widget SHALL read data exclusively from AsyncStorage without making network calls.
3. THE Widget SHALL support three sizes: small (2×2), medium (4×2), and large (4×4).
4. WHEN rendered at small size, THE Widget SHALL display the GROWTHOVO logo, the current streak number with a flame emoji, and the primary pillar accent color as a background accent.
5. WHEN rendered at medium size, THE Widget SHALL display the streak number, today's challenge title truncated to one line, the XP bar progress, and the primary pillar icon.
6. WHEN rendered at large size, THE Widget SHALL display streak, XP, hearts remaining, today's challenge title, league position, and a Rex daily line.
7. THE Widget SHALL refresh its display at most every 30 minutes.
8. THE rex_daily_line field SHALL rotate daily through a fixed set of 7 pre-written Rex lines, selected by day-of-year modulo 7.
9. WHERE the iOS platform is active, THE Widget SHALL be implemented as a WidgetKit extension.
10. WHERE the Android platform is active, THE Widget SHALL be implemented as a Glance widget.
11. IF AsyncStorage data is absent or stale (older than 24 hours), THEN THE Widget SHALL display a fallback state showing only the GROWTHOVO logo and "Open app to sync".

---

### Requirement 3: Progress Time Capsule

**User Story:** As a new user, I want to record a video message and written promises on day 1, so that I can compare my starting point to my progress on day 90.

#### Acceptance Criteria

1. WHEN a user completes the onboarding Quiz, THE Capsule_Service SHALL immediately present the Time Capsule creation flow.
2. THE Time Capsule creation flow SHALL consist of three steps: video recording, written promises, and automatic stats snapshot.
3. WHEN the video recording step is shown, THE Capsule_Service SHALL open the front camera automatically and display a prompt asking the user to describe their current situation and what they promise to change.
4. THE video recording step SHALL enforce a maximum recording duration of 60 seconds.
5. WHEN the user confirms their video, THE Capsule_Service SHALL upload the video to Supabase Storage at path time_capsules/{userId}/video.mp4.
6. THE written promises step SHALL require the user to complete exactly three prompts: "In 90 days I will have...", "The habit I'm committing to is...", and "The version of me I'm leaving behind is...".
7. WHEN all three prompts are completed, THE Capsule_Service SHALL store promise_1, promise_2, promise_3, user_id, and created_at in the time_capsules Supabase table.
8. THE Capsule_Service SHALL automatically capture a stats snapshot including: date, primary_pillar, quiz_scores, and starting XP of 0.
9. WHEN the Time Capsule is created, THE Capsule_Service SHALL seal it immediately so the user cannot view its contents.
10. WHILE the Time Capsule is sealed, THE Supabase RLS policy on time_capsules SHALL block SELECT for the owning user until created_at + 90 days <= now().
11. WHILE the Time Capsule is sealed, THE Capsule_Service SHALL display a countdown showing the number of days remaining until unlock on the profile screen.
12. WHEN day 90 is reached, THE Capsule_Service SHALL send a push notification at 8:00 AM local time with the message "90 days ago you made a promise. Today you find out if you kept it."
13. WHEN the user opens the app on day 90 or later, THE Capsule_Service SHALL display a full-screen unlock animation followed by automatic video playback.
14. WHEN the unlock screen is shown, THE Capsule_Service SHALL display the three written promises revealed one by one and a side-by-side comparison of day-1 stats versus current stats.
15. WHEN the unlock screen is shown, THE Capsule_Service SHALL display a Rex reaction message based on the user's current streak: greater than 60 days, 30–60 days, or fewer than 30 days.
16. WHEN the unlock screen is shown, THE Capsule_Service SHALL display a share button that generates a shareable card containing pillar growth, streak, XP earned, challenges completed, and one written promise.
17. IF the video upload fails, THEN THE Capsule_Service SHALL allow the user to retry the upload without losing the written promises.

---

### Requirement 4: GROWTHOVO Wrapped

**User Story:** As an active user, I want a monthly and yearly recap of my growth, so that I can celebrate my progress and share it with others.

#### Acceptance Criteria

1. THE Wrapped_Service SHALL generate a Monthly Wrapped for any user who has at least 7 active days in the calendar month.
2. WHEN the last day of a calendar month is reached, THE Wrapped_Service SHALL send a push notification at 8:00 PM local time: "Your [Month] Wrapped is ready. Rex has thoughts."
3. THE Wrapped_Service SHALL generate a Yearly Wrapped for all users on December 31st regardless of activity level.
4. THE Wrapped_Service SHALL compute the following data points for each Wrapped period: total lessons completed, total challenges completed, longest streak, total XP earned, most active day of week, most active time of day, strongest pillar, weakest pillar, total minutes in app, league promotions count, friends invited, and global percentile rank.
5. THE Wrapped SHALL consist of exactly 7 swipeable screens in order: Growth Overview, Streak Calendar, Strongest Pillar, Weakest Pillar, Global Rank, Rex Verdict, Share Card.
6. WHEN the Rex Verdict screen is shown, THE Wrapped_Service SHALL call the GPT-4o API via the existing rex-response Supabase Edge Function to generate a 3-sentence summary in an honest, specific, forward-looking tone.
7. WHEN a Wrapped_Summary is generated, THE Wrapped_Service SHALL store it in the wrapped_summaries Supabase table with fields: user_id, period, data_json, rex_verdict, created_at.
8. IF a Wrapped_Summary already exists for a given user_id and period, THEN THE Wrapped_Service SHALL return the cached record without regenerating it.
9. WHEN the Share Card screen is shown, THE Wrapped_Service SHALL render a 1080×1920 image containing: GROWTHOVO logo, period label, total lessons, longest streak, strongest pillar, global rank, and a pre-written caption.
10. WHEN the user taps share, THE Wrapped_Service SHALL invoke the native share sheet and automatically save the image to the camera roll.
11. IF the GPT-4o API call fails, THEN THE Wrapped_Service SHALL display a fallback Rex verdict from a pre-written set of 5 generic verdicts.
12. WHILE a Wrapped is loading, THE Wrapped_Service SHALL display a loading animation and prevent interaction with the share button.

---

### Requirement 5: Relapse Protection System

**User Story:** As a user who has broken their streak, I want a structured comeback flow, so that I have a clear path to recover rather than quitting entirely.

#### Acceptance Criteria

1. WHEN a user opens the app after missing a full calendar day, THE Relapse_Service SHALL detect the streak break and present the Relapse_Flow exactly once per streak break event.
2. THE Relapse_Flow SHALL NOT fire if the user has a Streak_Freeze that auto-activated for the missed day.
3. WHEN the streak break screen is shown, THE Relapse_Service SHALL display the lost streak number struck through and a Rex line appropriate to the streak length: 1–7 days, 8–30 days, or 31+ days.
4. WHEN the Comeback Challenge screen is shown, THE Relapse_Service SHALL display the hardest available challenge from the user's Primary_Pillar, a 24-hour countdown timer, and an accept button.
5. WHEN the user accepts the Comeback Challenge, THE Relapse_Service SHALL start a 24-hour expiry timer and require photo or video proof of completion.
6. IF the user completes the Comeback Challenge within 24 hours with valid proof, THEN THE Relapse_Service SHALL restore the streak to 50% of the original value (rounded down) and display a success screen.
7. IF the Comeback Challenge expires without completion, THEN THE Relapse_Service SHALL reset the streak to 0 and resume normal app flow.
8. THE Relapse_Service SHALL allow a user to use the Comeback Challenge at most once every 30 days.
9. WHEN the user declines the Comeback Challenge, THE Relapse_Service SHALL reset the streak to 0, display a "Starting fresh. Day 1." screen with a Rex line, and begin a new streak.
10. WHEN the Comeback success screen is shown, THE Relapse_Service SHALL display the restored streak count, a Rex message, a confetti animation in the primary pillar color, and a share option.
11. THE Freeze_Service SHALL allow users to purchase Streak_Freezes at a cost of 500 XP each.
12. THE Freeze_Service SHALL enforce a maximum of 3 Streak_Freezes held at any time.
13. WHEN a user misses a day and holds at least one Streak_Freeze, THE Freeze_Service SHALL auto-activate one freeze, preserve the streak, and send a push notification: "Rex used a streak freeze. You owe him one. Don't miss tomorrow."
14. THE Freeze_Service SHALL display the current freeze inventory count on the home screen and in settings.
15. IF a user attempts to purchase a Streak_Freeze with insufficient XP, THEN THE Freeze_Service SHALL display an error message and not deduct any XP.
16. IF a user attempts to purchase a Streak_Freeze when already holding 3, THEN THE Freeze_Service SHALL display an error message and not deduct any XP.
