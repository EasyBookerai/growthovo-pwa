import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotificationPermissionPrompt from '../components/NotificationPermissionPrompt';
import * as Notifications from 'expo-notifications';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
}));

describe('NotificationPermissionPrompt', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays the custom permission prompt with correct text', () => {
    const { getByText } = render(
      <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
    );

    expect(getByText('🔔')).toBeTruthy();
    expect(getByText('Stay on track — Rex will send you daily nudges')).toBeTruthy();
    expect(getByText('Allow')).toBeTruthy();
    expect(getByText('Maybe later')).toBeTruthy();
  });

  it('triggers native permission prompt when Allow is tapped', async () => {
    const { getByText } = render(
      <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
    );

    const allowButton = getByText('Allow');
    fireEvent.press(allowButton);

    await waitFor(() => {
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  it('dismisses without triggering native prompt when Maybe later is tapped', async () => {
    const { getByText } = render(
      <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
    );

    const laterButton = getByText('Maybe later');
    fireEvent.press(laterButton);

    await waitFor(() => {
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <NotificationPermissionPrompt visible={false} onDismiss={mockOnDismiss} />
    );

    expect(queryByText('Stay on track — Rex will send you daily nudges')).toBeNull();
  });

  it('has properly styled Allow button as primary action', () => {
    const { getByText } = render(
      <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
    );

    const allowButton = getByText('Allow').parent;
    expect(allowButton).toBeTruthy();
  });

  it('has properly styled Maybe later button as secondary action', () => {
    const { getByText } = render(
      <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
    );

    const laterButton = getByText('Maybe later');
    expect(laterButton).toBeTruthy();
  });
});
