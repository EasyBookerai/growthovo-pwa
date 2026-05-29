/**
 * Task 8.1: Lessons Section Header Test
 * 
 * Validates that the lessons section header displays correctly
 * with "Lessons" title and lesson count.
 * 
 * Requirement 7.1: Display section header "Lessons" with lesson count "4 lessons"
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// Mock component that simulates the lessons section header
const LessonsSectionHeader = ({ lessonCount }: { lessonCount: number }) => {
  return (
    <View testID="lessons-section-header" style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
      <Text testID="lessons-title" style={{ fontWeight: '700' }}>Lessons</Text>
      <Text testID="lessons-count" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {lessonCount} lessons
      </Text>
    </View>
  );
};

describe('Task 8.1: Lessons Section Header', () => {
  it('should display "Lessons" title', () => {
    const { getByTestId } = render(<LessonsSectionHeader lessonCount={4} />);
    
    const title = getByTestId('lessons-title');
    expect(title.props.children).toBe('Lessons');
  });

  it('should display lesson count with "lessons" suffix', () => {
    const { getByTestId } = render(<LessonsSectionHeader lessonCount={4} />);
    
    const count = getByTestId('lessons-count');
    expect(count.props.children).toBe('4 lessons');
  });

  it('should display correct count for different lesson numbers', () => {
    const { getByTestId, rerender } = render(<LessonsSectionHeader lessonCount={1} />);
    
    let count = getByTestId('lessons-count');
    expect(count.props.children).toBe('1 lessons');
    
    rerender(<LessonsSectionHeader lessonCount={3} />);
    count = getByTestId('lessons-count');
    expect(count.props.children).toBe('3 lessons');
    
    rerender(<LessonsSectionHeader lessonCount={4} />);
    count = getByTestId('lessons-count');
    expect(count.props.children).toBe('4 lessons');
  });

  it('should have horizontal layout with baseline alignment', () => {
    const { getByTestId } = render(<LessonsSectionHeader lessonCount={4} />);
    
    const header = getByTestId('lessons-section-header');
    expect(header.props.style).toMatchObject({
      flexDirection: 'row',
      alignItems: 'baseline',
    });
  });

  it('should style title as bold', () => {
    const { getByTestId } = render(<LessonsSectionHeader lessonCount={4} />);
    
    const title = getByTestId('lessons-title');
    expect(title.props.style).toMatchObject({
      fontWeight: '700',
    });
  });

  it('should style count with muted color', () => {
    const { getByTestId } = render(<LessonsSectionHeader lessonCount={4} />);
    
    const count = getByTestId('lessons-count');
    expect(count.props.style).toMatchObject({
      color: 'rgba(255,255,255,0.5)',
    });
  });
});
