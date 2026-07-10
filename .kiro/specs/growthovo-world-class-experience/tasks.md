# Implementation Plan: Growthovo World-Class Experience

## Overview

This implementation plan transforms Growthovo into a world-class, habit-forming, revenue-generating product through 12 major UI/UX enhancements. The implementation uses TypeScript with React Native and Expo, building on the existing service layer to deliver: onboarding flow, morning briefing UI, evening debrief UI, streak system UI, notifications, time capsule UI, weekly wrapped auto-show, squad (fake MVP), paywall enhancements, settings completion, micro-interactions, and comprehensive empty/loading/error states.

The goal is to create a premium experience that users will pay €9.99/month for, with every interaction polished, every state handled gracefully, and every feature working end-to-end without placeholders or TODOs.

## Tasks

- [x] 1. Implement 5-screen onboarding flow
  - [x] 1.1 Create OnboardingScreen component with swipeable screens
    - Create OnboardingScreen.tsx with 5 screens using FlatList horizontal pagination
    - Implement localStorage check to skip onboarding if already completed
    - Add skip button in top-right corner on all screens
    - Wire skip button to navigate directly to Screen 5
    - _Requirements: 1.1, 1.3, 1.4_
  
  - [x] 1.2 Implement Screen 1: Welcome with egg hatching animation
    - Display Growthovo logo with text "Your growth adventure starts now"
    - Create CSS-animated egg hatching animation using Animated API
    - Use transform: scale and opacity for hatching effect
    - _Requirements: 1.5, 1.6_
  
  - [x] 1.3 Implement Screen 2: Feature highlights
    - Display 3 feature cards with icons and text
    - Feature 1: "Rex, your AI coach — always there" with 🤖
    - Feature 2: "Earn XP, level up, beat your league" with 🎮
    - Feature 3: "Grow across 6 areas of your life" with 🌱
    - _Requirements: 1.7_
  
  - [x] 1.4 Implement Screen 3: Pillar selection
    - Display heading "Which areas matter most right now?"
    - Create 6 toggle cards for all pillars with multi-select
    - Disable continue button when fewer than 1 pillar selected
    - Enable continue button when at least 1 pillar selected
    - _Requirements: 1.8, 1.9, 1.10, 1.11_
  
  - [x] 1.5 Implement Screen 4: Time commitment selection
    - Display heading "How much time can you commit daily?"
    - Create 4 radio options: "5 min", "10 min", "20 min", "30 min+"
    - Store selection to localStorage for later use
    - _Requirements: 1.12, 1.13, 1.14_
  
  - [x] 1.6 Implement Screen 5: Name and avatar customization
    - Display heading "What should Rex call you?"
    - Add text input with 20 character maximum
    - Display heading "Choose your avatar color"
    - Create 6 color swatches for selection
    - Implement "Let's go →" button to save all selections
    - Save selections to AppContext and localStorage
    - Mark onboarding as complete in localStorage
    - Navigate to Home screen on completion
    - _Requirements: 1.15, 1.16, 1.17, 1.18, 1.19, 1.20, 1.21_

- [x] 2. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement Morning Briefing 5-part flow
  - [x] 3.1 Create MorningBriefingScreen with time-based access control
    - Create MorningBriefingScreen.tsx with 5-part flow
    - Check current time and only allow access before 12:00 PM
    - Display "☀️ Morning Briefing" button when before 12:00 PM
    - Display "Come back tomorrow morning ☀️" when after 12:00 PM
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 3.2 Implement Part 1: Morning greeting with quote
    - Display "Good morning [name] ☀️" with today's date
    - Rotate motivational quote from pool of 20 hardcoded quotes
    - Display "Your streak: X days 🔥" with current streak count
    - _Requirements: 2.4, 2.5, 2.6_
  
  - [x] 3.3 Implement Part 2: Yesterday's recap
    - Display yesterday's XP earned, lessons completed, and mood logged
    - Show "Fresh start today 💪" when no activity completed yesterday
    - _Requirements: 2.7, 2.8_
  
  - [x] 3.4 Implement Part 3: Suggested lessons
    - Display user's top 2 selected pillars from onboarding
    - Show one suggested lesson per displayed pillar
    - Add "Add to today's plan →" button for each suggested lesson
    - _Requirements: 2.9, 2.10, 2.11_
  
  - [x] 3.5 Implement Part 4: Daily intention input
    - Display text input with placeholder "Today I will..."
    - Check Web Speech API support and add voice note option if available
    - Display only text input without error when Web Speech API not supported
    - _Requirements: 2.12, 2.13, 2.14_
  
  - [x] 3.6 Implement Part 5: Rex personalized message
    - Generate personalized message based on streak, yesterday's mood, and day of week
    - Include "You're on fire!" for high streak (>7 days)
    - Include extra encouragement when yesterday's mood was negative
    - Include week motivation on Monday
    - Celebrate week's progress on Friday
    - Award 20 XP when "Start your day →" button is tapped
    - Close flow after completion
    - _Requirements: 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 2.21_

