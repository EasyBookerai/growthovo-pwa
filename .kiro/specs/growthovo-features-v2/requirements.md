# Requirements Document

## Introduction

This document defines the requirements for five major features of the GROWTHOVO self-improvement gamification app. The features are: (1) Onboarding Personality Quiz, (2) Home Screen Widget, (3) Progress Time Capsule, (4) GROWTHOVO Wrapped, and (5) Relapse Protection System. Together these features drive user acquisition, retention, and viral growth for the app's React Native / Expo / Supabase stack.

## Glossary

- **GROWTHOVO**: The self-improvement gamification app being built.
- **Pillar**: One of five growth domains — Mind, Discipline, Communication, Money, Relationships.
- **Primary_Pillar**: The pillar with the highest score from the onboarding quiz; featured on the home screen.
- **Secondary_Pillar**: The pillar with the second-highest score from the onboarding quiz; recommended next.
- **Quiz**: The five-question onboarding personality quiz.
- **Quiz_Scorer**: The component that tallies pillar scores from quiz answers and determines Primary_Pillar and Secondary_Pillar.
- **Onboarding_Flow**: The full sequence of screens shown to new users before the main app loads.
- **Widget**: A native home screen widget (iOS WidgetKit / Android Glance) that displays GROWTHOVO data.
- **Widget_Data_Store**: The AsyncStorage layer that the app writes to and the Widget reads from.
- **Time_Capsule**: A sealed record of the user's Day 1 state (video + written promises + stats snapshot) that unlocks on Day 90.
- **Capsule_Lock**: The Supabase RLS policy and in-app gate that prevents viewing the Time_Capsule before Day 90.
- **Wrapped**: A cinematic, swipeable summary of the user's growth over a month or year, inspired by Spotify Wrapped.
- **Wrapped_Generator**: The service that aggregates user data and produces a Wrapped summary for a given period.
- **Relapse_Protection**: The system that detects a broken streak and offers a Comeback Challenge to partially restore it.
- **Comeback_Challenge**: A harder-than-normal challenge from the user's Primary_Pillar offered within 24 hours of a streak break.
- **Streak_Freeze**: A consumable item (cost: 500 XP) that auto-activates to prevent a streak break when a day is missed.
- **Rex**: The GROWTHOVO AI coach whose voice and copy appear throughout the app.
- **Rex_Verdict**: A short AI-generated (GPT-4o) summary of the user's Wrapped period, written in Rex's voice.
- **Share_Card**: A generated image (1080×1920 for Wrapped; dark card for Time Capsule) used for social sharing.
- **Proof_Upload**: A photo or video submitted by the user as evidence of completing a Comeback_Challenge.
- **Daily_Goal**: The user's chosen daily engagement target: 5, 10, or 15 minutes.
- **Heatmap**: A calendar-style grid showing active vs inactive days, used in Wrapped Screen 2.
- **Spider_Chart**: A radar/spider chart comparing Day 1 vs Day 90 pillar scores, used in the Time Capsule share card.

---

## Requirements

### Requirement 1: Onboarding Personality Quiz — Quiz Flow

**User Story:** As a new user, I want to complete a personality quiz during onboarding, so that GROWTHOVO can recommend the right growth pillar for me and personalise my experience from day one.

#### Acceptance Criteria

