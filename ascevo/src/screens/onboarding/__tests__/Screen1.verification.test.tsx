/**
 * Verification tests for Task 1.2: Screen 1 with egg hatching animation
 * 
 * Validates Requirements:
 * - 1.5: Display Growthovo logo with text "Your growth adventure starts now"
 * - 1.6: Display CSS-animated egg hatching animation using Animated API
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import NewOnboardingScreen from '../NewOnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiSet: jest.fn(),
}));

describe('Task 1.2: Screen 1 - Welcome with egg hatching animation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  /**
   * Requirement 1.5: Display Growthovo logo with text
   */
  it('should display Growthovo logo', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    expect(getByText('Growthovo')).toBeTruthy();
  });

  it('should display "Your growth adventure starts now" text', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    expect(getByText('Your growth adventure starts now')).toBeTruthy();
  });

  /**
   * Requirement 1.6: Display egg hatching animation
   * Note: Animation uses React Native Animated API with transform: scale and opacity
   * The animation sequence is:
   * 1. Egg wobbles (scale pulses)
   * 2. Cracks appear (opacity fade in)
   * 3. Egg breaks (opacity fade out + scale down)
   * 4. Hatched creature appears (opacity fade in + spring scale up)
   */
  it('should display egg emoji for hatching animation', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    // Egg emoji should be present
    expect(getByText('🥚')).toBeTruthy();
  });

  it('should display hatched creature emoji', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    // Hatched creature emoji should be present (even if initially hidden)
    expect(getByText('🐣')).toBeTruthy();
  });

  it('should display crack effect emoji', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    // Crack effect emoji should be present (even if initially hidden)
    expect(getByText('💥')).toBeTruthy();
  });
});
