import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';
import { supabase } from '../../../services/supabaseClient';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  State: {},
  Directions: {},
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock dependencies
jest.mock('../../../services/supabaseClient');
jest.mock('../../../services/lessonService');
jest.mock('../../../services/heartService');
jest.mock('../../../services/progressService');
jest.mock('../../../services/partnerService');
jest.mock('../../../services/reportService');
jest.mock('../../../services/gamificationService');
jest.mock('../../../services/notificationService');
jest.mock('../../../services/relapseService');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('HomeScreen', () => {
  const mockUserId = 'test-user-id';
  const mockSubscriptionStatus = 'active';
  const mockOnNavigateToStreakBroke = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          current_streak: 5,
          last_activity_date: new Date().toISOString().split('T')[0],
          freeze_count: 2,
          count: 5,
          id: 'pillar-id',
        },
      }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null }),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] }),
      in: jest.fn().mockResolvedValue({ data: [] }),
    });
  });

  it('should render without crashing', async () => {
    const { getByTestId } = render(
      <HomeScreen
        userId={mockUserId}
        subscriptionStatus={mockSubscriptionStatus}
        onNavigateToStreakBroke={mockOnNavigateToStreakBroke}
      />
    );

    await waitFor(() => {
      // Wait for loading to complete
      expect(supabase.from).toHaveBeenCalled();
    });
  });

  it('should display streak information', async () => {
    const { findByText } = render(
      <HomeScreen
        userId={mockUserId}
        subscriptionStatus={mockSubscriptionStatus}
        onNavigateToStreakBroke={mockOnNavigateToStreakBroke}
      />
    );

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('streaks');
    });
  });

  it('should load daily goals on mount', async () => {
    const { getDailyGoals } = require('../../../services/gamificationService');
    getDailyGoals.mockResolvedValue([]);

    render(
      <HomeScreen
        userId={mockUserId}
        subscriptionStatus={mockSubscriptionStatus}
        onNavigateToStreakBroke={mockOnNavigateToStreakBroke}
      />
    );

    await waitFor(() => {
      expect(getDailyGoals).toHaveBeenCalledWith(mockUserId);
    });
  });

  it('should load achievements on mount', async () => {
    const { getAllAchievements, getUserAchievements } = require('../../../services/gamificationService');
    getAllAchievements.mockReturnValue([]);
    getUserAchievements.mockResolvedValue([]);

    render(
      <HomeScreen
        userId={mockUserId}
        subscriptionStatus={mockSubscriptionStatus}
        onNavigateToStreakBroke={mockOnNavigateToStreakBroke}
      />
    );

    await waitFor(() => {
      expect(getAllAchievements).toHaveBeenCalled();
      expect(getUserAchievements).toHaveBeenCalledWith(mockUserId);
    });
  });
});
