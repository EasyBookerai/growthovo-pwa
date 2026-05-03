import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AppProvider, useAppContext } from '../AppContext';
import { supabase } from '../../services/supabaseClient';

// Mock Supabase client
jest.mock('../../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('AppContext', () => {
  const mockUserId = 'test-user-123';
  const mockSupabaseFrom = supabase.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider userId={mockUserId}>{children}</AppProvider>
  );

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.xp).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.level).toBe(1);
  });

  it('should throw error when used outside AppProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      renderHook(() => useAppContext());
    }).toThrow('useAppContext must be used within AppProvider');

    consoleSpy.mockRestore();
  });

  it('should calculate level from XP correctly', async () => {
    // Mock Supabase response for initial load
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { total_xp: 250, current_streak: 5 },
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useAppContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.xp).toBe(250);
      expect(result.current.level).toBe(3); // floor(250 / 100) + 1 = 3
      expect(result.current.streak).toBe(5);
    });
  });

  it('should update XP and sync with Supabase', async () => {
    // Mock initial load
    mockSupabaseFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { total_xp: 100, current_streak: 3 },
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useAppContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.xp).toBe(100);
    });

    // Mock update call
    mockSupabaseFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }),
    });

    await act(async () => {
      await result.current.updateXP(50);
    });

    expect(result.current.xp).toBe(150);
    expect(result.current.level).toBe(2); // floor(150 / 100) + 1 = 2
  });

  it('should update streak and sync with Supabase', async () => {
    // Mock initial load
    mockSupabaseFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { total_xp: 0, current_streak: 5 },
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useAppContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.streak).toBe(5);
    });

    // Mock update call
    mockSupabaseFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }),
    });

    await act(async () => {
      await result.current.updateStreak(10);
    });

    expect(result.current.streak).toBe(10);
  });

  it('should refresh user data from Supabase', async () => {
    // Mock initial load
    mockSupabaseFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { total_xp: 100, current_streak: 3 },
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useAppContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.xp).toBe(100);
    });

    // Mock refresh call
    mockSupabaseFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { total_xp: 200, current_streak: 7 },
            error: null,
          }),
        }),
      }),
    });

    await act(async () => {
      await result.current.refreshUserData();
    });

    expect(result.current.xp).toBe(200);
    expect(result.current.streak).toBe(7);
    expect(result.current.level).toBe(3); // floor(200 / 100) + 1 = 3
  });

  it('should handle Supabase errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock error response
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useAppContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.xp).toBe(0);
      expect(result.current.streak).toBe(0);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
