# Requirements Document: Growthovo World-Class Experience

## Introduction

This document specifies the requirements for transforming Growthovo into a world-class, habit-forming, revenue-generating product. The feature builds upon the existing service layer to deliver 12 major UI/UX enhancements: onboarding flow, morning briefing UI, evening debrief UI, streak system UI, notifications, time capsule UI, weekly wrapped auto-show, squad (fake MVP), paywall enhancements, settings completion, micro-interactions, and comprehensive empty/loading/error states.

The goal is to create a premium experience that users will pay €9.99/month for, with every interaction polished, every state handled gracefully, and every feature working end-to-end without placeholders or TODOs.

## Glossary

- **Onboarding_Flow**: The 5-screen swipeable introduction sequence shown to first-time users before Home screen access
- **Morning_Briefing**: The 5-part daily ritual accessible before 12:00 PM that awards 20 XP upon completion
- **Evening_Debrief**: The 4-part daily reflection flow accessible after 6:00 PM that awards 30 XP upon completion
- **Streak_System**: The consecutive day tracking mechanism with freeze protection and milestone celebrations
- **Streak_Freeze**: A consumable item that preserves streak when a day is missed, earned every 7 days, max 2 stored
- **Time_Capsule**: A locked message to future self with 1/3/6/12 month unlock dates
- **Weekly_Wrapped**: A 6-slide shareable summary of the user's week, auto-shown on Mondays
- **Squad**: A social accountability group of up to 5 members sharing activity and reactions
- **Paywall**: The premium subscription modal with monthly/yearly pricing and 7-day free trial
- **Toast_System**: Bottom-screen slide-up notifications that auto-dismiss in 3 seconds
- **Haptic_Feedback**: Vibration patterns triggered on user interactions via navigator.vibrate()
- **Confetti_System**: CSS-based animated colored squares falling from top for celebrations
- **Pull_To_Refresh**: Custom touch-based refresh interaction on Home screen
- **Empty_State**: UI shown when a list or collection has no items
- **Loading_State**: Animated skeleton screen shown during async operations
- **Error_State**: Graceful fallback UI shown when operations fail
- **Light_Mode**: Alternative color scheme with light backgrounds and dark text
- **Dark_Mode**: Default color scheme with dark backgrounds and light text
- **Pillar**: One of 6 life areas (Mind, Discipline, Communication, Money, Career, Relationships)
- **Rex**: The AI coach character that provides personalized messages and reactions
- **XP**: Experience points earned through activities, used for level progression
- **Lesson**: Educational content within a pillar, first 2 per pillar free, rest premium-locked
- **Public_Speaking_Trainer**: Voice practice feature with 2 sessions/day free limit
- **Premium**: Subscription status that removes all free tier limits

## Requirements

### Requirement 1: Onboarding Flow

**User Story:** As a first-time user, I want to complete a 5-screen swipeable onboarding flow, so that I understand the app's value and can personalize my experience before reaching the Home screen.

#### Acceptance Criteria

1. WHEN localStorage contains no user data, THE Onboarding_Flow SHALL display before the Home screen
2. THE Onboarding_Flow SHALL consist of exactly 5 swipeable screens in sequential order
3. THE Onboarding_Flow SHALL display a skip button in the top-right corner on all screens
4. WHEN the skip button is tapped, THE Onboarding_Flow SHALL navigate directly to Screen 5
5. THE Screen_1 SHALL display the Growthovo logo with text "Your growth adventure starts now"
6. THE Screen_1 SHALL display a CSS-animated egg hatching animation without external libraries
7. THE Screen_2 SHALL display 3 feature highlights with icons: "Rex, your AI coach — always there" with 🤖, "Earn XP, level up, beat your league" with 🎮, "Grow across 6 areas of your life" with 🌱
8. THE Screen_3 SHALL display the heading "Which areas matter most right now?"
9. THE Screen_3 SHALL display 6 toggle cards representing all pillars with multi-select capability
10. WHEN fewer than 1 pillar is selected on Screen_3, THE continue button SHALL be disabled
11. WHEN at least 1 pillar is selected on Screen_3, THE continue button SHALL be enabled
12. THE Screen_4 SHALL display the heading "How much time can you commit daily?"
13. THE Screen_4 SHALL display 4 radio options: "5 min", "10 min", "20 min", "30 min+"
14. WHEN a time commitment is selected on Screen_4, THE selection SHALL be stored for later use
15. THE Screen_5 SHALL display the heading "What should Rex call you?"
16. THE Screen_5 SHALL provide a text input with 20 character maximum for name entry
17. THE Screen_5 SHALL display the heading "Choose your avatar color"
18. THE Screen_5 SHALL display 6 color swatches for avatar color selection
19. WHEN the "Let's go →" button is tapped on Screen_5, THE Onboarding_Flow SHALL save all selections to AppContext and localStorage
20. WHEN the "Let's go →" button is tapped on Screen_5, THE Onboarding_Flow SHALL mark onboarding as complete
21. WHEN the "Let's go →" button is tapped on Screen_5, THE Onboarding_Flow SHALL navigate to the Home screen