- [x] 4. Implement Evening Debrief 4-part flow
  - [x] 4.1 Create EveningDebriefScreen with time-based access control
    - Create EveningDebriefScreen.tsx with 4-part flow
    - Display "🌙 Evening Debrief" button only after 6:00 PM
    - Hide button before 6:00 PM
    - _Requirements: 3.1, 3.2_
  
  - [x] 4.2 Implement Part 1: Day rating
    - Display "How was your day overall?" with 1-5 star rating interface
    - Make stars tappable and fill with gold color when selected
    - _Requirements: 3.3, 3.4_
  
  - [x] 4.3 Implement Part 2: Win reflection
    - Display text input with 3 lines maximum
    - Add placeholder "Even something small counts..."
    - _Requirements: 3.5, 3.6_
  
  - [x] 4.4 Implement Part 3: Challenge reflection
    - Display text input with placeholder "No judgment, just reflection..."
    - _Requirements: 3.7_
  
  - [x] 4.5 Implement Part 4: Tomorrow's priority
    - Display "What's the ONE thing you want to do tomorrow?"
    - Add text input for user's answer
    - Show Rex response: "Got it. I'll remind you about [their answer] tomorrow morning 💪"
    - Award 30 XP on completion
    - Save tomorrow's priority to localStorage as tomorrow's reminder
    - _Requirements: 3.8, 3.9, 3.10, 3.11, 3.12_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Streak System with freeze mechanics
  - [x] 6.1 Create streak calculation and persistence logic
    - Implement streak increment on daily check-in completion
    - Check if current date equals lastCheckInDate plus 1 day to increment
    - Reset streak to 0 when current date is greater than lastCheckInDate plus 1 day
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 6.2 Implement Streak Freeze system
    - Award 1 Streak_Freeze on 7-day streak completion
    - Store maximum of 2 Streak_Freezes at once
    - Auto-consume 1 freeze when day is missed and at least 1 freeze available
    - Display "❄️ Streak Freeze used!" toast when freeze is consumed
    - Display ❄️ icon near streak count on Home screen when freezes available
    - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [x] 6.3 Implement streak milestone celebrations
    - Display celebration modal with "🔥 You're on fire!" at 3 days
    - Display celebration modal with "⚡ One week strong!" at 7 days
    - Display celebration modal with "💎 Two weeks! Legendary." at 14 days
    - Display celebration modal with "👑 30 days. You're unstoppable." at 30 days
    - Award 100 bonus XP at 7-day milestone
    - Award 250 bonus XP at 14-day milestone
    - Award 500 bonus XP at 30-day milestone
    - Trigger confetti animation when milestone modal is displayed
    - _Requirements: 4.9, 4.10, 4.11, 4.12, 4.13, 4.14, 4.15, 4.16_

