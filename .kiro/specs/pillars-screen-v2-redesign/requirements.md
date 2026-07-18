# Requirements Document: PillarsScreen V2 Redesign

## Introduction

The PillarsScreen V2 Redesign enhances the existing lesson browsing experience by implementing a refined visual design, improved lesson card layout, enhanced status indicators, pillar-specific daily challenges, and comprehensive progress tracking. This redesign focuses on creating a premium, engaging user experience that encourages daily lesson completion and maintains user motivation through clear visual feedback and gamification elements.

## Glossary

- **Pillars_Screen**: The main screen where users browse and select lessons across the 6 growth pillars
- **Filter_Chip**: A horizontal scrollable button representing one of the 6 pillars used to filter lesson content
- **Lesson_Card**: A vertical list item displaying lesson information, status, and action buttons
- **Daily_Challenge_Card**: A special card presenting a pillar-specific challenge with XP rewards
- **Status_Indicator**: A visual element showing lesson completion state (completed, in-progress, not-started)
- **Progress_Ring**: An animated circular indicator showing partial lesson completion
- **XP_System**: The experience points reward mechanism that awards 50 XP for lessons and 30 XP for challenges
- **Lesson_Modal**: A full-screen overlay displaying complete lesson content with interactive exercises
- **Pillar**: One of six life growth areas (Mental Health, Relationships, Career, Fitness, Finance, Hobbies)
- **Accent_Color**: The unique identifying color assigned to each pillar
- **Completed_Lesson**: A lesson where the user has finished all content and exercises
- **Not_Started_Lesson**: A lesson the user has not yet opened
- **In_Progress_Lesson**: A lesson the user has started but not completed

## Requirements

### Requirement 1: Display Horizontal Pillar Filter Chips

**User Story:** As a user, I want to see all 6 pillars as horizontal filter chips, so that I can quickly switch between different growth areas.

#### Acceptance Criteria

1. THE Pillars_Screen SHALL display all 6 pillars as horizontal scrollable Filter_Chips in a single row
2. WHEN a Filter_Chip is not selected, THE Pillars_Screen SHALL render it with background color #1A1A2E and text color rgba(255,255,255,0.5)
3. WHEN a Filter_Chip is selected, THE Pillars_Screen SHALL render it with the Pillar Accent_Color as background and white text color
4. THE Pillars_Screen SHALL display each Filter_Chip with the Pillar emoji and name
5. WHEN the user taps a Filter_Chip, THE Pillars_Screen SHALL update the selected pillar and refresh the lesson list within 200ms

### Requirement 2: Render Vertical Lesson List for Selected Pillar

**User Story:** As a user, I want to see a vertical list of lessons for my selected pillar, so that I can browse available learning content.

#### Acceptance Criteria

1. WHEN a Pillar is selected, THE Pillars_Screen SHALL display all lessons associated with that Pillar in a vertical scrollable list
2. THE Pillars_Screen SHALL sort lessons by their lesson number in ascending order
3. WHEN the selected Pillar changes, THE Pillars_Screen SHALL filter and display only lessons matching the new Pillar within 200ms
4. THE Pillars_Screen SHALL display between 4 and 6 lessons per Pillar
5. THE Pillars_Screen SHALL maintain scroll position when navigating between the lesson list and Lesson_Modal

### Requirement 3: Display Lesson Card with Structured Layout

**User Story:** As a user, I want to see lesson cards with clear visual hierarchy, so that I can quickly understand lesson content and status.

#### Acceptance Criteria

1. THE Lesson_Card SHALL display a colored circular icon on the left containing the lesson number in white text
2. THE Lesson_Card SHALL use the selected Pillar Accent_Color for the circular icon background
3. THE Lesson_Card SHALL display the lesson title in 15px bold white text
4. THE Lesson_Card SHALL display a subtitle showing the first 50 characters of the lesson content in 13px muted text rgba(255,255,255,0.5)
5. THE Lesson_Card SHALL display a duration badge showing lesson reading time
6. THE Lesson_Card SHALL display a Status_Indicator on the right side aligned vertically center
7. THE Lesson_Card SHALL have card background #1A1A2E, border-radius 16px, padding 16px, and margin-bottom 12px

### Requirement 4: Display Status-Specific Indicators

**User Story:** As a user, I want to see clear visual indicators of my lesson progress, so that I know which lessons I have completed, started, or not yet begun.

#### Acceptance Criteria

