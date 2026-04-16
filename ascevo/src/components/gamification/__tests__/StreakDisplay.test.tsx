import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StreakDisplay from '../StreakDisplay';

describe('StreakDisplay', () => {
  describe('Compact Variant', () => {
    it('should render streak count correctly', () => {
      const { getByText } = render(
        <StreakDisplay streak={10} isAtRisk={false} freezeCount={2} variant="compact" />
      );
      
      expect(getByText('10')).toBeTruthy();
      expect(getByText('day streak')).toBeTruthy();
    });

    it('should display fire emoji when not at risk', () => {
      const { getByText } = render(
        <StreakDisplay streak={5} isAtRisk={false} freezeCount={0} variant="compact" />
      );
      
      expect(getByText('🔥')).toBeTruthy();
    });

    it('should display skull emoji when at risk', () => {
      const { getByText } = render(
        <StreakDisplay streak={5} isAtRisk={true} freezeCount={0} variant="compact" />
      );
      
      expect(getByText('💀')).toBeTruthy();
    });

    it('should show "At Risk!" label when streak is at risk', () => {
      const { getByText } = render(
        <StreakDisplay streak={5} isAtRisk={true} freezeCount={0} variant="compact" />
      );
      
      expect(getByText('At Risk!')).toBeTruthy();
    });

    it('should display freeze count when available', () => {
      const { getByText } = render(
        <StreakDisplay streak={10} isAtRisk={false} freezeCount={3} variant="compact" />
      );
      
      expect(getByText('❄️')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
    });

    it('should not display freeze badge when count is 0', () => {
      const { queryByText } = render(
        <StreakDisplay streak={10} isAtRisk={false} freezeCount={0} variant="compact" />
      );
      
      expect(queryByText('❄️')).toBeNull();
    });

    it('should call onPress when tapped', () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <StreakDisplay streak={10} isAtRisk={false} freezeCount={0} variant="compact" onPress={onPress} />
      );
      
      const button = getByRole('button');
      fireEvent.press(button);
      
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Expanded Variant', () => {
    it('should render streak count correctly', () => {
      const { getByText } = render(
        <StreakDisplay streak={30} isAtRisk={false} freezeCount={2} variant="expanded" />
      );
      
      expect(getByText('30')).toBeTruthy();
      expect(getByText('Day Streak')).toBeTruthy();
    });

    it('should display fire emoji when not at risk', () => {
      const { getByText } = render(
        <StreakDisplay streak={15} isAtRisk={false} freezeCount={0} variant="expanded" />
      );
      
      expect(getByText('🔥')).toBeTruthy();
    });

    it('should display skull emoji when at risk', () => {
      const { getByText } = render(
        <StreakDisplay streak={15} isAtRisk={true} freezeCount={0} variant="expanded" />
      );
      
      expect(getByText('💀')).toBeTruthy();
    });

    it('should show at-risk banner when streak is at risk', () => {
      const { getByText } = render(
        <StreakDisplay streak={15} isAtRisk={true} freezeCount={0} variant="expanded" />
      );
      
      expect(getByText('⚠️ Complete your daily goal to keep your streak!')).toBeTruthy();
    });

    it('should show milestone banner for 7 day streak', () => {
      const { getByText } = render(
        <StreakDisplay streak={7} isAtRisk={false} freezeCount={0} variant="expanded" />
      );
      
      expect(getByText('🎉 7 Day Milestone!')).toBeTruthy();
    });

    it('should show milestone banner for 30 day streak', () => {
      const { getByText } = render(
        <StreakDisplay streak={30} isAtRisk={false} freezeCount={0} variant="expanded" />
      );
      
      expect(getByText('🎉 30 Day Milestone!')).toBeTruthy();
    });

    it('should show milestone banner for 100 day streak', () => {
      const { getByText } = render(
        <StreakDisplay streak={100} isAtRisk={false} freezeCount={0} variant="expanded" />
      );
      
      expect(getByText('🎉 100 Day Milestone!')).toBeTruthy();
    });

    it('should show milestone banner for 365 day streak', () => {
      const { getByText } = render(
        <StreakDisplay streak={365} isAtRisk={false} freezeCount={0} variant="expanded" />
      );
      
      expect(getByText('🎉 365 Day Milestone!')).toBeTruthy();
    });

    it('should not show milestone banner when at risk', () => {
      const { queryByText } = render(
        <StreakDisplay streak={7} isAtRisk={true} freezeCount={0} variant="expanded" />
      );
      
      expect(queryByText('🎉 7 Day Milestone!')).toBeNull();
    });

    it('should display freeze count with description', () => {
      const { getByText } = render(
        <StreakDisplay streak={20} isAtRisk={false} freezeCount={2} variant="expanded" />
      );
      
      expect(getByText('❄️')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
      expect(getByText('2 streak freezes available')).toBeTruthy();
    });

    it('should use singular "freeze" for count of 1', () => {
      const { getByText } = render(
        <StreakDisplay streak={20} isAtRisk={false} freezeCount={1} variant="expanded" />
      );
      
      expect(getByText('1 streak freeze available')).toBeTruthy();
    });

    it('should call onPress when tapped', () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <StreakDisplay streak={20} isAtRisk={false} freezeCount={0} variant="expanded" onPress={onPress} />
      );
      
      const button = getByRole('button');
      fireEvent.press(button);
      
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero streak', () => {
      const { getByText } = render(
        <StreakDisplay streak={0} isAtRisk={false} freezeCount={0} variant="compact" />
      );
      
      expect(getByText('0')).toBeTruthy();
    });

    it('should handle large streak numbers', () => {
      const { getByText } = render(
        <StreakDisplay streak={999} isAtRisk={false} freezeCount={0} variant="compact" />
      );
      
      expect(getByText('999')).toBeTruthy();
    });

    it('should handle maximum freeze count', () => {
      const { getByText } = render(
        <StreakDisplay streak={10} isAtRisk={false} freezeCount={5} variant="compact" />
      );
      
      expect(getByText('5')).toBeTruthy();
    });

    it('should work without onPress handler', () => {
      const { getByRole } = render(
        <StreakDisplay streak={10} isAtRisk={false} freezeCount={0} variant="compact" />
      );
      
      const button = getByRole('button');
      // Should not throw error when pressed without handler
      fireEvent.press(button);
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label for normal streak', () => {
      const { getByLabelText } = render(
        <StreakDisplay streak={10} isAtRisk={false} freezeCount={0} variant="compact" />
      );
      
      expect(getByLabelText('10 day streak')).toBeTruthy();
    });

    it('should have correct accessibility label for at-risk streak', () => {
      const { getByLabelText } = render(
        <StreakDisplay streak={5} isAtRisk={true} freezeCount={0} variant="compact" />
      );
      
      expect(getByLabelText('5 day streak, at risk')).toBeTruthy();
    });

    it('should have accessibility hint', () => {
      const { getByA11yHint } = render(
        <StreakDisplay streak={10} isAtRisk={false} freezeCount={0} variant="compact" onPress={() => {}} />
      );
      
      expect(getByA11yHint('Tap to view streak details')).toBeTruthy();
    });
  });
});
