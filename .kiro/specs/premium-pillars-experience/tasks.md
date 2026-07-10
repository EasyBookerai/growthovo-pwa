# Implementation Plan: Premium Pillars Experience

## Overview

This implementation plan transforms the Growthovo Pillars screen into a fully interactive, gamified learning platform with XP-based progression, level badges, daily challenges, and 24 educational lessons across 6 life pillars. The implementation uses TypeScript with React Native and builds on the existing PillarsScreen infrastructure without breaking changes.

## Tasks

- [x] 1. Set up core XP system and data models
  - Create TypeScript interfaces for PillarProgress, GlobalProgress, LessonData, and CompletedLessons
  - Implement XP calculation functions (calculateLevel, calculateProgress, getXPToNextLevel)
  - Create localStorage persistence utilities (savePillarProgress, loadPillarProgress, saveGlobalXP, loadGlobalXP)
  - Implement data validation and sanitization functions
  - _Requirements: 16.1, 16.2, 16.5, 18.1, 18.2_

- [x] 1.1 Write property test for level calculation from XP
  - **Property 1: Level Calculation from XP**
  - **Validates: Requirements 16.1, 16.4, 16.5**
  - Test that for any XP value 0-4999, level = floor(xp / 500) + 1
  - Test that crossing 500-boundary increments level by exactly 1

- [x] 1.2 Write property test for progress percentage calculation
  - **Property 2: Progress Percentage Calculation**
  - **Validates: Requirements 16.2, 16.3**
  - Test that for any XP value, progress = ((xp mod 500) / 500) * 100
  - Test that result is always between 0 (inclusive) and 100 (exclusive)

- [x] 1.3 Write property test for XP persistence round-trip
  - **Property 7: XP Persistence Round-Trip**
  - **Validates: Requirements 18.2, 18.5**
  - Test that any XP value saved to localStorage can be retrieved correctly
  - Test across multiple save/load cycles