### Requirement 2: Morning Briefing UI

**User Story:** As a user, I want to complete a 5-part morning briefing flow before 12:00 PM, so that I can start my day with intention and earn 20 XP.

#### Acceptance Criteria

1. WHEN the current time is before 12:00 PM, THE Morning_Briefing quick action button SHALL display "☀️ Morning Briefing"
2. WHEN the current time is after 12:00 PM, THE Morning_Briefing quick action button SHALL display "Come back tomorrow morning ☀️"
3. WHEN the Morning_Briefing is accessed after 12:00 PM, THE Morning_Briefing SHALL not show the full 5-part flow
4. THE Part_1 SHALL display "Good morning [name] ☀️" with today's date
5. THE Part_1 SHALL display a motivational quote rotated from a pool of 20 hardcoded quotes
6. THE Part_1 SHALL display "Your streak: X days 🔥" with the current streak count
7. THE Part_2 SHALL display yesterday's XP earned, lessons completed, and mood logged
8. WHEN no activity was completed yesterday, THE Part_2 SHALL display "Fresh start today 💪"
9. THE Part_3 SHALL display the user's top 2 selected pillars from onboarding
10. THE Part_3 SHALL display one suggested lesson per displayed pillar
11. THE Part_3 SHALL provide an "Add to today's plan →" button for each suggested lesson
12. THE Part_4 SHALL display a text input with placeholder "Today I will..."
13. WHEN Web Speech API is supported, THE Part_4 SHALL display a voice note option
14. WHEN Web Speech API is not supported, THE Part_4 SHALL display only the text input without error messages
15. THE Part_5 SHALL display a personalized message from Rex based on streak, yesterday's mood, and day of week
16. WHEN the user has a high streak (>7 days), THE Rex_Message SHALL include encouragement like "You're on fire!"
17. WHEN yesterday's mood was negative, THE Rex_Message SHALL include extra encouragement
18. WHEN the day is Monday, THE Rex_Message SHALL include motivation for the week
19. WHEN the day is Friday, THE Rex_Message SHALL celebrate the week's progress
20. WHEN the "Start your day →" button is tapped on Part_5, THE Morning_Briefing SHALL award 20 XP
21. WHEN the "Start your day →" button is tapped on Part_5, THE Morning_Briefing SHALL close the flow

### Requirement 3: Evening Debrief UI

**User Story:** As a user, I want to complete a 4-part evening debrief flow after 6:00 PM, so that I can reflect on my day and earn 30 XP.

#### Acceptance Criteria

1. WHEN the current time is after 6:00 PM, THE Evening_Debrief quick action button SHALL display "🌙 Evening Debrief"
2. WHEN the current time is before 6:00 PM, THE Evening_Debrief quick action button SHALL not be visible
3. THE Part_1 SHALL display "How was your day overall?" with a 1-5 star rating interface
4. THE Part_1 stars SHALL be tappable and fill with gold color when selected
5. THE Part_2 SHALL display a text input with 3 lines maximum
6. THE Part_2 text input SHALL have placeholder "Even something small counts..."
7. THE Part_3 SHALL display a text input with placeholder "No judgment, just reflection..."
8. THE Part_4 SHALL display "What's the ONE thing you want to do tomorrow?"
9. THE Part_4 SHALL provide a text input for the user's answer
10. WHEN the Part_4 input is submitted, THE Rex SHALL respond with "Got it. I'll remind you about [their answer] tomorrow morning 💪"
11. WHEN the Part_4 is completed, THE Evening_Debrief SHALL award 30 XP
12. WHEN the Part_4 is completed, THE Evening_Debrief SHALL save the tomorrow's priority to localStorage as tomorrow's reminder

