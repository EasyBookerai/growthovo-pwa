import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PillarsScreen from '../PillarsScreen';

// Mock dependencies
jest.mock('../../../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [] })),
      })),
    })),
  },
}));

jest.mock('../../../services/lessonService', () => ({
  getLessonsForUnit: jest.fn(() => Promise.resolve([])),
  getCompletedLessonIds: jest.fn(() => Promise.resolve(new Set())),
  isLessonUnlocked: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('../../../services/challengeService', () => ({
  getTodayChallenge: jest.fn(() => Promise.resolve(null)),
  submitCheckIn: jest.fn(() => Promise.resolve()),
  getTodayCompletion: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('../../lesson/LessonPlayerScreen', () => 'LessonPlayerScreen');

describe('PillarsScreen', () => {
  const defaultProps = {
    userId: 'test-user-id',
    subscriptionStatus: 'active',
  };

  it('renders the screen with header', () => {
    const { getByText } = render(<PillarsScreen {...defaultProps} />);
    
    expect(getByText('Your Pillars')).toBeTruthy();
    expect(getByText('Choose your growth area')).toBeTruthy();
  });

  it('displays 6 pillar cards in grid', () => {
    const { getByText } = render(<PillarsScreen {...defaultProps} />);
    
    expect(getByText('Mental')).toBeTruthy();
    expect(getByText('Relations')).toBeTruthy();
    expect(getByText('Career')).toBeTruthy();
    expect(getByText('Fitness')).toBeTruthy();
    expect(getByText('Finance')).toBeTruthy();
    expect(getByText('Hobbies')).toBeTruthy();
  });

  it('opens detail view when pillar card is pressed', async () => {
    const { getByText, getAllByText } = render(<PillarsScreen {...defaultProps} />);
    
    const mentalCard = getByText('Mental');
    fireEvent.press(mentalCard);
    
    await waitFor(() => {
      expect(getByText('← Back')).toBeTruthy();
      expect(getByText('Your growth journey')).toBeTruthy();
    });
  });

  it('displays empty state when no lessons available', async () => {
    const { getByText } = render(<PillarsScreen {...defaultProps} />);
    
    const mentalCard = getByText('Mental');
    fireEvent.press(mentalCard);
    
    await waitFor(() => {
      expect(getByText('No lessons available yet')).toBeTruthy();
      expect(getByText('Check back soon for new content!')).toBeTruthy();
    });
  });

  it('closes detail view when back button is pressed', async () => {
    const { getByText, queryByText } = render(<PillarsScreen {...defaultProps} />);
    
    const mentalCard = getByText('Mental');
    fireEvent.press(mentalCard);
    
    await waitFor(() => {
      expect(getByText('← Back')).toBeTruthy();
    });
    
    const backButton = getByText('← Back');
    fireEvent.press(backButton);
    
    await waitFor(() => {
      expect(queryByText('← Back')).toBeNull();
    });
  });

  it('displays progress bars for each pillar', () => {
    const { getAllByText } = render(<PillarsScreen {...defaultProps} />);
    
    // Each pillar should have a progress percentage
    const progressTexts = getAllByText(/%/);
    expect(progressTexts.length).toBeGreaterThan(0);
  });
});
