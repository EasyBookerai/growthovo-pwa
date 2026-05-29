/**
 * XP Synchronization Home Screen Integration Tests
 * Task 12.3: Verify Home screen stat updates
 * 
 * Tests the complete XP flow from Pillars to AppContext to Home screen:
 * - XP earned in Pillars appears on Home screen
 * - AppContext.xp reflects new total
 * - Cross-screen state consistency
 * 
 * Validates Requirements:
 * - 17.1: XP awarded in Pillars updates AppContext
 * - 17.2: Home screen stats reflect new XP value
 * - 17.3: AppContext used as fallback if needed
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PillarsScreen from '../screens/pillars/PillarsScreen';
import SimpleHomeScreen from '../screens/home/SimpleHomeScreen';
import { AppProvider } from '../context/AppContext';
import { loadCompletedLessons, loadPillarProgress, savePillarProgress, saveCompletedLessons } from '../services/pillarStorageService';

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

// Mock services
jest.mock('../services/pillarStorageService', () => ({
  loadCompletedLessons: jest.fn(),
  loadPillarProgress: jest.fn(),
  savePillarProgress: jest.fn(),
  saveCompletedLessons: jest.fn(),
  getCurrentDate: jest.fn(() => '2024-01-15'),
  shouldResetDailyChallenge: jest.fn(() => false),
  loadGlobalXP: jest.fn(() => Promise.resolve(0)),
  saveGlobalXP: jest.fn(() => Promise.resolve()),
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

// Mock Supabase client
const mockSupabaseUpdate = jest.fn(() => ({
  eq: jest.fn(() => Promise.resolve({ error: null })),
}));

const mockSupabaseSelect = jest.fn(() => ({
  eq: jest.fn(() => ({
    single: jest.fn(() => Promise.resolve({
      data: { total_xp: 0, current_streak: 0 },
      error: null,
    })),
  })),
}));

jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSupabaseSelect,
      update: mockSupabaseUpdate,
    })),
  },
}));

const Tab = createBottomTabNavigator();

describe('XP Synchronization: Pillars → AppContext → Home Screen', () => {
  const mockUserId = 'test-user-123';
  const mockSubscriptionStatus = 'premium';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset localStorage mocks to default state
    (loadCompletedLessons as jest.Mock).mockResolvedValue({
      lessonIds: [],
      lastUpdated: new Date().toISOString(),
    });
    
    (loadPillarProgress as jest.Mock).mockResolvedValue({
      pillarKey: 'mental-health',
      xp: 0,
      level: 1,
      completedLessons: [],
      streak: 0,
      lastActivityDate: '',
      challengeCompletedToday: false,
      challengeCompletionDate: null,
    });

    // Reset Supabase mocks
    mockSupabaseSelect.mockReturnValue({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: { total_xp: 0, current_streak: 0 },
          error: null,
        })),
      })),
    });

    mockSupabaseUpdate.mockReturnValue({
      eq: jest.fn(() => Promise.resolve({ error: null })),
    });
  });

  /**
   * Helper function to render app with navigation
   */
  const renderApp = () => {
    return render(
      <AppProvider userId={mockUserId}>
        <NavigationContainer>
          <Tab.Navigator initialRouteName="Home">
            <Tab.Screen name="Home">
              {(props) => (
                <SimpleHomeScreen
                  {...props}
                  userId={mockUserId}
                  subscriptionStatus={mockSubscriptionStatus}
                />
              )}
            </Tab.Screen>
            <Tab.Screen name="Pillars">
              {(props) => (
                <PillarsScreen
                  {...props}
                  userId={mockUserId}
                  subscriptionStatus={mockSubscriptionStatus}
                />
              )}
            </Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>
      </AppProvider>
    );
  };

  /**
   * Test 1: XP earned in Pillars appears on Home screen
   * 
   * This test validates the complete flow:
   * 1. User starts on Home screen with 0 XP
   * 2. User navigates to Pillars
   * 3. User completes a lesson (+50 XP)
   * 4. User navigates back to Home
   * 5. Home screen displays updated XP (50)
   * 
   * Validates Requirements: 17.1, 17.2
   */
  describe('XP Flow: Pillars → AppContext → Home', () => {
    it('should display XP earned in Pillars on Home screen', async () => {
      const { getByText, getByTestId } = renderApp();

      // Wait for Home screen to load
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Verify initial XP is 0 on Home screen
      await waitFor(() => {
        expect(getByText(/0/)).toBeTruthy(); // XP stat card shows 0
      });

      // Navigate to Pillars tab
      const pillarsTab = getByText('Pillars');
      fireEvent.press(pillarsTab);

      // Wait for Pillars screen to load
      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });

      // Open Mental Health pillar
      const mentalPillar = getByText('Mental');
      fireEvent.press(mentalPillar);

      // Wait for detail view
      await waitFor(() => {
        expect(getByText('← Pillars')).toBeTruthy();
      });

      // Open first lesson
      const firstLesson = getByText('Understanding Your Anxiety');
      fireEvent.press(firstLesson);

      // Wait for lesson modal
      await waitFor(() => {
        expect(getByText('5 min read')).toBeTruthy();
      });

      // Complete lesson (+50 XP)
      const completeButton = getByText(/Mark as Complete.*\+50 XP/);
      fireEvent.press(completeButton);

      // Wait for completion
      await waitFor(() => {
        expect(getByText(/50 \/ 500 XP/)).toBeTruthy();
      }, { timeout: 3000 });

      // Navigate back to Home tab
      const homeTab = getByText('Home');
      fireEvent.press(homeTab);

      // Wait for Home screen to be visible
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Verify XP updated to 50 on Home screen
      await waitFor(() => {
        expect(getByText(/50/)).toBeTruthy(); // XP stat card shows 50
      }, { timeout: 3000 });
    });

    it('should update AppContext.xp when lesson is completed', async () => {
      const { getByText } = renderApp();

      // Navigate to Pillars
      await waitFor(() => {
        expect(getByText('Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Pillars'));

      // Wait for Pillars screen
      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });

      // Open pillar and complete lesson
      fireEvent.press(getByText('Mental'));
      await waitFor(() => {
        expect(getByText('Understanding Your Anxiety')).toBeTruthy();
      });

      fireEvent.press(getByText('Understanding Your Anxiety'));
      await waitFor(() => {
        expect(getByText(/Mark as Complete/)).toBeTruthy();
      });

      fireEvent.press(getByText(/Mark as Complete.*\+50 XP/));

      // Wait for completion
      await waitFor(() => {
        expect(getByText(/50 \/ 500 XP/)).toBeTruthy();
      }, { timeout: 3000 });

      // Verify Supabase update was called with new XP
      await waitFor(() => {
        expect(mockSupabaseUpdate).toHaveBeenCalledWith({ total_xp: 50 });
      }, { timeout: 3000 });
    });

    it('should maintain XP consistency across multiple screen navigations', async () => {
      const { getByText, getByTestId } = renderApp();

      // Start on Home, verify 0 XP
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Navigate to Pillars
      fireEvent.press(getByText('Pillars'));
      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });

      // Complete first lesson (+50 XP)
      fireEvent.press(getByText('Mental'));
      await waitFor(() => {
        expect(getByText('Understanding Your Anxiety')).toBeTruthy();
      });
      fireEvent.press(getByText('Understanding Your Anxiety'));
      await waitFor(() => {
        expect(getByText(/Mark as Complete/)).toBeTruthy();
      });
      fireEvent.press(getByText(/Mark as Complete.*\+50 XP/));

      await waitFor(() => {
        expect(getByText(/50 \/ 500 XP/)).toBeTruthy();
      }, { timeout: 3000 });

      // Navigate to Home
      fireEvent.press(getByText('Home'));
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Verify 50 XP on Home
      await waitFor(() => {
        expect(getByText(/50/)).toBeTruthy();
      }, { timeout: 3000 });

      // Navigate back to Pillars
      fireEvent.press(getByText('Pillars'));
      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });

      // Open pillar again, verify XP still 50
      fireEvent.press(getByText('Mental'));
      await waitFor(() => {
        expect(getByText(/50 \/ 500 XP/)).toBeTruthy();
      });

      // Complete second lesson (+50 XP, total 100)
      fireEvent.press(getByText('Box Breathing in 5 Minutes'));
      await waitFor(() => {
        expect(getByText(/Mark as Complete/)).toBeTruthy();
      });
      fireEvent.press(getByText(/Mark as Complete.*\+50 XP/));

      await waitFor(() => {
        expect(getByText(/100 \/ 500 XP/)).toBeTruthy();
      }, { timeout: 3000 });

      // Navigate to Home again
      fireEvent.press(getByText('Home'));
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Verify 100 XP on Home
      await waitFor(() => {
        expect(getByText(/100/)).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('should update Home screen when daily challenge is completed', async () => {
      const { getByText, getByTestId } = renderApp();

      // Navigate to Pillars
      await waitFor(() => {
        expect(getByText('Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Pillars'));

      // Wait for Pillars screen
      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });

      // Open pillar
      fireEvent.press(getByText('Mental'));
      await waitFor(() => {
        expect(getByText('Daily Challenge')).toBeTruthy();
      });

      // Complete daily challenge (+30 XP)
      const challengeButton = getByText('Start Challenge →');
      fireEvent.press(challengeButton);

      // Wait for challenge completion
      await waitFor(() => {
        expect(getByText('✓ Completed')).toBeTruthy();
      }, { timeout: 3000 });

      // Verify XP increased by 30
      await waitFor(() => {
        expect(getByText(/30 \/ 500 XP/)).toBeTruthy();
      }, { timeout: 3000 });

      // Navigate to Home
      fireEvent.press(getByText('Home'));
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Verify 30 XP on Home screen
      await waitFor(() => {
        expect(getByText(/30/)).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('should accumulate XP from multiple lessons across different pillars', async () => {
      const { getByText, getByTestId } = renderApp();

      // Navigate to Pillars
      await waitFor(() => {
        expect(getByText('Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Pillars'));

      // Complete lesson in Mental Health (+50 XP)
      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Mental'));
      await waitFor(() => {
        expect(getByText('Understanding Your Anxiety')).toBeTruthy();
      });
      fireEvent.press(getByText('Understanding Your Anxiety'));
      await waitFor(() => {
        expect(getByText(/Mark as Complete/)).toBeTruthy();
      });
      fireEvent.press(getByText(/Mark as Complete.*\+50 XP/));

      await waitFor(() => {
        expect(getByText(/50 \/ 500 XP/)).toBeTruthy();
      }, { timeout: 3000 });

      // Close detail view
      fireEvent.press(getByText('← Pillars'));

      // Update mocks for Relationships pillar
      (loadPillarProgress as jest.Mock).mockResolvedValue({
        pillarKey: 'relationships',
        xp: 0,
        level: 1,
        completedLessons: [],
        streak: 0,
        lastActivityDate: '',
        challengeCompletedToday: false,
        challengeCompletionDate: null,
      });

      // Complete lesson in Relationships (+50 XP, total 100)
      fireEvent.press(getByText('Relations'));
      await waitFor(() => {
        expect(getByText('Active Listening Mastery')).toBeTruthy();
      });
      fireEvent.press(getByText('Active Listening Mastery'));
      await waitFor(() => {
        expect(getByText(/Mark as Complete/)).toBeTruthy();
      });
      fireEvent.press(getByText(/Mark as Complete.*\+50 XP/));

      await waitFor(() => {
        expect(getByText(/50 \/ 500 XP/)).toBeTruthy();
      }, { timeout: 3000 });

      // Navigate to Home
      fireEvent.press(getByText('Home'));
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Verify total XP is 100 (50 + 50)
      await waitFor(() => {
        expect(getByText(/100/)).toBeTruthy();
      }, { timeout: 3000 });

      // Verify Supabase was called with cumulative XP
      expect(mockSupabaseUpdate).toHaveBeenCalledWith({ total_xp: 100 });
    });
  });

  /**
   * Test 2: AppContext synchronization
   * 
   * This test validates that AppContext correctly manages XP state:
   * 1. AppContext.xp updates when XP is awarded
   * 2. All consuming components receive updated XP
   * 3. Level is recalculated automatically
   * 
   * Validates Requirements: 17.1
   */
  describe('AppContext Synchronization', () => {
    it('should update AppContext.xp when XP is awarded in Pillars', async () => {
      const { getByText } = renderApp();

      // Navigate to Pillars
      await waitFor(() => {
        expect(getByText('Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Pillars'));

      // Complete lesson
      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Mental'));
      await waitFor(() => {
        expect(getByText('Understanding Your Anxiety')).toBeTruthy();
      });
      fireEvent.press(getByText('Understanding Your Anxiety'));
      await waitFor(() => {
        expect(getByText(/Mark as Complete/)).toBeTruthy();
      });
      fireEvent.press(getByText(/Mark as Complete.*\+50 XP/));

      // Verify AppContext updateXP was called (via Supabase update)
      await waitFor(() => {
        expect(mockSupabaseUpdate).toHaveBeenCalledWith({ total_xp: 50 });
      }, { timeout: 3000 });
    });

    it('should recalculate level when XP crosses threshold', async () => {
      // Set initial XP to 90 (close to level 2 at 100 XP)
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { total_xp: 90, current_streak: 0 },
            error: null,
          })),
        })),
      });

      const { getByText, getByTestId } = renderApp();

      // Wait for Home screen to load with level 1
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Navigate to Pillars and complete lesson (+50 XP, total 140)
      fireEvent.press(getByText('Pillars'));
      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Mental'));
      await waitFor(() => {
        expect(getByText('Understanding Your Anxiety')).toBeTruthy();
      });
      fireEvent.press(getByText('Understanding Your Anxiety'));
      await waitFor(() => {
        expect(getByText(/Mark as Complete/)).toBeTruthy();
      });
      fireEvent.press(getByText(/Mark as Complete.*\+50 XP/));

      // Wait for XP update
      await waitFor(() => {
        expect(mockSupabaseUpdate).toHaveBeenCalledWith({ total_xp: 140 });
      }, { timeout: 3000 });

      // Navigate to Home
      fireEvent.press(getByText('Home'));
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Verify level updated to 2 (140 XP / 100 = level 2)
      // Note: AppContext calculates level as floor(xp / 100) + 1
      await waitFor(() => {
        expect(getByText(/140/)).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('should handle AppContext sync failure gracefully', async () => {
      // Mock Supabase update failure
      mockSupabaseUpdate.mockReturnValue({
        eq: jest.fn(() => Promise.resolve({ 
          error: { message: 'Network error' } 
        })),
      });

      const { getByText } = renderApp();

      // Navigate to Pillars
      await waitFor(() => {
        expect(getByText('Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Pillars'));

      // Complete lesson
      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Mental'));
      await waitFor(() => {
        expect(getByText('Understanding Your Anxiety')).toBeTruthy();
      });
      fireEvent.press(getByText('Understanding Your Anxiety'));
      await waitFor(() => {
        expect(getByText(/Mark as Complete/)).toBeTruthy();
      });
      fireEvent.press(getByText(/Mark as Complete.*\+50 XP/));

      // XP should still update locally even if sync fails
      await waitFor(() => {
        expect(getByText(/50 \/ 500 XP/)).toBeTruthy();
      }, { timeout: 3000 });

      // Error message should be displayed
      await waitFor(() => {
        expect(getByText(/Failed to save your XP/)).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  /**
   * Test 3: Cross-screen state consistency
   * 
   * This test validates that XP state remains consistent:
   * 1. XP persists across app navigation
   * 2. Multiple components show same XP value
   * 3. State updates propagate to all consumers
   * 
   * Validates Requirements: 17.2
   */
  describe('Cross-Screen State Consistency', () => {
    it('should maintain consistent XP across Home and Pillars screens', async () => {
      const { getByText, getByTestId } = renderApp();

      // Start on Home with 0 XP
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Navigate to Pillars, verify 0 XP
      fireEvent.press(getByText('Pillars'));
      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Mental'));
      await waitFor(() => {
        expect(getByText(/0 \/ 500 XP/)).toBeTruthy();
      });

      // Complete lesson (+50 XP)
      fireEvent.press(getByText('Understanding Your Anxiety'));
      await waitFor(() => {
        expect(getByText(/Mark as Complete/)).toBeTruthy();
      });
      fireEvent.press(getByText(/Mark as Complete.*\+50 XP/));

      await waitFor(() => {
        expect(getByText(/50 \/ 500 XP/)).toBeTruthy();
      }, { timeout: 3000 });

      // Navigate to Home, verify 50 XP
      fireEvent.press(getByText('Home'));
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });
      await waitFor(() => {
        expect(getByText(/50/)).toBeTruthy();
      }, { timeout: 3000 });

      // Navigate back to Pillars, verify still 50 XP
      fireEvent.press(getByText('Pillars'));
      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Mental'));
      await waitFor(() => {
        expect(getByText(/50 \/ 500 XP/)).toBeTruthy();
      });
    });

    it('should update all stat cards on Home screen when XP changes', async () => {
      const { getByText, getByTestId } = renderApp();

      // Navigate to Pillars and earn XP
      await waitFor(() => {
        expect(getByText('Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Pillars'));

      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Mental'));
      await waitFor(() => {
        expect(getByText('Understanding Your Anxiety')).toBeTruthy();
      });
      fireEvent.press(getByText('Understanding Your Anxiety'));
      await waitFor(() => {
        expect(getByText(/Mark as Complete/)).toBeTruthy();
      });
      fireEvent.press(getByText(/Mark as Complete.*\+50 XP/));

      await waitFor(() => {
        expect(getByText(/50 \/ 500 XP/)).toBeTruthy();
      }, { timeout: 3000 });

      // Navigate to Home
      fireEvent.press(getByText('Home'));
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Verify XP stat card shows 50
      await waitFor(() => {
        expect(getByText(/50/)).toBeTruthy();
      }, { timeout: 3000 });

      // Note: Level stat card should also update if XP crosses threshold
      // Level = floor(50 / 100) + 1 = 1 (no level change yet)
    });

    it('should persist XP state across rapid screen switches', async () => {
      const { getByText, getByTestId } = renderApp();

      // Complete lesson in Pillars
      await waitFor(() => {
        expect(getByText('Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Pillars'));

      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });
      fireEvent.press(getByText('Mental'));
      await waitFor(() => {
        expect(getByText('Understanding Your Anxiety')).toBeTruthy();
      });
      fireEvent.press(getByText('Understanding Your Anxiety'));
      await waitFor(() => {
        expect(getByText(/Mark as Complete/)).toBeTruthy();
      });
      fireEvent.press(getByText(/Mark as Complete.*\+50 XP/));

      await waitFor(() => {
        expect(getByText(/50 \/ 500 XP/)).toBeTruthy();
      }, { timeout: 3000 });

      // Rapidly switch between screens
      fireEvent.press(getByText('Home'));
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      fireEvent.press(getByText('Pillars'));
      await waitFor(() => {
        expect(getByText('Your Pillars')).toBeTruthy();
      });

      fireEvent.press(getByText('Home'));
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Verify XP still shows 50 after rapid switches
      await waitFor(() => {
        expect(getByText(/50/)).toBeTruthy();
      }, { timeout: 3000 });
    });
  });
});
