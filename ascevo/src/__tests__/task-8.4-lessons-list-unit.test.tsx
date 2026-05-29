/**
 * Task 8.4: Unit Tests for Lessons List
 * 
 * Unit tests validating that the lessons list displays correctly:
 * - Test lessons section displays correct count
 * - Test LessonCard displays all required elements
 * - Test status indicators show correct state based on completion
 * 
 * Validates Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text, ScrollView } from 'react-native';
import LessonCard, { LessonStatus } from '../components/LessonCard';

// Mock lessons section component that simulates the lessons list structure
interface LessonsSectionProps {
  lessonCount: number;
  lessons: Array<{
    id: string;
    number: number;
    title: string;
    duration: string;
    difficulty: string;
    accentColor: string;
    status: LessonStatus;
  }>;
}

const LessonsSection = ({ lessonCount, lessons }: LessonsSectionProps) => {
  return (
    <View testID="lessons-section">
      {/* Section Header */}
      <View testID="lessons-section-header" style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
        <Text testID="lessons-title" style={{ fontWeight: '700', fontSize: 18 }}>Lessons</Text>
        <Text testID="lessons-count" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          {lessonCount} lessons
        </Text>
      </View>
      
      {/* Lessons List */}
      <ScrollView testID="lessons-list">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            number={lesson.number}
            title={lesson.title}
            duration={lesson.duration}
            difficulty={lesson.difficulty}
            accentColor={lesson.accentColor}
            status={lesson.status}
            onPress={() => {}}
          />
        ))}
      </ScrollView>
    </View>
  );
};