- [x] 7. Implement notification permission and scheduling
  - [x] 7.1 Create custom notification permission prompt
    - Display custom permission prompt after onboarding completes
    - Show "🔔 Stay on track — Rex will send you daily nudges"
    - Add [Allow] and [Maybe later] buttons
    - Trigger browser's native permission prompt when [Allow] is tapped
    - Dismiss without triggering browser prompt when [Maybe later] is tapped
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 7.2 Implement notification scheduling
    - Schedule 8:00 AM notification: "☀️ Morning briefing is ready, [name]!"
    - Schedule 8:00 PM notification: "🌙 Time for your evening debrief"
    - Send 11:00 PM notification when no check-in occurred: "🔥 [name], your X-day streak ends in 1 hour!"
    - Send Sunday 8:00 PM notification: "🏆 League resets tomorrow — make your final push!"
    - _Requirements: 5.6, 5.7, 5.8, 5.9_
  
  - [x] 7.3 Add notification settings controls
    - Create Notifications section in Settings screen
    - Add toggles for each notification type
    - Prevent sending notification when toggle is disabled
    - Store notification preferences in localStorage
    - _Requirements: 5.10, 5.11, 5.12_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Time Capsule feature
  - [x] 9.1 Create TimeCapsuleScreen with landing view
    - Create route accessible from Profile screen at /capsule
    - Display existing capsules as locked cards
    - Show "🔒 To [name], from X months ago" on locked cards
    - Display "Opens in X days" countdown
    - Add glow visual effect when unlock date is reached
    - Display "📬 Your past self wrote you something!" when unlocked
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 9.2 Implement Create Capsule Step 1: Write letter
    - Display "Write a letter to your future self"
    - Add large textarea with 500 character maximum
    - Use placeholder "Hey future me, right now I'm feeling..."
    - _Requirements: 6.7, 6.8, 6.9_
  
  - [x] 9.3 Implement Create Capsule Step 2: Set unlock date
    - Display "Set unlock date" with 4 options: "1 month", "3 months", "6 months", "1 year"
    - Add custom date picker option
    - _Requirements: 6.10, 6.11_
  
  - [x] 9.4 Implement Create Capsule Step 3: Make promise
    - Display "Make one promise to your future self"
    - Add text input with placeholder "I promise to..."
    - _Requirements: 6.12, 6.13_
  
  - [x] 9.5 Implement Create Capsule Step 4: Preview and seal
    - Display preview of capsule card
    - Add "🔒 Seal Capsule →" button
    - Award 75 XP when button is tapped
    - Save capsule to localStorage with unlock timestamp
    - _Requirements: 6.14, 6.15, 6.16_
  
  - [x] 9.6 Implement capsule unlock animation
    - Create flip animation for capsule card reveal
    - Display capsule content after flip animation completes
    - _Requirements: 6.17, 6.18_

- [x] 10. Implement Weekly Wrapped auto-show
  - [x] 10.1 Create WeeklyWrappedScreen with auto-show logic
    - Display "Your Week Wrapped 🎁" card on Home screen when day is Monday
    - Make card dismissable
    - Open full-screen Weekly Wrapped when card is tapped
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 10.2 Implement Slide 1: Week overview
    - Display "Week of [date range] 📅"
    - Show user's top stat (highest value among XP, streak, lessons)
    - _Requirements: 7.4, 7.5_
  
  - [x] 10.3 Implement Slide 2: XP breakdown
    - Display "XP earned this week"
    - Create hand-drawn style CSS bar chart with 7 days
    - Show "Your best day was [day]"
    - _Requirements: 7.6, 7.7, 7.8_
  
  - [x] 10.4 Implement Slide 3: Lessons completed
    - Display "Lessons completed" with list and pillar emojis
    - Show "You spent ~X minutes learning"
    - _Requirements: 7.9, 7.10_
  
  - [x] 10.5 Implement Slide 4: Mood trend
    - Display "Mood trend" with emoji timeline across the week
    - Show "Your overall vibe: [most common mood]"
    - _Requirements: 7.11, 7.12_
  
  - [x] 10.6 Implement Slide 5: Rex's weekly message
    - Display Rex's personalized message based on actual stats
    - Include "This week you showed up [X] times. That's what champions do."
    - _Requirements: 7.13, 7.14_
  
  - [x] 10.7 Implement Slide 6: Next week challenge
    - Display "Next week challenge" with specific goal based on weakest pillar
    - Add "Accept Challenge →" button that awards 50 XP
    - Add Share button
    - Generate canvas screenshot of Slide 1 stats when Share is tapped
    - Share via Web Share API or download as PNG
    - Include watermark "growthovo.com" on shared image
    - _Requirements: 7.15, 7.16, 7.17, 7.18, 7.19, 7.20_

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement Squad (Fake MVP)
  - [x] 12.1 Create SquadScreen with fake members
    - Create route accessible from League screen at /squad
    - Display 3 fake squad members with realistic names and activity
    - Member 1: "Ana M. · 🔥 12 day streak · 420 XP · 'Studied Finance today'"
    - Member 2: "Bogdan T. · 🔥 5 day streak · 280 XP · 'Completed Fitness lesson'"
    - Member 3: "Ioana S. · ❄️ streak frozen · 195 XP · 'Missed yesterday'"
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 12.2 Implement squad activity feed
    - Display activity timeline with each member's last action and timestamp
    - Include user's own actions in timeline
    - _Requirements: 8.6, 8.7_
  
  - [x] 12.3 Add squad member interactions
    - Display mini profile when squad member is tapped (name, XP, streak, badges)
    - Show emoji reaction options when feed item is tapped: ❤️ 🔥 💪 👏
    - Store reaction locally and display on feed item when selected
    - _Requirements: 8.8, 8.9, 8.10_
  
  - [x] 12.4 Implement squad invite functionality
    - Add "Invite to Squad" button
    - Generate shareable link when button is tapped: "Join my Growthovo squad! growthovo.com/squad/join?code=XYZ"
    - Display "Invite link copied! 📋" toast when link is generated
    - _Requirements: 8.11, 8.12, 8.13_

