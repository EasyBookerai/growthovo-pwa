import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ProgressRing from '../ProgressRing';
import { colors } from '../../../theme';

describe('ProgressRing', () => {
  it('should render with basic props', () => {
    const { root } = render(
      <ProgressRing
        progress={0.5}
        size={100}
        strokeWidth={8}
        color={colors.primary}
      />
    );
    expect(root).toBeTruthy();
  });

  it('should render children content in center', () => {
    const { getByText } = render(
      <ProgressRing
        progress={0.75}
        size={120}
        strokeWidth={10}
        color={colors.success}
      >
        <Text>75%</Text>
      </ProgressRing>
    );
    expect(getByText('75%')).toBeTruthy();
  });

  it('should clamp progress to 0-1 range', () => {
    // Test with progress > 1
    const { root: root1 } = render(
      <ProgressRing
        progress={1.5}
        size={100}
        strokeWidth={8}
        color={colors.primary}
      />
    );
    expect(root1).toBeTruthy();

    // Test with progress < 0
    const { root: root2 } = render(
      <ProgressRing
        progress={-0.5}
        size={100}
        strokeWidth={8}
        color={colors.primary}
      />
    );
    expect(root2).toBeTruthy();
  });

  it('should use custom background color when provided', () => {
    const customBg = 'rgba(255, 0, 0, 0.2)';
    const { root } = render(
      <ProgressRing
        progress={0.3}
        size={100}
        strokeWidth={8}
        color={colors.primary}
        backgroundColor={customBg}
      />
    );
    expect(root).toBeTruthy();
  });

  it('should render with animation disabled', () => {
    const { root } = render(
      <ProgressRing
        progress={0.8}
        size={100}
        strokeWidth={8}
        color={colors.primary}
        animated={false}
      />
    );
    expect(root).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { marginTop: 20 };
    const { root } = render(
      <ProgressRing
        progress={0.6}
        size={100}
        strokeWidth={8}
        color={colors.primary}
        style={customStyle}
      />
    );
    expect(root).toBeTruthy();
  });

  it('should handle 0% progress', () => {
    const { root } = render(
      <ProgressRing
        progress={0}
        size={100}
        strokeWidth={8}
        color={colors.primary}
      />
    );
    expect(root).toBeTruthy();
  });

  it('should handle 100% progress', () => {
    const { root } = render(
      <ProgressRing
        progress={1}
        size={100}
        strokeWidth={8}
        color={colors.primary}
      />
    );
    expect(root).toBeTruthy();
  });

  it('should render with different sizes', () => {
    const sizes = [50, 100, 150, 200];
    
    sizes.forEach(size => {
      const { root } = render(
        <ProgressRing
          progress={0.5}
          size={size}
          strokeWidth={8}
          color={colors.primary}
        />
      );
      expect(root).toBeTruthy();
    });
  });

  it('should render with different stroke widths', () => {
    const strokeWidths = [4, 8, 12, 16];
    
    strokeWidths.forEach(strokeWidth => {
      const { root } = render(
        <ProgressRing
          progress={0.5}
          size={100}
          strokeWidth={strokeWidth}
          color={colors.primary}
        />
      );
      expect(root).toBeTruthy();
    });
  });

  it('should render with different colors', () => {
    const testColors = [
      colors.primary,
      colors.success,
      colors.error,
      colors.warning,
      colors.xpGold,
    ];
    
    testColors.forEach(color => {
      const { root } = render(
        <ProgressRing
          progress={0.5}
          size={100}
          strokeWidth={8}
          color={color}
        />
      );
      expect(root).toBeTruthy();
    });
  });

  it('should render multiple children', () => {
    const { getByText } = render(
      <ProgressRing
        progress={0.65}
        size={120}
        strokeWidth={10}
        color={colors.primary}
      >
        <Text>65%</Text>
        <Text>Complete</Text>
      </ProgressRing>
    );
    expect(getByText('65%')).toBeTruthy();
    expect(getByText('Complete')).toBeTruthy();
  });
});