- [x] 2. Implement enhanced PillarCard component
  - [x] 2.1 Add level badge display to PillarCard
    - Display "Lvl {level}" text in 12px font with purple (#7C3AED) background
    - Position badge in top-right corner of card
    - _Requirements: 1.1_
  
  - [x] 2.2 Add XP progress bar to PillarCard
    - Implement 4px height progress bar with teal (#34D399) fill
    - Add gray background (rgba(255,255,255,0.1))
    - Display "{current} / 500 XP" text in 11px muted color
    - Calculate fill width based on (current_xp / 500) * 100
    - _Requirements: 1.2, 1.3_
  
  - [x] 2.3 Add pillar-specific accent borders
    - Implement 3px left border with pillar-specific colors
    - Create color mapping: Mental Health (#A78BFA), Relationships (#F472B6), Career (#60A5FA), Fitness (#34D399), Finance (#FBBF24), Hobbies (#F87171)
    - _Requirements: 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11_
  
  - [x] 2.4 Add lesson count display
    - Display "{count} lessons" text in 11px muted color
    - Calculate count from completed lessons array
    - _Requirements: 1.4_
  
  - [x] 2.5 Implement hover animations for PillarCard
    - Add translateY(-2px) transform on hover with 200ms ease transition
    - Increase border opacity to 0.3 on hover
    - Return to original state on hover end
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.6 Write property test for pillar accent color mapping
  - **Property 3: Pillar Accent Color Mapping**
  - **Validates: Requirements 1.6-1.11**
  - Test that each pillar key maps to correct accent color
  - Test all 6 pillars

- [x] 2.7 Write unit tests for PillarCard rendering
  - Test level badge displays correct level
  - Test progress bar displays correct XP text
  - Test accent border uses correct color for each pillar
  - Test lesson count displays correctly

- [-] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Enhance DetailView modal with header and stats
  - [x] 4.1 Update DetailView header
    - Add back button with "← Pillars" text in top-left
    - Display pillar emoji at 48px size
    - Display pillar name + level in 24px bold font
    - Add full-width progress bar (8px height, teal fill)
    - Display "{current} / 500 XP to Level {next}" text below progress bar
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [x] 4.2 Implement stats row with three mini cards
    - Create horizontal row layout for stats
    - Add streak card: "🔥 {count} Day Streak"
    - Add completion card: "✅ {count} Done"
    - Add time card: "⏱ ~{minutes} min left today"
    - Position stats row below header and above daily challenge
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4.3 Write unit tests for DetailView header
  - Test header displays correct pillar information
  - Test progress bar calculates width correctly
  - Test XP text shows correct values

- [x] 4.4 Write unit tests for stats row
  - Test streak counter displays correctly
  - Test completion counter shows correct count
  - Test time estimate calculates correctly

- [ ] 5. Implement DailyChallengeCard component
  - [x] 5.1 Create DailyChallengeCard UI
    - Add teal border (2px, #34D399)
    - Display "Daily Challenge" title in bold 16px font
    - Add "+30 XP" badge with teal background
    - Implement two states: "Start Challenge →" button (purple) and "✓ Completed" text (green)
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.7_
  
  - [x] 5.2 Add pillar-specific challenge text
    - Create challenge text mapping for all 6 pillars
    - Mental Health: "Practice 5 minutes of mindful breathing today"
    - Relationships: "Send a meaningful message to someone you care about"
    - Career: "Spend 30 minutes on focused, deep work without distractions"
    - Fitness: "Complete a 10-minute workout or walk"
    - Finance: "Review your spending from the past 24 hours"
    - Hobbies: "Dedicate 15 minutes to a creative activity you enjoy"
    - _Requirements: 5.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 5.3 Implement challenge completion logic
    - Handle "Start Challenge" button press
    - Mark challenge as completed in localStorage
    - Award 30 XP via awardXP function
    - Update UI to show "✓ Completed" state
    - Implement daily reset check (reset if date changed)
    - _Requirements: 5.6, 5.8_

- [x] 5.4 Write property test for challenge completion XP award
  - **Property 5: Challenge Completion XP Award**
  - **Validates: Requirements 5.8**
  - Test that completing any daily challenge awards exactly 30 XP
  - Test across all 6 pillars

- [x] 5.5 Write unit tests for DailyChallengeCard
  - Test challenge displays correct text for each pillar
  - Test button state changes after completion
  - Test daily reset logic

- [ ] 6. Create lesson content data structure
  - [x] 6.1 Define LESSON_CONTENT constant with Mental Health lessons
    - Lesson 1: "Understanding Your Anxiety" (150-250 words, key takeaway)
    - Lesson 2: "Box Breathing in 5 Minutes" (150-250 words, key takeaway)
    - Lesson 3: "Cognitive Reframing 101" (150-250 words, key takeaway)
    - Lesson 4: "Building a Journaling Habit" (150-250 words, key takeaway)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 21.1-21.4, 22.1-22.4, 23.1-23.4, 24.1-24.4_
  
  - [x] 6.2 Add Relationships lesson content
    - Lesson 1: "Active Listening Mastery"
    - Lesson 2: "Setting Healthy Boundaries"
    - Lesson 3: "Conflict Resolution Skills"
    - Lesson 4: "Deepening Emotional Intimacy"
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [x] 6.3 Add Career lesson content
    - Lesson 1: "Defining Your Career Vision"
    - Lesson 2: "Deep Work: Focus Without Distraction"
    - Lesson 3: "Personal Branding Basics"
    - Lesson 4: "Negotiation Fundamentals"
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [x] 6.4 Add Fitness lesson content
    - Lesson 1: "Building a Sustainable Routine"
    - Lesson 2: "The Science of Sleep & Recovery"
    - Lesson 3: "Nutrition Essentials"
    - Lesson 4: "Progressive Overload Explained"
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [x] 6.5 Add Finance lesson content
    - Lesson 1: "Track Every Euro: Budgeting 101"
    - Lesson 2: "Emergency Fund: Why & How"
    - Lesson 3: "Investing Basics for Beginners"
    - Lesson 4: "Eliminating Bad Debt Fast"
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [x] 6.6 Add Hobbies lesson content
    - Lesson 1: "Finding Your Creative Flow"
    - Lesson 2: "Turning Passion into Practice"
    - Lesson 3: "Learning Any Skill Faster"
    - Lesson 4: "Building a Creative Habit"
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 6.7 Write property test for lesson content word count
  - **Property 9: Lesson Content Word Count**
  - **Validates: Requirements 19.1**
  - Test that all 24 lessons have content between 150-250 words
  - Test across all pillars

- [x] 6.8 Write property test for key takeaway word count
  - **Property 10: Key Takeaway Word Count**
  - **Validates: Requirements 19.5**
  - Test that all 24 lessons have key takeaway under 20 words
  - Test across all pillars

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement lessons list display in DetailView
  - [x] 8.1 Create lessons section header
    - Display "Lessons" title with lesson count
    - Position below daily challenge card
    - _Requirements: 7.1_
  
  - [x] 8.2 Implement LessonCard component
    - Display colored number circle (1, 2, 3, 4) using pillar accent color
    - Display lesson title in bold 15px font
    - Display metadata "5 min · Beginner" in 13px muted text
    - Implement three status indicators: "Start →" (purple), progress ring (50%), checkmark (green)
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_
  
  - [x] 8.3 Wire lessons list to LESSON_CONTENT
    - Load 4 lessons per pillar from LESSON_CONTENT constant
    - Check completed status from localStorage
    - Display appropriate status indicator based on completion state
    - _Requirements: 7.2_

- [x] 8.4 Write unit tests for lessons list
  - Test lessons section displays correct count
  - Test LessonCard displays all required elements
  - Test status indicators show correct state based on completion

- [ ] 9. Implement LessonModal component
  - [x] 9.1 Create LessonModal UI structure
    - Implement bottom sheet modal with slide-up animation
    - Add handle bar (40px width, 4px height, gray pill) at top
    - Display lesson title in bold 20px font
    - Add "5 min read" duration badge
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [x] 9.2 Render lesson content
    - Display 3-4 paragraphs from LESSON_CONTENT
    - Create key takeaway box with dark background (#1A1A2E)
    - Display "💡 Key Takeaway" label
    - Display key takeaway sentence in bold
    - _Requirements: 14.5, 14.6, 14.7, 14.8_
  
  - [x] 9.3 Add completion button
    - Display full-width button "Mark as Complete → +50 XP" in purple (#7C3AED)
    - Position at bottom of modal
    - _Requirements: 14.9_

- [x] 9.4 Write unit tests for LessonModal
  - Test modal displays lesson content correctly
  - Test key takeaway box renders properly
  - Test completion button is present

- [ ] 10. Implement lesson completion flow
  - [x] 10.1 Handle lesson completion action
    - Implement completeLesson function
    - Check if lesson already completed (idempotent)
    - Add lesson ID to completedLessons array in localStorage
    - Update pillar progress with lesson ID
    - Award 50 XP via awardXP function
    - Close modal after completion
    - _Requirements: 15.1, 15.2_
  
  - [x] 10.2 Update DetailView after lesson completion
    - Reload pillar progress from localStorage
    - Update lesson row to show green checkmark
    - Animate progress bar to reflect new XP total
    - _Requirements: 15.3, 15.4_
  
  - [x] 10.3 Add pillar completion celebration
    - Check if all 4 lessons completed
    - Display "🎉 Pillar Complete!" banner
    - Trigger level-up animation if applicable
    - _Requirements: 15.5, 15.6_

- [x] 10.4 Write property test for lesson completion XP award
  - **Property 4: Lesson Completion XP Award**
  - **Validates: Requirements 15.2**
  - Test that completing any lesson awards exactly 50 XP
  - Test across all 6 pillars and all lesson numbers

- [x] 10.5 Write property test for lesson completion persistence
  - **Property 6: Lesson Completion Persistence Round-Trip**
  - **Validates: Requirements 18.1, 18.4**
  - Test that any completed lesson ID is persisted and retrieved correctly
  - Test across multiple lessons

- [x] 10.6 Write integration tests for lesson completion flow
  - Test complete flow: open lesson → mark complete → verify XP increase
  - Test UI updates after completion
  - Test localStorage persistence

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement global XP synchronization with AppContext
  - [x] 12.1 Create syncWithAppContext function
    - Import AppContext and updateXP method
    - Implement function to propagate XP delta to AppContext
    - Add error handling with fallback to localStorage
    - _Requirements: 17.1, 17.3_
  
  - [x] 12.2 Integrate AppContext sync into awardXP
    - Call syncWithAppContext after updating local XP
    - Implement optimistic update pattern (update UI immediately, sync in background)
    - Add rollback logic if sync fails
    - _Requirements: 17.1_
  
  - [x] 12.3 Verify Home screen stat updates
    - Test that XP earned in Pillars appears on Home screen
    - Verify AppContext.xp reflects new total
    - Test cross-screen state consistency
    - _Requirements: 17.2_

- [x] 12.4 Write property test for AppContext synchronization
  - **Property 8: AppContext Synchronization**
  - **Validates: Requirements 17.1**
  - Test that any XP award propagates to AppContext correctly
  - Test that AppContext.xp matches sum of all pillar XP

- [x] 12.5 Write integration tests for global XP sync
  - Test XP flows from Pillars to AppContext to Home screen
  - Test sync works across app navigation
  - Test fallback to localStorage when AppContext unavailable

- [ ] 13. Add animations and visual polish
  - [x] 13.1 Implement level-up animation
    - Animate progress bar to 100% over 500ms
    - Reset to 0% for new level
    - Scale level badge (1.0 → 1.2 → 1.0) using spring animation
    - Display "🎉 Level {level} reached!" toast
    - Use React Native Animated API with native driver
    - _Requirements: 15.6_
  
  - [x] 13.2 Add progress bar fill animation
    - Animate progress bar width changes with 300ms ease transition
    - Use Animated.timing for smooth XP updates
    - _Requirements: 15.4_
  
  - [x] 13.3 Implement modal slide animations
    - Add slide-up animation for LessonModal (300ms ease)
    - Add slide-down animation for modal close
    - Support drag-to-close gesture on handle bar
    - _Requirements: 14.1_
  
  - [x] 13.4 Add button press feedback
    - Implement scale animation (1.0 → 0.95 → 1.0) on button press
    - Add 100ms duration with native driver
    - Apply to all interactive buttons
    - _Requirements: 20.5_

- [x] 13.5 Write unit tests for animations
  - Test level-up animation triggers correctly
  - Test progress bar animates on XP change
  - Test modal animations work properly

- [ ] 14. Implement error handling and edge cases
  - [x] 14.1 Add localStorage error handling
    - Wrap all localStorage operations in try-catch
    - Handle QuotaExceededError with data cleanup
    - Fall back to in-memory state if localStorage unavailable
    - Display user-friendly error messages
    - _Requirements: 18.1, 18.2_
  
  - [x] 14.2 Add AppContext sync error handling
    - Implement retry queue for failed syncs
    - Add exponential backoff for retries
    - Keep local state as source of truth
    - Display "Syncing..." indicator during retry
    - _Requirements: 17.1_
  
  - [x] 14.3 Implement data validation
    - Validate XP values (>= 0, integer)
    - Validate pillar keys against VALID_PILLARS array
    - Validate lesson IDs exist in LESSON_CONTENT
    - Sanitize loaded data from localStorage
    - _Requirements: 16.1_
  
  - [x] 14.4 Add idempotent operations
    - Prevent duplicate lesson completions
    - Prevent duplicate challenge completions
    - Check completion status before awarding XP
    - _Requirements: 15.1, 5.6_
  
  - [x] 14.5 Implement daily reset logic
    - Check challenge completion date on DetailView open
    - Reset challengeCompletedToday if date changed
    - Use YYYY-MM-DD format for date comparison
    - _Requirements: 5.8_

- [ ] 14.6 Write unit tests for error handling
  - Test localStorage quota exceeded scenario
  - Test AppContext sync failure and retry
  - Test data validation rejects invalid inputs
  - Test idempotent operations prevent duplicates

- [ ] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Add accessibility features
  - [x] 16.1 Add screen reader labels
    - Add accessibilityLabel to PillarCard: "{pillar} pillar. Level {level}. {xp} out of 500 XP."
    - Add accessibilityLabel to lesson cards: "{title}. {duration}. {difficulty}."
    - Add accessibilityLabel to buttons: "Complete {lesson}. Earn 50 XP."
    - Set accessibilityRole="button" on all interactive elements
    - Add accessibilityHint for non-obvious actions
    - _Requirements: 20.6_
  
  - [x] 16.2 Ensure touch target sizes
    - Verify all buttons are minimum 44x44 points
    - Verify pillar cards have sufficient height (160px)
    - Add padding to small interactive elements
    - _Requirements: 20.6_
  
  - [x] 16.3 Verify color contrast
    - Test level badge purple (#7C3AED) meets 4.5:1 ratio
    - Test XP text rgba(255,255,255,0.5) meets 4.5:1 ratio
    - Test all text colors against backgrounds
    - _Requirements: 20.1, 20.2, 20.9_
  
  - [x] 16.4 Implement reduced motion support
    - Check AccessibilityInfo.isReduceMotionEnabled()
    - Set animation duration to 0 if reduced motion enabled
    - Maintain functionality without animations
    - _Requirements: 20.5_

- [ ] 16.5 Write accessibility tests
  - Test screen reader labels are present and descriptive
  - Test touch targets meet minimum size
  - Test color contrast ratios

- [ ] 17. Optimize performance
  - [x] 17.1 Add component memoization
    - Wrap PillarCard in React.memo with custom comparison
    - Wrap LessonCard in React.memo
    - Prevent unnecessary re-renders on XP updates
    - _Requirements: 20.5_
  
  - [x] 17.2 Implement debounced localStorage writes
    - Create debounced save function (500ms delay)
    - Update in-memory cache immediately
    - Batch multiple XP updates into single write
    - _Requirements: 18.1, 18.2_
  
  - [x] 17.3 Optimize animations with native driver
    - Use useNativeDriver: true for transform animations
    - Avoid animating layout properties (width, height)
    - Use transform: scale instead of width/height changes
    - _Requirements: 20.5_
  
  - [x] 17.4 Add lazy loading for lesson content
    - Load lesson content only when modal opens
    - Show loading spinner during content load
    - Cache loaded content in component state
    - _Requirements: 19.1_

- [ ] 17.5 Write performance tests
  - Test initial render time < 100ms
  - Test modal open time < 200ms
  - Test localStorage read time < 10ms
  - Test localStorage write time < 50ms

- [ ] 18. Final integration and wiring
  - [x] 18.1 Wire all components together in PillarsScreen
    - Import all new components (PillarCard, DetailView, LessonModal, DailyChallengeCard)
    - Connect state management (useState, useEffect)
    - Implement navigation between views
    - Load initial progress from localStorage on mount
    - _Requirements: 1.1-25.5_
  
  - [x] 18.2 Add data initialization
    - Create default progress for new users
    - Initialize all 6 pillars with level 1, 0 XP
    - Set up empty completed lessons array
    - Initialize challenge completion state
    - _Requirements: 18.1, 18.2, 18.3_
  
  - [x] 18.3 Implement app foreground data refresh
    - Listen to AppState changes
    - Reload progress from localStorage on app foreground
    - Run daily reset check for challenges
    - Validate data integrity
    - _Requirements: 18.4, 18.5, 18.6_
  
  - [x] 18.4 Add design system consistency
    - Apply background colors (#1A1A2E for cards, #0A0A12 for DetailView)
    - Apply border-radius 16px to all cards
    - Apply border color rgba(255,255,255,0.08)
    - Use primary purple #7C3AED for buttons
    - Use teal #34D399 for progress indicators
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.7, 20.8, 20.9_

- [ ] 18.5 Write end-to-end integration tests
  - Test complete user flow: open pillar → complete challenge → complete lesson → verify XP
  - Test cross-screen sync: Pillars → Home screen
  - Test persistence: complete lesson → close app → reopen → verify state
  - Test all 6 pillars work correctly

- [ ] 19. Final checkpoint - Ensure all tests pass
  - Run full test suite (unit, property, integration, e2e)
  - Verify all 10 correctness properties pass
  - Fix any failing tests
  - Ensure code coverage meets 80% target
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at reasonable breaks
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests validate cross-component and cross-screen interactions
- The implementation uses TypeScript with React Native built-in APIs only (no new dependencies)
- All XP calculations follow the formula: level = floor(xp / 500) + 1
- All persistence uses localStorage with graceful fallback to in-memory state
- All animations use React Native Animated API with native driver where possible
- All components follow existing Growthovo design system (colors, spacing, typography)
