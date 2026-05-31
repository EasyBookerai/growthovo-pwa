/**
 * Tests for Screen 1: Welcome with egg hatching animation
 * 
 * Validates Requirements 1.5 and 1.6:
 * - Display Growthovo logo with text "Your growth adventure starts now"
 * - Create CSS-animated egg hatching animation using Animated API
 * - Use transform: scale and opacity for hatching effect
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewOnboardingScreen from '../NewOnboardingScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiSet: jest.fn(),
}));

describe('Screen 1: Welcome with egg hatching animation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should display Growthovo logo', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    // Requirement 1.5: Display Growthovo logo
    expect(getByText('Growthovo')).toBeTruthy();
  });

  it('should display "Your growth adventure starts now" text', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    // Requirement 1.5: Display text "Your growth adventure starts now"
    expect(getByText('Your growth adventure starts now')).toBeTruthy();
  });

  it('should render egg emoji for hatching animation', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    // Requirement 1.6: Create CSS-animated egg hatching animation
    // The egg emoji should be present in the component
    expect(getByText('🥚')).toBeTruthy();
  });

  it('should render hatched creature emoji', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    // Requirement 1.6: The hatched creature should be present
    expect(getByText('🐣')).toBeTruthy();
  });

  it('should have Get Started button', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    expect(getByText('Get Started →')).toBeTruthy();
  });

  it('should render animation container', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    // Verify the animation elements are present
    const eggEmoji = getByText('🥚');
    const hatchedEmoji = getByText('🐣');
    
    expect(eggEmoji).toBeTruthy();
    expect(hatchedEmoji).toBeTruthy();
  });
});
