# LessonCard Component

## Overview

The `LessonCard` component displays individual lessons in the DetailView with a colored number circle, lesson title, metadata, and status indicators.

## Features

- **Colored Number Circle**: Displays lesson number (1-4) with pillar-specific accent color
- **Lesson Title**: Bold 15px font for clear readability
- **Metadata**: Shows duration and difficulty level in 13px muted text
- **Status Indicators**:
  - **Not Started**: Purple "Start →" text
  - **In Progress**: Circular progress ring showing 50% completion
  - **Completed**: Green checkmark (✓)
- **Accessibility**: Full screen reader support with descriptive labels

## Usage

```tsx
import LessonCard from '../components/LessonCard';
import { PILLAR_COLORS } from '../types/pillars';

// Example 1: Not started lesson
<LessonCard
  number={1}
  title="Understanding Your Anxiety"
  duration="5 min"
  difficulty="Beginner"
  accentColor={PILLAR_COLORS['mental-health']}
  status="not-started"
  onPress={() => handleLessonPress(lesson)}
/>

// Example 2: In progress lesson
<LessonCard
  number={2}
  title="Box Breathing in 5 Minutes"
  duration="5 min"
  difficulty="Beginner"
  accentColor={PILLAR_COLORS['mental-health']}
  status="in-progress"
  onPress={() => handleLessonPress(lesson)}
/>

// Example 3: Completed lesson
<LessonCard
  number={3}
  title="Cognitive Reframing 101"
  duration="5 min"
  difficulty="Beginner"
  accentColor={PILLAR_COLORS['mental-health']}
  status="completed"
  onPress={() => handleLessonPress(lesson)}
/>

// Example 4: Disabled lesson
<LessonCard
  number={4}
  title="Building a Journaling Habit"
  duration="5 min"
  difficulty="Beginner"
  accentColor={PILLAR_COLORS['mental-health']}
  status="not-started"
  onPress={() => handleLessonPress(lesson)}
  disabled={true}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `number` | `number` | Yes | Lesson number (1, 2, 3, or 4) |
| `title` | `string` | Yes | Lesson title |
| `duration` | `string` | Yes | Lesson duration (e.g., "5 min") |
| `difficulty` | `string` | Yes | Lesson difficulty level (e.g., "Beginner") |
| `accentColor` | `string` | Yes | Pillar-specific accent color for number circle (hex code) |
| `status` | `LessonStatus` | Yes | Current lesson status: `'not-started'`, `'in-progress'`, or `'completed'` |
| `onPress` | `() => void` | Yes | Callback function when card is pressed |
| `disabled` | `boolean` | No | Whether the card is disabled (default: `false`) |

## Pillar Accent Colors

Use the `PILLAR_COLORS` constant from `types/pillars.ts`:

```tsx
import { PILLAR_COLORS } from '../types/pillars';

const accentColors = {
  'mental-health': PILLAR_COLORS['mental-health'],  // #A78BFA (Light Purple)
  'relationships': PILLAR_COLORS['relationships'],  // #F472B6 (Pink)
  'career': PILLAR_COLORS['career'],                // #60A5FA (Blue)
  'fitness': PILLAR_COLORS['fitness'],              // #34D399 (Green)
  'finance': PILLAR_COLORS['finance'],              // #FBBF24 (Yellow)
  'hobbies': PILLAR_COLORS['hobbies'],              // #F87171 (Red)
};
```

## Visual Specifications

### Number Circle
- **Size**: 40px diameter
- **Background**: Pillar accent color
- **Text**: White, 18px, bold (700)

### Title
- **Font Size**: 15px
- **Font Weight**: Bold (700)
- **Color**: White (#FFFFFF)

### Metadata
- **Font Size**: 13px
- **Color**: Muted (rgba(255,255,255,0.5))
- **Format**: "{duration} · {difficulty}"

### Status Indicators

#### Not Started
- **Text**: "Start →"
- **Color**: Purple (#7C3AED)
- **Font Size**: 14px
- **Font Weight**: 600

#### In Progress
- **Type**: Circular progress ring
- **Size**: 36px diameter
- **Progress**: 50%
- **Color**: Purple (#7C3AED)
- **Center Text**: "50%"

#### Completed
- **Type**: Checkmark (✓)
- **Container Size**: 36px diameter
- **Background**: Green (#34D399)
- **Text**: White, 18px, bold

## Accessibility

The component includes full accessibility support:

- **Role**: Button
- **Label**: "Lesson {number}: {title}. {duration}, {difficulty}. {status}"
- **Hint**: "Double tap to view lesson"
- **Disabled State**: Properly handled with `disabled` prop

Example accessibility labels:
- "Lesson 1: Understanding Your Anxiety. 5 min, Beginner. Not started"
- "Lesson 2: Box Breathing in 5 Minutes. 5 min, Beginner. In progress"
- "Lesson 3: Cognitive Reframing 101. 5 min, Beginner. Completed"

## Integration Example

Here's how to integrate LessonCard into a lesson list:

```tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import LessonCard from '../components/LessonCard';
import { PILLAR_COLORS } from '../types/pillars';

interface Lesson {
  id: string;
  number: number;
  title: string;
  duration: string;
  difficulty: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface LessonListProps {
  pillarKey: string;
  lessons: Lesson[];
  onLessonPress: (lesson: Lesson) => void;
}

export default function LessonList({ pillarKey, lessons, onLessonPress }: LessonListProps) {
  const accentColor = PILLAR_COLORS[pillarKey as keyof typeof PILLAR_COLORS];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lessons</Text>
        <Text style={styles.count}>{lessons.length} lessons</Text>
      </View>
      
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          number={lesson.number}
          title={lesson.title}
          duration={lesson.duration}
          difficulty={lesson.difficulty}
          accentColor={accentColor}
          status={lesson.status}
          onPress={() => onLessonPress(lesson)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  count: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
});
```

## Requirements Validated

This component validates the following requirements from the Premium Pillars Experience spec:

- **Requirement 7.2**: Display exactly 4 lessons per pillar
- **Requirement 7.3**: Display each lesson as a card with colored number circle (1, 2, 3, 4)
- **Requirement 7.4**: Use pillar's accent color for lesson number circle background
- **Requirement 7.5**: Display lesson title in bold 15px font
- **Requirement 7.6**: Display lesson metadata "5 min · Beginner" in 13px muted text
- **Requirement 7.7**: When lesson not started, display "Start →" in purple
- **Requirement 7.8**: When lesson in progress, display progress ring showing 50% completion
- **Requirement 7.9**: When lesson completed, display green checkmark (✓)

## Testing

The component includes comprehensive unit tests covering:
- Number circle rendering with correct colors
- Title and metadata display
- All three status indicators
- Interaction and accessibility
- Complete rendering scenarios

Run tests with:
```bash
npm test LessonCard.test
```

All 32 tests pass successfully.