1. WHEN a new user opens GROWTHOVO for the first time, THE Onboarding_Flow SHALL display the Welcome screen before any other app content.
2. THE Onboarding_Flow SHALL present exactly 5 quiz questions, one per full screen, in a fixed order.
3. WHEN a user views a quiz question screen, THE Onboarding_Flow SHALL display a progress indicator showing the current question number out of 5.
4. WHEN a user taps an answer card, THE Onboarding_Flow SHALL highlight the selected card in the accent colour of the pillar that answer maps to.
5. WHEN a user selects an answer, THE Onboarding_Flow SHALL advance to the next screen using a smooth slide transition.
6. THE Onboarding_Flow SHALL NOT provide a back button on any quiz question screen.
7. WHEN all 5 questions are answered, THE Quiz_Scorer SHALL tally the pillar count for each answer and identify the pillar with the highest count as the Primary_Pillar.
8. WHEN two or more pillars tie for the highest count, THE Quiz_Scorer SHALL select the Primary_Pillar using the answer from the final question as a tiebreaker.
9. WHEN the quiz is scored, THE Quiz_Scorer SHALL identify the pillar with the second-highest count as the Secondary_Pillar.
10. WHEN the quiz is scored, THE Onboarding_Flow SHALL display a results screen showing the user's Primary_Pillar and Secondary_Pillar.
11. WHEN the results screen is shown, THE Onboarding_Flow SHALL proceed to the Daily Goal selection screen.
12. WHEN the Daily Goal screen is shown, THE Onboarding_Flow SHALL present three selectable options: 5 minutes, 10 minutes, and 15 minutes per day.
13. WHEN a daily goal is selected, THE Onboarding_Flow SHALL proceed to the notification permission request screen.
14. WHEN the notification permission screen is shown, THE Onboarding_Flow SHALL request system notification permission from the user.
15. WHEN the notification permission step is complete, THE Onboarding_Flow SHALL proceed to the Paywall screen offering a 3-day free trial.
16. WHEN onboarding is complete, THE Onboarding_Flow SHALL save primary_pillar, secondary_pillar, and daily_goal_minutes to the users table in Supabase.
17. WHEN onboarding is complete, THE Onboarding_Flow SHALL set onboarding_complete to true in the users table.
18. IF saving onboarding data to Supabase fails, THEN THE Onboarding_Flow SHALL retry once and display an error message if the retry also fails.

---

### Requirement 2: Onboarding Personality Quiz — Design and UX

**User Story:** As a new user, I want the onboarding quiz to feel immersive and momentum-driven, so that I stay engaged and complete the full flow.

#### Acceptance Criteria

