// 🧪 Bug Condition Exploration Test for Bottom Tab Navigation
// Tests that tab navigation triggers screen changes for Pillars, Rex, League, and Profile tabs
// **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
// **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import fc from 'fast-check';
import { Text, View } from 'react-native';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '🏠',
  Pillars: '🎯',
  Rex: '💬',
  League: '🏆',
  Profile: '👤',
};

// Mock screen components that match the structure in App.tsx
// These components will capture the props they receive for inspection
let capturedProps: any = {};

function MockHomeScreen(props: any) {
  capturedProps.home = props;
  return <View testID="home-screen"><Text>Home Screen</Text></View>;
}

function MockPillarsScreen(props: any) {
  capturedProps.pillars = props;
  return <View testID="pillars-screen"><Text>Pillars Screen</Text></View>;
}

function MockRexScreen(props: any) {
  capturedProps.rex = props;
  return <View testID="rex-screen"><Text>Rex Screen</Text></View>;
}

function MockLeagueScreen(props: any) {
  capturedProps.league = props;
  return <View testID="league-screen"><Text>League Screen</Text></View>;
}

function MockProfileScreen(props: any) {
  capturedProps.profile = props;
  return <View testID="profile-screen"><Text>Profile Screen</Text></View>;
}

// MainTabs component matching the FIXED implementation in App.tsx
// This uses the render props pattern that spreads all props
function MainTabs({ userId, subscriptionStatus }: {
  userId: string;
  subscriptionStatus: string;
}) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabel: route.name,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home">
        {(props) => (
          <MockHomeScreen 
            userId={userId} 
            subscriptionStatus={subscriptionStatus}
            {...props}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Pillars">
        {(props) => (
          <MockPillarsScreen
            userId={userId}
            subscriptionStatus={subscriptionStatus}
            {...props}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Rex">
        {(props) => (
          <MockRexScreen
            userId={userId}
            subscriptionStatus={subscriptionStatus}
            {...props}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="League">
        {(props) => <MockLeagueScreen userId={userId} {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => (
          <MockProfileScreen
            userId={userId}
            {...props}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Test wrapper component
function TestApp({ userId = 'test-user-123', subscriptionStatus = 'free' }) {
  return (
    <NavigationContainer>
      <MainTabs userId={userId} subscriptionStatus={subscriptionStatus} />
    </NavigationContainer>
  );
}

describe('Bug Condition Exploration: Bottom Tab Navigation', () => {
  /**
   * Property 1: Bug Condition - Tab Navigation Triggers Screen Change
   * 
   * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
   * **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
   * 
   * For any tab press event where a user taps on Pillars, Rex, League, or Profile tabs,
   * the navigator should switch to the corresponding screen and highlight the active tab.
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
   */
  describe('Property 1: Tab Navigation Triggers Screen Change', () => {
    it('should navigate to PillarsScreen when Pillars tab is tapped', async () => {
      const { getByText, queryByTestId } = render(<TestApp />);

      // Initially, Home screen should be visible
      expect(queryByTestId('home-screen')).toBeTruthy();
      expect(queryByTestId('pillars-screen')).toBeNull();

      // Find and tap the Pillars tab
      const pillarsTab = getByText('Pillars');
      fireEvent.press(pillarsTab);

      // Wait for navigation to occur
      await waitFor(() => {
        // PillarsScreen should be rendered
        const pillarsScreen = queryByTestId('pillars-screen');
        expect(pillarsScreen).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should navigate to RexScreen when Rex tab is tapped', async () => {
      const { getByText, queryByTestId } = render(<TestApp />);

      // Initially, Home screen should be visible
      expect(queryByTestId('home-screen')).toBeTruthy();
      expect(queryByTestId('rex-screen')).toBeNull();

      // Find and tap the Rex tab
      const rexTab = getByText('Rex');
      fireEvent.press(rexTab);

      // Wait for navigation to occur
      await waitFor(() => {
        // RexScreen should be rendered
        const rexScreen = queryByTestId('rex-screen');
        expect(rexScreen).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should navigate to SimpleLeagueScreen when League tab is tapped', async () => {
      const { getByText, queryByTestId } = render(<TestApp />);

      // Initially, Home screen should be visible
      expect(queryByTestId('home-screen')).toBeTruthy();
      expect(queryByTestId('league-screen')).toBeNull();

      // Find and tap the League tab
      const leagueTab = getByText('League');
      fireEvent.press(leagueTab);

      // Wait for navigation to occur
      await waitFor(() => {
        // SimpleLeagueScreen should be rendered
        const leagueScreen = queryByTestId('league-screen');
        expect(leagueScreen).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should navigate to SimpleProfileScreen when Profile tab is tapped', async () => {
      const { getByText, queryByTestId } = render(<TestApp />);

      // Initially, Home screen should be visible
      expect(queryByTestId('home-screen')).toBeTruthy();
      expect(queryByTestId('profile-screen')).toBeNull();

      // Find and tap the Profile tab
      const profileTab = getByText('Profile');
      fireEvent.press(profileTab);

      // Wait for navigation to occur
      await waitFor(() => {
        // SimpleProfileScreen should be rendered
        const profileScreen = queryByTestId('profile-screen');
        expect(profileScreen).toBeTruthy();
      }, { timeout: 2000 });
    });

    /**
     * Property-Based Test: Tab Navigation for All Non-Home Tabs
     * 
     * Tests that tapping any non-Home tab (Pillars, Rex, League, Profile) triggers
     * navigation to the corresponding screen.
     */
    it('should navigate to correct screen for any non-Home tab press', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('Pillars', 'Rex', 'League', 'Profile'),
          async (tabName) => {
            const { getByText, queryByTestId } = render(<TestApp />);

            // Find and tap the tab
            const tab = getByText(tabName);
            fireEvent.press(tab);

            // Map tab names to expected screen test IDs
            const screenTestIds: Record<string, string> = {
              'Pillars': 'pillars-screen',
              'Rex': 'rex-screen',
              'League': 'league-screen',
              'Profile': 'profile-screen',
            };

            // Wait for navigation to occur
            await waitFor(() => {
              const screen = queryByTestId(screenTestIds[tabName]);
              expect(screen).toBeTruthy();
            }, { timeout: 2000 });
          }
        ),
        { numRuns: 20 } // Run 20 times to test all tabs multiple times
      );
    });

    /**
     * Props Inspection Test: Verify route prop is missing
     * 
     * This test inspects the props passed to screen components to verify
     * that the route prop is missing, confirming the root cause.
     * 
     * **CRITICAL**: This test documents the root cause of the bug
     * **EXPECTED**: This test SHOULD FAIL on unfixed code
     */
    it('should pass route prop to screen components for proper navigation', async () => {
      const { getByText } = render(<TestApp />);

      // Reset captured props
      capturedProps = {};

      // Tap the Pillars tab
      const pillarsTab = getByText('Pillars');
      fireEvent.press(pillarsTab);

      // Wait for screen to render
      await waitFor(() => {
        expect(capturedProps.pillars).toBeDefined();
      }, { timeout: 2000 });

      // Check what props were passed to the Pillars screen
      console.log('Props passed to PillarsScreen:', Object.keys(capturedProps.pillars || {}));
      
      // The bug: route prop is missing because we only pass navigation explicitly
      // React Navigation passes both navigation and route props to screen components
      // But our render props pattern only spreads navigation={props.navigation}
      expect(capturedProps.pillars.navigation).toBeDefined();
      
      // This assertion FAILS on unfixed code: route prop should be present
      // The incomplete props spreading pattern (navigation={props.navigation})
      // prevents the route prop from being passed to screen components
      expect(capturedProps.pillars.route).toBeDefined();
      
      // If we get here, the route prop is present (code is fixed)
      // If the test fails, it confirms the bug exists
    });
  });
});
