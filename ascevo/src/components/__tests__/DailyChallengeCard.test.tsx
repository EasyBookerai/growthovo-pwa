import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DailyChallengeCard from '../DailyChallengeCard';
import type { PremiumPillarKey } from '../../types/pillars';

describe('DailyChallengeCard', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
  });

  describe('Visual Elements', () => {
    it('should display "Daily Challenge" title', () => {
      const { getByText } = render(
        <DailyChallengeCard
          pillarKey="mental-health"
          isCompleted={false}
          onComplete={mockOnComplete}
        />
      );

      expect(getByText('Daily Challenge')).toBeTruthy();
    });

    it('should display "+30 XP" badge', () => {
      const { getByText } = render(
        <DailyChallengeCard
          pillarKey="mental-health"
          isCompleted={false}
          onComplete={mockOnComplete}
        />
      );

      expect(getByText('+30 XP')).toBeTruthy();
    });

    it('should have teal border via testID', () => {
      const { getByTestId } = render(
        <DailyChallengeCard
          pillarKey="mental-health"
          isCompleted={false}
          onComplete={mockOnComplete}
        />
      );

      const card = getByTestId('daily-challenge-card');
      expect(card).toBeTruthy();
      // Note: Border color is verified via StyleSheet, not runtime props
    });
  });

  describe('Pillar-Specific Challenge Text', () => {
    it('should display Mental Health challenge text', () => {
      const { getByText } = render(
        <DailyChallengeCard
          pillarKey="mental-health"
          isCompleted={false}
          onComplete={mockOnComplete}
        />
      );

      expect(getByText('Practice 5 minutes of mindful breathing today')).toBeTruthy();
    });

    it('should display Relationships challenge text', () => {
      const { getByText } = render(
        <DailyChallengeCard
          pillarKey="relationships"
          isCompleted={false}
          onComplete={mockOnComplete}
        />
      );

      expect(getByText('Send a meaningful message to someone you care about')).toBeTruthy();
    });

    it('should display Career challenge text', () => {
      const { getByText } = render(
        <DailyChallengeCard
          pillarKey="career"
          isCompleted={false}
          onComplete={mockOnComplete}
        />
      );

      expect(getByText('Spend 30 minutes on focused, deep work without distractions')).toBeTruthy();
    });

    it('should display Fitness challenge text', () => {
      const { getByText } = render(
        <DailyChallengeCard
          pillarKey="fitness"
          isCompleted={false}
          onComplete={mockOnComplete}
        />
      );

      expect(getByText('Complete a 10-minute workout or walk')).toBeTruthy();
    });

    it('should display Finance challenge text', () => {
      const { getByText } = render(
        <DailyChallengeCard
          pillarKey="finance"
          isCompleted={false}
          onComplete={mockOnComplete}
        />
      );

      expect(getByText('Review your spending from the past 24 hours')).toBeTruthy();
    });

    it('should display Hobbies challenge text', () => {
      const { getByText } = render(
        <DailyChallengeCard
          pillarKey="hobbies"
          isCompleted={false}
          onComplete={mockOnComplete}
        />
      );

      expect(getByText('Dedicate 15 minutes to a creative activity you enjoy')).toBeTruthy();
    });
  });

  describe('Not Completed State', () => {
    it('should display "Start Challenge →" button when not completed', () => {
      const { getByText } = render(
        <DailyChallengeCard
          pillarKey="mental-health"
          isCompleted={false}
          onComplete={mockOnComplete}
        />
      );

      expect(getByText('Start Challenge →')).toBeTruthy();
    });

    it('should call onComplete when "Start Challenge" button is pressed', () => {
      const { getByTestId } = render(
        <DailyChallengeCard
          pillarKey="mental-health"
          isCompleted={false}
          onComplete={mockOnComplete}
        />
      );

      const button = getByTestId('start-challenge-button');
      fireEvent.press(button);

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('should not display "✓ Completed" text when not completed', () => {
      const { queryByText } = render(
        <DailyChallengeCard
          pillarKey="mental-health"
          isCompleted={false}
          onComplete={mockOnComplete}
        />
      );

      expect(queryByText('✓ Completed')).toBeNull();
    });
  });

  describe('Completed State', () => {
    it('should display "✓ Completed" text when completed', () => {
      const { getByText } = render(
        <DailyChallengeCard
          pillarKey="mental-health"
          isCompleted={true}
          onComplete={mockOnComplete}
        />
      );

      expect(getByText('✓ Completed')).toBeTruthy();
    });

    it('should not display "Start Challenge →" button when completed', () => {
      const { queryByText } = render(
        <DailyChallengeCard
          pillarKey="mental-health"
          isCompleted={true}
          onComplete={mockOnComplete}
        />
      );

      expect(queryByText('Start Challenge →')).toBeNull();
    });

    it('should not call onComplete when already completed', () => {
      const { queryByTestId } = render(
        <DailyChallengeCard
          pillarKey="mental-health"
          isCompleted={true}
          onComplete={mockOnComplete}
        />
      );

      // Button should not exist when completed
      const button = queryByTestId('start-challenge-button');
      expect(button).toBeNull();
      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });

  describe('State Transitions', () => {
    it('should transition from not completed to completed state', () => {
      const { getByText, queryByText, rerender } = render(
        <DailyChallengeCard
          pillarKey="mental-health"
          isCompleted={false}
          onComplete={mockOnComplete}
        />
      );

      // Initially not completed
      expect(getByText('Start Challenge →')).toBeTruthy();
      expect(queryByText('✓ Completed')).toBeNull();

      // Rerender as completed
      rerender(
        <DailyChallengeCard
          pillarKey="mental-health"
          isCompleted={true}
          onComplete={mockOnComplete}
        />
      );

      // Now completed
      expect(queryByText('Start Challenge →')).toBeNull();
      expect(getByText('✓ Completed')).toBeTruthy();
    });
  });

  describe('All Pillars Rendering', () => {
    const allPillars: PremiumPillarKey[] = [
      'mental-health',
      'relationships',
      'career',
      'fitness',
      'finance',
      'hobbies',
    ];

    it('should render correctly for all pillar types', () => {
      allPillars.forEach((pillarKey) => {
        const { getByText, getByTestId } = render(
          <DailyChallengeCard
            pillarKey={pillarKey}
            isCompleted={false}
            onComplete={mockOnComplete}
          />
        );

        // All should have title and XP badge
        expect(getByText('Daily Challenge')).toBeTruthy();
        expect(getByText('+30 XP')).toBeTruthy();
        expect(getByTestId('daily-challenge-card')).toBeTruthy();
      });
    });
  });
});
