import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LegalDocumentUpdateBanner from '../LegalDocumentUpdateBanner';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'legal.updateBanner.title': 'Legal Documents Updated',
        'legal.updateBanner.subtitle': `${params?.count || 0} document updated`,
        'legal.updateBanner.accessibilityLabel': 'View legal document updates',
        'legal.updateBanner.dismiss': 'Dismiss notification',
      };
      return translations[key] || key;
    },
  }),
}));

describe('LegalDocumentUpdateBanner', () => {
  const mockOnPress = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not visible', () => {
    const { queryByText } = render(
      <LegalDocumentUpdateBanner
        visible={false}
        updateCount={1}
        onPress={mockOnPress}
      />
    );

    expect(queryByText('Legal Documents Updated')).toBeNull();
  });

  it('renders banner when visible', () => {
    const { getByText } = render(
      <LegalDocumentUpdateBanner
        visible={true}
        updateCount={1}
        onPress={mockOnPress}
      />
    );

    expect(getByText('Legal Documents Updated')).toBeTruthy();
    expect(getByText('1 document updated')).toBeTruthy();
  });

  it('calls onPress when banner is pressed', () => {
    const { getByText } = render(
      <LegalDocumentUpdateBanner
        visible={true}
        updateCount={1}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByText('Legal Documents Updated'));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('shows dismiss button when onDismiss is provided', () => {
    const { getByLabelText } = render(
      <LegalDocumentUpdateBanner
        visible={true}
        updateCount={1}
        onPress={mockOnPress}
        onDismiss={mockOnDismiss}
      />
    );

    const dismissButton = getByLabelText('Dismiss notification');
    expect(dismissButton).toBeTruthy();
  });

  it('calls onDismiss when dismiss button is pressed', () => {
    const { getByLabelText } = render(
      <LegalDocumentUpdateBanner
        visible={true}
        updateCount={1}
        onPress={mockOnPress}
        onDismiss={mockOnDismiss}
      />
    );

    const dismissButton = getByLabelText('Dismiss notification');
    fireEvent.press(dismissButton);
    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('does not show dismiss button when onDismiss is not provided', () => {
    const { queryByLabelText } = render(
      <LegalDocumentUpdateBanner
        visible={true}
        updateCount={1}
        onPress={mockOnPress}
      />
    );

    expect(queryByLabelText('Dismiss notification')).toBeNull();
  });

  it('displays correct count for multiple updates', () => {
    const { getByText } = render(
      <LegalDocumentUpdateBanner
        visible={true}
        updateCount={3}
        onPress={mockOnPress}
      />
    );

    expect(getByText('3 document updated')).toBeTruthy();
  });
});