### Requirement 4: Streak System UI

**User Story:** As a user, I want to see my streak progress with freeze indicators and milestone celebrations, so that I stay motivated to maintain my daily habit.

#### Acceptance Criteria

1. WHEN a daily check-in is completed, THE Streak_System SHALL increment the streak by 1
2. WHEN the current date equals lastCheckInDate plus 1 day, THE Streak_System SHALL increment the streak
3. WHEN the current date is greater than lastCheckInDate plus 1 day, THE Streak_System SHALL reset the streak to 0
4. WHEN the user completes a 7-day streak, THE Streak_System SHALL award 1 Streak_Freeze
5. THE Streak_System SHALL store a maximum of 2 Streak_Freezes at once
6. WHEN a day is missed and the user has at least 1 Streak_Freeze, THE Streak_System SHALL auto-consume 1 freeze
7. WHEN a Streak_Freeze is consumed, THE Toast_System SHALL display "❄️ Streak Freeze used!"
8. THE Home_Screen SHALL display a ❄️ icon near the streak count when freezes are available
9. WHEN the streak reaches 3 days, THE Streak_System SHALL display a celebration modal with "🔥 You're on fire!"
10. WHEN the streak reaches 7 days, THE Streak_System SHALL display a celebration modal with "⚡ One week strong!"
11. WHEN the streak reaches 14 days, THE Streak_System SHALL display a celebration modal with "💎 Two weeks! Legendary."
12. WHEN the streak reaches 30 days, THE Streak_System SHALL display a celebration modal with "👑 30 days. You're unstoppable."
13. WHEN a 7-day milestone is reached, THE Streak_System SHALL award 100 bonus XP
14. WHEN a 14-day milestone is reached, THE Streak_System SHALL award 250 bonus XP
15. WHEN a 30-day milestone is reached, THE Streak_System SHALL award 500 bonus XP
16. WHEN a milestone modal is displayed, THE Confetti_System SHALL trigger a confetti animation

### Requirement 5: Notification Permission and Scheduling

**User Story:** As a user, I want to receive timely push notifications for daily rituals and streak warnings, so that I stay on track with my goals.

#### Acceptance Criteria

1. WHEN onboarding completes, THE Notification_System SHALL display a custom permission prompt
2. THE custom permission prompt SHALL display "🔔 Stay on track — Rex will send you daily nudges"
3. THE custom permission prompt SHALL provide [Allow] and [Maybe later] buttons
4. WHEN the [Allow] button is tapped, THE Notification_System SHALL trigger the browser's native permission prompt
5. WHEN the [Maybe later] button is tapped, THE custom permission prompt SHALL dismiss without triggering the browser prompt
6. WHEN notification permission is granted, THE Notification_System SHALL schedule an 8:00 AM notification with text "☀️ Morning briefing is ready, [name]!"
7. WHEN notification permission is granted, THE Notification_System SHALL schedule an 8:00 PM notification with text "🌙 Time for your evening debrief"
8. WHEN the current time is 11:00 PM and no check-in has occurred, THE Notification_System SHALL send "🔥 [name], your X-day streak ends in 1 hour!"
9. WHEN the current day is Sunday at 8:00 PM, THE Notification_System SHALL send "🏆 League resets tomorrow — make your final push!"
10. THE Settings_Screen SHALL provide a Notifications section with toggles for each notification type
11. WHEN a notification toggle is disabled, THE Notification_System SHALL not send that notification type
12. THE Notification_System SHALL store notification preferences in localStorage

### Requirement 6: Time Capsule UI

**User Story:** As a user, I want to create and unlock time capsules with messages to my future self, so that I can reflect on my growth over time.

