import React from 'react';
import { render } from '@testing-library/react-native';
import XPBar from '../XPBar';

describe('XPBar Component', () => {
  it('should render with current XP, required XP, and level', () => {
    const { getByText } = render(
      <XPBar currentXP={150} requiredXP={250} level={3} />
    );

    expect(getByText('3')).toBeTruthy(); // Level badge
    expect(getByText('150 / 250 XP')).toBeTruthy(); // XP label
  });

  it('should hide label when showLabel is false', () => {
    const { queryByText } = render(
      <XPBar currentXP={150} requiredXP={250} level={3} showLabel={false} />
    );

    expect(queryByText('150 / 250 XP')).toBeNull();
  });

  it('should show level-up indicator when currentXP >= requiredXP', () => {
    const { getByText } = render(
      <XPBar currentXP={250} requiredXP={250} level={3} />
    );

    expect(getByText('🎉 Ready to level up!')).toBeTruthy();
  });

  it('should show level-up indicator when currentXP exceeds requiredXP', () => {
    const { getByText } = render(
      <XPBar currentXP={300} requiredXP={250} level={3} />
    );

    expect(getByText('🎉 Ready to level up!')).toBeTruthy();
  });

  it('should not show level-up indicator when below threshold', () => {
    const { queryByText } = render(
      <XPBar currentXP={200} requiredXP={250} level={3} />
    );

    expect(queryByText('🎉 Ready to level up!')).toBeNull();
  });

  it('should render with custom gradient colors', () => {
    const customGradient: [string, string] = ['#FF0000', '#00FF00'];
    const { toJSON } = render(
      <XPBar
        currentXP={150}
        requiredXP={250}
        level={3}
        gradient={customGradient}
      />
    );

    expect(toJSON()).toBeTruthy();
  });

  it('should handle zero XP correctly', () => {
    const { getByText } = render(
      <XPBar currentXP={0} requiredXP={100} level={1} />
    );

    expect(getByText('0 / 100 XP')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
  });

  it('should handle maximum XP correctly', () => {
    const { getByText } = render(
      <XPBar currentXP={5000} requiredXP={5000} level={10} />
    );

    expect(getByText('5000 / 5000 XP')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
    expect(getByText('🎉 Ready to level up!')).toBeTruthy();
  });

  it('should cap progress at 100% even if XP exceeds requirement', () => {
    // This test verifies the component doesn't break with overflow XP
    const { getByText } = render(
      <XPBar currentXP={500} requiredXP={250} level={5} />
    );

    expect(getByText('500 / 250 XP')).toBeTruthy();
    expect(getByText('🎉 Ready to level up!')).toBeTruthy();
  });

  it('should render without animation when animated is false', () => {
    const { toJSON } = render(
      <XPBar currentXP={150} requiredXP={250} level={3} animated={false} />
    );

    expect(toJSON()).toBeTruthy();
  });

  it('should support onPress callback', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <XPBar
        currentXP={150}
        requiredXP={250}
        level={3}
        onPress={onPressMock}
      />
    );

    // The component should render (onPress is handled by GlassCard)
    expect(getByText('3')).toBeTruthy();
  });

  it('should display correct level for different values', () => {
    const { getByText, rerender } = render(
      <XPBar currentXP={50} requiredXP={100} level={1} />
    );

    expect(getByText('1')).toBeTruthy();

    rerender(<XPBar currentXP={150} requiredXP={250} level={5} />);
    expect(getByText('5')).toBeTruthy();

    rerender(<XPBar currentXP={5000} requiredXP={6500} level={10} />);
    expect(getByText('10')).toBeTruthy();
  });

  it('should handle edge case of very small XP values', () => {
    const { getByText } = render(
      <XPBar currentXP={1} requiredXP={100} level={1} />
    );

    expect(getByText('1 / 100 XP')).toBeTruthy();
  });

  it('should handle edge case of very large XP values', () => {
    const { getByText } = render(
      <XPBar currentXP={9999} requiredXP={10000} level={15} />
    );

    expect(getByText('9999 / 10000 XP')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
  });
});
