/**
 * Task 13.2 Verification Test
 * 
 * Verifies that progress bar fill animation works correctly:
 * - Animates progress bar width changes with 300ms ease transition
 * - Uses Animated.timing for smooth XP updates
 * - Validates Requirements 15.4
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PillarsScreen from '../PillarsScreen';
import { AppProvider } from '../../../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated, Easing } from 'react-native';

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

describe('Task 13.2: Progress bar fill animation', () => {
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

  it('should animate progress bar with 300ms duration', async () => {
    const animatedTimingSpy = jest.spyOn(Animated, 'timing');

    // Mock progress with 150 XP (30% progress)
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'growthovo_completed_lessons') {
        return Promise.resolve(JSON.stringify({
          lessonIds: ['mental-health-lesson-1', 'mental-health-lesson-2', 'mental-health-lesson-3'],
          lastUpdated: new Date().toISOString(),
        }));
      }
      if (key === 'growthovo_xp') {
        return Promise.resolve('150');
      }
      if (key.startsWith('growthovo_pillar_progress_')) {
        return Promise.resolve(JSON.stringify({
          pillarKey: 'mental-health',
          xp: 150,
          level: 1,
          completedLessons: ['mental-health-lesson-1', 'mental-health-lesson-2', 'mental-health-lesson-3'],
          streak: 0,
          lastActivityDate: '2024-01-15',
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        }));
      }
      return Promise.resolve(null);
    });

    const { getByText } = renderWithAppContext();

    // Open Mental Health pillar
    const mentalCard = getByText('Mental').parent?.parent?.parent;
    expect(mentalCard).toBeTruthy();
    fireEvent.press(mentalCard!);

    // Wait for detail view to load
    await waitFor(() => {
      expect(getByText('150 / 500 XP to Level 2')).toBeTruthy();
    });

    // Verify Animated.timing was called
    expect(animatedTimingSpy).toHaveBeenCalled();
    
    // Find the animation call with 300ms duration
    const animationCall = animatedTimingSpy.mock.calls.find(call => {
      const config = call[1];
      return config && config.duration === 300;
    });
    
    expect(animationCall).toBeTruthy();
    
    // Verify animation config has 300ms duration
    const config = animationCall![1];
    expect(config.duration).toBe(300);
  });

  it('should use ease easing function for smooth transitions', async () => {
    const animatedTimingSpy = jest.spyOn(Animated, 'timing');

    // Mock progress with 200 XP (40% progress)
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'growthovo_completed_lessons') {
        return Promise.resolve(JSON.stringify({
          lessonIds: ['mental-health-lesson-1', 'mental-health-lesson-2', 'mental-health-lesson-3', 'mental-health-lesson-4'],
          lastUpdated: new Date().toISOString(),
        }));
      }
      if (key === 'growthovo_xp') {
        return Promise.resolve('200');
      }
      if (key.startsWith('growthovo_pillar_progress_')) {
        return Promise.resolve(JSON.stringify({
          pillarKey: 'mental-health',
          xp: 200,
          level: 1,
          completedLessons: ['mental-health-lesson-1', 'mental-health-lesson-2', 'mental-health-lesson-3', 'mental-health-lesson-4'],
          streak: 0,
          lastActivityDate: '2024-01-15',
          challengeCompletedToday: false,
          challengeCompletionDate: null,
        }));
      }
      return Promise.resolve(null);
    });

    const { getByText } = renderWithAppContext();

    // Open Mental Health pillar
    const mentalCard = getByText('Mental').parent?.parent?.parent;
    expect(mentalCard).toBeTruthy();
    fireEvent.press(mentalCard!);

    // Wait for detail view to load
    await waitFor(() => {
      expect(getByText('200 / 500 XP to Level 2')).toBeTruthy();
    });

    // Verify Animated.timing was called
    expect(animatedTimingSpy).toHaveBeenCalled();
    
    // Find the animation call with 300ms duration
    const animationCall = animatedTimingSpy.mock.calls.find(call => {
      const config = call[1];
      return config && config.duration === 300;
    });
    
    expect(animationCall).toBeTruthy();
    
    // Verify animation config has ease easing
    const config = animationCall![1];
    expect(config.easing).toBe(Easing.ease);
  });

  it('should use useNativeDriver: false for width animation', async () => {
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

    const { getByText } = renderWithAppContext();

    // Open Mental Health pillar
    const mentalCard = getByText('Mental').parent?.parent?.parent;
    expect(mentalCard).toBeTruthy();
    fireEvent.press(mentalCard!);

    // Wait for detail view to load
    await waitFor(() => {
      expect(getByText('100 / 500 XP to Level 2')).toBeTruthy();
    });

    // Verify Animated.timing was called
    expect(animatedTimingSpy).toHaveBeenCalled();
    
    // Find the animation call with 300ms duration
    const animationCall = animatedTimingSpy.mock.calls.find(call => {
      const config = call[1];
      return config && config.duration === 300;
    });
    
    expect(animationCall).toBeTruthy();
    
    // Verify animation config has useNativeDriver: false
    // (required for width animations which are layout properties)
    const config = animationCall![1];
    expect(config.useNativeDriver).toBe(false);
  });

  it('should animate progress bar on XP updates', async () => {
    const animatedTimingSpy = jest.spyOn(Animated, 'timing');

    // Start with 0 XP
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

    const { getByText } = renderWithAppContext();

    // Open Mental Health pillar
    const mentalCard = getByText('Mental').parent?.parent?.parent;
    expect(mentalCard).toBeTruthy();
    fireEvent.press(mentalCard!);

    // Wait for detail view to load
    await waitFor(() => {
      expect(getByText('0 / 500 XP to Level 2')).toBeTruthy();
    });

    // Clear previous calls
    animatedTimingSpy.mockClear();

    // Simulate XP update by updating AsyncStorage and reopening modal
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

    // Close and reopen modal to trigger animation
    const backButton = getByText('← Pillars');
    fireEvent.press(backButton);

    await waitFor(() => {
      expect(getByText('Mental')).toBeTruthy();
    });

    // Reopen modal
    const mentalCardAgain = getByText('Mental').parent?.parent?.parent;
    fireEvent.press(mentalCardAgain!);

    // Wait for detail view to load with new XP
    await waitFor(() => {
      expect(getByText('50 / 500 XP to Level 2')).toBeTruthy();
    });

    // Verify animation was triggered with new XP value
    expect(animatedTimingSpy).toHaveBeenCalled();
    
    // Find the animation call with 300ms duration
    const animationCall = animatedTimingSpy.mock.calls.find(call => {
      const config = call[1];
      return config && config.duration === 300;
    });
    
    expect(animationCall).toBeTruthy();
  });

  it('should calculate correct progress percentage for animation', async () => {
    const animatedTimingSpy = jest.spyOn(Animated, 'timing');

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

    const { getByText } = renderWithAppContext();

    // Open Mental Health pillar
    const mentalCard = getByText('Mental').parent?.parent?.parent;
    expect(mentalCard).toBeTruthy();
    fireEvent.press(mentalCard!);

    // Wait for detail view to load
    await waitFor(() => {
      expect(getByText('250 / 500 XP to Level 2')).toBeTruthy();
    });

    // Verify Animated.timing was called
    expect(animatedTimingSpy).toHaveBeenCalled();
    
    // Find the animation call with 300ms duration
    const animationCall = animatedTimingSpy.mock.calls.find(call => {
      const config = call[1];
      return config && config.duration === 300;
    });
    
    expect(animationCall).toBeTruthy();
    
    // Verify the animated value is set to correct percentage
    // 250 XP out of 500 = 50%
    const animatedValue = animationCall![0];
    expect(animatedValue).toBeDefined();
    
    // The toValue should be 50 (representing 50%)
    const config = animationCall![1];
    expect(config.toValue).toBe(50);
  });
});
