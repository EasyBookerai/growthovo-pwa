/**
 * Test: PillarCard Rendering
 * 
 * Unit tests validating that PillarCard components render all required elements correctly:
 * - Level badge displays correct level format
 * - Progress bar displays correct XP text format
 * - Accent border uses correct color for each pillar
 * - Lesson count displays correctly
 * 
 * Validates Requirements 1.1, 1.2, 1.3, 1.4, 1.5-1.11
 * Task 2.7: Write unit tests for PillarCard rendering
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import PillarsScreen from '../PillarsScreen';
import { AppProvider } from '../../../context/AppContext';
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

describe('PillarCard Rendering', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Level Badge Display', () => {
    it('should display level badge with correct "Lvl {level}" format', () => {
      const { getAllByText } = render(<PillarsScreen {...defaultProps} />);
      
      // All 6 pillar cards should display "Lvl 1" badge
      const levelBadges = getAllByText('Lvl 1');
      expect(levelBadges).toHaveLength(6);
    });

    it('should display level badge for each pillar card', () => {
      const { getByText, getAllByText } = render(<PillarsScreen {...defaultProps} />);
      
      // Verify all pillar cards are rendered
      const pillarNames = ['Mental', 'Relations', 'Career', 'Fitness', 'Finance', 'Hobbies'];
      pillarNames.forEach((name) => {
        expect(getByText(name)).toBeTruthy();
      });
      
      // Verify each has a level badge
      const levelBadges = getAllByText('Lvl 1');
      expect(levelBadges).toHaveLength(pillarNames.length);
    });
  });

  describe('XP Progress Bar Display', () => {
    it('should display XP progress text in "{current} / 500 XP" format', () => {
      const { getAllByText } = render(<PillarsScreen {...defaultProps} />);
      
      // Each pillar should have XP progress text matching the format
      const xpTexts = getAllByText(/\d+ \/ 500 XP/);
      expect(xpTexts.length).toBeGreaterThan(0);
    });

    it('should display correct XP values for each pillar', () => {
      const { getByText } = render(<PillarsScreen {...defaultProps} />);
      
      // Based on PILLAR_DISPLAY in PillarsScreen.tsx:
      // mind: progress 0.3 -> 150 / 500 XP
      // communication: progress 0.5 -> 250 / 500 XP
      // money: progress 0.2 -> 100 / 500 XP
      // relationships: progress 0.7 -> 350 / 500 XP
      // finance: progress 0.4 -> 200 / 500 XP
      // hobbies: progress 0.1 -> 50 / 500 XP
      
      expect(getByText('150 / 500 XP')).toBeTruthy(); // Mental
      expect(getByText('250 / 500 XP')).toBeTruthy(); // Relations
      expect(getByText('100 / 500 XP')).toBeTruthy(); // Career
      expect(getByText('350 / 500 XP')).toBeTruthy(); // Fitness
      expect(getByText('200 / 500 XP')).toBeTruthy(); // Finance
      expect(getByText('50 / 500 XP')).toBeTruthy();  // Hobbies
    });

    it('should display XP progress bar for all pillar cards', () => {
      const { getAllByText } = render(<PillarsScreen {...defaultProps} />);
      
      // All 6 pillars should have XP progress text
      const xpTexts = getAllByText(/\d+ \/ 500 XP/);
      expect(xpTexts).toHaveLength(6);
    });
  });

  describe('Accent Border Colors', () => {
    it('should use correct accent color for Mental Health pillar', () => {
      // Mental Health (mind) should use #A78BFA
      expect(PILLAR_COLORS['mental-health']).toBe('#A78BFA');
    });

    it('should use correct accent color for Relationships pillar', () => {
      // Relationships (communication) should use #F472B6
      expect(PILLAR_COLORS['relationships']).toBe('#F472B6');
    });

    it('should use correct accent color for Career pillar', () => {
      // Career (money) should use #60A5FA
      expect(PILLAR_COLORS['career']).toBe('#60A5FA');
    });

    it('should use correct accent color for Fitness pillar', () => {
      // Fitness (relationships) should use #34D399
      expect(PILLAR_COLORS['fitness']).toBe('#34D399');
    });

    it('should use correct accent color for Finance pillar', () => {
      // Finance should use #FBBF24
      expect(PILLAR_COLORS['finance']).toBe('#FBBF24');
    });

    it('should use correct accent color for Hobbies pillar', () => {
      // Hobbies should use #F87171
      expect(PILLAR_COLORS['hobbies']).toBe('#F87171');
    });

    it('should have all 6 pillar accent colors defined', () => {
      const expectedColors = {
        'mental-health': '#A78BFA',
        'relationships': '#F472B6',
        'career': '#60A5FA',
        'fitness': '#34D399',
        'finance': '#FBBF24',
        'hobbies': '#F87171',
      };

      Object.entries(expectedColors).forEach(([pillarKey, expectedColor]) => {
        expect(PILLAR_COLORS[pillarKey as keyof typeof PILLAR_COLORS]).toBe(expectedColor);
      });
    });
  });

  describe('Lesson Count Display', () => {
    it('should display "4 lessons" text for all pillar cards', () => {
      const { getAllByText } = render(<PillarsScreen {...defaultProps} />);
      
      // All 6 pillar cards should display "4 lessons"
      const lessonCountTexts = getAllByText('4 lessons');
      expect(lessonCountTexts).toHaveLength(6);
    });

    it('should display lesson count for each pillar', () => {
      const { getByText, getAllByText } = render(<PillarsScreen {...defaultProps} />);
      
      // Verify all pillar cards are rendered
      const pillarNames = ['Mental', 'Relations', 'Career', 'Fitness', 'Finance', 'Hobbies'];
      pillarNames.forEach((name) => {
        expect(getByText(name)).toBeTruthy();
      });
      
      // Verify each has lesson count
      const lessonCounts = getAllByText('4 lessons');
      expect(lessonCounts).toHaveLength(pillarNames.length);
    });
  });

  describe('Complete PillarCard Rendering', () => {
    it('should render all required elements for each pillar card', () => {
      const { getByText, getAllByText } = render(<PillarsScreen {...defaultProps} />);
      
      // Verify all 6 pillars are rendered
      const pillarNames = ['Mental', 'Relations', 'Career', 'Fitness', 'Finance', 'Hobbies'];
      pillarNames.forEach((name) => {
        expect(getByText(name)).toBeTruthy();
      });
      
      // Verify all have level badges
      const levelBadges = getAllByText('Lvl 1');
      expect(levelBadges).toHaveLength(6);
      
      // Verify all have XP progress
      const xpTexts = getAllByText(/\d+ \/ 500 XP/);
      expect(xpTexts).toHaveLength(6);
      
      // Verify all have lesson counts
      const lessonCounts = getAllByText('4 lessons');
      expect(lessonCounts).toHaveLength(6);
    });

    it('should render pillar cards with correct structure', () => {
      const { getByTestId } = render(<PillarsScreen {...defaultProps} />);
      
      // Verify the main screen is rendered
      expect(getByTestId('pillars-screen')).toBeTruthy();
    });
  });
});
