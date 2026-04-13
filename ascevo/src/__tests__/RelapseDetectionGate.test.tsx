import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import RelapseDetectionGate from '../components/RelapseDetectionGate';

// Mock the services
jest.mock('../services/relapseService', () => ({
  detectStreakBreak: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('RelapseDetectionGate', () => {
  const mockOnStreakBroke = jest.fn();
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when not checking', async () => {
    const { detectStreakBreak } = require('../services/relapseService');
    detectStreakBreak.mockResolvedValue({ broke: false, originalStreak: 5, freezeActivated: false });

    const { getByText } = render(
      <RelapseDetectionGate userId={mockUserId} onStreakBroke={mockOnStreakBroke}>
        <Text>Test Content</Text>
      </RelapseDetectionGate>
    );

    // Wait for the component to finish checking
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('calls onStreakBroke when streak is broken', async () => {
    const { detectStreakBreak } = require('../services/relapseService');
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    
    detectStreakBreak.mockResolvedValue({ broke: true, originalStreak: 10, freezeActivated: false });
    AsyncStorage.getItem.mockResolvedValue(null); // Not shown today

    render(
      <RelapseDetectionGate userId={mockUserId} onStreakBroke={mockOnStreakBroke}>
        <Text>Test Content</Text>
      </RelapseDetectionGate>
    );

    // Wait for the async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockOnStreakBroke).toHaveBeenCalledWith(10);
  });

  it('does not call onStreakBroke if already shown today', async () => {
    const { detectStreakBreak } = require('../services/relapseService');
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    
    detectStreakBreak.mockResolvedValue({ broke: true, originalStreak: 10, freezeActivated: false });
    AsyncStorage.getItem.mockResolvedValue('true'); // Already shown today

    render(
      <RelapseDetectionGate userId={mockUserId} onStreakBroke={mockOnStreakBroke}>
        <Text>Test Content</Text>
      </RelapseDetectionGate>
    );

    // Wait for the async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockOnStreakBroke).not.toHaveBeenCalled();
  });
});