#### Acceptance Criteria

1. THE Time_Capsule route SHALL be accessible from the Profile screen at /capsule
2. THE Time_Capsule landing screen SHALL display existing capsules as locked cards
3. THE locked capsule card SHALL display "🔒 To [name], from X months ago"
4. THE locked capsule card SHALL display "Opens in X days" countdown
5. WHEN the unlock date is reached, THE locked capsule card SHALL glow with a visual effect
6. WHEN the unlock date is reached, THE locked capsule card SHALL display "📬 Your past self wrote you something!"
7. THE Create_Capsule_Step_1 SHALL display "Write a letter to your future self"
8. THE Create_Capsule_Step_1 SHALL provide a large textarea with 500 character maximum
9. THE Create_Capsule_Step_1 textarea SHALL have placeholder "Hey future me, right now I'm feeling..."
10. THE Create_Capsule_Step_2 SHALL display "Set unlock date" with 4 options: "1 month", "3 months", "6 months", "1 year"
11. THE Create_Capsule_Step_2 SHALL provide a custom date picker option
12. THE Create_Capsule_Step_3 SHALL display "Make one promise to your future self"
13. THE Create_Capsule_Step_3 SHALL provide a text input with placeholder "I promise to..."
14. THE Create_Capsule_Step_4 SHALL display a preview of the capsule card
15. WHEN the "🔒 Seal Capsule →" button is tapped, THE Time_Capsule SHALL award 75 XP
16. WHEN the "🔒 Seal Capsule →" button is tapped, THE Time_Capsule SHALL save the capsule to localStorage with unlock timestamp
17. WHEN a capsule is unlocked, THE capsule card SHALL flip with a reveal animation
18. WHEN a capsule is unlocked, THE capsule content SHALL appear after the flip animation

### Requirement 7: Weekly Wrapped Auto-Show

**User Story:** As a user, I want to see my weekly wrapped summary automatically on Mondays, so that I can review my progress and share my achievements.

#### Acceptance Criteria

1. WHEN the current day is Monday, THE Home_Screen SHALL display a "Your Week Wrapped 🎁" card
2. THE Weekly_Wrapped card SHALL be dismissable
3. WHEN the Weekly_Wrapped card is tapped, THE Weekly_Wrapped full-screen SHALL open
4. THE Weekly_Wrapped_Slide_1 SHALL display "Week of [date range] 📅"
5. THE Weekly_Wrapped_Slide_1 SHALL display the user's top stat (highest value among XP, streak, lessons)
6. THE Weekly_Wrapped_Slide_2 SHALL display "XP earned this week"
7. THE Weekly_Wrapped_Slide_2 SHALL display a hand-drawn style CSS bar chart with 7 days
8. THE Weekly_Wrapped_Slide_2 SHALL display "Your best day was [day]"
9. THE Weekly_Wrapped_Slide_3 SHALL display "Lessons completed" with a list and pillar emojis
10. THE Weekly_Wrapped_Slide_3 SHALL display "You spent ~X minutes learning"
11. THE Weekly_Wrapped_Slide_4 SHALL display "Mood trend" with an emoji timeline across the week
12. THE Weekly_Wrapped_Slide_4 SHALL display "Your overall vibe: [most common mood]"
13. THE Weekly_Wrapped_Slide_5 SHALL display Rex's weekly message personalized based on actual stats
14. THE Weekly_Wrapped_Slide_5 message SHALL include "This week you showed up [X] times. That's what champions do."
15. THE Weekly_Wrapped_Slide_6 SHALL display "Next week challenge" with a specific goal based on the weakest pillar
16. WHEN the "Accept Challenge →" button is tapped on Slide_6, THE Weekly_Wrapped SHALL award 50 XP
17. THE Weekly_Wrapped_Slide_6 SHALL display a Share button
18. WHEN the Share button is tapped, THE Weekly_Wrapped SHALL generate a canvas screenshot of Slide_1 stats
19. WHEN the Share button is tapped, THE Weekly_Wrapped SHALL share via Web Share API or download as PNG
20. THE shared image SHALL include a watermark "growthovo.com"

### Requirement 8: Squad (Fake MVP)

