import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AppProvider, useAppContext } from '../context/AppContext';
import { Text, View } from 'react-native';

// Mock Supabase
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { total_xp: 100, current_streak: 5 },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

// Test component that uses AppContext
function TestComponent() {
  const { xp, streak, level } = useAppContext();
  
  return (
    <View>
      <Text testID="xp-value">{xp}</Text>
      <Text testID="streak-value">{streak}</Text>
      <Text testID="level-value">{level}</Text>
    </View>
  );
}

describe('AppProvider Integration', () => {
  it('should provide context to child components', async () => {
    const { getByTestId } = render(
      <AppProvider userId="test-user-id">
        <TestComponent />
      </AppProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(getByTestId('xp-value').props.children).toBe(100);
      expect(getByTestId('streak-value').props.children).toBe(5);
      expect(getByTestId('level-value').props.children).toBe(2); // level = floor(100/100) + 1 = 2
    });
  });

  it('should throw error when useAppContext is used outside AppProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAppContext must be used within AppProvider');

    consoleSpy.mockRestore();
  });
});
