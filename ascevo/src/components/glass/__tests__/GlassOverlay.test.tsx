import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GlassOverlay from '../GlassOverlay';

// Mock the theme service
jest.mock('../../../services/themeService', () => ({
  getResolvedTheme: jest.fn(() => 'dark'),
  getGlassTheme: jest.fn(() => ({
    blur: { light: 10, medium: 20, heavy: 30 },
    tint: {
      light: 'rgba(20, 20, 20, 0.5)',
      dark: 'rgba(10, 10, 10, 0.7)',
    },
    opacity: { light: 0.5, medium: 0.7, heavy: 0.85 },
    shadow: {
      color: '#000000',
      offset: { width: 0, height: 4 },
      opacity: 0.5,
      radius: 12,
    },
  })),
}));

describe('GlassOverlay', () => {
  it('should render when visible', () => {
    const { getByLabelText } = render(
      <GlassOverlay visible={true} />
    );

    expect(getByLabelText('Modal backdrop')).toBeTruthy();
  });

  it('should not render when not visible and not animated', () => {
    const { queryByLabelText } = render(
      <GlassOverlay visible={false} animated={false} />
    );

    expect(queryByLabelText('Modal backdrop')).toBeNull();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByLabelText } = render(
      <GlassOverlay visible={true} onPress={mockOnPress} />
    );

    const overlay = getByLabelText('Close modal');
    fireEvent.press(overlay);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should not be pressable when onPress is not provided', () => {
    const { getByLabelText } = render(
      <GlassOverlay visible={true} />
    );

    const overlay = getByLabelText('Modal backdrop');
    expect(overlay).toBeTruthy();
    // Should not have button role
    expect(overlay.props.accessibilityRole).not.toBe('button');
  });

  it('should support custom blur amount', () => {
    const { getByLabelText } = render(
      <GlassOverlay visible={true} blurAmount={30} />
    );

    expect(getByLabelText('Modal backdrop')).toBeTruthy();
  });

  it('should support custom tint color', () => {
    const { getByLabelText } = render(
      <GlassOverlay visible={true} tintColor="rgba(255, 0, 0, 0.5)" />
    );

    const overlay = getByLabelText('Modal backdrop');
    expect(overlay).toBeTruthy();
  });

  it('should support custom opacity', () => {
    const { getByLabelText } = render(
      <GlassOverlay visible={true} opacity={0.5} />
    );

    expect(getByLabelText('Modal backdrop')).toBeTruthy();
  });

  it('should have proper accessibility attributes when pressable', () => {
    const mockOnPress = jest.fn();
    const { getByLabelText } = render(
      <GlassOverlay visible={true} onPress={mockOnPress} />
    );

    const overlay = getByLabelText('Close modal');
    expect(overlay.props.accessibilityRole).toBe('button');
    expect(overlay.props.accessibilityHint).toBe('Tap to dismiss');
  });

  it('should animate when animated prop is true', () => {
    const { getByLabelText } = render(
      <GlassOverlay visible={true} animated={true} />
    );

    expect(getByLabelText('Modal backdrop')).toBeTruthy();
  });

  it('should not animate when animated prop is false', () => {
    const { getByLabelText } = render(
      <GlassOverlay visible={true} animated={false} />
    );

    expect(getByLabelText('Modal backdrop')).toBeTruthy();
  });
});
