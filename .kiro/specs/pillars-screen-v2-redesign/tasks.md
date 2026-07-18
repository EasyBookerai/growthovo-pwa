# Implementation Plan: PillarsScreen V2 Redesign

## Overview

The PillarsScreen V2 is already implemented with most features working. This plan focuses on **refinement, polish, and production readiness** rather than building from scratch. Tasks include visual accuracy, animation smoothness, accessibility compliance, error handling, and comprehensive testing.

**Current Status**: ✅ Core features implemented
- Horizontal filter chips working
- Vertical lesson list with filtering
- Daily challenge card present
- Lesson modal integration
- XP system connected
- Progress tracking operational

**Focus Areas**: Visual polish, accessibility, error handling, testing, performance optimization

---

## Tasks

### 1. Visual Refinement and Spec Compliance

- [x] 1.1 Audit and fix color values to match design spec exactly
  - Verify root background is `#0A0A12` (not slightly different)
  - Verify card background is `#1A1A2E`
  - Verify muted text uses `rgba(255,255,255,0.5)`
  - Verify border color uses `rgba(255,255,255,0.08)`
  - Verify completed checkmark uses `#34D399`
  - Verify challenge card background uses `rgba(52, 211, 153, 0.15)` with `2px` teal border
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 1.2 Audit typography and ensure all text styles match design spec
  - Verify lesson title is `15px` bold weight `700`
  - Verify lesson subtitle is `13px` with muted color
  - Verify duration/difficulty is `12px` weight `600`
  - Verify header title uses `typography.h2` (28px)
  - Verify header subtitle is `15px` muted
  - _Requirements: 3.3, 3.4, 12.1, 12.2_

- [x] 1.3 Audit spacing and padding to ensure consistency
  - Verify card margin-bottom is exactly `12px`
  - Verify card padding is exactly `16px`
  - Verify filter chip gap is `8px`
  - Verify header padding matches design spec
  - Verify all cards use `borderRadius: 16`
  - _Requirements: 3.7, 10.6, 10.7, 12.4_

- [ ] 1.4 Create visual regression snapshot tests
  - Snapshot FilterChip (selected and unselected states)
  - Snapshot LessonCard (all three status states)
  - Snapshot DailyChallengeCard
  - Snapshot full PillarsScreen with mock data
  - _Requirements: 10.1-10.7_

### 2. Status Indicator Polish

- [x] 2.1 Refine completed checkmark styling
  - Ensure checkmark `✓` is centered in 32px circle
  - Verify teal color `#34D399` matches spec
  - Verify checkmark size is readable (20px font)
  - Test against different screen sizes
  - _Requirements: 4.1, 4.4_

- [x] 2.2 Implement progress ring animation for in-progress lessons
  - Add rotation animation to progress ring (360deg over 2s, loop)
  - Ensure animation uses pillar accent color
  - Optimize animation to maintain 60fps
  - Add `useEffect` cleanup to stop animation on unmount
  - _Requirements: 4.3, 4.4, 11.5_

- [x] 2.3 Refine "Start →" button styling
  - Verify button uses pillar accent color (not hardcoded purple)
  - Ensure arrow symbol renders correctly on all platforms
  - Verify button padding and border-radius match spec
  - Test button visibility on various screen sizes
  - _Requirements: 4.2, 4.4_

- [~] 2.4 Write unit tests for status indicator rendering
  - Test checkmark displays when status is 'completed'
  - Test progress ring displays when status is 'in-progress'
  - Test Start button displays when status is 'not-started'
  - Test correct colors are applied based on pillar
  - _Requirements: 4.1, 4.2, 4.3_

### 3. Animation and Interaction Polish

- [x] 3.1 Audit all press animations for 150ms timing
  - Verify FilterChip press animation is exactly 150ms
  - Verify LessonCard press animation is exactly 150ms
  - Verify DailyChallengeCard button press animation is exactly 150ms
  - Ensure scale value is `0.95` (not `0.9` or other)
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 3.2 Optimize scroll performance for 60fps
  - Add `removeClippedSubviews={true}` to ScrollViews if not present
  - Test scrolling with performance monitor enabled
  - Profile render times for LessonCard components
  - Verify `memo` optimization is working correctly
  - _Requirements: 11.5_

- [x] 3.3 Add haptic feedback for button presses (iOS/Android)
  - Add light haptic feedback on FilterChip press
  - Add medium haptic feedback on LessonCard press
  - Add medium haptic feedback on Challenge accept
  - Test haptic consistency across platforms
  - _Requirements: 11.1, 11.2, 11.3_