**User Story:** As a user, I want to see a squad of accountability partners with realistic activity, so that I feel socially connected and motivated.

#### Acceptance Criteria

1. THE Squad route SHALL be accessible from the League screen at /squad
2. THE Squad_Screen SHALL display 3 fake squad members with realistic names and activity
3. THE Squad_Member_1 SHALL display "Ana M. · 🔥 12 day streak · 420 XP · 'Studied Finance today'"
4. THE Squad_Member_2 SHALL display "Bogdan T. · 🔥 5 day streak · 280 XP · 'Completed Fitness lesson'"
5. THE Squad_Member_3 SHALL display "Ioana S. · ❄️ streak frozen · 195 XP · 'Missed yesterday'"
6. THE Squad_Feed SHALL display an activity timeline with each member's last action and timestamp
7. THE Squad_Feed SHALL include the user's own actions in the timeline
8. WHEN a squad member is tapped, THE Squad_Screen SHALL display their mini profile with name, XP, streak, and badges
9. WHEN a feed item is tapped, THE Squad_Screen SHALL display emoji reaction options: ❤️ 🔥 💪 👏
10. WHEN an emoji reaction is selected, THE reaction SHALL be stored locally and displayed on that feed item
11. THE Squad_Screen SHALL display an "Invite to Squad" button
12. WHEN the "Invite to Squad" button is tapped, THE Squad_Screen SHALL generate a shareable link "Join my Growthovo squad! growthovo.com/squad/join?code=XYZ"
13. WHEN the invite link is generated, THE Toast_System SHALL display "Invite link copied! 📋"

### Requirement 9: Paywall Enhancements

**User Story:** As a free user, I want to see clear limit counters and a compelling premium modal, so that I understand the value of upgrading.

#### Acceptance Criteria

1. WHEN the user is on the free tier, THE Rex_Chat SHALL display "X/10 messages left" counter
2. WHEN the user is on the free tier, THE Lessons_Screen SHALL lock all lessons beyond the first 2 per pillar with 🔒 icon
3. WHEN the user is on the free tier, THE Public_Speaking_Trainer SHALL display "X/2 sessions left" counter
4. WHEN the user is on the free tier, THE Time_Capsule SHALL allow a maximum of 1 capsule
5. WHEN the user is on the free tier, THE Weekly_Wrapped SHALL show summary only without share capability
6. WHEN the user is on the free tier, THE League SHALL be visible but league XP earning SHALL be disabled
7. WHEN a free tier limit is reached, THE Paywall modal SHALL slide up from bottom
8. THE Paywall modal SHALL display "🚀 Unlock Growthovo Pro"
9. THE Paywall modal SHALL display 3 bullet benefits: "✓ Unlimited Rex conversations — 24/7", "✓ All 24 lessons across every pillar", "✓ Public Speaking Trainer unlimited"
10. THE Paywall modal SHALL provide a pricing toggle between Monthly and Yearly
11. THE Monthly option SHALL display "€9.99/mo"
12. THE Yearly option SHALL display "€79.99/yr" shown as "€6.67/mo · Save 33%"
13. THE Yearly option SHALL be highlighted with a "Most Popular" badge
14. THE Paywall modal SHALL display a "Start 7-Day Free Trial →" primary button in purple, full width
15. THE Paywall modal SHALL display a "Maybe later" text link below the primary button
16. WHEN the "Start 7-Day Free Trial →" button is tapped, THE Paywall SHALL navigate to /checkout
17. WHEN isPremium is true in localStorage, THE Paywall SHALL remove all free tier limits silently

### Requirement 10: Settings Completion

**User Story:** As a user, I want fully functional settings options including appearance, data export, and account deletion, so that I have full control over my account and data.

#### Acceptance Criteria