1. THE Onboarding_Flow SHALL render each question on a full-screen view with no vertical scrolling required.
2. WHEN a question screen is rendered, THE Onboarding_Flow SHALL display a large emoji and bold question text at the top of the screen.
3. WHEN a question screen is rendered, THE Onboarding_Flow SHALL display exactly 4 tappable answer cards below the question text.
4. WHEN an answer card is selected, THE Onboarding_Flow SHALL apply a visual highlight to that card within 100ms of the tap.
5. THE Onboarding_Flow SHALL use react-native-reanimated for all screen transition animations.
6. THE Onboarding_Flow SHALL use a dark-mode-first design consistent with the GROWTHOVO theme (primary background #0A0A0A).
7. WHERE the device is an iPhone 14 or Samsung S23 form factor, THE Onboarding_Flow SHALL render all content without clipping or overflow.

---

### Requirement 3: Home Screen Widget — Data and Refresh

**User Story:** As an active user, I want a home screen widget that shows my streak and daily challenge, so that I stay motivated without opening the app.

#### Acceptance Criteria

1. WHEN the GROWTHOVO app is opened, THE Widget_Data_Store SHALL be updated with the latest streak, XP, hearts, challenge_title, league_position, primary_pillar, and rex_daily_line values.
2. THE Widget SHALL read all display data exclusively from Widget_Data_Store (AsyncStorage) and SHALL NOT make direct API or Supabase calls.
3. THE Widget SHALL refresh its display at most every 30 minutes.
4. THE Widget SHALL display a Rex daily line selected by rotating through the 7 pre-written lines based on the current day of the year modulo 7.
5. WHERE the streak count is available, THE Widget SHALL display the streak number alongside a flame emoji.
6. THE Widget SHALL be available in three sizes: Small (2×2), Medium (4×2), and Large (4×4).
7. WHEN the Small widget is tapped, THE Widget SHALL open the GROWTHOVO app.
8. WHEN the Medium widget is tapped, THE Widget SHALL open the GROWTHOVO app.
9. WHEN the Large widget is tapped, THE Widget SHALL open the GROWTHOVO app.
10. THE Widget SHALL function on iOS using WidgetKit extension without requiring the app to be open.
11. THE Widget SHALL function on Android using a Glance widget without requiring the app to be open.
12. IF Widget_Data_Store contains no data, THEN THE Widget SHALL display a default placeholder state prompting the user to open the app.

---

### Requirement 4: Home Screen Widget — Size-Specific Content

**User Story:** As a user, I want each widget size to show the right amount of information for its dimensions, so that the widget is always readable and useful.

#### Acceptance Criteria

1. WHEN the Small widget is rendered, THE Widget SHALL display the GROWTHOVO logo, the streak number with a flame emoji, and a "Tap to continue" label.
2. WHEN the Small widget is rendered, THE Widget SHALL use the today's Primary_Pillar accent colour as a background accent.
3. WHEN the Medium widget is rendered, THE Widget SHALL display the streak number with flame, today's challenge title (truncated to one line), the XP bar progress, and the Primary_Pillar icon.
4. WHEN the Large widget is rendered, THE Widget SHALL display streak, XP, hearts remaining, today's challenge title, league position, and the Rex daily line.
5. THE Widget SHALL truncate any text that exceeds the available width for its size rather than wrapping to a second line where single-line display is specified.

---

### Requirement 5: Progress Time Capsule — Day 1 Capture

**User Story:** As a new user completing onboarding, I want to record a video message and written promises to my future self, so that I can reflect on my growth at Day 90.

#### Acceptance Criteria

1. WHEN onboarding is complete, THE Onboarding_Flow SHALL trigger the Time Capsule capture flow immediately after the paywall step.
2. WHEN the Time Capsule capture screen is shown, THE Onboarding_Flow SHALL open the front camera automatically for video recording.
3. THE Time_Capsule capture flow SHALL allow the user to record a video message of up to 60 seconds.
4. WHEN a video is recorded, THE Time_Capsule capture flow SHALL provide a preview and a re-record option before saving.
5. WHEN the video is confirmed, THE Time_Capsule capture flow SHALL upload the video to Supabase Storage at path time_capsules/{userId}/video.mp4.
6. THE Time_Capsule capture flow SHALL require the user to complete exactly 3 written promise fields before proceeding.
7. THE Time_Capsule capture flow SHALL auto-capture the current date, primary_pillar, quiz results, and starting XP (0) as the stats snapshot.
8. WHEN all capture steps are complete, THE Time_Capsule capture flow SHALL seal the capsule immediately so the user cannot view its contents.
9. WHEN the capsule is sealed, THE Time_Capsule capture flow SHALL store the record in Supabase with created_at set to the current timestamp.
10. IF video upload to Supabase Storage fails, THEN THE Time_Capsule capture flow SHALL retry once and display an error message if the retry also fails, while still allowing the written promises and stats to be saved.

---

### Requirement 6: Progress Time Capsule — Lock and Unlock

**User Story:** As a user, I want my time capsule to be locked until Day 90, so that the reveal feels meaningful and earned.

#### Acceptance Criteria

1. THE Capsule_Lock SHALL enforce a Supabase RLS SELECT policy that blocks access to the time capsule record until (created_at + 90 days) <= now().
2. WHILE the capsule is locked, THE Time_Capsule SHALL display a countdown timer showing the number of days remaining until unlock on the profile screen.
3. WHEN the user reaches Day 90, THE Time_Capsule SHALL send a push notification at 8am: "90 days ago you made a promise. Today you find out if you kept it."
4. WHEN the user opens the app on Day 90 or later, THE Time_Capsule SHALL display a full-screen unlock animation before revealing the capsule contents.
5. WHEN the capsule is unlocked, THE Time_Capsule SHALL play the recorded video automatically.
6. WHEN the capsule is unlocked, THE Time_Capsule SHALL reveal the three written promises one by one.
7. WHEN the capsule is unlocked, THE Time_Capsule SHALL display current stats alongside Day 1 stats in a side-by-side comparison.
8. WHEN the capsule is unlocked, THE Time_Capsule SHALL display a Rex reaction message based on the user's current streak: streak > 60 days shows the "You did it" message; streak 30–60 days shows the "Not perfect" message; streak < 30 days shows the "Watch the video" message.
9. WHEN the capsule is unlocked, THE Time_Capsule SHALL display a Share button that generates a Share_Card image.
10. WHEN the Share button is tapped, THE Time_Capsule SHALL invoke the native share sheet with the generated Share_Card image.

---

### Requirement 7: GROWTHOVO Wrapped — Data Aggregation

**User Story:** As an active user, I want a monthly and yearly summary of my growth, so that I can celebrate my progress and share it with others.

#### Acceptance Criteria

1. THE Wrapped_Generator SHALL aggregate the following data points for the specified period: total lessons completed, total challenges completed, longest streak, total XP earned, most active day of week, most active time of day, strongest pillar, weakest pillar, total minutes in app, league promotions count, friends invited, and global percentile rank.
2. WHEN a monthly Wrapped is triggered, THE Wrapped_Generator SHALL only generate a summary for users who had at least 7 active days in that month.
3. WHEN a yearly Wrapped is triggered, THE Wrapped_Generator SHALL generate a summary for all users regardless of activity level.
4. WHEN a Wrapped summary is generated, THE Wrapped_Generator SHALL store it in the wrapped_summaries table with the period, data_json, and rex_verdict fields populated.
5. WHEN a Wrapped summary already exists for a given user and period, THE Wrapped_Generator SHALL return the cached summary and SHALL NOT regenerate it.
6. THE Wrapped_Generator SHALL call the Rex AI service (GPT-4o) to generate a 3-sentence Rex_Verdict for each Wrapped summary.
7. WHEN the monthly Wrapped is ready, THE Wrapped_Generator SHALL send a push notification at 8pm on the last day of the month: "Your [Month] Wrapped is ready. Rex has thoughts."
8. WHEN the yearly Wrapped is ready, THE Wrapped_Generator SHALL send a push notification on December 31st.

---

### Requirement 8: GROWTHOVO Wrapped — Presentation and Sharing

**User Story:** As a user viewing my Wrapped, I want a cinematic, swipeable experience with a shareable card, so that I feel proud of my progress and want to share it.

#### Acceptance Criteria

1. THE Wrapped SHALL present exactly 7 swipeable full-screen slides in the order: growth overview, streak heatmap, strongest pillar, weakest pillar, global rank, Rex verdict, and share card.
2. WHEN Wrapped Screen 2 is displayed, THE Wrapped SHALL render a Heatmap calendar of active days with the longest streak highlighted.
3. WHEN Wrapped Screen 3 is displayed, THE Wrapped SHALL fill the screen with the strongest pillar's accent colour.
4. WHEN Wrapped Screen 5 is displayed, THE Wrapped SHALL show the user's global percentile rank with an animated counter.
5. WHEN Wrapped Screen 6 is displayed, THE Wrapped SHALL display the Rex_Verdict text generated by the Rex AI service.
6. WHEN Wrapped Screen 7 is displayed, THE Wrapped SHALL render a Share_Card in 1080×1920 format suitable for Instagram Stories.
7. WHEN the share action is triggered, THE Wrapped SHALL invoke the native share sheet with the Share_Card image and a pre-written caption including lesson count, streak count, and the @growthovo handle.
8. WHEN the share action is triggered, THE Wrapped SHALL also save the Share_Card image to the device camera roll.
9. THE Wrapped SHALL use react-native-reanimated for all slide transition and reveal animations.
10. IF the Rex_Verdict has not yet been generated when the user reaches Screen 6, THEN THE Wrapped SHALL display a loading state until the verdict is available.

---

### Requirement 9: Relapse Protection — Streak Break Detection

**User Story:** As a user who has missed a day, I want the app to detect my streak break and give me a chance to recover, so that I don't lose all my progress permanently.

#### Acceptance Criteria

1. WHEN a user opens the app after missing a full calendar day of activity, THE Relapse_Protection SHALL detect the streak break and trigger the relapse flow.
2. THE Relapse_Protection SHALL fire the relapse flow at most once per streak break event.
3. IF the user has an active Streak_Freeze when a day is missed, THEN THE Relapse_Protection SHALL auto-activate the freeze, decrement freeze_count by 1, and SHALL NOT trigger the relapse flow.
4. WHEN a Streak_Freeze is auto-activated, THE Relapse_Protection SHALL send a push notification: "Rex used a streak freeze. You owe him one. Don't miss tomorrow."
5. WHEN the relapse flow is triggered, THE Relapse_Protection SHALL display the broken streak number (struck through) and a Rex line appropriate to the streak length: 1–7 days uses the short message; 8–30 days uses the medium message; 31+ days uses the long message.

---

### Requirement 10: Relapse Protection — Comeback Challenge

**User Story:** As a user whose streak has broken, I want the option to complete a Comeback Challenge to restore half my streak, so that my past effort isn't entirely wasted.

#### Acceptance Criteria

1. WHEN the relapse flow reaches Screen 2, THE Relapse_Protection SHALL display the Comeback_Challenge from the user's Primary_Pillar with a 24-hour countdown timer.
2. THE Comeback_Challenge SHALL be harder than a normal daily challenge.
3. WHEN the user accepts the Comeback_Challenge, THE Relapse_Protection SHALL require the user to submit a Proof_Upload (photo or video) to mark the challenge as complete.
4. WHEN the Comeback_Challenge is completed with valid Proof_Upload within 24 hours, THE Relapse_Protection SHALL restore the streak to 50% of the original streak value (rounded down).
5. WHEN the streak is restored, THE Relapse_Protection SHALL display a success screen with a confetti animation in the Primary_Pillar accent colour and a Rex message.
6. IF the 24-hour window expires without completion, THEN THE Relapse_Protection SHALL reset the streak to 0 and resume normal app flow.
7. IF the user declines the Comeback_Challenge, THEN THE Relapse_Protection SHALL reset the streak to 0, display a "Starting fresh. Day 1." screen with a Rex message, and begin a new streak.
8. THE Relapse_Protection SHALL allow a user to use the Comeback_Challenge at most once every 30 days.
9. WHEN a Comeback_Challenge attempt is made, THE Relapse_Protection SHALL NOT deduct hearts from the user.
10. WHEN the comeback success screen is shown, THE Relapse_Protection SHALL display a share option with the pre-written caption "I broke my streak and came back. @growthovo".

---

### Requirement 11: Relapse Protection — Streak Insurance (XP Economy)

**User Story:** As a user, I want to spend XP to buy streak freezes, so that I have a safety net for days when life gets in the way.

#### Acceptance Criteria

1. THE Relapse_Protection SHALL allow users to purchase Streak_Freezes at a cost of 500 XP each.
2. THE Relapse_Protection SHALL enforce a maximum of 3 Streak_Freezes held at any time.
3. WHEN a user attempts to purchase a Streak_Freeze while already holding 3, THE Relapse_Protection SHALL display an error message and SHALL NOT deduct XP.
4. WHEN a user attempts to purchase a Streak_Freeze with insufficient XP, THE Relapse_Protection SHALL display an error message and SHALL NOT deduct XP.
5. THE Relapse_Protection SHALL display the current Streak_Freeze inventory count on the home screen and in settings.
6. WHEN a Streak_Freeze is purchased, THE Relapse_Protection SHALL deduct 500 XP from the user's total and increment freeze_count by 1 in the streaks table.
