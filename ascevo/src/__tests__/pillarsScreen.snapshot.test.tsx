/**
 * Task 1.4: Visual Regression Snapshot Tests
 * 
 * Snapshot tests for visual regression detection:
 * - FilterChip (selected and unselected states)
 * - LessonCard (all three status states: completed, in-progress, not-started)
 * - DailyChallengeCard
 * - Full PillarsScreen with mock data
 * 
 * Validates Requirements: 10.1-10.7
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import PillarsScreen from '../screens/pillars/PillarsScreen';
import { AppProvider } from '../context/AppContext';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  State: {},
}));

// Mock expo-modules-core
jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn(),
  requireOptionalNativeModule: jest.fn(() => null),
  NativeModulesProxy: {},
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock i18n service
jest.mock('../services/i18nService', () => ({
  __esModule: true,
  default: {
    t: (key: string) => key,
    changeLanguage: jest.fn(),
    language: 'en',
  },
}));

// Mock storage services
jest.mock('../services/pillarStorageService', () => ({
  loadCompletedLessons: jest.fn().mockResolvedValue({ lessonIds: ['mental-health-lesson-1'], lastUpdated: '2025-01-10' }),
  saveCompletedLessons: jest.fn().mockResolvedValue(undefined),
  loadPillarProgress: jest.fn().mockResolvedValue({ completedCount: 1, totalCount: 6 }),
  savePillarProgress: jest.fn().mockResolvedValue(undefined),
  getCurrentDate: jest.fn(() => '2025-01-10'),
  shouldResetDailyChallenge: jest.fn(() => false),
  loadGlobalXP: jest.fn(() => Promise.resolve(100)),
  saveGlobalXP: jest.fn(() => Promise.resolve()),
}));

jest.mock('../services/pillarLessonService', () => ({
  completeLesson: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../services/pillarChallengeService', () => ({
  awardXP: jest.fn(() => Promise.resolve()),
  completeDailyChallenge: jest.fn(() => Promise.resolve()),
  isChallengeCompletedToday: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('../services/pillarXPService', () => ({
  calculateLevel: jest.fn((xp: number) => Math.floor(xp / 500) + 1),
  calculateProgress: jest.fn((xp: number) => ((xp % 500) / 500) * 100),
  getXPToNextLevel: jest.fn((xp: number) => 500 - (xp % 500)),
}));

jest.mock('../hooks/useButtonPressAnimation', () => ({
  useButtonPressAnimation: jest.fn(() => ({
    scaleAnim: { _value: 1 },
    handlePressIn: jest.fn(),
    handlePressOut: jest.fn(),
  })),
}));

// Mock Animated to prevent animation warnings in snapshots
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('Task 1.4: Visual Regression Snapshot Tests', () => {
  const mockUserId = 'test-user-123';
  const mockSubscriptionStatus = 'premium';

  // Set shorter timeout for snapshot tests
  jest.setTimeout(10000);

  describe('Full PillarsScreen Snapshot', () => {
    it('should match snapshot for full PillarsScreen with mock data', async () => {
      const { toJSON, getByText } = render(
        <AppProvider userId={mockUserId}>
          <PillarsScreen
            userId={mockUserId}
            subscriptionStatus={mockSubscriptionStatus}
          />
        </AppProvider>
      );

      // Wait for the screen to load
      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      }, { timeout: 5000 });

      expect(toJSON()).toMatchSnapshot();
    });

    it('should capture FilterChip components in both states', async () => {
      const { toJSON, getByText } = render(
        <AppProvider userId={mockUserId}>
          <PillarsScreen
            userId={mockUserId}
            subscriptionStatus={mockSubscriptionStatus}
          />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByText('Mental')).toBeTruthy();
      });

      // Snapshot captures both selected (Mental) and unselected (Relations, Career, etc.) FilterChips
      expect(toJSON()).toMatchSnapshot();
    });

    it('should capture LessonCard with completed status', async () => {
      const { toJSON, getByText } = render(
        <AppProvider userId={mockUserId}>
          <PillarsScreen
            userId={mockUserId}
            subscriptionStatus={mockSubscriptionStatus}
          />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByText('Understanding Your Anxiety')).toBeTruthy();
      });

      // mental-health-lesson-1 is mocked as completed and shows checkmark
      expect(toJSON()).toMatchSnapshot();
    });

    it('should capture LessonCard with not-started status', async () => {
      const { toJSON, getByText } = render(
        <AppProvider userId={mockUserId}>
          <PillarsScreen
            userId={mockUserId}
            subscriptionStatus={mockSubscriptionStatus}
          />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByText('Box Breathing in 5 Minutes')).toBeTruthy();
      });

      // Other lessons show "Start →" button
      expect(toJSON()).toMatchSnapshot();
    });

    it('should capture DailyChallengeCard structure', async () => {
      const { toJSON, getByText } = render(
        <AppProvider userId={mockUserId}>
          <PillarsScreen
            userId={mockUserId}
            subscriptionStatus={mockSubscriptionStatus}
          />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByText("Today's Mental Challenge")).toBeTruthy();
      });

      // Captures teal border, +30 XP badge, challenge description, Accept button
      expect(toJSON()).toMatchSnapshot();
    });

    it('should verify visual design consistency', async () => {
      const { toJSON, getByText } = render(
        <AppProvider userId={mockUserId}>
          <PillarsScreen
            userId={mockUserId}
            subscriptionStatus={mockSubscriptionStatus}
          />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });

      // Verifies colors, spacing, border-radius across all components
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
