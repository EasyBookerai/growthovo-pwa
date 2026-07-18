/**
 * Haptic Feedback Integration Tests for PillarsScreenV2
 * Tests that haptic feedback is triggered for button presses
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PillarsScreenV2 from '../PillarsScreenV2';
import { AppProvider } from '../../../context/AppContext';
import * as animationService from '../../../services/animationService';

// Mock dependencies
jest.mock('../../../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { total_xp: 0, current_streak: 0 } })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [] })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

jest.mock('../../../services/pillarStorageService', () => ({
  loadCompletedLessons: jest.fn(() => Promise.resolve({ lessonIds: [], lastUpdated: new Date().toISOString() })),
  saveCompletedLessons: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../services/pillarLessonService', () => ({
  completeLesson: jest.fn(() => Promise.resolve()),
}));

// Spy on the triggerHaptic function
jest.spyOn(animationService, 'triggerHaptic').mockImplementation(() => Promise.resolve());

describe('PillarsScreenV2 - Haptic Feedback', () => {
  const defaultProps = {
    userId: 'test-user-id',
    subscriptionStatus: 'active',
  };

  // Helper function to render with AppProvider
  const renderWithAppContext = (props = defaultProps) => {
    return render(
      <AppProvider userId={props.userId}>
        <PillarsScreenV2 {...props} />
      </AppProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FilterChip Haptic Feedback', () => {
    it('should trigger light haptic feedback when filter chip is pressed', async () => {
      const { getByText } = renderWithAppContext();
      
      // Find and press the "Relations" filter chip
      const relationsChip = getByText('Relations');
      fireEvent.press(relationsChip);
      
      // Verify light haptic was triggered
      expect(animationService.triggerHaptic).toHaveBeenCalledWith('light');
    });

    it('should trigger haptic for each filter chip press', async () => {
      const { getByText } = renderWithAppContext();
      
      // Press multiple filter chips
      fireEvent.press(getByText('Career'));
      fireEvent.press(getByText('Fitness'));
      fireEvent.press(getByText('Finance'));
      
      // Verify haptic was called 3 times (once per press)
      expect(animationService.triggerHaptic).toHaveBeenCalledTimes(3);
      expect(animationService.triggerHaptic).toHaveBeenCalledWith('light');
    });
  });

  describe('LessonCard Haptic Feedback', () => {
    it('should trigger medium haptic feedback when lesson card is pressed', async () => {
      const { getAllByText } = renderWithAppContext();
      
      // Find first lesson card (they have titles like "Understanding Anxiety")
      const lessonCards = getAllByText(/Understanding|Active Listening|Set One Career|Morning Mobility|Track Your Spending|Finding Your Creative/);
      
      if (lessonCards.length > 0) {
        fireEvent.press(lessonCards[0]);
        
        // Verify medium haptic was triggered
        expect(animationService.triggerHaptic).toHaveBeenCalledWith('medium');
      }
    });
  });

  describe('Challenge Accept Haptic Feedback', () => {
    it('should trigger medium haptic feedback when challenge is accepted', async () => {
      const { getByText } = renderWithAppContext();
      
      // Find and press the "Accept Challenge →" button
      const acceptButton = getByText('Accept Challenge →');
      fireEvent.press(acceptButton);
      
      // Verify medium haptic was triggered
      expect(animationService.triggerHaptic).toHaveBeenCalledWith('medium');
    });
  });

  describe('Haptic Consistency', () => {
    it('should use consistent haptic types across interactions', async () => {
      const { getByText, getAllByText } = renderWithAppContext();
      
      // Clear previous calls
      jest.clearAllMocks();
      
      // Press filter chip (light)
      fireEvent.press(getByText('Fitness'));
      expect(animationService.triggerHaptic).toHaveBeenLastCalledWith('light');
      
      // Press lesson card (medium)
      const lessonCards = getAllByText(/Morning Mobility/);
      if (lessonCards.length > 0) {
        fireEvent.press(lessonCards[0]);
        expect(animationService.triggerHaptic).toHaveBeenLastCalledWith('medium');
      }
      
      // Press challenge accept (medium)
      fireEvent.press(getByText('Accept Challenge →'));
      expect(animationService.triggerHaptic).toHaveBeenLastCalledWith('medium');
    });
  });
});
