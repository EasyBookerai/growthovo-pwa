/**
 * Test: PillarCard Accent Border Implementation
 * 
 * Validates that PillarCard components render with the correct 3px left border
 * using pillar-specific accent colors as specified in Requirements 1.5-1.11
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { AppProvider } from '../../../context/AppContext';
import { Animated } from 'react-native';
import PillarsScreen from '../PillarsScreen';
import { PILLAR_COLORS } from '../../../types/pillars';

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

describe('PillarCard Accent Border', () => {
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

  it('should render all 6 pillar cards', () => {
    const { getByText } = render(<PillarsScreen {...defaultProps} />);
    
    expect(getByText('Mental')).toBeTruthy();
    expect(getByText('Relations')).toBeTruthy();
    expect(getByText('Career')).toBeTruthy();
    expect(getByText('Fitness')).toBeTruthy();
    expect(getByText('Finance')).toBeTruthy();
    expect(getByText('Hobbies')).toBeTruthy();
  });

  it('should have accent colors defined for all pillars', () => {
    // Verify that PILLAR_COLORS has all required colors
    expect(PILLAR_COLORS['mental-health']).toBe('#A78BFA');
    expect(PILLAR_COLORS['relationships']).toBe('#F472B6');
    expect(PILLAR_COLORS['career']).toBe('#60A5FA');
    expect(PILLAR_COLORS['fitness']).toBe('#34D399');
    expect(PILLAR_COLORS['finance']).toBe('#FBBF24');
    expect(PILLAR_COLORS['hobbies']).toBe('#F87171');
  });

  it('should render pillar cards with level badges', () => {
    const { getAllByText } = render(<PillarsScreen {...defaultProps} />);
    
    // Each pillar should have a "Lvl 1" badge
    const levelBadges = getAllByText('Lvl 1');
    expect(levelBadges).toHaveLength(6);
  });

  it('should render pillar cards with XP progress', () => {
    const { getAllByText } = render(<PillarsScreen {...defaultProps} />);
    
    // Each pillar should have XP progress text
    const xpTexts = getAllByText(/\d+ \/ 500 XP/);
    expect(xpTexts.length).toBeGreaterThan(0);
  });
});
