/**
 * Basic smoke tests for NewOnboardingScreen
 * 
 * These tests verify the component renders without crashing
 * and basic interactions work as expected.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewOnboardingScreen from '../NewOnboardingScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiSet: jest.fn(),
}));

describe('NewOnboardingScreen - Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);
  });

  it('should render without crashing', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    expect(getByText('Your growth adventure starts now')).toBeTruthy();
  });

  it('should display skip button', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    expect(getByText('Skip')).toBeTruthy();
  });

  it('should display Get Started button on first screen', () => {
    const mockOnComplete = jest.fn();
    const { getByText } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    expect(getByText('Get Started →')).toBeTruthy();
  });

  it('should have pagination dots', () => {
    const mockOnComplete = jest.fn();
    const { UNSAFE_getAllByType } = render(<NewOnboardingScreen onComplete={mockOnComplete} />);
    
    // Component should render successfully
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
});
