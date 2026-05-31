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
  const navigateToScreen3 = async (getByText: any, getByTestId: any) => {
    // Navigate to Screen 2
    const getStartedButton = getByText('Get Started →');
    fireEvent.press(getStartedButton);

    // Wait for Screen 2 to appear
    await waitFor(() => {
      expect(getByText('What makes Growthovo special')).toBeTruthy();
    }, { timeout: 3000 });

    // Navigate to Screen 3
    fireEvent.press(getByTestId('onboarding-screen2-continue'));

    // Wait for Screen 3 to appear
    await waitFor(() => {
      expect(getByText('Which areas matter most right now?')).toBeTruthy();
    }, { timeout: 3000 });
  };

  /**
   * Test: Requirement 1.8 - Display heading "Which areas matter most right now?"
   */
  it('should display the correct heading on Screen 3', async () => {
    const mockOnComplete = jest.fn();
    const { getByText, getByTestId } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(getByText, getByTestId);

    // Verify heading is displayed
    expect(getByText('Which areas matter most right now?')).toBeTruthy();
  });

  /**
   * Test: Requirement 1.9 - Create 6 toggle cards for all pillars with multi-select
   */
  it('should display 6 pillar cards with correct labels', async () => {
    const mockOnComplete = jest.fn();
    const { getByText, getByTestId, getByLabelText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(getByText, getByTestId);

    // Verify all 6 pillars are displayed
    expect(getByLabelText('Mind')).toBeTruthy();
    expect(getByLabelText('Discipline')).toBeTruthy();
    expect(getByLabelText('Communication')).toBeTruthy();
    expect(getByLabelText('Money')).toBeTruthy();
    expect(getByLabelText('Career')).toBeTruthy();
    expect(getByLabelText('Relationships')).toBeTruthy();
  });

  /**
   * Test: Requirement 1.9 - Multi-select capability
   */
  it('should allow selecting multiple pillars', async () => {
    const mockOnComplete = jest.fn();
    const { getByText, getByTestId, getByLabelText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(getByText, getByTestId);

    // Select multiple pillars
    const mindPillar = getByLabelText('Mind');
    const careerPillar = getByLabelText('Career');
    const moneyPillar = getByLabelText('Money');

    fireEvent.press(mindPillar);
    fireEvent.press(careerPillar);
    fireEvent.press(moneyPillar);

    // Verify all are selected (checked state)
    await waitFor(() => {
      expect(mindPillar.props.accessibilityState.checked).toBe(true);
      expect(careerPillar.props.accessibilityState.checked).toBe(true);
      expect(moneyPillar.props.accessibilityState.checked).toBe(true);
    });
  });

  /**
   * Test: Requirement 1.9 - Toggle functionality (select and deselect)
   */
  it('should allow toggling pillar selection on and off', async () => {
    const mockOnComplete = jest.fn();
    const { getByText, getByTestId, getByLabelText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(getByText, getByTestId);

    const mindPillar = getByLabelText('Mind');

    // Select pillar
    fireEvent.press(mindPillar);
    await waitFor(() => {
      expect(mindPillar.props.accessibilityState.checked).toBe(true);
    });

    // Deselect pillar
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
    const { getByText, getByTestId } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(getByText, getByTestId);

    // Verify continue button is disabled
    const continueButton = getByTestId('onboarding-screen3-continue');
    expect(continueButton.props.accessibilityState?.disabled).toBe(true);
  });

  /**
   * Test: Requirement 1.11 - Enable continue button when at least 1 pillar selected
   */
  it('should enable continue button when 1 pillar is selected', async () => {
    const mockOnComplete = jest.fn();
    const { getByText, getByTestId, getByLabelText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(getByText, getByTestId);

    // Select one pillar
    const mindPillar = getByLabelText('Mind');
    fireEvent.press(mindPillar);

    // Verify continue button is enabled
    await waitFor(() => {
      const continueButton = getByTestId('onboarding-screen3-continue');
      expect(continueButton.props.disabled).toBeFalsy();
    });
  });

  /**
   * Test: Requirement 1.11 - Continue button remains enabled with multiple selections
   */
  it('should keep continue button enabled when multiple pillars are selected', async () => {
    const mockOnComplete = jest.fn();
    const { getByText, getByTestId, getByLabelText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(getByText, getByTestId);

    // Select multiple pillars
    fireEvent.press(getByLabelText('Mind'));
    fireEvent.press(getByLabelText('Career'));
    fireEvent.press(getByLabelText('Money'));

    // Verify continue button is enabled
    await waitFor(() => {
      const continueButton = getByTestId('onboarding-screen3-continue');
      expect(continueButton.props.disabled).toBeFalsy();
    });
  });

  /**
   * Test: Requirement 1.10 - Button becomes disabled again when all selections are removed
   */
  it('should disable continue button when all selected pillars are deselected', async () => {
    const mockOnComplete = jest.fn();
    const { getByText, getByTestId, getByLabelText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(getByText, getByTestId);

    const mindPillar = getByLabelText('Mind');
    
    // Select pillar
    fireEvent.press(mindPillar);
    
    // Verify button is enabled
    await waitFor(() => {
      let continueButton = getByTestId('onboarding-screen3-continue');
      expect(continueButton.props.disabled).toBeFalsy();
    });

    // Deselect pillar
    fireEvent.press(mindPillar);
    
    // Verify button is disabled again
    await waitFor(() => {
      let continueButton = getByTestId('onboarding-screen3-continue');
      expect(continueButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  /**
   * Test: Visual feedback - Selected pillars should show checkmark
   */
  it('should display checkmark on selected pillars', async () => {
    const mockOnComplete = jest.fn();
    const { getByText, getByTestId, getByLabelText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);

    await navigateToScreen3(getByText, getByTestId);

    const mindPillar = getByLabelText('Mind');
    
    // Select pillar
    fireEvent.press(mindPillar);
    
    // Verify accessibility state shows checked
    await waitFor(() => {
      expect(mindPillar.props.accessibilityState.checked).toBe(true);
    });
  });
});
