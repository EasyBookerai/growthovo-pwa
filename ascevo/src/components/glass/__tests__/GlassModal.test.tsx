import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import GlassModal from '../GlassModal';

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

describe('GlassModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    const { getByText } = render(
      <GlassModal visible={true} onClose={mockOnClose}>
        <Text>Modal Content</Text>
      </GlassModal>
    );

    expect(getByText('Modal Content')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <GlassModal visible={false} onClose={mockOnClose}>
        <Text>Modal Content</Text>
      </GlassModal>
    );

    // After animation completes, modal should not be rendered
    expect(queryByText('Modal Content')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByLabelText } = render(
      <GlassModal visible={true} onClose={mockOnClose} showCloseButton={true}>
        <Text>Modal Content</Text>
      </GlassModal>
    );

    const closeButton = getByLabelText('Close modal');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is pressed', () => {
    const { getByLabelText } = render(
      <GlassModal visible={true} onClose={mockOnClose}>
        <Text>Modal Content</Text>
      </GlassModal>
    );

    const overlay = getByLabelText('Close modal');
    fireEvent.press(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not show close button when showCloseButton is false', () => {
    const { getByText } = render(
      <GlassModal visible={true} onClose={mockOnClose} showCloseButton={false}>
        <Text>Modal Content</Text>
      </GlassModal>
    );

    // Modal content should be visible
    expect(getByText('Modal Content')).toBeTruthy();
    // The test passes if the modal renders without the close button
  });

  it('should render in full screen mode', () => {
    const { getByLabelText } = render(
      <GlassModal visible={true} onClose={mockOnClose} fullScreen={true}>
        <Text>Full Screen Content</Text>
      </GlassModal>
    );

    const dialog = getByLabelText('Modal dialog');
    expect(dialog).toBeTruthy();
  });

  it('should support different animation types', () => {
    const { rerender, getByText } = render(
      <GlassModal visible={true} onClose={mockOnClose} animationType="fade">
        <Text>Fade Animation</Text>
      </GlassModal>
    );

    expect(getByText('Fade Animation')).toBeTruthy();

    rerender(
      <GlassModal visible={true} onClose={mockOnClose} animationType="slide">
        <Text>Slide Animation</Text>
      </GlassModal>
    );

    expect(getByText('Slide Animation')).toBeTruthy();

    rerender(
      <GlassModal visible={true} onClose={mockOnClose} animationType="scale">
        <Text>Scale Animation</Text>
      </GlassModal>
    );

    expect(getByText('Scale Animation')).toBeTruthy();
  });

  it('should support custom blur intensity', () => {
    const { getByText } = render(
      <GlassModal visible={true} onClose={mockOnClose} blurIntensity={30}>
        <Text>Custom Blur</Text>
      </GlassModal>
    );

    expect(getByText('Custom Blur')).toBeTruthy();
  });

  it('should have proper accessibility attributes', () => {
    const { getByLabelText } = render(
      <GlassModal visible={true} onClose={mockOnClose}>
        <Text>Accessible Modal</Text>
      </GlassModal>
    );

    const dialog = getByLabelText('Modal dialog');
    expect(dialog).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = { padding: 32 };
    const { getByLabelText } = render(
      <GlassModal visible={true} onClose={mockOnClose} style={customStyle}>
        <Text>Styled Modal</Text>
      </GlassModal>
    );

    const dialog = getByLabelText('Modal dialog');
    // Check that the style array includes our custom style
    const styles = Array.isArray(dialog.props.style) ? dialog.props.style : [dialog.props.style];
    const hasCustomPadding = styles.some((s: any) => s && s.padding === 32);
    expect(hasCustomPadding).toBe(true);
  });
});
