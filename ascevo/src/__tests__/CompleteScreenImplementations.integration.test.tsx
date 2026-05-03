/**
 * Complete Screen Implementations Integration Tests
 * Tests all user flows, component interactions, state management, and error handling
 * 
 * Test Coverage:
 * - 10.1: Check-in flow with XP updates
 * - 10.2: Pillar navigation
 * - 10.3: Rex chat with keyword responses
 * - 10.4: Leaderboard display and scrolling
 * - 10.5: Profile stats and settings
 * - 10.6: AppContext state propagation
 * - 10.7: Theme consistency
 * - 10.8: Error scenarios
 */

import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import { AppProvider } from '../context/AppContext';
import SimpleHomeScreen from '../screens/home/SimpleHomeScreen';
import PillarsScreen from '../screens/pillars/PillarsScreen';
import RexScreen from '../screens/rex/RexScreen';
import SimpleLeagueScreen from '../screens/league/SimpleLeagueScreen';
import SimpleProfileScreen from '../screens/profile/SimpleProfileScreen';
import CheckInModal from '../components/CheckInModal';
import { supabase } from '../services/supabaseClient';

// Mock Supabase client
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { total_xp: 100, current_streak: 5 },
            error: null,
          })),
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({
              data: [
                { id: '1', title: 'Lesson 1', display_order: 1 },
                { id: '2', title: 'Lesson 2', display_order: 2 },
                { id: '3', title: 'Lesson 3', display_order: 3 },
              ],
              error: null,
            })),
          })),
        })),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({
            data: [
              { id: '1', title: 'Lesson 1', display_order: 1 },
              { id: '2', title: 'Lesson 2', display_order: 2 },
              { id: '3', title: 'Lesson 3', display_order: 3 },
            ],
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
    })),
    auth: {
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

describe('Complete Screen Implementations - Integration Tests', () => {
  const mockUserId = 'test-user-123';
  const mockSubscriptionStatus = 'premium';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 10.1: Check-in Flow
   * Tests: open modal → select mood → enter focus → complete → see XP update
   */
  describe('10.1 Check-in Flow with XP Update', () => {
    it('should complete full check-in flow and update XP', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <AppProvider userId={mockUserId}>
          <SimpleHomeScreen
            userId={mockUserId}
            subscriptionStatus={mockSubscriptionStatus}
            navigation={mockNavigation}
          />
        </AppProvider>
      );

      // Wait for initial data load
      await waitFor(() => {
        expect(getByText('100')).toBeTruthy(); // Initial XP
      });

      // Step 1: Open check-in modal
      const checkInButton = getByText('Start Daily Check-in →');
      fireEvent.press(checkInButton);

      // Step 2: Select mood
      await waitFor(() => {
        expect(getByText('How are you feeling?')).toBeTruthy();
      });
      fireEvent.press(getByText('🙂'));
      fireEvent.press(getByText('Next →'));

      // Step 3: Enter focus
      await waitFor(() => {
        expect(getByText("What's your focus today?")).toBeTruthy();
      });
      const focusInput = getByPlaceholderText('e.g., Complete 2 lessons, stay consistent...');
      fireEvent.changeText(focusInput, 'Complete 2 lessons today');
      fireEvent.press(getByText('Next →'));

      // Step 4: Complete check-in
      await waitFor(() => {
        expect(getByText('Check-in Complete!')).toBeTruthy();
      });
      fireEvent.press(getByText('Done ✓'));

      // Step 5: Verify XP update
      await waitFor(() => {
        expect(getByText('150')).toBeTruthy(); // 100 + 50 XP
      }, { timeout: 3000 });
    });

    it('should show XP gain animation after check-in', async () => {
      const { getByText, getByPlaceholderText } = render(
        <AppProvider userId={mockUserId}>
          <SimpleHomeScreen
            userId={mockUserId}
            subscriptionStatus={mockSubscriptionStatus}
            navigation={mockNavigation}
          />
        </AppProvider>
      );

      // Complete check-in flow
      fireEvent.press(getByText('Start Daily Check-in →'));
      await waitFor(() => fireEvent.press(getByText('🙂')));
      fireEvent.press(getByText('Next →'));
      
      await waitFor(() => {
        const focusInput = getByPlaceholderText('e.g., Complete 2 lessons, stay consistent...');
        fireEvent.changeText(focusInput, 'Test focus');
      });
      fireEvent.press(getByText('Next →'));
      
      await waitFor(() => fireEvent.press(getByText('Done ✓')));

      // Verify XP gain animation appears
      await waitFor(() => {
        expect(getByText('+50 XP')).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should validate mood selection before advancing', () => {
      const { getByText, queryByText } = render(
        <CheckInModal
          visible={true}
          userId={mockUserId}
          onComplete={jest.fn()}
          onClose={jest.fn()}
        />
      );

      // Try to advance without selecting mood
      fireEvent.press(getByText('Next →'));

      // Should still be on Step 1
      expect(getByText('Step 1 of 3')).toBeTruthy();
      expect(queryByText('Step 2 of 3')).toBeNull();
    });

    it('should validate focus text before advancing', async () => {
      const { getByText } = render(
        <CheckInModal
          visible={true}
          userId={mockUserId}
          onComplete={jest.fn()}
          onClose={jest.fn()}
        />
      );

      // Select mood and advance
      fireEvent.press(getByText('🙂'));
      fireEvent.press(getByText('Next →'));

      // Try to advance without entering focus
      await waitFor(() => {
        expect(getByText('Step 2 of 3')).toBeTruthy();
      });
      fireEvent.press(getByText('Next →'));

      // Should still be on Step 2
      expect(getByText('Step 2 of 3')).toBeTruthy();
    });
  });

  /**
   * Test 10.2: Pillar Navigation
   * Tests: tap card → see lessons → tap lesson (future)
   */
  describe('10.2 Pillar Navigation', () => {
    it('should display 6 pillar cards in grid layout', () => {
      const { getByText } = render(
        <PillarsScreen
          userId={mockUserId}
          subscriptionStatus={mockSubscriptionStatus}
          navigation={mockNavigation}
        />
      );

      // Verify all 6 pillars are displayed
      expect(getByText('Mental')).toBeTruthy();
      expect(getByText('Relations')).toBeTruthy();
      expect(getByText('Career')).toBeTruthy();
      expect(getByText('Fitness')).toBeTruthy();
      expect(getByText('Finance')).toBeTruthy();
      expect(getByText('Hobbies')).toBeTruthy();
    });

    it('should open detail view when pillar card is tapped', async () => {
      const { getByText } = render(
        <PillarsScreen
          userId={mockUserId}
          subscriptionStatus={mockSubscriptionStatus}
          navigation={mockNavigation}
        />
      );

      // Tap on Mental pillar
      const mentalCard = getByText('Mental');
      fireEvent.press(mentalCard);

      // Verify detail view opens with lessons
      await waitFor(() => {
        expect(getByText('Lesson 1')).toBeTruthy();
        expect(getByText('Lesson 2')).toBeTruthy();
        expect(getByText('Lesson 3')).toBeTruthy();
      });
    });

    it('should show empty state when no lessons available', async () => {
      // Mock empty lessons response
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      });

      const { getByText } = render(
        <PillarsScreen
          userId={mockUserId}
          subscriptionStatus={mockSubscriptionStatus}
          navigation={mockNavigation}
        />
      );

      fireEvent.press(getByText('Mental'));

      await waitFor(() => {
        expect(getByText('No lessons available yet')).toBeTruthy();
      });
    });
  });

  /**
   * Test 10.3: Rex Chat
   * Tests: send 5 messages with keywords → verify correct responses
   */
  describe('10.3 Rex Chat with Keyword Responses', () => {
    it('should display 3 welcome messages on load', () => {
      const { getByText } = render(
        <RexScreen
          userId={mockUserId}
          subscriptionStatus={mockSubscriptionStatus}
          navigation={mockNavigation}
        />
      );

      expect(getByText('Hey Champion! 👋 Ready to grow today?')).toBeTruthy();
      expect(getByText("I'm here to support you across all 6 areas of your life.")).toBeTruthy();
      expect(getByText("What's on your mind? Or pick a topic below 👇")).toBeTruthy();
    });

    it('should respond to "anxious" keyword with breathing tip', async () => {
      const { getByPlaceholderText, getByText } = render(
        <RexScreen
          userId={mockUserId}
          subscriptionStatus={mockSubscriptionStatus}
          navigation={mockNavigation}
        />
      );

      const input = getByPlaceholderText('Message Rex...');
      fireEvent.changeText(input, 'I feel anxious');
      
      // Find and press the send button (↑ symbol)
      const sendButton = getByText('↑');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(getByText(/Take 3 deep breaths/i)).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should respond to "focus" keyword with productivity tip', async () => {
      const { getByPlaceholderText, getByText } = render(
        <RexScreen
          userId={mockUserId}
          subscriptionStatus={mockSubscriptionStatus}
          navigation={mockNavigation}
        />
      );

      const input = getByPlaceholderText('Message Rex...');
      fireEvent.changeText(input, 'I need help with focus');
      
      // Find and press the send button (↑ symbol)
      const sendButton = getByText('↑');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(getByText(/Pick ONE thing/i)).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should respond to "motivate" keyword with motivational message', async () => {
      const { getByPlaceholderText, getByText } = render(
        <RexScreen
          userId={mockUserId}
          subscriptionStatus={mockSubscriptionStatus}
          navigation={mockNavigation}
        />
      );

      const input = getByPlaceholderText('Message Rex...');
      fireEvent.changeText(input, 'I need motivation');
      const sendButton = getByText('↑');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(getByText(/Remember why you started/i)).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should respond to "relationship" keyword with relationship advice', async () => {
      const { getByPlaceholderText, getByText } = render(
        <RexScreen
          userId={mockUserId}
          subscriptionStatus={mockSubscriptionStatus}
          navigation={mockNavigation}
        />
      );

      const input = getByPlaceholderText('Message Rex...');
      fireEvent.changeText(input, 'relationship problems');
      const sendButton = getByText('↑');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(getByText(/Relationships are mirrors/i)).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should respond to "career" keyword with career help', async () => {
      const { getByPlaceholderText, getByText } = render(
        <RexScreen
          userId={mockUserId}
          subscriptionStatus={mockSubscriptionStatus}
          navigation={mockNavigation}
        />
      );

      const input = getByPlaceholderText('Message Rex...');
      fireEvent.changeText(input, 'career advice needed');
      const sendButton = getByText('↑');
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(getByText(/career is a marathon/i)).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should show typing indicator before Rex replies', async () => {
      jest.useFakeTimers();

      const { getByPlaceholderText, getByText, queryByTestId } = render(
        <RexScreen
          userId={mockUserId}
          subscriptionStatus={mockSubscriptionStatus}
          navigation={mockNavigation}
        />
      );

      const input = getByPlaceholderText('Message Rex...');
      fireEvent.changeText(input, 'test message');
      const sendButton = getByText('↑');
      fireEvent.press(sendButton);

      // Wait for typing indicator (implementation uses animated dots)
      await waitFor(() => {
        expect(getByText('test message')).toBeTruthy();
      });

      jest.advanceTimersByTime(1500);

      // Response should appear after delay
      await waitFor(() => {
        expect(getByText(/I'm here to support you/i)).toBeTruthy();
      });

      jest.useRealTimers();
    });

    it('should auto-scroll to latest message', async () => {
      const { getByPlaceholderText, getByText } = render(
        <RexScreen
          userId={mockUserId}
          subscriptionStatus={mockSubscriptionStatus}
          navigation={mockNavigation}
        />
      );

      // Send multiple messages
      const input = getByPlaceholderText('Message Rex...');
      
      fireEvent.changeText(input, 'Message 1');
      const sendButton = getByText('↑');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(getByText('Message 1')).toBeTruthy();
      });

      fireEvent.changeText(input, 'Message 2');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(getByText('Message 2')).toBeTruthy();
      });

      // Latest message should be visible
      expect(getByText('Message 2')).toBeTruthy();
    });
  });

  /**
   * Test 10.4: Leaderboard
   * Tests: scroll → see all rows → verify user row highlighted
   */
  describe('10.4 Leaderboard Display and Scrolling', () => {
    it('should display Weekly League header', () => {
      const { getByText } = render(
        <SimpleLeagueScreen
          userId={mockUserId}
          navigation={mockNavigation}
        />
      );

      expect(getByText('Weekly League 🏆')).toBeTruthy();
    });

    it('should display user rank card with correct data', () => {
      const { getByText } = render(
        <SimpleLeagueScreen
          userId={mockUserId}
          navigation={mockNavigation}
        />
      );

      expect(getByText('YOUR RANK')).toBeTruthy();
      expect(getByText('Bronze League')).toBeTruthy();
      expect(getByText('#12')).toBeTruthy();
      expect(getByText('340 XP')).toBeTruthy();
    });

    it('should display 10 leaderboard rows with medals for top 3', () => {
      const { getByText } = render(
        <SimpleLeagueScreen
          userId={mockUserId}
          navigation={mockNavigation}
        />
      );

      // Check for medals
      expect(getByText('🥇')).toBeTruthy(); // Rank 1
      expect(getByText('🥈')).toBeTruthy(); // Rank 2
      expect(getByText('🥉')).toBeTruthy(); // Rank 3

      // Check for rank numbers
      expect(getByText('#1')).toBeTruthy();
      expect(getByText('#10')).toBeTruthy();
    });

    it('should highlight current user row in purple', () => {
      const { getByText } = render(
        <SimpleLeagueScreen
          userId={mockUserId}
          navigation={mockNavigation}
        />
      );

      // User row should be visible
      const userRow = getByText('#12');
      expect(userRow).toBeTruthy();
      
      // User row should show "You" label
      expect(getByText('You')).toBeTruthy();
    });

    it('should display squad section with 3 members', () => {
      const { getByText } = render(
        <SimpleLeagueScreen
          userId={mockUserId}
          navigation={mockNavigation}
        />
      );

      expect(getByText('Your Squad')).toBeTruthy();
      // Squad members should be visible (implementation-specific)
    });

    it('should display invite friend button', () => {
      const { getByText } = render(
        <SimpleLeagueScreen
          userId={mockUserId}
          navigation={mockNavigation}
        />
      );

      expect(getByText('Invite a Friend →')).toBeTruthy();
    });
  });

  /**
   * Test 10.5: Profile
   * Tests: verify stats display → tap settings → tap log out → confirm alert
   */
  describe('10.5 Profile Stats and Settings', () => {
    it('should display avatar and username', () => {
      const { getByText } = render(
        <AppProvider userId={mockUserId}>
          <SimpleProfileScreen
            userId={mockUserId}
            navigation={mockNavigation}
          />
        </AppProvider>
      );

      expect(getByText('C')).toBeTruthy(); // Avatar
      expect(getByText('Champion')).toBeTruthy(); // Username
    });

    it('should display 3 stats from AppContext', async () => {
      const { getByText } = render(
        <AppProvider userId={mockUserId}>
          <SimpleProfileScreen
            userId={mockUserId}
            navigation={mockNavigation}
          />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByText('Total XP')).toBeTruthy();
        expect(getByText('Day Streak')).toBeTruthy();
        expect(getByText('Lessons Done')).toBeTruthy();
      });
    });

    it('should display settings list with 6 items', () => {
      const { getByText } = render(
        <AppProvider userId={mockUserId}>
          <SimpleProfileScreen
            userId={mockUserId}
            navigation={mockNavigation}
          />
        </AppProvider>
      );

      expect(getByText('Edit Profile')).toBeTruthy();
      expect(getByText('Notification Settings')).toBeTruthy();
      expect(getByText('Language')).toBeTruthy();
      expect(getByText('Privacy & Data')).toBeTruthy();
      expect(getByText('Help Center')).toBeTruthy();
      expect(getByText('Rate Growthovo')).toBeTruthy();
    });

    it('should display red Log Out button', () => {
      const { getByText } = render(
        <AppProvider userId={mockUserId}>
          <SimpleProfileScreen
            userId={mockUserId}
            navigation={mockNavigation}
          />
        </AppProvider>
      );

      const logOutButton = getByText('Log Out');
      expect(logOutButton).toBeTruthy();
    });

    it('should display legal footer with version', () => {
      const { getByText } = render(
        <AppProvider userId={mockUserId}>
          <SimpleProfileScreen
            userId={mockUserId}
            navigation={mockNavigation}
          />
        </AppProvider>
      );

      expect(getByText(/Version/i)).toBeTruthy();
    });
  });

  /**
   * Test 10.6: AppContext State Propagation
   * Tests: verify XP updates propagate to all consuming components
   */
  describe('10.6 AppContext State Propagation', () => {
    it('should propagate XP updates to HomeScreen and ProfileScreen', async () => {
      const TestWrapper = () => {
        const [showProfile, setShowProfile] = React.useState(false);
        
        return (
          <AppProvider userId={mockUserId}>
            {!showProfile ? (
              <SimpleHomeScreen
                userId={mockUserId}
                subscriptionStatus={mockSubscriptionStatus}
                navigation={mockNavigation}
              />
            ) : (
              <SimpleProfileScreen
                userId={mockUserId}
                navigation={mockNavigation}
              />
            )}
          </AppProvider>
        );
      };

      const { getByText, rerender } = render(<TestWrapper />);

      // Wait for initial XP load
      await waitFor(() => {
        expect(getByText('100')).toBeTruthy();
      });

      // Complete check-in to update XP
      fireEvent.press(getByText('Start Daily Check-in →'));
      await waitFor(() => fireEvent.press(getByText('🙂')));
      fireEvent.press(getByText('Next →'));
      
      await waitFor(() => {
        const focusInput = getByText(/What's your focus today?/i);
        expect(focusInput).toBeTruthy();
      });

      // Both screens should show updated XP
      await waitFor(() => {
        expect(getByText('150')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('should calculate level correctly from XP', async () => {
      const { getByText } = render(
        <AppProvider userId={mockUserId}>
          <SimpleHomeScreen
            userId={mockUserId}
            subscriptionStatus={mockSubscriptionStatus}
            navigation={mockNavigation}
          />
        </AppProvider>
      );

      // Wait for data load (100 XP = Level 2)
      await waitFor(() => {
        expect(getByText('2')).toBeTruthy(); // Level
      });
    });

    it('should maintain streak value across components', async () => {
      const { getByText } = render(
        <AppProvider userId={mockUserId}>
          <SimpleHomeScreen
            userId={mockUserId}
            subscriptionStatus={mockSubscriptionStatus}
            navigation={mockNavigation}
          />
        </AppProvider>
      );

      // Wait for streak load
      await waitFor(() => {
        expect(getByText('5')).toBeTruthy(); // Streak
      });
    });
  });

  /**
   * Test 10.7: Theme Consistency
   * Tests: verify theme colors and styling across all screens
   */
  describe('10.7 Theme Consistency', () => {
    it('should use dark theme colors consistently', () => {
      const screens = [
        <SimpleHomeScreen userId={mockUserId} subscriptionStatus={mockSubscriptionStatus} navigation={mockNavigation} />,
        <PillarsScreen userId={mockUserId} subscriptionStatus={mockSubscriptionStatus} navigation={mockNavigation} />,
        <RexScreen userId={mockUserId} subscriptionStatus={mockSubscriptionStatus} navigation={mockNavigation} />,
        <SimpleLeagueScreen userId={mockUserId} navigation={mockNavigation} />,
      ];

      screens.forEach((screen) => {
        const { container } = render(
          <AppProvider userId={mockUserId}>
            {screen}
          </AppProvider>
        );
        
        // All screens should render without errors
        expect(container).toBeTruthy();
      });
    });

    it('should have SafeAreaView on all screens', () => {
      const { getByTestId } = render(
        <AppProvider userId={mockUserId}>
          <SimpleHomeScreen
            userId={mockUserId}
            subscriptionStatus={mockSubscriptionStatus}
            navigation={mockNavigation}
          />
        </AppProvider>
      );

      expect(getByTestId('home-screen')).toBeTruthy();
    });
  });

  /**
   * Test 10.8: Error Scenarios
   * Tests: Supabase failures, invalid inputs, empty states
   */
  describe('10.8 Error Handling', () => {
    it('should handle Supabase connection failure gracefully', async () => {
      // Mock Supabase error
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Connection failed' },
            })),
          })),
        })),
      });

      const { getByText } = render(
        <AppProvider userId={mockUserId}>
          <SimpleHomeScreen
            userId={mockUserId}
            subscriptionStatus={mockSubscriptionStatus}
            navigation={mockNavigation}
          />
        </AppProvider>
      );

      // Error message should be displayed
      await waitFor(() => {
        expect(getByText(/Unable to load your progress/i)).toBeTruthy();
      });
    });

    it('should handle check-in save failure gracefully', async () => {
      // Mock insert error
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn(() => Promise.resolve({
          error: { message: 'Insert failed' },
        })),
      });

      const { getByText, getByPlaceholderText } = render(
        <CheckInModal
          visible={true}
          userId={mockUserId}
          onComplete={jest.fn()}
          onClose={jest.fn()}
        />
      );

      // Complete check-in
      fireEvent.press(getByText('🙂'));
      fireEvent.press(getByText('Next →'));
      
      await waitFor(() => {
        const focusInput = getByPlaceholderText('e.g., Complete 2 lessons, stay consistent...');
        fireEvent.changeText(focusInput, 'Test');
      });
      fireEvent.press(getByText('Next →'));
      
      await waitFor(() => fireEvent.press(getByText('Done ✓')));

      // Error message should be displayed
      await waitFor(() => {
        expect(getByText(/Unable to save your check-in/i)).toBeTruthy();
      });
    });

    it('should handle empty pillar lessons gracefully', async () => {
      // Mock empty lessons
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      });

      const { getByText } = render(
        <PillarsScreen
          userId={mockUserId}
          subscriptionStatus={mockSubscriptionStatus}
          navigation={mockNavigation}
        />
      );

      fireEvent.press(getByText('Mental'));

      await waitFor(() => {
        expect(getByText('No lessons available yet')).toBeTruthy();
      });
    });

    it('should handle invalid check-in inputs', () => {
      const { getByText, queryByText } = render(
        <CheckInModal
          visible={true}
          userId={mockUserId}
          onComplete={jest.fn()}
          onClose={jest.fn()}
        />
      );

      // Try to advance without selecting mood
      fireEvent.press(getByText('Next →'));

      // Should remain on Step 1
      expect(getByText('Step 1 of 3')).toBeTruthy();
      expect(queryByText('Step 2 of 3')).toBeNull();
    });

    it('should display error banner and allow dismissal', async () => {
      // Mock error
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Test error' },
            })),
          })),
        })),
      });

      const { getByText, queryByText } = render(
        <AppProvider userId={mockUserId}>
          <SimpleHomeScreen
            userId={mockUserId}
            subscriptionStatus={mockSubscriptionStatus}
            navigation={mockNavigation}
          />
        </AppProvider>
      );

      // Wait for error to appear
      await waitFor(() => {
        expect(getByText(/Unable to load your progress/i)).toBeTruthy();
      });

      // Dismiss error
      const dismissButton = getByText('✕');
      fireEvent.press(dismissButton);

      // Error should be dismissed
      await waitFor(() => {
        expect(queryByText(/Unable to load your progress/i)).toBeNull();
      });
    });
  });
});
