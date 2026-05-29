import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PillarsScreen from '../PillarsScreen';
import { AppProvider } from '../../../context/AppContext';

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

  // Helper function to render with AppProvider
  const renderWithAppContext = (props = defaultProps) => {
    return render(
      <AppProvider userId={props.userId}>
        <PillarsScreen {...props} />
      </AppProvider>
    );
  };

  it('renders the screen with header', () => {
    const { getByText } = renderWithAppContext();
    
    expect(getByText('Your Pillars')).toBeTruthy();
    expect(getByText('Choose your growth area')).toBeTruthy();
  });

  it('displays 6 pillar cards in grid', () => {
    const { getByText } = renderWithAppContext();
    
    expect(getByText('Mental')).toBeTruthy();
    expect(getByText('Relations')).toBeTruthy();
    expect(getByText('Career')).toBeTruthy();
    expect(getByText('Fitness')).toBeTruthy();
    expect(getByText('Finance')).toBeTruthy();
    expect(getByText('Hobbies')).toBeTruthy();
  });

  it('opens detail view when pillar card is pressed', async () => {
    const { getByText } = renderWithAppContext();
    
    const mentalCard = getByText('Mental');
    fireEvent.press(mentalCard);
    
    await waitFor(() => {
      expect(getByText('← Pillars')).toBeTruthy();
      expect(getByText('Level 1')).toBeTruthy();
    });
  });

  it('displays empty state when no lessons available', async () => {
    const { getByText } = renderWithAppContext();
    
    const mentalCard = getByText('Mental');
    fireEvent.press(mentalCard);
    
    await waitFor(() => {
      expect(getByText('No lessons available yet')).toBeTruthy();
      expect(getByText('Check back soon for new content!')).toBeTruthy();
    });
  });

  it('closes detail view when back button is pressed', async () => {
    const { getByText, queryByText } = renderWithAppContext();
    
    const mentalCard = getByText('Mental');
    fireEvent.press(mentalCard);
    
    await waitFor(() => {
      expect(getByText('← Pillars')).toBeTruthy();
    });
    
    const backButton = getByText('← Pillars');
    fireEvent.press(backButton);
    
    await waitFor(() => {
      expect(queryByText('← Pillars')).toBeNull();
    });
  });

  it('displays XP progress for each pillar', () => {
    const { getAllByText } = renderWithAppContext();
    
    // Each pillar should have XP progress text
    const xpTexts = getAllByText(/\d+ \/ 500 XP/);
    expect(xpTexts.length).toBeGreaterThan(0);
  });
});
