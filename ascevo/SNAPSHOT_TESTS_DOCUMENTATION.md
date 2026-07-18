# PillarsScreen V2 Snapshot Tests Documentation

## Task 1.4: Visual Regression Snapshot Tests

### Overview
Created comprehensive Jest snapshot tests for the PillarsScreen V2 Redesign to detect visual regressions and ensure design spec compliance.

### Test Coverage

#### 1. Full PillarsScreen Snapshot
- **Test**: `should match snapshot for full PillarsScreen with mock data`
- **Purpose**: Captures the entire screen layout with all components rendered
- **Validates**: Overall screen structure, header, filter chips, lesson list, and challenge card
- **Requirements**: 10.1-10.7

#### 2. FilterChip Components
- **Test**: `should capture FilterChip components in both states`
- **Purpose**: Captures both selected and unselected FilterChip states in a single snapshot
- **Covers**:
  - Selected state: Mental Health pillar (default)
  - Unselected states: Relations, Career, Fitness, Finance, Hobbies
- **Visual Elements Captured**:
  - Background colors (#1A1A2E for unselected, pillar accent color for selected)
  - Text colors (rgba(255,255,255,0.5) for unselected, #FFFFFF for selected)
  - Border styling
  - Emoji and name labels
  - Accessibility properties

#### 3. LessonCard Status States
- **Test 1**: `should capture LessonCard with completed status`
  - Captures the green checkmark (✓) indicator
  - Shows completed lesson styling with teal color #34D399
  
- **Test 2**: `should capture LessonCard with not-started status`
  - Captures the "Start →" button
  - Shows pillar accent color styling

- **Test 3**: All lesson card elements are captured including:
  - Colored number circle (44px) with lesson number
  - Lesson title (15px bold)
  - Lesson subtitle (first 50 characters, 13px muted)
  - Duration and difficulty metadata
  - Status indicators (checkmark, progress ring, or Start button)

#### 4. DailyChallengeCard
- **Test**: `should capture DailyChallengeCard structure`
- **Visual Elements Captured**:
  - Teal border (2px solid #34D399)
  - Teal background with 15% opacity
  - Challenge title "Today's Mental Challenge"
  - "+30 XP" badge with teal background
  - Challenge description text
  - "Accept Challenge →" button

#### 5. Visual Design Consistency
- **Test**: `should verify visual design consistency`
- **Validates**:
  - Root background: #0A0A12
  - Card backgrounds: #1A1A2E
  - Border radius: 16px for cards
  - Spacing: 12px card margins, 16px padding
  - Typography: Consistent font sizes and weights
  - Color palette compliance

### Mock Configuration

The tests use the following mocks:
- **pillarStorageService**: Returns one completed lesson (mental-health-lesson-1)
- **AppProvider**: Provides XP context with initial value of 100 XP
- **useButtonPressAnimation**: Mocked to prevent animation warnings in snapshots
- **Animated**: Native animated helper mocked for snapshot consistency

### Running the Tests

```bash
# Run snapshot tests only
npm test -- --testPathPattern=pillarsScreen.snapshot --no-coverage

# Update snapshots if intentional changes were made
npm test -- --testPathPattern=pillarsScreen.snapshot --no-coverage -u
```

### Snapshot File

- **Location**: `src/__tests__/__snapshots__/pillarsScreen.snapshot.test.tsx.snap`
- **Size**: ~314KB (comprehensive coverage)
- **Number of Snapshots**: 6 distinct snapshots covering all component states

### Benefits

1. **Visual Regression Detection**: Any unintended changes to component styling will be immediately detected
2. **Design Spec Compliance**: Snapshots serve as documentation of the approved visual design
3. **Refactoring Safety**: Developers can refactor code with confidence that visual output remains unchanged
4. **Review Tool**: Snapshot diffs in PRs make it easy to review visual changes

### Maintenance

- **When to Update**: Update snapshots only when visual changes are intentional and approved
- **Review Process**: Always review snapshot diffs in PRs to ensure changes are expected
- **Git**: Snapshot files are committed to version control and should be reviewed like code

### Related Requirements

- **Requirement 10.1**: Root background color #0A0A12 ✓
- **Requirement 10.2**: Card background #1A1A2E ✓
- **Requirement 10.3**: Border radius 16px ✓
- **Requirement 10.4**: Muted text color rgba(255,255,255,0.5) ✓
- **Requirement 10.5**: Primary text color #FFFFFF ✓
- **Requirement 10.6**: Card spacing 12px ✓
- **Requirement 10.7**: Pillar accent colors for visual elements ✓

### Notes

- Snapshots are deterministic and platform-independent
- Animation states are mocked to ensure consistent snapshots
- All async data loading is awaited before capturing snapshots
- Tests use `waitFor` to ensure components are fully rendered
