/**
 * Test: LessonCard Component
 * 
 * Unit tests validating that LessonCard component renders all required elements correctly:
 * - Colored number circle (1, 2, 3, 4) using pillar accent color
 * - Lesson title in bold 15px font
 * - Metadata "5 min · Beginner" in 13px muted text
 * - Three status indicators: "Start →" (purple), progress ring (50%), checkmark (green)
 * 
 * Validates Requirements 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9
 * Task 8.2: Implement LessonCard component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LessonCard, { LessonCardProps } from '../LessonCard';

describe('LessonCard Component', () => {
  const defaultProps: LessonCardProps = {
    number: 1,
    title: 'Understanding Your Anxiety',
    duration: '5 min',
    difficulty: 'Beginner',
    accentColor: '#A78BFA',
    status: 'not-started',
    onPress: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Requirement 7.3: Display each lesson as a card with colored number circle', () => {
    it('should display lesson number in a circle', () => {
      const { getByText } = render(<LessonCard {...defaultProps} />);
      
      const numberElement = getByText('1');
      expect(numberElement).toBeTruthy();
    });

    it('should display correct number for each lesson (1, 2, 3, 4)', () => {
      const { rerender, getByText } = render(<LessonCard {...defaultProps} number={1} />);
      expect(getByText('1')).toBeTruthy();

      rerender(<LessonCard {...defaultProps} number={2} />);
      expect(getByText('2')).toBeTruthy();

      rerender(<LessonCard {...defaultProps} number={3} />);
      expect(getByText('3')).toBeTruthy();

      rerender(<LessonCard {...defaultProps} number={4} />);
      expect(getByText('4')).toBeTruthy();
    });
  });

  describe('Requirement 7.4: Use pillar accent color for lesson number circle background', () => {
    it('should apply Mental Health accent color (#A78BFA)', () => {
      const { getByText } = render(
        <LessonCard {...defaultProps} accentColor="#A78BFA" />
      );
      
      const numberElement = getByText('1');
      const numberCircle = numberElement.parent?.parent;
      
      expect(numberCircle?.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#A78BFA' })
      );
    });

    it('should apply Relationships accent color (#F472B6)', () => {
      const { getByText } = render(
        <LessonCard {...defaultProps} accentColor="#F472B6" />
      );
      
      const numberElement = getByText('1');
      const numberCircle = numberElement.parent?.parent;
      
      expect(numberCircle?.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#F472B6' })
      );
    });

    it('should apply Career accent color (#60A5FA)', () => {
      const { getByText } = render(
        <LessonCard {...defaultProps} accentColor="#60A5FA" />
      );
      
      const numberElement = getByText('1');
      const numberCircle = numberElement.parent?.parent;
      
      expect(numberCircle?.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#60A5FA' })
      );
    });

    it('should apply Fitness accent color (#34D399)', () => {
      const { getByText } = render(
        <LessonCard {...defaultProps} accentColor="#34D399" />
      );
      
      const numberElement = getByText('1');
      const numberCircle = numberElement.parent?.parent;
      
      expect(numberCircle?.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#34D399' })
      );
    });

    it('should apply Finance accent color (#FBBF24)', () => {
      const { getByText } = render(
        <LessonCard {...defaultProps} accentColor="#FBBF24" />
      );
      
      const numberElement = getByText('1');
      const numberCircle = numberElement.parent?.parent;
      
      expect(numberCircle?.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#FBBF24' })
      );
    });

    it('should apply Hobbies accent color (#F87171)', () => {
      const { getByText } = render(
        <LessonCard {...defaultProps} accentColor="#F87171" />
      );
      
      const numberElement = getByText('1');
      const numberCircle = numberElement.parent?.parent;
      
      expect(numberCircle?.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#F87171' })
      );
    });
  });

  describe('Requirement 7.5: Display lesson title in bold 15px font', () => {
    it('should display lesson title', () => {
      const { getByText } = render(<LessonCard {...defaultProps} />);
      
      expect(getByText('Understanding Your Anxiety')).toBeTruthy();
    });

    it('should apply bold font weight to title', () => {
      const { getByText } = render(<LessonCard {...defaultProps} />);
      
      const titleElement = getByText('Understanding Your Anxiety');
      expect(titleElement.props.style).toMatchObject({ fontWeight: '700' });
    });

    it('should apply 15px font size to title', () => {
      const { getByText } = render(<LessonCard {...defaultProps} />);
      
      const titleElement = getByText('Understanding Your Anxiety');
      expect(titleElement.props.style).toMatchObject({ fontSize: 15 });
    });
  });

  describe('Requirement 7.6: Display lesson metadata "5 min · Beginner" in 13px muted text', () => {
    it('should display duration and difficulty metadata', () => {
      const { getByText } = render(<LessonCard {...defaultProps} />);
      
      expect(getByText('5 min · Beginner')).toBeTruthy();
    });

    it('should apply 13px font size to metadata', () => {
      const { getByText } = render(<LessonCard {...defaultProps} />);
      
      const metadataElement = getByText('5 min · Beginner');
      expect(metadataElement.props.style).toMatchObject({ fontSize: 13 });
    });

    it('should apply muted color to metadata', () => {
      const { getByText } = render(<LessonCard {...defaultProps} />);
      
      const metadataElement = getByText('5 min · Beginner');
      expect(metadataElement.props.style).toMatchObject({ color: 'rgba(255,255,255,0.5)' });
    });

    it('should format metadata with different durations and difficulties', () => {
      const { rerender, getByText } = render(
        <LessonCard {...defaultProps} duration="10 min" difficulty="Advanced" />
      );
      
      expect(getByText('10 min · Advanced')).toBeTruthy();

      rerender(<LessonCard {...defaultProps} duration="3 min" difficulty="Intermediate" />);
      expect(getByText('3 min · Intermediate')).toBeTruthy();
    });
  });

  describe('Requirement 7.7: When lesson not started, display "Start →" in purple', () => {
    it('should display "Start →" for not-started status', () => {
      const { getByText } = render(
        <LessonCard {...defaultProps} status="not-started" />
      );
      
      expect(getByText('Start →')).toBeTruthy();
    });

    it('should apply purple color (#7C3AED) to "Start →" text', () => {
      const { getByText } = render(
        <LessonCard {...defaultProps} status="not-started" />
      );
      
      const startElement = getByText('Start →');
      expect(startElement.props.style).toMatchObject({ color: '#7C3AED' });
    });
  });

  describe('Requirement 7.8: When lesson in progress, display progress ring showing 50% completion', () => {
    it('should display progress ring for in-progress status', () => {
      const { getByText } = render(
        <LessonCard {...defaultProps} status="in-progress" />
      );
      
      // Progress ring should show 50% text
      expect(getByText('50%')).toBeTruthy();
    });

    it('should not display "Start →" for in-progress status', () => {
      const { queryByText } = render(
        <LessonCard {...defaultProps} status="in-progress" />
      );
      
      expect(queryByText('Start →')).toBeNull();
    });

    it('should not display checkmark for in-progress status', () => {
      const { queryByText } = render(
        <LessonCard {...defaultProps} status="in-progress" />
      );
      
      expect(queryByText('✓')).toBeNull();
    });
  });

  describe('Requirement 7.9: When lesson completed, display green checkmark (✓)', () => {
    it('should display checkmark for completed status', () => {
      const { getByText } = render(
        <LessonCard {...defaultProps} status="completed" />
      );
      
      expect(getByText('✓')).toBeTruthy();
    });

    it('should apply green color (#34D399) to checkmark container', () => {
      const { getByText } = render(
        <LessonCard {...defaultProps} status="completed" />
      );
      
      const checkmarkElement = getByText('✓');
      const checkmarkContainer = checkmarkElement.parent?.parent;
      
      expect(checkmarkContainer?.props.style).toMatchObject({ backgroundColor: '#34D399' });
    });

    it('should not display "Start →" for completed status', () => {
      const { queryByText } = render(
        <LessonCard {...defaultProps} status="completed" />
      );
      
      expect(queryByText('Start →')).toBeNull();
    });

    it('should not display progress ring for completed status', () => {
      const { queryByText } = render(
        <LessonCard {...defaultProps} status="completed" />
      );
      
      expect(queryByText('50%')).toBeNull();
    });
  });

  describe('Interaction and Accessibility', () => {
    it('should call onPress when card is pressed', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = render(
        <LessonCard {...defaultProps} onPress={onPressMock} />
      );
      
      const card = getByTestId('lesson-card-1');
      fireEvent.press(card);
      
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when card is disabled', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = render(
        <LessonCard {...defaultProps} onPress={onPressMock} disabled={true} />
      );
      
      const card = getByTestId('lesson-card-1');
      fireEvent.press(card);
      
      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('should have proper accessibility label', () => {
      const { getByTestId } = render(<LessonCard {...defaultProps} />);
      
      const card = getByTestId('lesson-card-1');
      expect(card.props.accessibilityLabel).toBe(
        'Lesson 1: Understanding Your Anxiety. 5 min, Beginner. Not started'
      );
    });

    it('should have proper accessibility label for completed lesson', () => {
      const { getByTestId } = render(
        <LessonCard {...defaultProps} status="completed" />
      );
      
      const card = getByTestId('lesson-card-1');
      expect(card.props.accessibilityLabel).toBe(
        'Lesson 1: Understanding Your Anxiety. 5 min, Beginner. Completed'
      );
    });

    it('should have proper accessibility label for in-progress lesson', () => {
      const { getByTestId } = render(
        <LessonCard {...defaultProps} status="in-progress" />
      );
      
      const card = getByTestId('lesson-card-1');
      expect(card.props.accessibilityLabel).toBe(
        'Lesson 1: Understanding Your Anxiety. 5 min, Beginner. In progress'
      );
    });
  });

  describe('Complete LessonCard Rendering', () => {
    it('should render all required elements together', () => {
      const { getByText } = render(<LessonCard {...defaultProps} />);
      
      // Number circle
      expect(getByText('1')).toBeTruthy();
      
      // Title
      expect(getByText('Understanding Your Anxiety')).toBeTruthy();
      
      // Metadata
      expect(getByText('5 min · Beginner')).toBeTruthy();
      
      // Status indicator
      expect(getByText('Start →')).toBeTruthy();
    });

    it('should render correctly for all lesson numbers', () => {
      const lessons = [
        { number: 1, title: 'Understanding Your Anxiety' },
        { number: 2, title: 'Box Breathing in 5 Minutes' },
        { number: 3, title: 'Cognitive Reframing 101' },
        { number: 4, title: 'Building a Journaling Habit' },
      ];

      lessons.forEach((lesson) => {
        const { getByText } = render(
          <LessonCard
            {...defaultProps}
            number={lesson.number}
            title={lesson.title}
          />
        );

        expect(getByText(lesson.number.toString())).toBeTruthy();
        expect(getByText(lesson.title)).toBeTruthy();
      });
    });

    it('should render correctly for all status types', () => {
      const statuses: Array<'not-started' | 'in-progress' | 'completed'> = [
        'not-started',
        'in-progress',
        'completed',
      ];

      statuses.forEach((status) => {
        const { getByText, queryByText } = render(
          <LessonCard {...defaultProps} status={status} />
        );

        if (status === 'not-started') {
          expect(getByText('Start →')).toBeTruthy();
        } else if (status === 'in-progress') {
          expect(getByText('50%')).toBeTruthy();
        } else if (status === 'completed') {
          expect(getByText('✓')).toBeTruthy();
        }
      });
    });
  });
});
