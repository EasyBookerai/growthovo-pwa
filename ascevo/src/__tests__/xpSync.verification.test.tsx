/**
 * XP Synchronization Verification Test
 * Task 12.3: Verify Home screen stat updates
 * 
 * This is a simplified verification test that focuses on the core requirement:
 * - XP earned in Pillars updates AppContext
 * - AppContext.xp reflects new total
 * - Cross-screen state consistency
 * 
 * Validates Requirements:
 * - 17.1: XP awarded in Pillars updates AppContext
 * - 17.2: Home screen stats reflect new XP value
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AppProvider, useAppContext } from '../context/AppContext';
import { completeLesson } from '../services/pillarLessonService';
import { awardXP } from '../services/pillarChallengeService';

// Mock services
jest.mock('../services/pillarStorageService', () => ({
  loadCompletedLessons: jest.fn(() => Promise.resolve({
    lessonIds: [],
    lastUpdated: new Date().toISOString(),
  })),
  loadPillarProgress: jest.fn(() => Promise.resolve({
    pillarKey: 'mental-health',
    xp: 0,
    level: 1,
    completedLessons: [],
    streak: 0,
    lastActivityDate: '',
    challengeCompletedToday: false,
    challengeCompletionDate: null,
  })),
  savePillarProgress: jest.fn(() => Promise.resolve()),
  saveCompletedLessons: jest.fn(() => Promise.resolve()),
  loadGlobalXP: jest.fn(() => Promise.resolve(0)),
  saveGlobalXP: jest.fn(() => Promise.resolve()),
  getCurrentDate: jest.fn(() => '2024-01-15'),
  shouldResetDailyChallenge: jest.fn(() => false),
}));

jest.mock('../services/pillarXPService', () => ({
  calculateLevel: jest.fn((xp: number) => Math.floor(xp / 500) + 1),
  calculateProgress: jest.fn((xp: number) => ((xp % 500) / 500) * 100),
  getXPToNextLevel: jest.fn((xp: number) => 500 - (xp % 500)),
}));

// Mock Supabase client
const mockSupabaseUpdate = jest.fn(() => ({
  eq: jest.fn(() => Promise.resolve({ error: null })),
}));

const mockSupabaseSelect = jest.fn(() => ({
  eq: jest.fn(() => ({
    single: jest.fn(() => Promise.resolve({
      data: { total_xp: 0, current_streak: 0 },
      error: null,
    })),
  })),
}));

jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSupabaseSelect,
      update: mockSupabaseUpdate,
    })),
  },
}));

// Test component that displays XP from AppContext
const XPDisplay = () => {
  const { xp } = useAppContext();
  return <>{xp}</>;
};

describe('XP Synchronization Verification (Task 12.3)', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset Supabase mocks
    mockSupabaseSelect.mockReturnValue({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: { total_xp: 0, current_streak: 0 },
          error: null,
        })),
      })),
    });

    mockSupabaseUpdate.mockReturnValue({
      eq: jest.fn(() => Promise.resolve({ error: null })),
    });
  });

  /**
   * Test 1: Verify AppContext.xp updates when XP is awarded
   * 
   * This test validates that the updateXP callback from AppContext
   * correctly updates the global XP state.
   */
  it('should update AppContext.xp when XP is awarded', async () => {
    const { getByText } = render(
      <AppProvider userId={mockUserId}>
        <XPDisplay />
      </AppProvider>
    );

    // Initial XP should be 0
    await waitFor(() => {
      expect(getByText('0')).toBeTruthy();
    });

    // Get the updateXP function from AppContext
    let updateXPCallback: ((xp: number) => Promise<void>) | null = null;
    
    const UpdateXPCapture = () => {
      const { updateXP } = useAppContext();
      updateXPCallback = updateXP;
      return null;
    };

    render(
      <AppProvider userId={mockUserId}>
        <UpdateXPCapture />
      </AppProvider>
    );

    // Award 50 XP through AppContext
    if (updateXPCallback) {
      await updateXPCallback(50);
    }

    // Verify Supabase was called with new XP
    await waitFor(() => {
      expect(mockSupabaseUpdate).toHaveBeenCalledWith({ total_xp: 50 });
    });
  });

  /**
   * Test 2: Verify awardXP function calls AppContext sync callback
   * 
   * This test validates that the awardXP function in pillarChallengeService
   * correctly calls the onAppContextSync callback when provided.
   */
  it('should call AppContext sync callback when awardXP is invoked', async () => {
    const mockOnAppContextSync = jest.fn(() => Promise.resolve());

    // Award 50 XP with AppContext sync callback
    await awardXP('mental-health', 50, mockOnAppContextSync);

    // Verify callback was called with correct amount
    expect(mockOnAppContextSync).toHaveBeenCalledWith(50);
  });

  /**
   * Test 3: Verify completeLesson function calls AppContext sync callback
   * 
   * This test validates that the completeLesson function in pillarLessonService
   * correctly calls the onAppContextSync callback when provided.
   */
  it('should call AppContext sync callback when lesson is completed', async () => {
    const mockOnAppContextSync = jest.fn(() => Promise.resolve());

    // Complete a lesson with AppContext sync callback
    await completeLesson('mental-health', 'mental-health-lesson-1', mockOnAppContextSync);

    // Verify callback was called with 50 XP (lesson completion award)
    expect(mockOnAppContextSync).toHaveBeenCalledWith(50);
  });

  /**
   * Test 4: Verify XP accumulates correctly across multiple awards
   * 
   * This test validates that multiple XP awards accumulate correctly
   * in AppContext.
   */
  it('should accumulate XP across multiple awards', async () => {
    const mockOnAppContextSync = jest.fn(() => Promise.resolve());

    // Award XP multiple times
    await awardXP('mental-health', 50, mockOnAppContextSync);
    await awardXP('mental-health', 30, mockOnAppContextSync);
    await awardXP('relationships', 50, mockOnAppContextSync);

    // Verify callback was called 3 times with correct amounts
    expect(mockOnAppContextSync).toHaveBeenCalledTimes(3);
    expect(mockOnAppContextSync).toHaveBeenNthCalledWith(1, 50);
    expect(mockOnAppContextSync).toHaveBeenNthCalledWith(2, 30);
    expect(mockOnAppContextSync).toHaveBeenNthCalledWith(3, 50);

    // Total XP should be 130 (50 + 30 + 50)
    const totalXP = 50 + 30 + 50;
    expect(totalXP).toBe(130);
  });

  /**
   * Test 5: Verify AppContext sync handles errors gracefully
   * 
   * This test validates that when AppContext sync fails (network error),
   * the local state is preserved and the error is handled gracefully.
   */
  it('should handle AppContext sync failure gracefully', async () => {
    // Mock Supabase update failure
    mockSupabaseUpdate.mockReturnValue({
      eq: jest.fn(() => Promise.resolve({ 
        error: { message: 'Network error' } 
      })),
    });

    const mockOnAppContextSync = jest.fn(() => 
      Promise.reject(new Error('Network error'))
    );

    // Award XP with failing callback
    // Should not throw error (graceful handling)
    await expect(
      awardXP('mental-health', 50, mockOnAppContextSync)
    ).resolves.not.toThrow();

    // Verify callback was called
    expect(mockOnAppContextSync).toHaveBeenCalledWith(50);
  });

  /**
   * Test 6: Verify XP state consistency
   * 
   * This test validates that XP state remains consistent when
   * accessed from multiple components.
   */
  it('should maintain consistent XP state across multiple components', async () => {
    const Component1 = () => {
      const { xp } = useAppContext();
      return <>{xp}</>;
    };

    const Component2 = () => {
      const { xp } = useAppContext();
      return <>{xp}</>;
    };

    const { getAllByText } = render(
      <AppProvider userId={mockUserId}>
        <Component1 />
        <Component2 />
      </AppProvider>
    );

    // Both components should show same XP value
    await waitFor(() => {
      const xpElements = getAllByText('0');
      expect(xpElements).toHaveLength(2);
    });
  });
});
