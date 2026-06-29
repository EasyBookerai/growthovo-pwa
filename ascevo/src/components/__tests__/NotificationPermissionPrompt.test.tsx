import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotificationPermissionPrompt from '../NotificationPermissionPrompt';
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

  describe('Visibility', () => {
    it('should render when visible is true', () => {
      const { getByText } = render(
        <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
      );

      expect(getByText('Stay on track — Rex will send you daily nudges')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { queryByText } = render(
        <NotificationPermissionPrompt visible={false} onDismiss={mockOnDismiss} />
      );

      expect(queryByText('Stay on track — Rex will send you daily nudges')).toBeNull();
    });
  });

  describe('UI Elements - Requirement 5.2', () => {
    it('should display "🔔 Stay on track — Rex will send you daily nudges" text', () => {
      const { getByText } = render(
        <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
      );

      expect(getByText('Stay on track — Rex will send you daily nudges')).toBeTruthy();
    });

    it('should display the bell emoji 🔔', () => {
      const { getByText } = render(
        <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
      );

      expect(getByText('🔔')).toBeTruthy();
    });
  });

  describe('Buttons - Requirement 5.3', () => {
    it('should display [Allow] button', () => {
      const { getByText } = render(
        <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
      );

      expect(getByText('Allow')).toBeTruthy();
    });

    it('should display [Maybe later] button', () => {
      const { getByText } = render(
        <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
      );

      expect(getByText('Maybe later')).toBeTruthy();
    });
  });

  describe('Allow Button Behavior - Requirement 5.4', () => {
    it('should trigger native permission prompt when [Allow] is tapped on native platform', async () => {
      const mockRequestPermissions = jest.fn().mockResolvedValue({
        status: 'granted',
      });
      (Notifications.requestPermissionsAsync as jest.Mock) = mockRequestPermissions;

      const { getByText } = render(
        <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
      );

      const allowButton = getByText('Allow');
      fireEvent.press(allowButton);

      await waitFor(() => {
        expect(mockRequestPermissions).toHaveBeenCalled();
      });
    });

    it('should call onDismiss after requesting permissions', async () => {
      const mockRequestPermissions = jest.fn().mockResolvedValue({
        status: 'granted',
      });
      (Notifications.requestPermissionsAsync as jest.Mock) = mockRequestPermissions;

      const { getByText } = render(
        <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
      );

      const allowButton = getByText('Allow');
      fireEvent.press(allowButton);

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });
    });
  });

  describe('Maybe Later Button Behavior - Requirement 5.5', () => {
    it('should dismiss without triggering browser prompt when [Maybe later] is tapped', async () => {
      const mockRequestPermissions = jest.fn();
      (Notifications.requestPermissionsAsync as jest.Mock) = mockRequestPermissions;

      const { getByText } = render(
        <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
      );

      const maybeLaterButton = getByText('Maybe later');
      fireEvent.press(maybeLaterButton);

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });

      // Ensure permissions were not requested
      expect(mockRequestPermissions).not.toHaveBeenCalled();
    });
  });

  describe('Modal Behavior', () => {
    it('should render as a modal with transparent overlay', () => {
      const { UNSAFE_getByType } = render(
        <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
      );

      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(true);
      expect(modal.props.transparent).toBe(true);
      expect(modal.props.animationType).toBe('fade');
    });
  });

  describe('Error Handling', () => {
    it('should handle permission request rejection gracefully', async () => {
      const mockRequestPermissions = jest.fn().mockRejectedValue(new Error('Permission denied'));
      (Notifications.requestPermissionsAsync as jest.Mock) = mockRequestPermissions;

      const { getByText } = render(
        <NotificationPermissionPrompt visible={true} onDismiss={mockOnDismiss} />
      );

      const allowButton = getByText('Allow');
      fireEvent.press(allowButton);

      // Should still dismiss even if permission request fails
      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });
    });
  });
});