- [~] 3.4 Write integration tests for animation behavior
  - Test FilterChip animation triggers on press
  - Test LessonCard animation triggers on press
  - Test animations complete within 150ms
  - Test animations don't block interactions
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

### 4. Accessibility Compliance

- [x] 4.1 Audit and fix accessibility labels for screen readers
  - Verify FilterChip label includes pillar name only
  - Verify LessonCard label includes title, duration, difficulty, and status
  - Verify Challenge button label is "Accept Challenge"
  - Test all labels with iOS VoiceOver
  - Test all labels with Android TalkBack
  - _Requirements: 14.1, 14.2, 14.3_

- [x] 4.2 Verify touch target sizes are minimum 44x44 pixels
  - Audit FilterChip touch target size
  - Audit LessonCard touch target size (full card)
  - Audit Start button touch target size
  - Audit Challenge button touch target size
  - Add padding if any targets are smaller than 44x44
  - _Requirements: 14.5_

- [x] 4.3 Add accessibility state for selected filter chips
  - Verify `accessibilityState={{ selected: isSelected }}` is present
  - Test that screen readers announce "selected" state
  - Verify iOS VoiceOver announces correctly
  - Verify Android TalkBack announces correctly
  - _Requirements: 14.4_

- [x] 4.4 Create accessibility audit checklist and manual test
  - Test full screen with VoiceOver enabled
  - Test full screen with TalkBack enabled
  - Verify all interactive elements are reachable
  - Verify navigation order is logical
  - Verify color contrast meets WCAG AA (4.5:1 for text)
  - Document any limitations or known issues
  - _Requirements: 14.1-14.5_

### 5. Error Handling and Edge Cases

- [x] 5.1 Implement graceful empty state handling
  - Add empty state UI when no lessons available for pillar
  - Display message "No lessons available for this pillar"
  - Ensure challenge card still renders in empty state
  - Ensure filter chips remain functional
  - _Requirements: 13.1, 13.3, 13.4_

- [x] 5.2 Handle storage load failures gracefully
  - Add try-catch around `loadCompletedLessons` call
  - Log error but continue with empty Set
  - Display user-friendly error toast if needed
  - Ensure app doesn't crash on storage failure
  - _Requirements: 8.5, 13.2_

- [x] 5.3 Handle XP update failures with user feedback
  - Add try-catch around `updateXP` calls
  - Show Alert dialog if XP update fails
  - Provide "Retry" option in alert
  - Don't mark lesson as complete if XP fails
  - _Requirements: 6.2, 6.3, 7.2_

- [x] 5.4 Prevent duplicate lesson completions
  - Check if lesson already completed before awarding XP
  - Add early return if `completedIds.has(lessonId)`
  - Add console log for debugging duplicate attempts
  - _Requirements: 6.4_

- [~] 5.5 Write unit tests for error scenarios
  - Test empty lessons array renders empty state
  - Test storage load failure doesn't crash app
  - Test XP update failure shows error
  - Test duplicate completion is ignored
  - _Requirements: 8.5, 13.1, 13.2_

### 6. Data Flow and State Management

- [x] 6.1 Optimize lesson filtering performance
  - Memoize `filterLessonsByPillar` function with `useMemo`
  - Measure filtering time with performance profiler
  - Ensure filtering completes within 200ms requirement
  - _Requirements: 1.5, 2.3_

- [x] 6.2 Optimize completed lessons lookup
  - Verify `Set` is used for O(1) lookup (not array)
  - Measure lookup performance in getLessonStatus
  - Ensure status check is < 1ms per lesson
  - _Requirements: 8.3, 4.5_

- [x] 6.3 Ensure lesson completion persists correctly
  - Verify lesson ID saved to AsyncStorage within 500ms
  - Test persistence across app restarts
  - Verify `completedIds` reloads correctly on mount
  - _Requirements: 8.2, 8.4_

- [~] 6.4 Write integration tests for state management flows
  - Test pillar selection updates lesson list within 200ms
  - Test lesson completion updates status immediately
  - Test completed lessons persist and reload correctly
  - Test challenge acceptance updates XP correctly
  - _Requirements: 1.5, 2.3, 6.1, 7.1, 8.1-8.4_

### 7. Checkpoint - Core Refinements Complete

- [x] 7. Review all visual, animation, and accessibility tasks
  - Ensure all tests pass, ask the user if questions arise.
  - Verify app runs smoothly on test devices
  - Check for any console errors or warnings
  - Confirm design spec compliance

### 8. Lesson Modal Integration Testing

