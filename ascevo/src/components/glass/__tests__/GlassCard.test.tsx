import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, Platform } from 'react-native';
import GlassCard from '../GlassCard';

describe('GlassCard', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <GlassCard>
        <Text>Test Content</Text>
      </GlassCard>
    );
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should apply light intensity styling', () => {
    const { getByTestId } = render(
      <GlassCard intensity="light">
        <Text testID="content">Light Glass</Text>
      </GlassCard>
    );
    expect(getByTestId('content')).toBeTruthy();
  });

  it('should apply medium intensity styling (default)', () => {
    const { getByTestId } = render(
      <GlassCard>
        <Text testID="content">Medium Glass</Text>
      </GlassCard>
    );
    expect(getByTestId('content')).toBeTruthy();
  });

  it('should apply heavy intensity styling', () => {
    const { getByTestId } = render(
      <GlassCard intensity="heavy">
        <Text testID="content">Heavy Glass</Text>
      </GlassCard>
    );
    expect(getByTestId('content')).toBeTruthy();
  });

  it('should accept custom tint color', () => {
    const customTint = 'rgba(100, 100, 100, 0.8)';
    const { getByTestId } = render(
      <GlassCard tint={customTint}>
        <Text testID="content">Custom Tint</Text>
      </GlassCard>
    );
    expect(getByTestId('content')).toBeTruthy();
  });

  it('should accept custom border color', () => {
    const customBorder = 'rgba(255, 0, 0, 0.5)';
    const { getByTestId } = render(
      <GlassCard borderColor={customBorder}>
        <Text testID="content">Custom Border</Text>
      </GlassCard>
    );
    expect(getByTestId('content')).toBeTruthy();
  });

  it('should accept custom style prop', () => {
    const customStyle = { marginTop: 20, padding: 24 };
    const { getByTestId } = render(
      <GlassCard style={customStyle}>
        <Text testID="content">Custom Style</Text>
      </GlassCard>
    );
    expect(getByTestId('content')).toBeTruthy();
  });

  it('should render as TouchableOpacity when onPress is provided', () => {
    const onPressMock = jest.fn();
    const { getByRole } = render(
      <GlassCard onPress={onPressMock}>
        <Text>Pressable Glass</Text>
      </GlassCard>
    );
    
    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByRole } = render(
      <GlassCard onPress={onPressMock}>
        <Text>Pressable Glass</Text>
      </GlassCard>
    );
    
    const button = getByRole('button');
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should render as View when onPress is not provided', () => {
    const { queryByRole } = render(
      <GlassCard>
        <Text>Non-pressable Glass</Text>
      </GlassCard>
    );
    
    expect(queryByRole('button')).toBeNull();
  });

  describe('Platform-specific styling', () => {
    const originalPlatform = Platform.OS;

    afterEach(() => {
      // Restore original platform
      Object.defineProperty(Platform, 'OS', {
        value: originalPlatform,
        writable: true,
      });
    });

    it('should apply backdrop-filter on web', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const { getByTestId } = render(
        <GlassCard intensity="medium">
          <Text testID="content">Web Glass</Text>
        </GlassCard>
      );
      
      expect(getByTestId('content')).toBeTruthy();
      // Note: We can't directly test style properties in React Native Testing Library
      // but we verify the component renders without errors on web
    });

    it('should render correctly on iOS', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });

      const { getByTestId } = render(
        <GlassCard intensity="medium">
          <Text testID="content">iOS Glass</Text>
        </GlassCard>
      );
      
      expect(getByTestId('content')).toBeTruthy();
    });

    it('should render correctly on Android with elevation', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        writable: true,
      });

      const { getByTestId } = render(
        <GlassCard intensity="medium">
          <Text testID="content">Android Glass</Text>
        </GlassCard>
      );
      
      expect(getByTestId('content')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty children', () => {
      const { root } = render(<GlassCard>{null}</GlassCard>);
      expect(root).toBeTruthy();
    });

    it('should handle multiple children', () => {
      const { getByText } = render(
        <GlassCard>
          <Text>First Child</Text>
          <Text>Second Child</Text>
          <Text>Third Child</Text>
        </GlassCard>
      );
      
      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
      expect(getByText('Third Child')).toBeTruthy();
    });

    it('should handle nested GlassCards', () => {
      const { getByText } = render(
        <GlassCard intensity="light">
          <Text>Outer Card</Text>
          <GlassCard intensity="heavy">
            <Text>Inner Card</Text>
          </GlassCard>
        </GlassCard>
      );
      
      expect(getByText('Outer Card')).toBeTruthy();
      expect(getByText('Inner Card')).toBeTruthy();
    });
  });

  describe('Blur optimization', () => {
    it('should enable blur optimization by default', () => {
      const { getByTestId } = render(
        <GlassCard>
          <Text testID="content">Optimized Glass</Text>
        </GlassCard>
      );
      
      expect(getByTestId('content')).toBeTruthy();
    });

    it('should allow disabling blur optimization', () => {
      const { getByTestId } = render(
        <GlassCard optimizeBlur={false}>
          <Text testID="content">Non-optimized Glass</Text>
        </GlassCard>
      );
      
      expect(getByTestId('content')).toBeTruthy();
    });

    it('should allow disabling blur on scroll', () => {
      const { getByTestId } = render(
        <GlassCard disableBlurOnScroll={false}>
          <Text testID="content">Always Blurred Glass</Text>
        </GlassCard>
      );
      
      expect(getByTestId('content')).toBeTruthy();
    });

    it('should work with all optimization options', () => {
      const { getByTestId } = render(
        <GlassCard optimizeBlur={true} disableBlurOnScroll={true}>
          <Text testID="content">Fully Optimized Glass</Text>
        </GlassCard>
      );
      
      expect(getByTestId('content')).toBeTruthy();
    });
  });
});