- [x] 13. Implement Paywall enhancements
  - [x] 13.1 Add free tier limit counters
    - Display "X/10 messages left" counter in Rex Chat for free users
    - Lock all lessons beyond first 2 per pillar with 🔒 icon for free users
    - Display "X/2 sessions left" counter in Public Speaking Trainer for free users
    - Allow maximum of 1 capsule for free users in Time Capsule
    - Show summary only without share capability in Weekly Wrapped for free users
    - Make League visible but disable league XP earning for free users
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [x] 13.2 Create enhanced Paywall modal
    - Slide up modal from bottom when free tier limit is reached
    - Display "🚀 Unlock Growthovo Pro"
    - Show 3 bullet benefits: "✓ Unlimited Rex conversations — 24/7", "✓ All 24 lessons across every pillar", "✓ Public Speaking Trainer unlimited"
    - _Requirements: 9.7, 9.8, 9.9_
  
  - [x] 13.3 Implement pricing toggle and trial button
    - Add pricing toggle between Monthly and Yearly
    - Display Monthly option: "€9.99/mo"
    - Display Yearly option: "€79.99/yr" shown as "€6.67/mo · Save 33%"
    - Highlight Yearly option with "Most Popular" badge
    - Add "Start 7-Day Free Trial →" primary button in purple, full width
    - Add "Maybe later" text link below primary button
    - Navigate to /checkout when trial button is tapped
    - Remove all free tier limits silently when isPremium is true in localStorage
    - _Requirements: 9.10, 9.11, 9.12, 9.13, 9.14, 9.15, 9.16, 9.17_

- [x] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Complete Settings screen functionality
  - [x] 15.1 Implement Edit Profile settings
    - Display inline edit for name when "Edit Profile" row is tapped
    - Add avatar color picker when "Edit Profile" row is tapped
    - _Requirements: 10.1_
  
  - [x] 15.2 Implement Notifications settings
    - Display toggle list for morning, evening, streak, and league notifications when "Notifications" row is tapped
    - Save preference to localStorage when toggle is changed
    - Affect Service Worker notification scheduling when toggle is changed
    - _Requirements: 10.2, 10.3, 10.4_
  
  - [x] 15.3 Implement Language settings
    - Display modal with 8 flag options when "Language" row is tapped
    - Show "Language support coming soon for [language]" toast when non-English language is selected
    - Change app language immediately when English is selected
    - _Requirements: 10.5, 10.6, 10.7_
  
  - [x] 15.4 Implement Appearance settings
    - Display toggle with Dark, Light, and System options when "Appearance" row is tapped
    - Apply light theme when Light mode is selected: bg #F5F5FA, cards #FFFFFF, text #1A1A2E
    - Apply dark theme when Dark mode is selected: bg #0A0A12, cards #1A1A2E, purple #7C3AED
    - _Requirements: 10.8, 10.9, 10.10_
  
  - [x] 15.5 Implement My Progress modal
    - Display modal with Total XP, Total lessons, Total check-ins, Longest streak, Favorite pillar, Days active when "My Progress" row is tapped
    - _Requirements: 10.11_
  
  - [x] 15.6 Implement data export and feedback
    - Generate and download JSON file of all localStorage data when "Export My Data" row is tapped
    - Open App Store link placeholder when "Rate Growthovo" row is tapped
    - Open mailto: link or feedback form modal when "Send Feedback" row is tapped
    - _Requirements: 10.12, 10.13, 10.14_
  
  - [x] 15.7 Implement log out and account deletion
    - Display confirmation dialog when "Log Out" row is tapped
    - Clear session data but preserve localStorage when log out is confirmed
    - Display double confirmation dialog when "Delete Account" row is tapped
    - Require typing "DELETE" to confirm account deletion
    - Clear all localStorage data when account deletion is confirmed
    - Redirect to onboarding screen when account deletion is confirmed
    - _Requirements: 10.15, 10.16, 10.17, 10.18, 10.19, 10.20_

