# Requirements Document: Premium Pillars Experience

## Introduction

This feature transforms the Growthovo Pillars screen from a static grid display into a fully interactive, premium growth experience. The current implementation shows 6 pillar cards with basic progress indicators and a modal detail view. This upgrade adds level badges, XP progress tracking, daily challenges, lesson content, and persistent progress storage to create an engaging, gamified learning journey across 6 life pillars: Mental Health, Relationships, Career, Fitness, Finance, and Hobbies.

## Glossary

- **Pillar_Card**: A visual card component representing one of the 6 growth pillars, displayed in the main grid view
- **Detail_View**: The full-screen interface shown when a Pillar_Card is tapped, containing lessons, challenges, and stats
- **XP_System**: Experience point tracking mechanism that awards points for completing lessons and challenges
- **Level_Badge**: Visual indicator showing the user's current level (1-10) for a specific pillar
- **Progress_Bar**: Visual component displaying XP progress toward the next level (0-500 XP per level)
- **Daily_Challenge**: A pillar-specific task that awards bonus XP when completed, resets daily
- **Lesson**: Educational content unit with title, duration, difficulty, and completion status
- **Lesson_Modal**: Bottom sheet interface displaying lesson content and completion button
- **Streak_Counter**: Metric tracking consecutive days of activity in a pillar
- **Storage_Service**: LocalStorage-based persistence layer for XP, completed lessons, and challenge state
- **App_Context**: React Context providing global state management for XP and progress data
- **Accent_Color**: Pillar-specific color used for borders, badges, and visual theming

## Requirements

### Requirement 1: Enhanced Pillar Card Display

**User Story:** As a user, I want to see my progress and level at a glance on each pillar card, so that I can quickly understand my growth status without opening the detail view.

#### Acceptance Criteria