1. WHEN the "Edit Profile" row is tapped, THE Settings_Screen SHALL display inline edit for name and avatar color picker
2. WHEN the "Notifications" row is tapped, THE Settings_Screen SHALL display a toggle list for morning, evening, streak, and league notifications
3. WHEN a notification toggle is changed, THE Settings_Screen SHALL save the preference to localStorage
4. WHEN a notification toggle is changed, THE Settings_Screen SHALL affect Service Worker notification scheduling
5. WHEN the "Language" row is tapped, THE Settings_Screen SHALL display a modal with 8 flag options
6. WHEN a language other than English is selected, THE Toast_System SHALL display "Language support coming soon for [language]"
7. WHEN English is selected, THE Settings_Screen SHALL change the app language immediately
8. WHEN the "Appearance" row is tapped, THE Settings_Screen SHALL display a toggle with Dark, Light, and System options
9. WHEN Light mode is selected, THE Settings_Screen SHALL apply light theme: bg #F5F5FA, cards #FFFFFF, text #1A1A2E
10. WHEN Dark mode is selected, THE Settings_Screen SHALL apply dark theme: bg #0A0A12, cards #1A1A2E, purple #7C3AED
11. WHEN the "My Progress" row is tapped, THE Settings_Screen SHALL display a modal with Total XP, Total lessons, Total check-ins, Longest streak, Favorite pillar, Days active
12. WHEN the "Export My Data" row is tapped, THE Settings_Screen SHALL generate and download a JSON file of all localStorage data
13. WHEN the "Rate Growthovo" row is tapped, THE Settings_Screen SHALL open an App Store link placeholder
14. WHEN the "Send Feedback" row is tapped, THE Settings_Screen SHALL open a mailto: link or feedback form modal
15. WHEN the "Log Out" row is tapped, THE Settings_Screen SHALL display a confirmation dialog
16. WHEN log out is confirmed, THE Settings_Screen SHALL clear session data but preserve localStorage
17. WHEN the "Delete Account" row is tapped, THE Settings_Screen SHALL display a double confirmation dialog
18. WHEN the "Delete Account" row is tapped, THE Settings_Screen SHALL require typing "DELETE" to confirm
19. WHEN account deletion is confirmed, THE Settings_Screen SHALL clear all localStorage data
20. WHEN account deletion is confirmed, THE Settings_Screen SHALL redirect to the onboarding screen

### Requirement 11: Micro-Interactions and Polish

**User Story:** As a user, I want polished micro-interactions including toasts, haptics, and animations, so that the app feels premium and responsive.

#### Acceptance Criteria

1. THE Toast_System SHALL display notifications at the bottom of the screen
2. THE Toast_System SHALL slide up from bottom when triggered
3. THE Toast_System SHALL auto-dismiss after 3 seconds
4. THE Toast_System SHALL support 4 types: success (teal), info (purple), warning (amber), error (red)
5. THE Toast_System SHALL be used for XP gains, streak freeze usage, invite copied, and other feedback
6. WHEN any button is tapped, THE Haptic_Feedback SHALL trigger navigator.vibrate(10)
7. WHEN XP is gained, THE Haptic_Feedback SHALL trigger navigator.vibrate([10,50,10])
8. WHEN a level up occurs, THE Haptic_Feedback SHALL trigger navigator.vibrate([50,30,50,30,100])
9. THE Home_Screen SHALL support pull-to-refresh with custom CSS and touch events
10. WHEN pull-to-refresh is triggered, THE Rex SHALL send a new motivational message
11. WHEN a list has no items, THE Empty_State SHALL display with relevant emoji, 1-line message, and CTA button
12. THE Empty_State for no lessons SHALL display "Start your first lesson 👆"
13. THE Empty_State for no chat messages SHALL display a welcome state
14. WHEN an async operation is in progress, THE Loading_State SHALL display an animated shimmer skeleton screen
15. THE Loading_State SHALL never show a blank screen or spinner alone
16. WHEN localStorage fails, THE Error_State SHALL provide a graceful fallback keeping data in memory
17. WHEN Web Speech API fails, THE Error_State SHALL silently fallback to text input
18. THE Error_State SHALL never show raw error messages to the user
19. WHEN XP is gained, THE XP_Animation SHALL display floating "+X XP ✨" rising from the triggering element
20. THE XP_Animation SHALL fade out over 1 second
21. THE XP stat card number SHALL increment smoothly with animation
22. WHEN a level up occurs, THE Level_Up_Modal SHALL display full overlay with dark background
23. THE Level_Up_Modal SHALL display large "⚡ LEVEL UP!" text
24. THE Level_Up_Modal SHALL display "You reached Level X — [tier name]"
25. WHEN the Level_Up_Modal is displayed, THE Confetti_System SHALL trigger
26. THE Level_Up_Modal SHALL display a "Claim reward →" button that closes the modal
27. THE Confetti_System SHALL use pure CSS and JavaScript without external libraries
28. THE Confetti_System SHALL display 30 colored squares with random trajectories
29. THE Confetti_System SHALL be used on level up, streak milestones, and pillar completion