- [~] 8.1 Test lesson modal open/close flow
  - Verify modal opens when lesson card is tapped
  - Verify modal displays correct lesson content
  - Verify modal uses correct pillar accent color
  - Verify modal closes when X button is tapped
  - Verify scroll position is maintained after close
  - _Requirements: 9.1, 9.3, 9.4_

- [~] 8.2 Test lesson completion in modal
  - Verify "Mark Complete" button awards 50 XP
  - Verify lesson status updates to "completed"
  - Verify modal closes automatically after completion
  - Verify lesson card shows checkmark after modal closes
  - _Requirements: 9.5, 6.1, 6.2_

- [~] 8.3 Write integration tests for modal flows
  - Test modal open/close behavior
  - Test lesson completion awards XP
  - Test lesson status updates after completion
  - Test scroll position maintained after modal
  - _Requirements: 9.1-9.5_

### 9. Daily Challenge Integration Testing

- [~] 9.1 Test challenge content switches with pillar selection
  - Select each pillar and verify challenge updates
  - Verify challenge title includes pillar name
  - Verify challenge description matches pillar-specific content
  - Verify update happens within 200ms of pillar change
  - _Requirements: 5.7, 15.1-15.6_

- [~] 9.2 Test challenge acceptance flow
  - Tap "Accept Challenge" button
  - Verify +30 XP is awarded
  - Verify XP updates within 500ms
  - Verify button press animation plays
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [~] 9.3 Write unit tests for challenge component
  - Test challenge renders with correct title and description
  - Test XP badge displays "+30 XP"
  - Test button calls onAccept callback
  - Test pillar-specific challenge content for all 6 pillars
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 15.1-15.6_

### 10. Performance Optimization

- [x] 10.1 Profile component render times
  - Use React DevTools Profiler to measure render times
  - Identify any components rendering unnecessarily
  - Verify `memo` wrappers are preventing re-renders
  - Optimize any components with > 16ms render time
  - _Requirements: 11.5_

- [x] 10.2 Optimize FlatList rendering if needed
  - Consider replacing ScrollView with FlatList for lesson list
  - Add `keyExtractor` for stable keys
  - Add `getItemLayout` for fixed height items
  - Test scrolling performance with 50+ lessons
  - _Requirements: 11.5, 2.2_

- [x] 10.3 Minimize state updates and re-renders
  - Verify `useCallback` is used for all event handlers
  - Verify `useMemo` is used for filtered lessons
  - Check that state updates are batched correctly
  - _Requirements: 1.5, 2.3_

- [~] 10.4 Write performance benchmark tests
  - Benchmark lesson filtering time (target < 200ms)
  - Benchmark status lookup time (target < 1ms)
  - Benchmark scroll FPS (target 60fps)
  - Benchmark animation frame rate (target 60fps)
  - _Requirements: 1.5, 2.3, 11.5_

### 11. Final Polish and Production Readiness

- [x] 11.1 Remove debug console.log statements
  - Remove all debug Text elements (red/yellow debug text)
  - Remove excessive console.log statements
  - Keep only essential error logging
  - _Requirements: N/A (code cleanup)_

- [x] 11.2 Add PropTypes or TypeScript type validation
  - Verify all component props have correct TypeScript types
  - Add JSDoc comments to complex interfaces
  - Ensure no `any` types are used
  - _Requirements: N/A (code quality)_

- [x] 11.3 Audit code for best practices
  - Remove unused imports
  - Remove commented-out code
  - Ensure consistent code formatting
  - Run linter and fix all warnings
  - _Requirements: N/A (code quality)_

- [~] 11.4 Write comprehensive integration test suite
  - Test complete user journey: pillar select → lesson open → complete → challenge accept
  - Test edge cases: empty state, storage failure, XP failure
  - Test accessibility with screen reader simulation
  - Test performance benchmarks
  - _Requirements: All requirements (comprehensive)_

### 12. Final Checkpoint - Production Ready

- [x] 12. Review all tasks and verify production readiness
  - Ensure all tests pass, ask the user if questions arise.
  - Verify app meets all 15 requirements from requirements.md
  - Confirm design spec compliance
  - Test on iOS and Android physical devices
  - Get user acceptance before marking complete

---

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster delivery
- Each task references specific requirements for traceability
- Focus on refinement rather than building new features
- Current implementation is already 80% complete; these tasks bring it to 100%
- Testing tasks complement implementation but are not blockers for core functionality
- All animations target 60fps and 150ms duration per spec
- All accessibility features target WCAG 2.1 AA compliance per spec