describe('Task 8.4: Unit Tests for Lessons List', () => {
  const mockLessons = [
    {
      id: 'mental-health-lesson-1',
      number: 1,
      title: 'Understanding Your Anxiety',
      duration: '5 min',
      difficulty: 'Beginner',
      accentColor: '#A78BFA',
      status: 'not-started' as LessonStatus,
    },
    {
      id: 'mental-health-lesson-2',
      number: 2,
      title: 'Box Breathing in 5 Minutes',
      duration: '5 min',
      difficulty: 'Beginner',
      accentColor: '#A78BFA',
      status: 'in-progress' as LessonStatus,
    },
    {
      id: 'mental-health-lesson-3',
      number: 3,
      title: 'Cognitive Reframing 101',
      duration: '5 min',
      difficulty: 'Beginner',
      accentColor: '#A78BFA',
      status: 'completed' as LessonStatus,
    },
    {
      id: 'mental-health-lesson-4',
      number: 4,
      title: 'Building a Journaling Habit',
      duration: '5 min',
      difficulty: 'Beginner',
      accentColor: '#A78BFA',
      status: 'not-started' as LessonStatus,
    },
  ];

  describe('Requirement 7.1: Lessons section displays correct count', () => {
    it('should display "Lessons" title', () => {
      const { getByTestId } = render(
        <LessonsSection lessonCount={4} lessons={mockLessons} />
      );
      
      const title = getByTestId('lessons-title');
      expect(title.props.children).toBe('Lessons');
    });

    it('should display correct lesson count for 4 lessons', () => {
      const { getByTestId } = render(
        <LessonsSection lessonCount={4} lessons={mockLessons} />
      );
      
      const count = getByTestId('lessons-count');
      expect(count.props.children).toEqual([4, ' lessons']);
    });

    it('should display correct lesson count for different numbers', () => {
      const { getByTestId, rerender } = render(
        <LessonsSection lessonCount={1} lessons={[mockLessons[0]]} />
      );
      
      let count = getByTestId('lessons-count');
      expect(count.props.children).toEqual([1, ' lessons']);
      
      rerender(<LessonsSection lessonCount={2} lessons={mockLessons.slice(0, 2)} />);
      count = getByTestId('lessons-count');
      expect(count.props.children).toEqual([2, ' lessons']);
      
      rerender(<LessonsSection lessonCount={3} lessons={mockLessons.slice(0, 3)} />);
      count = getByTestId('lessons-count');
      expect(count.props.children).toEqual([3, ' lessons']);
    });

    it('should match the number of lessons rendered', () => {
      const { getByTestId, getAllByTestId } = render(
        <LessonsSection lessonCount={4} lessons={mockLessons} />
      );
      
      const count = getByTestId('lessons-count');
      const lessonCards = getAllByTestId(/lesson-card-/);
      
      expect(count.props.children).toEqual([4, ' lessons']);
      expect(lessonCards).toHaveLength(4);
    });
  });

  describe('Requirement 7.2-7.6: LessonCard displays all required elements', () => {
    it('should display lesson number in colored circle', () => {
      const { getByText } = render(
        <LessonCard
          number={1}
          title="Understanding Your Anxiety"
          duration="5 min"
          difficulty="Beginner"
          accentColor="#A78BFA"
          status="not-started"
          onPress={() => {}}
        />
      );
      
      expect(getByText('1')).toBeTruthy();
    });

    it('should display lesson title in bold', () => {
      const { getByText } = render(
        <LessonCard
          number={1}
          title="Understanding Your Anxiety"
          duration="5 min"
          difficulty="Beginner"
          accentColor="#A78BFA"
          status="not-started"
          onPress={() => {}}
        />
      );
      
      const title = getByText('Understanding Your Anxiety');
      expect(title).toBeTruthy();
      expect(title.props.style).toMatchObject({ fontWeight: '700', fontSize: 15 });
    });

    it('should display lesson metadata with duration and difficulty', () => {
      const { getByText } = render(
        <LessonCard
          number={1}
          title="Understanding Your Anxiety"
          duration="5 min"
          difficulty="Beginner"
          accentColor="#A78BFA"
          status="not-started"
          onPress={() => {}}
        />
      );
      
      const metadata = getByText('5 min · Beginner');
      expect(metadata).toBeTruthy();
      expect(metadata.props.style).toMatchObject({ fontSize: 13, color: 'rgba(255,255,255,0.5)' });
    });

    it('should apply pillar accent color to number circle', () => {
      const { getByText } = render(
        <LessonCard
          number={1}
          title="Understanding Your Anxiety"
          duration="5 min"
          difficulty="Beginner"
          accentColor="#A78BFA"
          status="not-started"
          onPress={() => {}}
        />
      );
      
      const numberElement = getByText('1');
      const numberCircle = numberElement.parent?.parent;
      
      expect(numberCircle?.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#A78BFA' })
      );
    });

    it('should display all required elements together', () => {
      const { getByText } = render(
        <LessonCard
          number={2}
          title="Box Breathing in 5 Minutes"
          duration="5 min"
          difficulty="Beginner"
          accentColor="#A78BFA"
          status="not-started"
          onPress={() => {}}
        />
      );
      
      // Number
      expect(getByText('2')).toBeTruthy();
      
      // Title
      expect(getByText('Box Breathing in 5 Minutes')).toBeTruthy();
      
      // Metadata
      expect(getByText('5 min · Beginner')).toBeTruthy();
      
      // Status indicator
      expect(getByText('Start →')).toBeTruthy();
    });
  });

  describe('Requirement 7.7-7.9: Status indicators show correct state based on completion', () => {
    it('should display "Start →" for not-started lessons', () => {
      const { getByText } = render(
        <LessonCard
          number={1}
          title="Understanding Your Anxiety"
          duration="5 min"
          difficulty="Beginner"
          accentColor="#A78BFA"
          status="not-started"
          onPress={() => {}}
        />
      );
      
      const startText = getByText('Start →');
      expect(startText).toBeTruthy();
      expect(startText.props.style).toMatchObject({ color: '#7C3AED' });
    });

    it('should display progress ring with 50% for in-progress lessons', () => {
      const { getByText, queryByText } = render(
        <LessonCard
          number={2}
          title="Box Breathing in 5 Minutes"
          duration="5 min"
          difficulty="Beginner"
          accentColor="#A78BFA"
          status="in-progress"
          onPress={() => {}}
        />
      );
      
      // Should show 50% progress
      expect(getByText('50%')).toBeTruthy();
      
      // Should not show other status indicators
      expect(queryByText('Start →')).toBeNull();
      expect(queryByText('✓')).toBeNull();
    });

    it('should display green checkmark for completed lessons', () => {
      const { getByText, queryByText } = render(
        <LessonCard
          number={3}
          title="Cognitive Reframing 101"
          duration="5 min"
          difficulty="Beginner"
          accentColor="#A78BFA"
          status="completed"
          onPress={() => {}}
        />
      );
      
      // Should show checkmark
      const checkmark = getByText('✓');
      expect(checkmark).toBeTruthy();
      
      // Checkmark container should have green background
      const checkmarkContainer = checkmark.parent?.parent;
      expect(checkmarkContainer?.props.style).toMatchObject({ backgroundColor: '#34D399' });
      
      // Should not show other status indicators
      expect(queryByText('Start →')).toBeNull();
      expect(queryByText('50%')).toBeNull();
    });

    it('should display correct status for each lesson in the list', () => {
      const { getByText, getAllByText, queryByText } = render(
        <LessonsSection lessonCount={4} lessons={mockLessons} />
      );
      
      // Lesson 1: not-started (should have "Start →")
      expect(getAllByText('Start →').length).toBeGreaterThanOrEqual(1);
      
      // Lesson 2: in-progress (should have "50%")
      expect(getByText('50%')).toBeTruthy();
      
      // Lesson 3: completed (should have "✓")
      expect(getByText('✓')).toBeTruthy();
      
      // Lesson 4: not-started (should have "Start →")
      expect(getAllByText('Start →').length).toBe(2); // Lessons 1 and 4
    });
  });

  describe('Integration: Complete lessons list rendering', () => {
    it('should render complete lessons section with header and all lesson cards', () => {
      const { getByTestId, getAllByTestId, getByText } = render(
        <LessonsSection lessonCount={4} lessons={mockLessons} />
      );
      
      // Section header
      expect(getByTestId('lessons-section-header')).toBeTruthy();
      expect(getByText('Lessons')).toBeTruthy();
      expect(getByText('4 lessons')).toBeTruthy();
      
      // All lesson cards
      const lessonCards = getAllByTestId(/lesson-card-/);
      expect(lessonCards).toHaveLength(4);
      
      // Verify each lesson card has required elements
      expect(getByText('Understanding Your Anxiety')).toBeTruthy();
      expect(getByText('Box Breathing in 5 Minutes')).toBeTruthy();
      expect(getByText('Cognitive Reframing 101')).toBeTruthy();
      expect(getByText('Building a Journaling Habit')).toBeTruthy();
    });

    it('should render lessons for different pillars with correct accent colors', () => {
      const relationshipsLessons = [
        {
          id: 'relationships-lesson-1',
          number: 1,
          title: 'Active Listening Mastery',
          duration: '5 min',
          difficulty: 'Beginner',
          accentColor: '#F472B6', // Relationships color
          status: 'not-started' as LessonStatus,
        },
        {
          id: 'relationships-lesson-2',
          number: 2,
          title: 'Setting Healthy Boundaries',
          duration: '5 min',
          difficulty: 'Beginner',
          accentColor: '#F472B6',
          status: 'completed' as LessonStatus,
        },
      ];
      
      const { getByText } = render(
        <LessonsSection lessonCount={2} lessons={relationshipsLessons} />
      );
      
      // Verify lessons are rendered
      expect(getByText('Active Listening Mastery')).toBeTruthy();
      expect(getByText('Setting Healthy Boundaries')).toBeTruthy();
      
      // Verify accent color is applied
      const numberElement = getByText('1');
      const numberCircle = numberElement.parent?.parent;
      expect(numberCircle?.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#F472B6' })
      );
    });

    it('should handle empty lessons list', () => {
      const { getByTestId, queryAllByTestId } = render(
        <LessonsSection lessonCount={0} lessons={[]} />
      );
      
      // Header should still be present
      expect(getByTestId('lessons-section-header')).toBeTruthy();
      
      // No lesson cards should be rendered
      const lessonCards = queryAllByTestId(/lesson-card-/);
      expect(lessonCards).toHaveLength(0);
    });

    it('should render lessons with mixed completion states', () => {
      const mixedLessons = [
        { ...mockLessons[0], status: 'completed' as LessonStatus },
        { ...mockLessons[1], status: 'not-started' as LessonStatus },
        { ...mockLessons[2], status: 'in-progress' as LessonStatus },
        { ...mockLessons[3], status: 'completed' as LessonStatus },
      ];
      
      const { getByText, getAllByText } = render(
        <LessonsSection lessonCount={4} lessons={mixedLessons} />
      );
      
      // 2 completed lessons (should have 2 checkmarks)
      expect(getAllByText('✓')).toHaveLength(2);
      
      // 1 not-started lesson (should have 1 "Start →")
      expect(getAllByText('Start →')).toHaveLength(1);
      
      // 1 in-progress lesson (should have 1 "50%")
      expect(getByText('50%')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single lesson', () => {
      const { getByTestId, getAllByTestId, getByText } = render(
        <LessonsSection lessonCount={1} lessons={[mockLessons[0]]} />
      );
      
      expect(getByText('1 lessons')).toBeTruthy();
      expect(getAllByTestId(/lesson-card-/)).toHaveLength(1);
    });

    it('should handle all lessons completed', () => {
      const allCompleted = mockLessons.map(lesson => ({
        ...lesson,
        status: 'completed' as LessonStatus,
      }));
      
      const { getAllByText, queryByText } = render(
        <LessonsSection lessonCount={4} lessons={allCompleted} />
      );
      
      // All should have checkmarks
      expect(getAllByText('✓')).toHaveLength(4);
      
      // None should have "Start →" or progress
      expect(queryByText('Start →')).toBeNull();
      expect(queryByText('50%')).toBeNull();
    });

    it('should handle all lessons not started', () => {
      const allNotStarted = mockLessons.map(lesson => ({
        ...lesson,
        status: 'not-started' as LessonStatus,
      }));
      
      const { getAllByText, queryByText } = render(
        <LessonsSection lessonCount={4} lessons={allNotStarted} />
      );
      
      // All should have "Start →"
      expect(getAllByText('Start →')).toHaveLength(4);
      
      // None should have checkmarks or progress
      expect(queryByText('✓')).toBeNull();
      expect(queryByText('50%')).toBeNull();
    });

    it('should render lessons with different durations and difficulties', () => {
      const variedLessons = [
        { ...mockLessons[0], duration: '3 min', difficulty: 'Beginner' },
        { ...mockLessons[1], duration: '10 min', difficulty: 'Intermediate' },
        { ...mockLessons[2], duration: '15 min', difficulty: 'Advanced' },
        { ...mockLessons[3], duration: '5 min', difficulty: 'Beginner' },
      ];
      
      const { getByText } = render(
        <LessonsSection lessonCount={4} lessons={variedLessons} />
      );
      
      expect(getByText('3 min · Beginner')).toBeTruthy();
      expect(getByText('10 min · Intermediate')).toBeTruthy();
      expect(getByText('15 min · Advanced')).toBeTruthy();
      expect(getByText('5 min · Beginner')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      const { getByTestId } = render(
        <LessonsSection lessonCount={4} lessons={mockLessons} />
      );
      
      const section = getByTestId('lessons-section');
      expect(section).toBeTruthy();
      
      const header = getByTestId('lessons-section-header');
      expect(header).toBeTruthy();
      
      const list = getByTestId('lessons-list');
      expect(list).toBeTruthy();
    });

    it('should have accessible lesson cards', () => {
      const { getByTestId } = render(
        <LessonCard
          number={1}
          title="Understanding Your Anxiety"
          duration="5 min"
          difficulty="Beginner"
          accentColor="#A78BFA"
          status="not-started"
          onPress={() => {}}
        />
      );
      
      const card = getByTestId('lesson-card-1');
      expect(card.props.accessibilityLabel).toBe(
        'Lesson 1: Understanding Your Anxiety. 5 min, Beginner. Not started'
      );
      expect(card.props.accessibilityRole).toBe('button');
    });
  });
});