- [x] 16. Implement micro-interactions and polish
  - [x] 16.1 Create Toast notification system
    - Display toasts at bottom of screen
    - Slide up from bottom when triggered
    - Auto-dismiss after 3 seconds
    - Support 4 types: success (teal), info (purple), warning (amber), error (red)
    - Use for XP gains, streak freeze usage, invite copied, and other feedback
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 16.2 Implement haptic feedback
    - Trigger navigator.vibrate(10) when any button is tapped
    - Trigger navigator.vibrate([10,50,10]) when XP is gained
    - Trigger navigator.vibrate([50,30,50,30,100]) when level up occurs
    - _Requirements: 11.6, 11.7, 11.8_
  
  - [x] 16.3 Add pull-to-refresh on Home screen
    - Support pull-to-refresh with custom CSS and touch events
    - Send new motivational message from Rex when triggered
    - _Requirements: 11.9, 11.10_
  
  - [x] 16.4 Implement XP gain animations
    - Display floating "+X XP ✨" rising from triggering element when XP is gained
    - Fade out over 1 second
    - Increment XP stat card number smoothly with animation
    - _Requirements: 11.19, 11.20, 11.21_
  
  - [x] 16.5 Create level-up modal and confetti
    - Display full overlay with dark background for Level Up Modal
    - Show large "⚡ LEVEL UP!" text
    - Display "You reached Level X — [tier name]"
    - Trigger confetti animation when modal is displayed
    - Add "Claim reward →" button that closes modal
    - _Requirements: 11.22, 11.23, 11.24, 11.25, 11.26_
  
  - [x] 16.6 Implement confetti system
    - Use pure CSS and JavaScript without external libraries
    - Display 30 colored squares with random trajectories
    - Use on level up, streak milestones, and pillar completion
    - _Requirements: 11.27, 11.28, 11.29_

- [x] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Implement empty, loading, and error states
  - [x] 18.1 Create empty states for all screens
    - Display "Start your first lesson 👆" with emoji and CTA when lessons list is empty
    - Display welcome state with Rex introduction when chat messages list is empty
    - Display "Your squad's activity will appear here" with emoji when squad feed is empty
    - Display "Create your first time capsule 📬" with CTA when time capsule list is empty
    - Display "Complete activities this week to unlock Wrapped" when weekly wrapped has no data
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 18.2 Create loading states for all screens
    - Display animated shimmer skeleton with lesson card shapes when lessons are loading
    - Display skeleton cards for quick actions and stats when home screen is loading
    - Display skeleton for avatar, name, and stats when profile is loading
    - Display skeleton for leaderboard rows when league is loading
    - Display skeleton for message bubbles when Rex chat is loading
    - _Requirements: 12.6, 12.7, 12.8, 12.9, 12.10_
  
  - [x] 18.3 Create error states for all screens
    - Keep data in memory and display "Data will sync when connection is restored" when localStorage read fails
    - Silently fallback to text input without showing error when Web Speech API is unavailable
    - Display "Unable to load data. Please check your connection." with retry button when Supabase query fails
    - Display placeholder image with fallback color when image loading fails
    - Display "Video unavailable" with support link when video loading fails in Time Capsule
    - Never display raw error messages or stack traces to user
    - Always provide user-friendly explanation and next action
    - Queue operation for retry and show "XP will sync when online" when network error occurs during XP award
    - _Requirements: 12.11, 12.12, 12.13, 12.14, 12.15, 12.16, 12.17, 12.18_

