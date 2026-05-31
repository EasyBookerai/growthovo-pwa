/**
 * Tests for Screen 4: Time commitment selection
 * 
 * **Validates: Requirements 1.12, 1.13, 1.14**
 * 
 * This test file validates the time commitment selection screen of the onboarding flow.
 * 
 * Requirements:
 * - 1.12: THE Screen_4 SHALL display the heading "How much time can you commit daily?"
 * - 1.13: THE Screen_4 SHALL display 4 radio options: "5 min", "10 min", "20 min", "30 min+"
 * - 1.14: WHEN a time commitment is selected on Screen_4, THE selection SHALL be stored for later use
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewOnboardingScreen from '../NewOnboardingScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiSet: jest.fn(),
}));

describe('Screen 4: Time commitment selection - Requirements 1.12, 1.13, 1.14', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);
  });

  /**
   * Helper function to navigate to Screen 4
   */
  const navigateToScreen4 = async (component: ReturnType<typeof render>) => {
    const { getByText, getByTestId, getByLabelText } = component;

    // Navigate to Screen 2
    fireEvent.press(getByText('Get Started →'));

    // Navigate to Screen 3
    await waitFor(() => {
      fireEvent.press(getByTestId('onboarding-screen2-continue'));
    });

    // Select a pillar on Screen 3 to enable continue button
    await waitFor(() => {
      const mindPillar = getByLabelText('Mind');
      fireEvent.press(mindPillar);
    });

    // Navigate to Screen 4
    await waitFor(() => {
      fireEvent.press(getByTestId('onboarding-screen3-continue'));
    });
  };

  /**
   * Test: Requirement 1.12 - Display heading "How much time can you commit daily?"
   */
  it('should display the heading "How much time can you commit daily?"', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen4(component);

    const { getByText } = component;
    await waitFor(() => {
      expect(getByText('How much time can you commit daily?')).toBeTruthy();
    });
  });

  /**
   * Test: Requirement 1.13 - Display 4 radio options: "5 min", "10 min", "20 min", "30 min+"
   */
  it('should display 4 radio options with correct labels', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen4(component);

    const { getByLabelText } = component;
    await waitFor(() => {
      // Verify all 4 time commitment options are present
      expect(getByLabelText('5 min')).toBeTruthy();
      expect(getByLabelText('10 min')).toBeTruthy();
      expect(getByLabelText('20 min')).toBeTruthy();
      expect(getByLabelText('30 min+')).toBeTruthy();
    });
  });

  /**
   * Test: Requirement 1.13 - Radio options should be selectable
   */
  it('should allow selecting a time commitment option', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen4(component);

    const { getByLabelText } = component;
    await waitFor(() => {
      const option10min = getByLabelText('10 min');
      
      // Initially not selected
      expect(option10min.props.accessibilityState.checked).toBe(false);
      
      // Select the option
      fireEvent.press(option10min);
      
      // Should now be selected
      expect(option10min.props.accessibilityState.checked).toBe(true);
    });
  });

  /**
   * Test: Requirement 1.13 - Only one radio option should be selected at a time
   */
  it('should allow only one time commitment option to be selected at a time', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen4(component);

    const { getByLabelText } = component;
    await waitFor(() => {
      const option5min = getByLabelText('5 min');
      const option10min = getByLabelText('10 min');
      
      // Select first option
      fireEvent.press(option5min);
      expect(option5min.props.accessibilityState.checked).toBe(true);
      expect(option10min.props.accessibilityState.checked).toBe(false);
      
      // Select second option
      fireEvent.press(option10min);
      expect(option5min.props.accessibilityState.checked).toBe(false);
      expect(option10min.props.accessibilityState.checked).toBe(true);
    });
  });

  /**
   * Test: Requirement 1.14 - Time commitment selection should be stored to localStorage
   */
  it('should store the selected time commitment to localStorage when onboarding is completed', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen4(component);

    const { getByLabelText, getByTestId, getByPlaceholderText, getByText } = component;

    // Select time commitment
    await waitFor(() => {
      const option20min = getByLabelText('20 min');
      fireEvent.press(option20min);
    });

    // Navigate to Screen 5
    await waitFor(() => {
      fireEvent.press(getByTestId('onboarding-screen4-continue'));
    });

    // Fill in name on Screen 5
    await waitFor(() => {
      const nameInput = getByPlaceholderText('Enter your name');
      fireEvent.changeText(nameInput, 'TestUser');
    });

    // Complete onboarding
    await waitFor(() => {
      fireEvent.press(getByText("Let's go →"));
    });

    // Verify AsyncStorage.multiSet was called with the time commitment
    await waitFor(() => {
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith(
        expect.arrayContaining([
          ['@growthovo:time_commitment', '20 min'],
        ])
      );
    });
  });

  /**
   * Test: Requirement 1.14 - Each time commitment option should be stored correctly
   */
  it.each([
    ['5 min'],
    ['10 min'],
    ['20 min'],
    ['30 min+'],
  ])('should store "%s" to localStorage when selected', async (timeOption) => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen4(component);

    const { getByLabelText, getByTestId, getByPlaceholderText, getByText } = component;

    // Select the time commitment option
    await waitFor(() => {
      const option = getByLabelText(timeOption);
      fireEvent.press(option);
    });

    // Navigate to Screen 5
    await waitFor(() => {
      fireEvent.press(getByTestId('onboarding-screen4-continue'));
    });

    // Fill in name on Screen 5
    await waitFor(() => {
      const nameInput = getByPlaceholderText('Enter your name');
      fireEvent.changeText(nameInput, 'TestUser');
    });

    // Complete onboarding
    await waitFor(() => {
      fireEvent.press(getByText("Let's go →"));
    });

    // Verify the specific time commitment was stored
    await waitFor(() => {
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith(
        expect.arrayContaining([
          ['@growthovo:time_commitment', timeOption],
        ])
      );
    });
  });

  /**
   * Test: Screen 4 should have a continue button
   */
  it('should display a continue button', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen4(component);

    const { getByTestId } = component;
    await waitFor(() => {
      expect(getByTestId('onboarding-screen4-continue')).toBeTruthy();
    });
  });

  /**
   * Test: Continue button should navigate to Screen 5
   */
  it('should navigate to Screen 5 when continue button is pressed', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen4(component);

    const { getByTestId, getByText } = component;

    // Press continue button
    await waitFor(() => {
      fireEvent.press(getByTestId('onboarding-screen4-continue'));
    });

    // Should navigate to Screen 5
    await waitFor(() => {
      expect(getByText('What should Rex call you?')).toBeTruthy();
    });
  });

  /**
   * Test: Screen 4 should be accessible via skip button from Screen 1
   */
  it('should be accessible when navigating through the onboarding flow', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen4(component);

    const { getByText } = component;
    await waitFor(() => {
      // Verify we're on Screen 4
      expect(getByText('How much time can you commit daily?')).toBeTruthy();
    });
  });
});