1. WHEN a lesson status is Completed_Lesson, THE Lesson_Card SHALL display a teal checkmark "✓" with color #34D399
2. WHEN a lesson status is Not_Started_Lesson, THE Lesson_Card SHALL display a purple "Start →" button with background color #7C3AED
3. WHEN a lesson status is In_Progress_Lesson, THE Lesson_Card SHALL display a Progress_Ring using the Pillar Accent_Color
4. THE Status_Indicator SHALL be positioned on the right side of the Lesson_Card
5. THE Status_Indicator SHALL be immediately visible without user interaction

### Requirement 5: Display Daily Challenge Card Below Lessons

**User Story:** As a user, I want to see a daily challenge specific to my selected pillar, so that I can practice growth skills and earn bonus XP.

#### Acceptance Criteria

1. THE Pillars_Screen SHALL display one Daily_Challenge_Card below the lesson list for the selected Pillar
2. THE Daily_Challenge_Card SHALL have teal accent color #34D399 for border and title text
3. THE Daily_Challenge_Card SHALL display the title "Today's [Pillar] Challenge" where [Pillar] matches the selected Pillar name
4. THE Daily_Challenge_Card SHALL display a one-sentence challenge description specific to the selected Pillar
5. THE Daily_Challenge_Card SHALL display a "+30 XP" badge with teal background color #34D399
6. THE Daily_Challenge_Card SHALL display an "Accept Challenge →" button with purple background #7C3AED
7. WHEN the selected Pillar changes, THE Daily_Challenge_Card SHALL update to show the challenge for the new Pillar within 200ms

### Requirement 6: Award XP for Lesson Completion

**User Story:** As a user, I want to earn XP when I complete lessons, so that I feel rewarded for my learning progress.

#### Acceptance Criteria

1. WHEN a user completes a lesson, THE XP_System SHALL award 50 XP to the user account
2. THE XP_System SHALL update the user total XP within 500ms of lesson completion
3. THE XP_System SHALL persist the XP award to user storage
4. WHEN a lesson is already marked as Completed_Lesson, THE XP_System SHALL NOT award additional XP for re-opening that lesson
5. THE Pillars_Screen SHALL reflect the updated lesson status as Completed_Lesson after XP is awarded

### Requirement 7: Award XP for Challenge Acceptance

**User Story:** As a user, I want to earn XP when I accept daily challenges, so that I am incentivized to complete practical growth actions.

#### Acceptance Criteria

1. WHEN a user taps "Accept Challenge →", THE XP_System SHALL award 30 XP to the user account
2. THE XP_System SHALL update the user total XP within 500ms of challenge acceptance
3. THE XP_System SHALL persist the XP award to user storage
4. THE Daily_Challenge_Card SHALL provide immediate visual feedback when the challenge is accepted

### Requirement 8: Track Lesson Progress State

**User Story:** As a user, I want my lesson progress to be saved, so that I can see which lessons I have completed and continue where I left off.

#### Acceptance Criteria

1. THE Pillars_Screen SHALL load completed lesson IDs from persistent storage on screen mount
2. WHEN a lesson is completed, THE Pillars_Screen SHALL save the lesson ID to persistent storage within 500ms
3. THE Pillars_Screen SHALL check completed lesson IDs to determine if a lesson status is Completed_Lesson
4. THE Pillars_Screen SHALL persist completed lesson data across app sessions
5. THE Pillars_Screen SHALL handle storage read failures gracefully without blocking screen render

### Requirement 9: Display Lesson Content in Modal

**User Story:** As a user, I want to view full lesson content in an overlay, so that I can read and complete lessons without losing my place in the lesson list.

#### Acceptance Criteria

1. WHEN a user taps a Lesson_Card, THE Pillars_Screen SHALL open the Lesson_Modal displaying full lesson content
2. THE Lesson_Modal SHALL display the lesson title, content paragraphs, and interactive exercises
3. THE Lesson_Modal SHALL use the selected Pillar Accent_Color for visual elements
4. WHEN the user closes the Lesson_Modal, THE Pillars_Screen SHALL return to the lesson list maintaining scroll position
5. WHEN the user completes a lesson in the Lesson_Modal, THE Pillars_Screen SHALL update the lesson status and close the modal

### Requirement 10: Apply Consistent Visual Design System

**User Story:** As a user, I want a visually consistent and premium interface, so that the app feels polished and professional.

#### Acceptance Criteria