- [x] 19. Implement Light Mode
  - [x] 19.1 Create light mode theme system
    - Apply class="light" to <html> element when Light mode is selected
    - Apply class="dark" to <html> element when Dark mode is selected
    - Respect prefers-color-scheme media query when System mode is selected
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [x] 19.2 Define light mode color palette
    - Use background color #F5F5FA for Light Mode
    - Use card background color #FFFFFF for Light Mode
    - Use text color #1A1A2E for Light Mode
    - Use muted text color rgba(26,26,46,0.5) for Light Mode
    - Use card border 1px solid rgba(0,0,0,0.08) for Light Mode
    - Use same purple (#7C3AED) and teal (#34D399) accent colors as Dark Mode
    - _Requirements: 13.5, 13.6, 13.7, 13.8, 13.9, 13.10_
  
  - [x] 19.3 Define dark mode color palette
    - Use background color #0A0A12 for Dark Mode
    - Use card background color #1A1A2E for Dark Mode
    - Use purple #7C3AED and light purple #A78BFA for Dark Mode
    - Use teal #34D399 for Dark Mode
    - _Requirements: 13.11, 13.12, 13.13, 13.14_
  
  - [x] 19.4 Implement appearance persistence
    - Save appearance preference to localStorage
    - Read appearance preference from localStorage when app loads
    - Default to prefers-color-scheme value when no preference exists in localStorage
    - _Requirements: 13.15, 13.16, 13.17_

- [x] 20. Final integration and testing
  - [x] 20.1 Wire all features to navigation
    - Connect OnboardingScreen to navigation flow
    - Connect MorningBriefingScreen to Home screen quick action
    - Connect EveningDebriefScreen to Home screen quick action
    - Connect TimeCapsuleScreen to Profile screen
    - Connect WeeklyWrappedScreen to Home screen card
    - Connect SquadScreen to League screen
    - Connect PaywallScreen to all free tier limit triggers
    - _Requirements: 1.1-13.17_
  
  - [x] 20.2 Implement cross-screen state synchronization
    - Sync XP updates across all screens via AppContext
    - Sync streak updates across all screens via AppContext
    - Sync level updates across all screens via AppContext
    - Refresh data from localStorage on app foreground
    - _Requirements: 1.1-13.17_
  
  - [x] 20.3 Add data initialization for new users
    - Initialize default progress for new users
    - Set up empty completed lessons array
    - Initialize challenge completion state
    - Initialize notification preferences
    - Initialize appearance preference
    - _Requirements: 1.1-13.17_
  
  - [x] 20.4 Verify design system consistency
    - Apply background colors consistently across all screens
    - Apply border-radius 16px to all cards
    - Apply border color rgba(255,255,255,0.08) consistently
    - Use primary purple #7C3AED for all buttons
    - Use teal #34D399 for all progress indicators
    - _Requirements: 1.1-13.17_
  
  - [x] 20.5 Run end-to-end testing
    - Test complete onboarding flow
    - Test morning briefing flow with time restrictions
    - Test evening debrief flow with time restrictions
    - Test streak system with freeze mechanics
    - Test notification permission and scheduling
    - Test time capsule creation and unlock
    - Test weekly wrapped auto-show on Monday
    - Test squad interactions and invite
    - Test paywall triggers and premium unlock
    - Test all settings functionality
    - Test all micro-interactions (toasts, haptics, animations)
    - Test all empty, loading, and error states
    - Test light mode and dark mode switching
    - _Requirements: 1.1-13.17_

- [x] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at reasonable breaks
- The implementation uses TypeScript with React Native and Expo
- All features build on existing service layer without breaking changes
- All persistence uses localStorage with graceful fallback to in-memory state
- All animations use React Native Animated API with native driver where possible
- All components follow existing Growthovo design system (colors, spacing, typography)
- All screens must handle empty, loading, and error states gracefully
- All interactions must feel premium and polished
- No placeholders or TODOs should remain in the final implementation
