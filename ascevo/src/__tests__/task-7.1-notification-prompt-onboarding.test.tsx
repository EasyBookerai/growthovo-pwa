/**
 * Test Suite: Task 7.1 - Custom Notification Permission Prompt After Onboarding
 * 
 * Requirements Tested:
 * - 5.1: Display custom permission prompt after onboarding completes
 * - 5.2: Show "🔔 Stay on track — Rex will send you daily nudges"
 * - 5.3: Add [Allow] and [Maybe later] buttons
 * - 5.4: Trigger browser's native permission prompt when [Allow] is tapped
 * - 5.5: Dismiss without triggering browser prompt when [Maybe later] is tapped
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewOnboardingScreen from '../screens/onboarding/NewOnboardingScreen';
import * as Notifications from 'expo-notifications';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
}));

// Mock growthovoExperienceService
jest.mock('../services/growthovoExperienceService', () => ({
  saveNewOnboardingToSupabase: jest.fn(),
}));

describe('Task 7.1: Custom Notification Permission Prompt After Onboarding', () => {
  const mockOnComplete = jest.fn();
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    const asyncStorageMock = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    asyncStorageMock.getItem.mockResolvedValue(null);
    asyncStorageMock.multiSet.mockResolvedValue(undefined);
  });

  async function completeOnboarding(component: ReturnType<typeof render>) {
    const { getByText, getByLabelText, getByPlaceholderText } = component;

    // Navigate through all screens
    // Screen 1: Welcome
    fireEvent.press(getByText('Get Started →'));

    // Screen 2: Features
    await waitFor(() => {
      expect(getByText('What makes Growthovo special')).toBeTruthy();
    });
    fireEvent.press(getByText('Continue →'));

    // Screen 3: Pillar selection
    await waitFor(() => {
      expect(getByText('Which areas matter most right now?')).toBeTruthy();
    });
    fireEvent.press(getByLabelText('Mind'));
    fireEvent.press(getByText('Continue →'));

    // Screen 4: Time commitment
    await waitFor(() => {
      expect(getByText('How much time can you commit daily?')).toBeTruthy();
    });
    fireEvent.press(getByLabelText('5 min'));
    fireEvent.press(getByText('Continue →'));

    // Screen 5: Name and avatar
    await waitFor(() => {
      expect(getByText('What should Rex call you?')).toBeTruthy();
    });
    const nameInput = getByPlaceholderText('Enter your name');
    fireEvent.changeText(nameInput, 'TestUser');
    
    // Complete onboarding
    fireEvent.press(getByText('Let\'s go →'));
  }

  it('Requirement 5.1: displays custom permission prompt after onboarding completes', async () => {
    const component = render(
      <NewOnboardingScreen userId={mockUserId} onComplete={mockOnComplete} />
    );

    await completeOnboarding(component);

    // Verify the notification prompt is displayed after onboarding
    await waitFor(() => {
      expect(component.getByText('Stay on track — Rex will send you daily nudges')).toBeTruthy();
    });
  });

  it('Requirement 5.2: shows correct prompt message with bell emoji', async () => {
    const component = render(
      <NewOnboardingScreen userId={mockUserId} onComplete={mockOnComplete} />
    );

    await completeOnboarding(component);

    await waitFor(() => {
      expect(component.getByText('🔔')).toBeTruthy();
      expect(component.getByText('Stay on track — Rex will send you daily nudges')).toBeTruthy();
    });
  });

  it('Requirement 5.3: displays [Allow] and [Maybe later] buttons', async () => {
    const component = render(
      <NewOnboardingScreen userId={mockUserId} onComplete={mockOnComplete} />
    );

    await completeOnboarding(component);

    await waitFor(() => {
      expect(component.getByText('Allow')).toBeTruthy();
      expect(component.getByText('Maybe later')).toBeTruthy();
    });
  });

  it('Requirement 5.4: triggers native permission prompt when [Allow] is tapped', async () => {
    const component = render(
      <NewOnboardingScreen userId={mockUserId} onComplete={mockOnComplete} />
    );

    await completeOnboarding(component);

    await waitFor(() => {
      expect(component.getByText('Allow')).toBeTruthy();
    });

    // Tap Allow button
    fireEvent.press(component.getByText('Allow'));

    // Verify native permission prompt was triggered
    await waitFor(() => {
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    // Verify onComplete was called after permission prompt
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('Requirement 5.5: dismisses without triggering browser prompt when [Maybe later] is tapped', async () => {
    const component = render(
      <NewOnboardingScreen userId={mockUserId} onComplete={mockOnComplete} />
    );

    await completeOnboarding(component);

    await waitFor(() => {
      expect(component.getByText('Maybe later')).toBeTruthy();
    });

    // Tap Maybe later button
    fireEvent.press(component.getByText('Maybe later'));

    // Verify native permission prompt was NOT triggered
    await waitFor(() => {
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    // Verify onComplete was called after dismissal
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('saves onboarding data before showing notification prompt', async () => {
    const component = render(
      <NewOnboardingScreen userId={mockUserId} onComplete={mockOnComplete} />
    );

    await completeOnboarding(component);

    // Verify AsyncStorage was called to save onboarding data
    await waitFor(() => {
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith(
        expect.arrayContaining([
          ['@growthovo:onboarding_complete', 'true'],
          expect.arrayContaining(['@growthovo:user_name', expect.any(String)]),
        ])
      );
    });

    // Verify notification prompt appears after data is saved
    await waitFor(() => {
      expect(component.getByText('Stay on track — Rex will send you daily nudges')).toBeTruthy();
    });
  });

  it('does not call onComplete until notification prompt is dismissed', async () => {
    const component = render(
      <NewOnboardingScreen userId={mockUserId} onComplete={mockOnComplete} />
    );

    await completeOnboarding(component);

    // Wait for prompt to appear
    await waitFor(() => {
      expect(component.getByText('Stay on track — Rex will send you daily nudges')).toBeTruthy();
    });

    // onComplete should not be called yet
    expect(mockOnComplete).not.toHaveBeenCalled();

    // Dismiss the prompt
    fireEvent.press(component.getByText('Maybe later'));

    // Now onComplete should be called
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('prompt is not visible before onboarding completion', async () => {
    const component = render(
      <NewOnboardingScreen userId={mockUserId} onComplete={mockOnComplete} />
    );

    // Verify prompt is not visible on initial render
    expect(component.queryByText('Stay on track — Rex will send you daily nudges')).toBeNull();

    // Navigate to screen 2
    fireEvent.press(component.getByText('Get Started →'));

    await waitFor(() => {
      expect(component.getByText('What makes Growthovo special')).toBeTruthy();
    });

    // Prompt should still not be visible
    expect(component.queryByText('Stay on track — Rex will send you daily nudges')).toBeNull();
  });
});