1. THE Pillars_Screen SHALL use background color #0A0A12 for the root container
2. THE Pillars_Screen SHALL use card background #1A1A2E for all Lesson_Cards and Filter_Chips
3. THE Pillars_Screen SHALL use border-radius 16px for all cards and buttons
4. THE Pillars_Screen SHALL use muted text color rgba(255,255,255,0.5) for secondary text elements
5. THE Pillars_Screen SHALL use white #FFFFFF for primary text elements
6. THE Pillars_Screen SHALL apply consistent spacing of 12px between Lesson_Cards
7. THE Pillars_Screen SHALL use the Pillar Accent_Color for selected Filter_Chips, lesson icons, and Start buttons

### Requirement 11: Provide Responsive Touch Interactions

**User Story:** As a user, I want smooth button animations and immediate feedback, so that the interface feels responsive and engaging.

#### Acceptance Criteria

1. WHEN a user presses a Filter_Chip, THE Pillars_Screen SHALL apply a scale-down animation for visual feedback
2. WHEN a user presses a Lesson_Card, THE Pillars_Screen SHALL apply a scale-down animation for visual feedback
3. WHEN a user presses the "Accept Challenge →" button, THE Pillars_Screen SHALL apply a scale-down animation for visual feedback
4. THE Pillars_Screen SHALL complete all press animations within 150ms
5. THE Pillars_Screen SHALL maintain 60fps during scroll and animations

### Requirement 12: Display Header with Title and Subtitle

**User Story:** As a user, I want to see a clear screen header, so that I understand the purpose of the screen.

#### Acceptance Criteria

1. THE Pillars_Screen SHALL display the header title "Your Pillars" in typography.h2 style
2. THE Pillars_Screen SHALL display the subtitle "Choose your growth area" in muted text color rgba(255,255,255,0.5)
3. THE Pillars_Screen SHALL position the header above the Filter_Chips
4. THE Pillars_Screen SHALL apply consistent padding to the header section

### Requirement 13: Handle Empty Lesson States

**User Story:** As a user, I want to see helpful messaging if no lessons are available, so that I understand why content is missing.

#### Acceptance Criteria

1. WHEN a Pillar has zero lessons, THE Pillars_Screen SHALL display a message "No lessons available for this pillar"
2. WHEN lesson data fails to load, THE Pillars_Screen SHALL display an error message and retry option
3. THE Pillars_Screen SHALL render the Daily_Challenge_Card even when no lessons are available
4. THE Pillars_Screen SHALL continue to display Filter_Chips and header when no lessons are available

### Requirement 14: Maintain Accessibility Standards

**User Story:** As a user with accessibility needs, I want the screen to work with screen readers and assistive technologies, so that I can access all features.

#### Acceptance Criteria

1. THE Filter_Chip SHALL have accessibilityRole "button" and accessibilityLabel matching the Pillar name
2. THE Lesson_Card SHALL have accessibilityRole "button" and accessibilityLabel including lesson title, duration, difficulty, and status
3. THE Daily_Challenge_Card button SHALL have accessibilityRole "button" and accessibilityLabel "Accept Challenge"
4. WHEN a Filter_Chip is selected, THE Pillars_Screen SHALL set accessibilityState selected to true
5. THE Pillars_Screen SHALL ensure all interactive elements have touch target size of at least 44x44 pixels

### Requirement 15: Support Pillar-Specific Challenge Content

**User Story:** As a user, I want to see daily challenges that match my selected pillar, so that the challenges are relevant to my current learning focus.

#### Acceptance Criteria

1. WHEN the Mental Health pillar is selected, THE Daily_Challenge_Card SHALL display "Take 3 deep breaths before your next meeting or task"
2. WHEN the Relationships pillar is selected, THE Daily_Challenge_Card SHALL display "Send a genuine compliment to someone you care about"
3. WHEN the Career pillar is selected, THE Daily_Challenge_Card SHALL display "Spend 10 minutes updating your resume or LinkedIn"
4. WHEN the Fitness pillar is selected, THE Daily_Challenge_Card SHALL display "Do 20 bodyweight squats or a 5-minute walk"
5. WHEN the Finance pillar is selected, THE Daily_Challenge_Card SHALL display "Review your last 3 purchases and categorize them"
6. WHEN the Hobbies pillar is selected, THE Daily_Challenge_Card SHALL display "Dedicate 15 minutes to something purely for fun"

