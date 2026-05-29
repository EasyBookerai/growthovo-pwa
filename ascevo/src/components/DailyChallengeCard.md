# DailyChallengeCard Component

## Overview

The `DailyChallengeCard` component displays a daily challenge specific to each pillar in the Premium Pillars Experience. It features a distinctive teal border, shows the challenge description, displays an XP reward badge, and toggles between two states: not completed (with action button) and completed (with confirmation text).

## Features

- **Teal Border**: 2px solid border (#34D399) for visual distinction
- **Challenge Title**: "Daily Challenge" in bold 16px font
- **XP Badge**: "+30 XP" badge with teal background
- **Two States**:
  - Not completed: Purple "Start Challenge →" button (#7C3AED)
  - Completed: Green "✓ Completed" text (#34D399)
- **Pillar-Specific Content**: Each pillar has a unique challenge description

## Props

```typescript
interface DailyChallengeCardProps {
  pillarKey: PremiumPillarKey;  // The pillar identifier
  isCompleted: boolean;          // Whether the challenge is completed
  onComplete: () => void;        // Callback when challenge is started
}
```

### Prop Details

- **pillarKey**: One of `'mental-health' | 'relationships' | 'career' | 'fitness' | 'finance' | 'hobbies'`
- **isCompleted**: Boolean flag indicating completion status
- **onComplete**: Function called when user taps "Start Challenge" button

## Usage

### Basic Example

```tsx
import DailyChallengeCard from '../components/DailyChallengeCard';

function PillarDetailView() {
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  const handleChallengeComplete = () => {
    // Award 30 XP
    awardXP('mental-health', 30);
    
    // Mark as completed
    setChallengeCompleted(true);
    
    // Persist to storage
    saveChallengeCompletion('mental-health');
  };

  return (
    <DailyChallengeCard
      pillarKey="mental-health"
      isCompleted={challengeCompleted}
      onComplete={handleChallengeComplete}
    />
  );
}
```

### Integration with PillarsScreen

```tsx
// In PillarsScreen DetailView modal
<View style={styles.statsRow}>
  {/* Stats cards */}
</View>

<DailyChallengeCard
  pillarKey={selectedPillar.key}
  isCompleted={challengeCompletedToday}
  onComplete={handleChallengeComplete}
/>

<View style={styles.lessonsSection}>
  {/* Lessons list */}
</View>
```

## Challenge Text by Pillar

Each pillar has a specific daily challenge:

| Pillar | Challenge Text |
|--------|---------------|
| Mental Health | "Practice 5 minutes of mindful breathing today" |
| Relationships | "Send a meaningful message to someone you care about" |
| Career | "Spend 30 minutes on focused, deep work without distractions" |
| Fitness | "Complete a 10-minute workout or walk" |
| Finance | "Review your spending from the past 24 hours" |
| Hobbies | "Dedicate 15 minutes to a creative activity you enjoy" |

## Visual Specifications

### Colors

- **Border**: `#34D399` (teal, 2px solid)
- **Background**: `#1A1A2E` (dark card)
- **Title**: `#FFFFFF` (white)
- **Challenge Text**: `rgba(255, 255, 255, 0.7)` (muted white)
- **XP Badge Background**: `#34D399` (teal)
- **XP Badge Text**: `#FFFFFF` (white)
- **Start Button**: `#7C3AED` (purple)
- **Completed Text**: `#34D399` (green)

### Typography

- **Title**: 16px, bold (700 weight)
- **Challenge Text**: 14px, regular
- **XP Badge**: 13px, semi-bold (600 weight)
- **Button/Completed Text**: 15px, semi-bold (600 weight)

### Spacing

- **Container Padding**: 16px
- **Border Radius**: 16px
- **Header Row Margin**: 12px bottom
- **Challenge Text Margin**: 16px bottom
- **XP Badge Padding**: 10px horizontal, 4px vertical

## States

### Not Completed State

When `isCompleted={false}`:
- Displays purple "Start Challenge →" button
- Button is pressable and calls `onComplete` callback
- Button has active opacity of 0.7 for press feedback

### Completed State

When `isCompleted={true}`:
- Displays green "✓ Completed" text
- No button is shown
- Text is centered in the action area

## Accessibility

The component includes:
- `testID="daily-challenge-card"` on the container for testing
- `testID="start-challenge-button"` on the action button
- Semantic structure with proper text hierarchy
- Touch target size of 44px+ for the button

## Testing

### Unit Tests

The component includes comprehensive unit tests covering:
- Visual elements (title, XP badge, border)
- All 6 pillar-specific challenge texts
- Not completed state (button display and interaction)
- Completed state (completed text display)
- State transitions
- All pillar types rendering correctly

Run tests:
```bash
npm run test src/components/__tests__/DailyChallengeCard.test.tsx
```

### Visual Example

A visual example component is available at:
```
src/components/__tests__/DailyChallengeCard.example.tsx
```

This shows all 6 pillars with interactive state toggling.

## Requirements Validated

This component validates the following requirements from the Premium Pillars Experience spec:

- **Requirement 5.1**: Teal border (2px, #34D399)
- **Requirement 5.2**: "Daily Challenge" title in bold 16px font
- **Requirement 5.4**: "+30 XP" badge with teal background
- **Requirement 5.5**: "Start Challenge →" button (purple)
- **Requirement 5.7**: "✓ Completed" text (green)
- **Requirement 6.1-6.6**: Pillar-specific challenge text for all 6 pillars

## Design Decisions

### Why Two States Instead of Three?

The component uses a simple boolean `isCompleted` rather than an enum with states like `'not-started' | 'in-progress' | 'completed'`. This is because:
1. Daily challenges are binary: either done or not done
2. There's no meaningful "in-progress" state for these challenges
3. Simpler state management reduces complexity

### Why Callback Instead of Direct XP Award?

The component calls `onComplete()` callback rather than directly awarding XP because:
1. Separation of concerns: UI component doesn't handle business logic
2. Flexibility: Parent can implement custom XP logic, persistence, etc.
3. Testability: Easier to test component without mocking XP service

### Why Pillar-Specific Text in Component?

The challenge text mapping is defined in the component rather than passed as props because:
1. Challenge text is static and won't change per instance
2. Reduces prop drilling from parent components
3. Ensures consistency across the app
4. Easier to maintain in one location

## Future Enhancements

Potential improvements for future iterations:

1. **Animation**: Add celebration animation when challenge is completed
2. **Progress Indicator**: Show partial progress for multi-step challenges
3. **Streak Bonus**: Display streak multiplier (e.g., "3-day streak: +10 XP bonus")
4. **Custom Challenges**: Allow user-defined challenges
5. **Challenge History**: Show past completed challenges
6. **Difficulty Levels**: Easy/Medium/Hard challenges with varying XP

## Related Components

- `PillarsScreen`: Main screen that displays pillar cards
- `DetailView`: Modal that contains the DailyChallengeCard
- `LessonCard`: Similar card component for lessons
- `StatsRow`: Stats cards displayed above the challenge card

## Related Services

- `pillarXPService`: Handles XP awards and level calculations
- `pillarStorageService`: Persists challenge completion state
- `challengeService`: May be used for daily reset logic

## File Location

```
ascevo/src/components/DailyChallengeCard.tsx
```

## Dependencies

- React Native core components: `View`, `Text`, `TouchableOpacity`, `StyleSheet`
- Type definitions: `PremiumPillarKey` from `../types/pillars`

No external dependencies required.