### Requirement 12: Empty, Loading, and Error States

**User Story:** As a user, I want to see helpful empty states, smooth loading states, and graceful error states, so that I always understand what's happening in the app.

#### Acceptance Criteria

1. WHEN the lessons list is empty, THE Empty_State SHALL display "Start your first lesson 👆" with a relevant emoji and CTA button
2. WHEN the chat messages list is empty, THE Empty_State SHALL display a welcome state with Rex introduction
3. WHEN the squad feed is empty, THE Empty_State SHALL display "Your squad's activity will appear here" with emoji
4. WHEN the time capsule list is empty, THE Empty_State SHALL display "Create your first time capsule 📬" with CTA button
5. WHEN the weekly wrapped has no data, THE Empty_State SHALL display "Complete activities this week to unlock Wrapped"
6. WHEN lessons are loading, THE Loading_State SHALL display an animated shimmer skeleton with lesson card shapes
7. WHEN the home screen is loading, THE Loading_State SHALL display skeleton cards for quick actions and stats
8. WHEN the profile is loading, THE Loading_State SHALL display skeleton for avatar, name, and stats
9. WHEN the league is loading, THE Loading_State SHALL display skeleton for leaderboard rows
10. WHEN Rex chat is loading, THE Loading_State SHALL display skeleton for message bubbles
11. WHEN localStorage read fails, THE Error_State SHALL keep data in memory and display "Data will sync when connection is restored"
12. WHEN Web Speech API is unavailable, THE Error_State SHALL silently fallback to text input without showing error
13. WHEN Supabase query fails, THE Error_State SHALL display "Unable to load data. Please check your connection." with retry button
14. WHEN image loading fails, THE Error_State SHALL display a placeholder image with fallback color
15. WHEN video loading fails in Time Capsule, THE Error_State SHALL display "Video unavailable" with support link
16. THE Error_State SHALL never display raw error messages or stack traces to the user
17. THE Error_State SHALL always provide a user-friendly explanation and next action
18. WHEN a network error occurs during XP award, THE Error_State SHALL queue the operation for retry and show "XP will sync when online"

### Requirement 13: Light Mode Implementation

**User Story:** As a user, I want to toggle between dark and light appearance modes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Settings_Screen SHALL provide an Appearance toggle with Dark, Light, and System options
2. WHEN Light mode is selected, THE App SHALL apply class="light" to the <html> element
3. WHEN Dark mode is selected, THE App SHALL apply class="dark" to the <html> element
4. WHEN System mode is selected, THE App SHALL respect the prefers-color-scheme media query
5. THE Light_Mode SHALL use background color #F5F5FA
6. THE Light_Mode SHALL use card background color #FFFFFF
7. THE Light_Mode SHALL use text color #1A1A2E
8. THE Light_Mode SHALL use muted text color rgba(26,26,46,0.5)
9. THE Light_Mode SHALL use card border 1px solid rgba(0,0,0,0.08)
10. THE Light_Mode SHALL use the same purple (#7C3AED) and teal (#34D399) accent colors as Dark_Mode
11. THE Dark_Mode SHALL use background color #0A0A12
12. THE Dark_Mode SHALL use card background color #1A1A2E
13. THE Dark_Mode SHALL use purple #7C3AED and light purple #A78BFA
14. THE Dark_Mode SHALL use teal #34D399
15. THE appearance preference SHALL be saved to localStorage
16. WHEN the app loads, THE appearance preference SHALL be read from localStorage
17. WHEN no appearance preference exists in localStorage, THE App SHALL default to the prefers-color-scheme value