1. THE Pillar_Card SHALL display a Level_Badge showing "Lvl 1" in purple (#7C3AED) with 12px font size
2. THE Pillar_Card SHALL display a Progress_Bar with 4px height, teal (#34D399) fill color, and gray background (rgba(255,255,255,0.1))
3. THE Pillar_Card SHALL display XP progress text "0 / 500 XP" in 11px muted text (rgba(255,255,255,0.5))
4. THE Pillar_Card SHALL display lesson count text "4 lessons" in 11px muted text
5. THE Pillar_Card SHALL display a left border accent in the pillar's Accent_Color with 3px width
6. WHERE the pillar is Mental Health, THE Pillar_Card SHALL use Accent_Color #A78BFA
7. WHERE the pillar is Relationships, THE Pillar_Card SHALL use Accent_Color #F472B6
8. WHERE the pillar is Career, THE Pillar_Card SHALL use Accent_Color #60A5FA
9. WHERE the pillar is Fitness, THE Pillar_Card SHALL use Accent_Color #34D399
10. WHERE the pillar is Finance, THE Pillar_Card SHALL use Accent_Color #FBBF24
11. WHERE the pillar is Hobbies, THE Pillar_Card SHALL use Accent_Color #F87171

### Requirement 2: Interactive Card Feedback

**User Story:** As a user, I want visual feedback when I interact with pillar cards, so that I know my tap was registered and the interface feels responsive.

#### Acceptance Criteria

1. WHEN a user hovers over a Pillar_Card, THE Pillar_Card SHALL translate upward by 2px within 200ms
2. WHEN a user hovers over a Pillar_Card, THE Pillar_Card SHALL brighten its border color by increasing opacity to 0.3 within 200ms
3. WHEN a user stops hovering, THE Pillar_Card SHALL return to its original position within 200ms
4. THE Pillar_Card SHALL apply all hover transitions with ease timing function

### Requirement 3: Detail View Header Enhancement

**User Story:** As a user, I want to see my level, XP progress, and pillar information prominently in the detail view, so that I understand my current status before engaging with lessons.

#### Acceptance Criteria

1. THE Detail_View SHALL display a back button with text "← Pillars" in the top-left corner
2. THE Detail_View SHALL display the pillar emoji at 48px size
3. THE Detail_View SHALL display the pillar name at 24px bold font
4. THE Detail_View SHALL display "Level 1" text next to the pillar name
5. THE Detail_View SHALL display a full-width Progress_Bar with 8px height and teal fill
6. THE Detail_View SHALL display XP progress text "0 / 500 XP to Level 2" below the Progress_Bar

### Requirement 4: Streak and Statistics Display

**User Story:** As a user, I want to see my activity streak and completion statistics, so that I can track my consistency and progress over time.

#### Acceptance Criteria

1. THE Detail_View SHALL display a streak counter showing "🔥 0 Day Streak"
2. THE Detail_View SHALL display a completion counter showing "✅ 0 Done"
3. THE Detail_View SHALL display an estimated time remaining showing "⏱ ~20 min left today"
4. THE Detail_View SHALL arrange the three statistics in a horizontal row of mini cards
5. THE Detail_View SHALL position the statistics row below the header and above the daily challenge

### Requirement 5: Daily Challenge Card

**User Story:** As a user, I want to complete a daily challenge specific to each pillar, so that I can earn bonus XP and build consistent habits.

#### Acceptance Criteria

1. THE Detail_View SHALL display a Daily_Challenge card with teal border (2px, #34D399)
2. THE Daily_Challenge SHALL display the title "Daily Challenge" in bold 16px font
3. THE Daily_Challenge SHALL display a pillar-specific challenge description in one sentence
4. THE Daily_Challenge SHALL display a "+30 XP" badge in teal background
5. WHEN the Daily_Challenge is not completed, THE Daily_Challenge SHALL display a "Start Challenge →" button in purple (#7C3AED)
6. WHEN a user taps "Start Challenge →", THE Daily_Challenge SHALL mark itself as completed
7. WHEN the Daily_Challenge is completed, THE Daily_Challenge SHALL display "✓ Completed" text in green (#34D399)
8. WHEN the Daily_Challenge is completed, THE XP_System SHALL award 30 XP to the user
9. THE Daily_Challenge SHALL position itself below the statistics row and above the lessons list

### Requirement 6: Pillar-Specific Challenge Content

**User Story:** As a user, I want daily challenges that are relevant to each pillar, so that the challenges feel meaningful and aligned with my growth goals.

#### Acceptance Criteria

1. WHERE the pillar is Mental Health, THE Daily_Challenge SHALL display "Practice 5 minutes of mindful breathing today"
2. WHERE the pillar is Relationships, THE Daily_Challenge SHALL display "Send a meaningful message to someone you care about"
3. WHERE the pillar is Career, THE Daily_Challenge SHALL display "Spend 30 minutes on focused, deep work without distractions"
4. WHERE the pillar is Fitness, THE Daily_Challenge SHALL display "Complete a 10-minute workout or walk"
5. WHERE the pillar is Finance, THE Daily_Challenge SHALL display "Review your spending from the past 24 hours"
6. WHERE the pillar is Hobbies, THE Daily_Challenge SHALL display "Dedicate 15 minutes to a creative activity you enjoy"

### Requirement 7: Lessons List Display

**User Story:** As a user, I want to see a list of available lessons for each pillar, so that I can choose what to learn and track my progress.

#### Acceptance Criteria

1. THE Detail_View SHALL display a section header "Lessons" with lesson count "4 lessons"
2. THE Detail_View SHALL display exactly 4 lessons per pillar
3. THE Detail_View SHALL display each lesson as a card with colored number circle (1, 2, 3, 4)
4. THE Detail_View SHALL use the pillar's Accent_Color for the lesson number circle background
5. THE Detail_View SHALL display the lesson title in bold 15px font
6. THE Detail_View SHALL display lesson metadata "5 min · Beginner" in 13px muted text
7. WHEN a lesson is not started, THE Detail_View SHALL display "Start →" in purple on the right side
8. WHEN a lesson is in progress, THE Detail_View SHALL display a progress ring showing 50% completion
9. WHEN a lesson is completed, THE Detail_View SHALL display a green checkmark (✓) on the right side

### Requirement 8: Mental Health Lesson Content

**User Story:** As a user, I want to learn about mental health topics, so that I can improve my emotional well-being and stress management.

#### Acceptance Criteria

1. WHERE the pillar is Mental Health, THE Detail_View SHALL display lesson 1 titled "Understanding Your Anxiety"
2. WHERE the pillar is Mental Health, THE Detail_View SHALL display lesson 2 titled "Box Breathing in 5 Minutes"
3. WHERE the pillar is Mental Health, THE Detail_View SHALL display lesson 3 titled "Cognitive Reframing 101"
4. WHERE the pillar is Mental Health, THE Detail_View SHALL display lesson 4 titled "Building a Journaling Habit"

### Requirement 9: Relationships Lesson Content

**User Story:** As a user, I want to learn about relationship skills, so that I can build stronger connections and communicate more effectively.

#### Acceptance Criteria

1. WHERE the pillar is Relationships, THE Detail_View SHALL display lesson 1 titled "Active Listening Mastery"
2. WHERE the pillar is Relationships, THE Detail_View SHALL display lesson 2 titled "Setting Healthy Boundaries"
3. WHERE the pillar is Relationships, THE Detail_View SHALL display lesson 3 titled "Conflict Resolution Skills"
4. WHERE the pillar is Relationships, THE Detail_View SHALL display lesson 4 titled "Deepening Emotional Intimacy"

### Requirement 10: Career Lesson Content

**User Story:** As a user, I want to learn about career development, so that I can advance professionally and achieve my work goals.

#### Acceptance Criteria

1. WHERE the pillar is Career, THE Detail_View SHALL display lesson 1 titled "Defining Your Career Vision"
2. WHERE the pillar is Career, THE Detail_View SHALL display lesson 2 titled "Deep Work: Focus Without Distraction"
3. WHERE the pillar is Career, THE Detail_View SHALL display lesson 3 titled "Personal Branding Basics"
4. WHERE the pillar is Career, THE Detail_View SHALL display lesson 4 titled "Negotiation Fundamentals"

### Requirement 11: Fitness Lesson Content

**User Story:** As a user, I want to learn about fitness and health, so that I can build sustainable exercise habits and improve my physical well-being.

#### Acceptance Criteria

1. WHERE the pillar is Fitness, THE Detail_View SHALL display lesson 1 titled "Building a Sustainable Routine"
2. WHERE the pillar is Fitness, THE Detail_View SHALL display lesson 2 titled "The Science of Sleep & Recovery"
3. WHERE the pillar is Fitness, THE Detail_View SHALL display lesson 3 titled "Nutrition Essentials"
4. WHERE the pillar is Fitness, THE Detail_View SHALL display lesson 4 titled "Progressive Overload Explained"

### Requirement 12: Finance Lesson Content

**User Story:** As a user, I want to learn about personal finance, so that I can manage my money effectively and build financial security.

#### Acceptance Criteria

1. WHERE the pillar is Finance, THE Detail_View SHALL display lesson 1 titled "Track Every Euro: Budgeting 101"
2. WHERE the pillar is Finance, THE Detail_View SHALL display lesson 2 titled "Emergency Fund: Why & How"
3. WHERE the pillar is Finance, THE Detail_View SHALL display lesson 3 titled "Investing Basics for Beginners"
4. WHERE the pillar is Finance, THE Detail_View SHALL display lesson 4 titled "Eliminating Bad Debt Fast"

### Requirement 13: Hobbies Lesson Content

**User Story:** As a user, I want to learn about developing hobbies and creative pursuits, so that I can enrich my life with meaningful activities.

#### Acceptance Criteria

1. WHERE the pillar is Hobbies, THE Detail_View SHALL display lesson 1 titled "Finding Your Creative Flow"
2. WHERE the pillar is Hobbies, THE Detail_View SHALL display lesson 2 titled "Turning Passion into Practice"
3. WHERE the pillar is Hobbies, THE Detail_View SHALL display lesson 3 titled "Learning Any Skill Faster"
4. WHERE the pillar is Hobbies, THE Detail_View SHALL display lesson 4 titled "Building a Creative Habit"

### Requirement 14: Lesson Modal Interface

**User Story:** As a user, I want to read lesson content in a focused modal interface, so that I can learn without distractions and mark lessons as complete.

#### Acceptance Criteria

1. WHEN a user taps "Start →" on a lesson, THE Lesson_Modal SHALL slide up from the bottom
2. THE Lesson_Modal SHALL display a handle bar (short gray pill) at the top for drag-to-close gesture
3. THE Lesson_Modal SHALL display the lesson title in bold 20px font
4. THE Lesson_Modal SHALL display a "5 min read" badge next to the title
5. THE Lesson_Modal SHALL display 3-4 paragraphs of educational content
6. THE Lesson_Modal SHALL display a key takeaway box with dark background (#1A1A2E)
7. THE Lesson_Modal SHALL display "💡 Key Takeaway" label in the takeaway box
8. THE Lesson_Modal SHALL display one bold sentence summarizing the key learning
9. THE Lesson_Modal SHALL display a full-width button "Mark as Complete → +50 XP" in purple (#7C3AED)

### Requirement 15: Lesson Completion Flow

**User Story:** As a user, I want to mark lessons as complete and earn XP, so that I can track my progress and feel rewarded for learning.

#### Acceptance Criteria

1. WHEN a user taps "Mark as Complete → +50 XP", THE Lesson_Modal SHALL close
2. WHEN a lesson is marked complete, THE XP_System SHALL award 50 XP to the user
3. WHEN a lesson is marked complete, THE Detail_View SHALL update the lesson row to show a green checkmark
4. WHEN a lesson is marked complete, THE Progress_Bar SHALL animate to reflect the new XP total
5. WHEN all 4 lessons in a pillar are completed, THE Detail_View SHALL display a "🎉 Pillar Complete!" celebration banner
6. WHEN all 4 lessons are completed, THE Detail_View SHALL trigger a level-up animation

### Requirement 16: XP Progress Calculation

**User Story:** As a user, I want my XP to accumulate and contribute to leveling up, so that I can see tangible progress in my growth journey.

#### Acceptance Criteria

1. THE XP_System SHALL require 500 XP to advance from Level 1 to Level 2
2. THE XP_System SHALL calculate progress percentage as (current_xp / 500) * 100
3. WHEN XP is awarded, THE Progress_Bar SHALL update its fill width to match the new percentage
4. WHEN XP reaches 500, THE XP_System SHALL increment the level by 1
5. WHEN the level increments, THE XP_System SHALL reset current XP to 0 and require 500 XP for the next level

### Requirement 17: Global XP Synchronization

**User Story:** As a user, I want my XP earned in Pillars to update my overall stats on the Home screen, so that my progress is consistent across the app.

#### Acceptance Criteria

1. WHEN XP is awarded in the Pillars screen, THE XP_System SHALL update the App_Context with the new XP total
2. WHEN the App_Context is updated, THE Home screen stat cards SHALL reflect the new XP value
3. IF App_Context does not exist, THE XP_System SHALL use Storage_Service as fallback

### Requirement 18: Progress Persistence

**User Story:** As a user, I want my progress to be saved automatically, so that I don't lose my XP, completed lessons, or challenge status when I close the app.

#### Acceptance Criteria

1. WHEN a lesson is completed, THE Storage_Service SHALL persist the lesson ID to localStorage key 'growthovo_completed_lessons'
2. WHEN XP is awarded, THE Storage_Service SHALL persist the new XP total to localStorage key 'growthovo_xp'
3. WHEN a Daily_Challenge is completed, THE Storage_Service SHALL persist the completion timestamp to localStorage
4. WHEN the Pillars screen loads, THE Storage_Service SHALL retrieve completed lessons from localStorage
5. WHEN the Pillars screen loads, THE Storage_Service SHALL retrieve XP total from localStorage
6. WHEN the Pillars screen loads, THE Storage_Service SHALL retrieve challenge completion status from localStorage

### Requirement 19: Lesson Content Quality

**User Story:** As a user, I want lesson content to be informative and actionable, so that I gain real value from reading and can apply what I learn.

#### Acceptance Criteria

1. THE Lesson_Modal SHALL display content with 3-4 paragraphs totaling 150-250 words
2. THE Lesson_Modal SHALL include practical examples or actionable steps in the content
3. THE Lesson_Modal SHALL avoid placeholder text (lorem ipsum) in all lessons
4. THE Lesson_Modal SHALL write content at a beginner-friendly reading level (Grade 8-10)
5. THE Lesson_Modal SHALL ensure the key takeaway is a single, memorable sentence under 20 words

### Requirement 20: Design System Consistency

**User Story:** As a user, I want the premium pillars experience to match the existing app design, so that the interface feels cohesive and professional.

#### Acceptance Criteria

1. THE Pillar_Card SHALL use background color #1A1A2E
2. THE Detail_View SHALL use background color #0A0A12
3. THE Pillar_Card SHALL use border-radius 16px
4. THE Pillar_Card SHALL use border color rgba(255,255,255,0.08) with 1px width
5. THE Detail_View SHALL apply 0.2s ease transitions to all interactive elements
6. THE Detail_View SHALL ensure mobile-first responsive design works at 390px width
7. THE Detail_View SHALL use primary purple #7C3AED for buttons and interactive elements
8. THE Detail_View SHALL use light purple #A78BFA for secondary accents
9. THE Detail_View SHALL use teal #34D399 for progress indicators and success states

### Requirement 21: Mental Health Lesson 1 Content

**User Story:** As a user, I want to learn about anxiety, so that I can recognize and manage anxious feelings more effectively.

#### Acceptance Criteria

1. WHERE the lesson is "Understanding Your Anxiety", THE Lesson_Modal SHALL display content explaining what anxiety is and how it manifests
2. WHERE the lesson is "Understanding Your Anxiety", THE Lesson_Modal SHALL display content describing common physical symptoms (racing heart, shallow breathing, tension)
3. WHERE the lesson is "Understanding Your Anxiety", THE Lesson_Modal SHALL display content explaining that anxiety is a normal stress response
4. WHERE the lesson is "Understanding Your Anxiety", THE Lesson_Modal SHALL display key takeaway "Anxiety is your body's alarm system—it's not dangerous, just uncomfortable"

### Requirement 22: Mental Health Lesson 2 Content

**User Story:** As a user, I want to learn a quick breathing technique, so that I can calm myself during stressful moments.

#### Acceptance Criteria

1. WHERE the lesson is "Box Breathing in 5 Minutes", THE Lesson_Modal SHALL display content explaining the box breathing technique (4-4-4-4 pattern)
2. WHERE the lesson is "Box Breathing in 5 Minutes", THE Lesson_Modal SHALL display step-by-step instructions (inhale 4 seconds, hold 4, exhale 4, hold 4)
3. WHERE the lesson is "Box Breathing in 5 Minutes", THE Lesson_Modal SHALL display content explaining when to use this technique (stress, anxiety, before sleep)
4. WHERE the lesson is "Box Breathing in 5 Minutes", THE Lesson_Modal SHALL display key takeaway "Four counts in, hold, out, hold—your portable calm button"

### Requirement 23: Mental Health Lesson 3 Content

**User Story:** As a user, I want to learn how to reframe negative thoughts, so that I can develop a more balanced perspective.

#### Acceptance Criteria

1. WHERE the lesson is "Cognitive Reframing 101", THE Lesson_Modal SHALL display content explaining what cognitive reframing is
2. WHERE the lesson is "Cognitive Reframing 101", THE Lesson_Modal SHALL display an example of reframing a negative thought into a balanced one
3. WHERE the lesson is "Cognitive Reframing 101", THE Lesson_Modal SHALL display content explaining the difference between reframing and toxic positivity
4. WHERE the lesson is "Cognitive Reframing 101", THE Lesson_Modal SHALL display key takeaway "Change the story, change the feeling—same facts, better frame"

### Requirement 24: Mental Health Lesson 4 Content

**User Story:** As a user, I want to learn how to start journaling, so that I can process my thoughts and emotions regularly.

#### Acceptance Criteria

1. WHERE the lesson is "Building a Journaling Habit", THE Lesson_Modal SHALL display content explaining the mental health benefits of journaling
2. WHERE the lesson is "Building a Journaling Habit", THE Lesson_Modal SHALL display 3 simple journaling prompts to get started
3. WHERE the lesson is "Building a Journaling Habit", THE Lesson_Modal SHALL display content recommending a specific time of day (morning or evening)
4. WHERE the lesson is "Building a Journaling Habit", THE Lesson_Modal SHALL display key takeaway "Five minutes, three sentences, one habit—that's all you need"

### Requirement 25: No External Dependencies

**User Story:** As a developer, I want to implement this feature without adding new npm packages, so that the app bundle size remains small and dependencies are minimized.

#### Acceptance Criteria

1. THE implementation SHALL use only existing dependencies from package.json
2. THE implementation SHALL NOT install new animation libraries
3. THE implementation SHALL NOT install new state management libraries
4. THE implementation SHALL use React Native's built-in Animated API for animations
5. THE implementation SHALL use localStorage directly for persistence without wrapper libraries
