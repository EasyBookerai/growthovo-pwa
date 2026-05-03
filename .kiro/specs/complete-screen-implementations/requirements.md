# Requirements Document: Complete Screen Implementations

## Introduction

This document specifies the functional and non-functional requirements for implementing complete, functional screen implementations for the Growthovo PWA. The feature includes four main tab screens (PillarsScreen, RexScreen, LeagueScreen, ProfileScreen), shared state management via AppContext, and a daily check-in modal with XP rewards. All screens must match the existing dark theme and provide meaningful, scrollable content.

## Functional Requirements

### 1. PillarsScreen Implementation

1.1 The system SHALL display 6 pillar cards in a 2-column grid layout with the following pillars: Mental (🧠), Relations (💬), Career (💼), Fitness (💪), Finance (💰), Hobbies (🎨)

1.2 Each pillar card SHALL display: dark background (#1A1A2E), pillar emoji, pillar name, and a placeholder progress bar

1.3 WHEN a user taps a pillar card THEN the system SHALL open a detail view displaying 3-4 lesson titles for that pillar

1.4 The pillar detail view SHALL fetch lessons from Supabase based on the selected pillar's units

1.5 The pillar detail view SHALL display lessons in a scrollable list with the pillar's theme color

1.6 IF no lessons are available for a pillar THEN the system SHALL display an empty state message "No lessons available yet"

### 2. RexScreen (AI Chat) Implementation

2.1 The system SHALL display a chat UI matching the app's dark theme (#0A0A12 background, #1A1A2E cards)

2.2 The system SHALL pre-load 3 welcome messages from "Rex" when the screen opens:
   - "Hey Champion! 👋 Ready to grow today?"
   - "I'm here to support you across all 6 areas of your life."
   - "What's on your mind? Or pick a topic below 👇"

2.3 The system SHALL provide a text input field and send button at the bottom of the screen

2.4 The system SHALL implement 5 hardcoded keyword-based responses:
   - "anxious" → breathing tip response
   - "focus" → productivity tip response
   - "motivate" → motivational response
   - "relationship" → relationship advice response
   - "career" → career help response

2.5 The system SHALL display a typing indicator (animated dots) for 1 second before Rex replies

2.6 The system SHALL auto-scroll to the latest message when new messages are added

2.7 The system SHALL display user messages in purple bubbles (#7C3AED) aligned to the right

2.8 The system SHALL display Rex messages in dark purple bubbles (rgba(124,58,237,0.2)) aligned to the left with Rex avatar

### 3. LeagueScreen (Leaderboard) Implementation

3.1 The system SHALL display a "Weekly League 🏆" header with a countdown badge showing time remaining

3.2 The system SHALL display a user rank card showing:
   - "YOUR RANK" label
   - "Bronze League" badge
   - Rank #12
   - 340 XP
   - Progress bar showing "160 XP to rank up"

3.3 The system SHALL display a leaderboard with 10 rows containing fake names and XP values for ranks 1-10

3.4 The leaderboard SHALL display medals for top 3 ranks: 🥇 (rank 1), 🥈 (rank 2), 🥉 (rank 3)

3.5 The system SHALL display the current user's row at rank #12 with 340 XP, highlighted in purple background (rgba(124,58,237,0.15))

3.6 The system SHALL display a "Your Squad" section with 3 squad members showing online/offline status

3.7 The system SHALL provide an "Invite a Friend →" button with dashed purple border

### 4. ProfileScreen Implementation

4.1 The system SHALL display a circular avatar with the letter "C" on purple background (#7C3AED)

4.2 The system SHALL display "Champion" as the username

4.3 The system SHALL display 3 stats in a horizontal row:
   - Total XP (from AppContext)
   - Day Streak (from AppContext)
   - Lessons Done (from database or hardcoded)

4.4 The system SHALL display a settings list with the following items:
   - Edit Profile (✏️)
   - Notification Settings (🔔)
   - Language (🌐) with current value "English"
   - Privacy & Data (🔒)
   - Help Center (❓)
   - Rate Growthovo (⭐)

4.5 The system SHALL display a "Log Out" button with red text (#EF4444) and red border

4.6 WHEN a user taps "Log Out" THEN the system SHALL show a confirmation alert before signing out

4.7 The system SHALL display a legal footer with app version and legal docs version

### 5. AppContext (Shared State) Implementation

5.1 The system SHALL create an AppContext providing global state for: xp (number), streak (number), level (number)

5.2 The AppContext SHALL provide an updateXP function that:
   - Updates the xp state by the given amount
   - Recalculates level as Math.floor(xp / 100) + 1
   - Syncs the new xp value to Supabase users table

5.3 The AppContext SHALL provide a refreshUserData function that fetches current xp and streak from Supabase

5.4 The HomeScreen stat cards SHALL read xp, streak, and level from AppContext

5.5 The ProfileScreen stats SHALL read xp and streak from AppContext

5.6 WHEN AppContext state changes THEN all consuming components SHALL automatically re-render with updated values

### 6. Check-In Feature Implementation

6.1 The HomeScreen SHALL display a "Start Daily Check-in →" button

6.2 WHEN a user taps "Start Daily Check-in" THEN the system SHALL open a modal with 3 steps

6.3 Step 1 SHALL display a mood picker with 5 emoji options: 😔 😐 🙂 😊 🤩

6.4 Step 2 SHALL display a text input with the prompt "What's your focus today?"

6.5 Step 3 SHALL display a completion screen

6.6 WHEN a user completes all 3 steps THEN the system SHALL:
   - Award +50 XP via AppContext.updateXP(50)
   - Close the modal
   - Show an XP gain animation (+50 XP floating text)
   - Update the HomeScreen XP stat card to reflect the new value

6.7 The check-in modal SHALL validate that mood is selected and focus text is non-empty before allowing completion

6.8 The system SHALL save check-in data (mood, focus, intention, xp_awarded) to Supabase check_ins table

### 7. Theme Consistency Requirements

7.1 All screens SHALL use the dark theme with:
   - Background: #0A0A12
   - Card background: #1A1A2E
   - Primary purple: #7C3AED
   - Light purple: #A78BFA
   - Text: #FFFFFF
   - Muted text: rgba(255,255,255,0.5)

7.2 All screens SHALL be scrollable with SafeAreaView and proper padding

7.3 All interactive elements SHALL provide visual feedback (opacity change, color change) on press

### 8. Navigation Requirements

8.1 The system SHALL use the existing React Navigation bottom tab navigator

8.2 All screens SHALL receive userId and subscriptionStatus props from the parent navigator

8.3 The PillarsScreen SHALL support navigation to a pillar detail view (modal or stack screen)

8.4 The ProfileScreen settings items SHALL navigate to respective screens when tapped (future implementation)

## Non-Functional Requirements

### 9. Performance Requirements

9.1 Screen render time SHALL be less than 100ms

9.2 Check-in modal open/close animation SHALL complete within 200ms

9.3 Rex response time SHALL be 1.5 seconds (including 1s typing indicator)

9.4 Pillar detail view SHALL load lessons within 500ms

9.5 All screens SHALL use FlatList or ScrollView with proper optimization for lists with more than 10 items

### 10. Usability Requirements

10.1 All screens SHALL be fully functional, not blank placeholders

10.2 All screens SHALL provide meaningful content (real or fake data)

10.3 All interactive elements SHALL have clear visual affordances (buttons, cards, inputs)

10.4 Error states SHALL display user-friendly messages, not technical errors

10.5 Loading states SHALL display activity indicators with descriptive text

### 11. Maintainability Requirements

11.1 The system SHALL NOT introduce new npm packages unless absolutely necessary

11.2 All components SHALL follow existing codebase patterns and conventions

11.3 All components SHALL use the existing theme constants from src/theme

11.4 All TypeScript interfaces SHALL be properly typed with no 'any' types except for navigation props

11.5 All Supabase queries SHALL use parameterized queries to prevent SQL injection

### 12. Compatibility Requirements

12.1 All screens SHALL work on web (PWA) as the primary platform

12.2 All screens SHALL work on iOS and Android (React Native)

12.3 All screens SHALL handle different screen sizes responsively

12.4 All screens SHALL support dark mode only (no light mode required)

### 13. Security Requirements

13.1 All Supabase queries SHALL use authenticated userId from session

13.2 All user inputs SHALL be validated before saving to database

13.3 User-generated content SHALL be sanitized before rendering to prevent XSS

13.4 Check-in submissions SHALL be rate-limited to once per day per user

13.5 Leaderboard SHALL NOT expose real user data (use fake names for other users)

### 14. Data Requirements

14.1 The system SHALL persist xp and streak values to Supabase users table

14.2 The system SHALL persist check-in data to Supabase check_ins table

14.3 The system SHALL fetch pillar lessons from Supabase pillars, units, and lessons tables

14.4 The system SHALL handle Supabase connection failures gracefully with error messages

14.5 The system SHALL retry failed Supabase updates on next app foreground event

## Acceptance Criteria

### AC1: PillarsScreen

- [ ] 6 pillar cards are displayed in a 2-column grid
- [ ] Each card shows emoji, name, and progress bar
- [ ] Tapping a card opens detail view with 3-4 lesson titles
- [ ] Empty state is shown if no lessons available

### AC2: RexScreen

- [ ] 3 welcome messages are pre-loaded from Rex
- [ ] Text input and send button are functional
- [ ] 5 keyword responses work correctly (anxious, focus, motivate, relationship, career)
- [ ] Typing indicator shows for 1s before Rex replies
- [ ] Chat auto-scrolls to latest message

### AC3: LeagueScreen

- [ ] "Weekly League 🏆" header is displayed
- [ ] User rank card shows Rank #12, 340 XP, Bronze League
- [ ] Leaderboard shows 10 rows with fake names and XP
- [ ] User row is highlighted in purple
- [ ] Squad section shows 3 members with online status

### AC4: ProfileScreen

- [ ] Avatar circle with "C" is displayed
- [ ] "Champion" username is shown
- [ ] 3 stats (XP, Streak, Lessons) are displayed
- [ ] Settings list has 6 items
- [ ] "Log Out" button is red and shows confirmation alert

### AC5: AppContext

- [ ] AppContext provides xp, streak, level state
- [ ] updateXP function updates state and syncs to Supabase
- [ ] HomeScreen stat cards read from AppContext
- [ ] ProfileScreen stats read from AppContext

### AC6: Check-In Feature

- [ ] "Start Daily Check-in →" button opens modal
- [ ] Modal has 3 steps: mood picker, focus input, completion
- [ ] Completing check-in awards +50 XP
- [ ] XP stat card updates live after check-in
- [ ] XP gain animation is shown

### AC7: Theme Consistency

- [ ] All screens use dark theme colors (#0A0A12, #1A1A2E, #7C3AED, #A78BFA)
- [ ] All screens are scrollable with proper padding
- [ ] All interactive elements provide visual feedback

## Out of Scope

The following items are explicitly out of scope for this feature:

1. Real AI integration for Rex (using hardcoded keyword responses instead)
2. Real leaderboard data from Supabase (using fake data instead)
3. Actual lesson player implementation (detail view shows lesson titles only)
4. Settings screen implementations (Edit Profile, Notifications, Language, etc.)
5. Squad invite functionality (button is placeholder)
6. Achievement badge unlock logic (showing static locked/unlocked states)
7. Real-time leaderboard updates
8. Push notifications for check-in reminders
9. Multi-language support (English only for now)
10. Light mode theme
