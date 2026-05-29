/**
 * Task 10.2 Verification Test
 * 
 * Verifies that DetailView updates after lesson completion:
 * - Reloads pillar progress from localStorage
 * - Updates lesson row to show green checkmark
 * - Animates progress bar to reflect new XP total
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PillarsScreen from '../PillarsScreen';
import { AppProvider } from '../../../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated } from 'react-native';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  State: {},
  Directions: {},
}));

// Mock LessonPlayerScreen
jest.mock('../../lesson/LessonPlayerScreen', () => 'LessonPlayerScreen');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('Task 10.2: Update DetailView after lesson completion', () => {
  const defaultProps = {
    userId: 'test-user-id',
    subscriptionStatus: 'premium',
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
    
    // Mock AsyncStorage to return initial state
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'growthovo_completed_lessons') {
        return Promise.resolve(JSON.stringify({
          lessonIds: [],
          lastUpdated: new Date().toISOString(),
        }));
      }
      if (key === 'growthovo_xp') {
        return Promise.resolve('0');
      }
      if (key.startsWith('growthovo_pillar_progress_')) {
        return Promise.resolve(JSON.stringify({
          pillarKey: 'mental-health',
          xp: 0,
          level: 1,
          completedLessons: [],
          streak: 0,
          lastActivityDate: '',
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        }));
      }
      return Promise.resolve(null);
    });
  });

  it('should reload pillar progress from localStorage after lesson completion', async () => {
    const { getByText } = renderWithAppContext();

    // Open Mental Health pillar
    const mentalCard = getByText('Mental').parent?.parent?.parent;
    expect(mentalCard).toBeTruthy();
    fireEvent.press(mentalCard!);

    // Wait for detail view to load
    await waitFor(() => {
      expect(getByText('0 / 500 XP to Level 2')).toBeTruthy();
    });

    // Verify loadPillarProgress was called
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('growthovo_pillar_progress_mental-health');
  });

  it('should update lesson row to show green checkmark after completion', async () => {
    // Mock completed lesson
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'growthovo_completed_lessons') {
        return Promise.resolve(JSON.stringify({
          lessonIds: ['mental-health-lesson-1'],
          lastUpdated: new Date().toISOString(),
        }));
      }
      if (key === 'growthovo_xp') {
        return Promise.resolve('50');
      }
      if (key.startsWith('growthovo_pillar_progress_')) {
        return Promise.resolve(JSON.stringify({
          pillarKey: 'mental-health',
          xp: 50,
          level: 1,
          completedLessons: ['mental-health-lesson-1'],
          streak: 0,
          lastActivityDate: '2024-01-15',
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        }));
      }
      return Promise.resolve(null);
    });

    const { getByText } = render(<PillarsScreen {...defaultProps} />);

    // Open Mental Health pillar
    const mentalCard = getByText('Mental').parent?.parent?.parent;
    expect(mentalCard).toBeTruthy();
    fireEvent.press(mentalCard!);

    // Wait for detail view to load
    await waitFor(() => {
      expect(getByText('Understanding Your Anxiety')).toBeTruthy();
    });

    // Verify checkmark is displayed for completed lesson
    await waitFor(() => {
      expect(getByText('✓ Completed')).toBeTruthy();
    });
  });

  it('should animate progress bar to reflect new XP total', async () => {
    const animatedTimingSpy = jest.spyOn(Animated, 'timing');

    // Mock progress with 100 XP (20% progress)
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'growthovo_completed_lessons') {
        return Promise.resolve(JSON.stringify({
          lessonIds: ['mental-health-lesson-1', 'mental-health-lesson-2'],
          lastUpdated: new Date().toISOString(),
        }));
      }
      if (key === 'growthovo_xp') {
        return Promise.resolve('100');
      }
      if (key.startsWith('growthovo_pillar_progress_')) {
        return Promise.resolve(JSON.stringify({
          pillarKey: 'mental-health',
          xp: 100,
          level: 1,
          completedLessons: ['mental-health-lesson-1', 'mental-health-lesson-2'],
          streak: 0,
          lastActivityDate: '2024-01-15',
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        }));
      }
      return Promise.resolve(null);
    });

    const { getByText } = render(<PillarsScreen {...defaultProps} />);

    // Open Mental Health pillar
    const mentalCard = getByText('Mental').parent?.parent?.parent;
    expect(mentalCard).toBeTruthy();
    fireEvent.press(mentalCard!);

    // Wait for detail view to load
    await waitFor(() => {
      expect(getByText('100 / 500 XP to Level 2')).toBeTruthy();
    });

    // Verify animation was triggered
    expect(animatedTimingSpy).toHaveBeenCalled();
    
    // Verify animation parameters
    const animationCall = animatedTimingSpy.mock.calls.find(call => {
      const config = call[1];
      return config && config.duration === 300;
    });
    
    expect(animationCall).toBeTruthy();
  });

  it('should display correct XP values after loading from localStorage', async () => {
    // Mock progress with 250 XP (50% progress)
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'growthovo_completed_lessons') {
        return Promise.resolve(JSON.stringify({
          lessonIds: ['mental-health-lesson-1', 'mental-health-lesson-2', 'mental-health-lesson-3', 'mental-health-lesson-4', 'relationships-lesson-1'],
          lastUpdated: new Date().toISOString(),
        }));
      }
      if (key === 'growthovo_xp') {
        return Promise.resolve('250');
      }
      if (key.startsWith('growthovo_pillar_progress_')) {
        return Promise.resolve(JSON.stringify({
          pillarKey: 'mental-health',
          xp: 250,
          level: 1,
          completedLessons: ['mental-health-lesson-1', 'mental-health-lesson-2', 'mental-health-lesson-3', 'mental-health-lesson-4', 'relationships-lesson-1'],
          streak: 0,
          lastActivityDate: '2024-01-15',
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        }));
      }
      return Promise.resolve(null);
    });

    const { getByText } = render(<PillarsScreen {...defaultProps} />);

    // Open Mental Health pillar
    const mentalCard = getByText('Mental').parent?.parent?.parent;
    expect(mentalCard).toBeTruthy();
    fireEvent.press(mentalCard!);

    // Wait for detail view to load with correct XP
    await waitFor(() => {
      expect(getByText('250 / 500 XP to Level 2')).toBeTruthy();
    });
  });

  it('should update completion count in stats row', async () => {
    // Mock progress with 2 completed lessons
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'growthovo_completed_lessons') {
        return Promise.resolve(JSON.stringify({
          lessonIds: ['mental-health-lesson-1', 'mental-health-lesson-2'],
          lastUpdated: new Date().toISOString(),
        }));
      }
      if (key === 'growthovo_xp') {
        return Promise.resolve('100');
      }
      if (key.startsWith('growthovo_pillar_progress_')) {
        return Promise.resolve(JSON.stringify({
          pillarKey: 'mental-health',
          xp: 100,
          level: 1,
          completedLessons: ['mental-health-lesson-1', 'mental-health-lesson-2'],
          streak: 0,
          lastActivityDate: '2024-01-15',
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        }));
      }
      return Promise.resolve(null);
    });

    const { getByText, getAllByText } = render(<PillarsScreen {...defaultProps} />);

    // Open Mental Health pillar
    const mentalCard = getByText('Mental').parent?.parent?.parent;
    expect(mentalCard).toBeTruthy();
    fireEvent.press(mentalCard!);

    // Wait for detail view to load
    await waitFor(() => {
      expect(getByText('Done')).toBeTruthy();
    });

    // Verify completion count shows 2
    const completionValues = getAllByText('2');
    expect(completionValues.length).toBeGreaterThan(0);
  });
});
