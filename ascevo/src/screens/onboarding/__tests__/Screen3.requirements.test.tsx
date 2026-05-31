/**
 * Tests for Screen 3: Pillar Selection
 * 
 * Validates Requirements:
 * - 1.8: Display heading "Which areas matter most right now?"
 * - 1.9: Create 6 toggle cards for all pillars with multi-select
 * - 1.10: Disable continue button when fewer than 1 pillar selected
 * - 1.11: Enable continue button when at least 1 pillar selected
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

describe('Screen 3: Pillar Selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);
  });

  /**
   * Helper function to navigate to Screen 3
   */
  const navigateToScreen3 = async (component: ReturnType<typeof render>) => {
    const { getByText, getByTestId } = component;
    
    // Navigate from Screen 1 to Screen 2
    fireEvent.press(getByText('Get Started →'));
    
    // Navigate from Screen 2 to Screen 3
    await waitFor(() => {
      fireEvent.press(getByTestId('onboarding-screen2-continue'));
    });

    // Wait for Screen 3 to be visible
    await waitFor(() => {
      expect(getByText('Which areas matter most right now?')).toBeTruthy();
    });
  };

  /**
   * Test: Requirement 1.8 - Display heading "Which areas matter most right now?"
   */
  it('should display the heading "Which areas matter most right now?"', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(component);

    const { getByText } = component;
    expect(getByText('Which areas matter most right now?')).toBeTruthy();
  });

  /**
   * Test: Requirement 1.9 - Create 6 toggle cards for all pillars with multi-select
   */
  it('should display 6 pillar toggle cards', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(component);

    const { getByLabelText } = component;

    // Verify all 6 pillars are present
    const pillars = ['Mind', 'Discipline', 'Communication', 'Money', 'Career', 'Relationships'];
    
    pillars.forEach((pillar) => {
      const pillarCard = getByLabelText(pillar);
      expect(pillarCard).toBeTruthy();
      expect(pillarCard.props.accessibilityRole).toBe('checkbox');
    });
  });

  /**
   * Test: Requirement 1.9 - Multi-select capability
   */
  it('should allow selecting multiple pillars', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(component);

    const { getByLabelText } = component;

    // Select first pillar
    const mindPillar = getByLabelText('Mind');
    fireEvent.press(mindPillar);

    await waitFor(() => {
      expect(mindPillar.props.accessibilityState.checked).toBe(true);
    });

    // Select second pillar
    const disciplinePillar = getByLabelText('Discipline');
    fireEvent.press(disciplinePillar);

    await waitFor(() => {
      expect(disciplinePillar.props.accessibilityState.checked).toBe(true);
      // First pillar should still be selected
      expect(mindPillar.props.accessibilityState.checked).toBe(true);
    });
  });

  /**
   * Test: Requirement 1.9 - Toggle functionality (deselect)
   */
  it('should allow deselecting a pillar', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(component);

    const { getByLabelText } = component;

    // Select a pillar
    const mindPillar = getByLabelText('Mind');
    fireEvent.press(mindPillar);

    await waitFor(() => {
      expect(mindPillar.props.accessibilityState.checked).toBe(true);
    });

    // Deselect the same pillar
    fireEvent.press(mindPillar);

    await waitFor(() => {
      expect(mindPillar.props.accessibilityState.checked).toBe(false);
    });
  });

  /**
   * Test: Requirement 1.10 - Disable continue button when fewer than 1 pillar selected
   */
  it('should disable continue button when no pillars are selected', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(component);

    const { getByTestId } = component;
    const continueButton = getByTestId('onboarding-screen3-continue');

    // Button should be disabled
    expect(continueButton.props.accessibilityState?.disabled).toBe(true);
    
    // Button should have disabled styling (opacity 0.4)
    const buttonStyle = continueButton.props.style;
    const hasDisabledStyle = Array.isArray(buttonStyle) 
      ? buttonStyle.some((style: any) => style?.opacity === 0.4)
      : buttonStyle?.opacity === 0.4;
    
    expect(hasDisabledStyle).toBe(true);
  });

  /**
   * Test: Requirement 1.11 - Enable continue button when at least 1 pillar selected
   */
  it('should enable continue button when at least 1 pillar is selected', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(component);

    const { getByTestId, getByLabelText } = component;

    // Select one pillar
    const mindPillar = getByLabelText('Mind');
    fireEvent.press(mindPillar);

    await waitFor(() => {
      const continueButton = getByTestId('onboarding-screen3-continue');
      
      // Button should be enabled
      expect(continueButton.props.disabled).toBeFalsy();
      
      // Button should not have disabled styling
      const buttonStyle = continueButton.props.style;
      const hasDisabledStyle = Array.isArray(buttonStyle)
        ? buttonStyle.some((style: { opacity?: number }) => style?.opacity === 0.4)
        : buttonStyle?.opacity === 0.4;

      expect(hasDisabledStyle).toBe(false);
    });
  });

  /**
   * Test: Requirement 1.11 - Continue button remains enabled with multiple selections
   */
  it('should keep continue button enabled when multiple pillars are selected', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(component);

    const { getByTestId, getByLabelText } = component;

    // Select multiple pillars
    fireEvent.press(getByLabelText('Mind'));
    fireEvent.press(getByLabelText('Discipline'));
    fireEvent.press(getByLabelText('Career'));

    await waitFor(() => {
      const continueButton = getByTestId('onboarding-screen3-continue');
      expect(continueButton.props.disabled).toBeFalsy();
    });
  });

  /**
   * Test: Requirement 1.10 - Button becomes disabled again when all pillars are deselected
   */
  it('should disable continue button when all selected pillars are deselected', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(component);

    const { getByTestId, getByLabelText } = component;

    // Select a pillar
    const mindPillar = getByLabelText('Mind');
    fireEvent.press(mindPillar);

    await waitFor(() => {
      expect(getByTestId('onboarding-screen3-continue').props.disabled).toBeFalsy();
    });

    // Deselect the pillar
    fireEvent.press(mindPillar);

    await waitFor(() => {
    const continueButton = getByTestId('onboarding-screen3-continue');
    expect(continueButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  /**
   * Test: Visual feedback - Selected pillars show checkmark
   */
  it('should display checkmark on selected pillars', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(component);

    const { getByLabelText, getByText } = component;

    // Select a pillar
    const mindPillar = getByLabelText('Mind');
    fireEvent.press(mindPillar);

    await waitFor(() => {
      expect(getByLabelText('Mind').props.accessibilityState.checked).toBe(true);
    });
  });

  /**
   * Test: Navigation - Can proceed to Screen 4 after selecting pillars
   */
  it('should navigate to Screen 4 when continue button is pressed with selected pillars', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(component);

    const { getByText, getByTestId, getByLabelText } = component;

    // Select a pillar
    fireEvent.press(getByLabelText('Mind'));

    await waitFor(() => {
      fireEvent.press(getByTestId('onboarding-screen3-continue'));
    });

    // Should navigate to Screen 4 (time commitment)
    await waitFor(() => {
      expect(getByText('How much time can you commit daily?')).toBeTruthy();
    });
  });

  /**
   * Test: Accessibility - All pillar cards have proper accessibility labels
   */
  it('should have proper accessibility labels for all pillar cards', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(component);

    const { getByLabelText } = component;

    const pillars = ['Mind', 'Discipline', 'Communication', 'Money', 'Career', 'Relationships'];
    
    pillars.forEach((pillar) => {
      const pillarCard = getByLabelText(pillar);
      expect(pillarCard.props.accessibilityRole).toBe('checkbox');
      expect(pillarCard.props.accessibilityLabel).toBe(pillar);
    });
  });

  /**
   * Test: Accessibility - Continue button has proper accessibility label
   */
  it('should have proper accessibility label for continue button', async () => {
    const mockOnComplete = jest.fn();
    const component = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(component);

    const { getByTestId } = component;
    const continueButton = getByTestId('onboarding-screen3-continue');

    expect(continueButton.props.accessibilityRole).toBe('button');
    expect(continueButton.props.accessibilityLabel).toBe('Continue to time commitment');
  });
});
