/**
 * CheckInModal Component Tests
 * Tests the 3-step check-in flow with mood selection, focus input, and completion screen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CheckInModal from '../components/CheckInModal';
import { supabase } from '../services/supabaseClient';

// Mock Supabase client
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

describe('CheckInModal', () => {
  const mockOnComplete = jest.fn();
  const mockOnClose = jest.fn();
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Step 1 with mood picker when visible', () => {
    const { getByText } = render(
      <CheckInModal
        visible={true}
        userId={mockUserId}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    expect(getByText('How are you feeling?')).toBeTruthy();
    expect(getByText('Step 1 of 3')).toBeTruthy();
    expect(getByText('😔')).toBeTruthy();
    expect(getByText('😐')).toBeTruthy();
    expect(getByText('🙂')).toBeTruthy();
    expect(getByText('😊')).toBeTruthy();
    expect(getByText('🤩')).toBeTruthy();
  });

  it('advances to Step 2 when mood is selected', () => {
    const { getByText } = render(
      <CheckInModal
        visible={true}
        userId={mockUserId}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Select a mood
    fireEvent.press(getByText('🙂'));

    // Click Next
    fireEvent.press(getByText('Next →'));

    // Should show Step 2
    expect(getByText('Step 2 of 3')).toBeTruthy();
    expect(getByText("What's your focus today?")).toBeTruthy();
  });

  it('validates that mood must be selected before advancing', () => {
    const { getByText, queryByText } = render(
      <CheckInModal
        visible={true}
        userId={mockUserId}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Try to click Next without selecting mood
    const nextButton = getByText('Next →');
    fireEvent.press(nextButton);

    // Should still be on Step 1
    expect(getByText('Step 1 of 3')).toBeTruthy();
    expect(queryByText('Step 2 of 3')).toBeNull();
  });

  it('validates that focus text must be entered before advancing', () => {
    const { getByText, getByPlaceholderText } = render(
      <CheckInModal
        visible={true}
        userId={mockUserId}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Select mood and advance to Step 2
    fireEvent.press(getByText('🙂'));
    fireEvent.press(getByText('Next →'));

    // Try to advance without entering focus text
    const nextButton = getByText('Next →');
    fireEvent.press(nextButton);

    // Should still be on Step 2
    expect(getByText('Step 2 of 3')).toBeTruthy();
  });

  it('shows completion screen on Step 3', async () => {
    const { getByText, getByPlaceholderText } = render(
      <CheckInModal
        visible={true}
        userId={mockUserId}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Complete Step 1: Select mood
    fireEvent.press(getByText('🙂'));
    fireEvent.press(getByText('Next →'));

    // Complete Step 2: Enter focus
    const focusInput = getByPlaceholderText('e.g., Complete 2 lessons, stay consistent...');
    fireEvent.changeText(focusInput, 'Complete 2 lessons today');
    fireEvent.press(getByText('Next →'));

    // Should show Step 3 completion screen
    await waitFor(() => {
      expect(getByText('Step 3 of 3')).toBeTruthy();
      expect(getByText('Check-in Complete!')).toBeTruthy();
      expect(getByText("You've earned +50 XP for checking in today.")).toBeTruthy();
      expect(getByText('Keep up the momentum! 🚀')).toBeTruthy();
    });
  });

  it('saves check-in data to Supabase when completed', async () => {
    const mockInsert = jest.fn(() => Promise.resolve({ error: null }));
    const mockFrom = jest.fn(() => ({
      insert: mockInsert,
    }));
    (supabase.from as jest.Mock) = mockFrom;

    const { getByText, getByPlaceholderText } = render(
      <CheckInModal
        visible={true}
        userId={mockUserId}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Complete all steps
    fireEvent.press(getByText('🙂'));
    fireEvent.press(getByText('Next →'));

    const focusInput = getByPlaceholderText('e.g., Complete 2 lessons, stay consistent...');
    fireEvent.changeText(focusInput, 'Complete 2 lessons today');
    fireEvent.press(getByText('Next →'));

    // Click Done on completion screen
    await waitFor(() => {
      const doneButton = getByText('Done ✓');
      fireEvent.press(doneButton);
    });

    // Verify Supabase insert was called
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('check_ins');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          mood: 'good',
          focus: 'Complete 2 lessons today',
          xp_awarded: 50,
        })
      );
    });
  });

  it('calls onComplete callback with check-in data', async () => {
    const { getByText, getByPlaceholderText } = render(
      <CheckInModal
        visible={true}
        userId={mockUserId}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Complete all steps
    fireEvent.press(getByText('🙂'));
    fireEvent.press(getByText('Next →'));

    const focusInput = getByPlaceholderText('e.g., Complete 2 lessons, stay consistent...');
    fireEvent.changeText(focusInput, 'Complete 2 lessons today');
    fireEvent.press(getByText('Next →'));

    // Click Done on completion screen
    await waitFor(() => {
      const doneButton = getByText('Done ✓');
      fireEvent.press(doneButton);
    });

    // Verify onComplete was called with correct data
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith({
        mood: 'good',
        focus: 'Complete 2 lessons today',
        intention: '',
      });
    });
  });

  it('closes modal after completion', async () => {
    jest.useFakeTimers();

    const { getByText, getByPlaceholderText } = render(
      <CheckInModal
        visible={true}
        userId={mockUserId}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Complete all steps
    fireEvent.press(getByText('🙂'));
    fireEvent.press(getByText('Next →'));

    const focusInput = getByPlaceholderText('e.g., Complete 2 lessons, stay consistent...');
    fireEvent.changeText(focusInput, 'Complete 2 lessons today');
    fireEvent.press(getByText('Next →'));

    // Click Done on completion screen
    await waitFor(() => {
      const doneButton = getByText('Done ✓');
      fireEvent.press(doneButton);
    });

    // Fast-forward time to trigger modal close
    jest.advanceTimersByTime(1500);

    // Verify onClose was called
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  it('allows going back from Step 2 to Step 1', () => {
    const { getByText } = render(
      <CheckInModal
        visible={true}
        userId={mockUserId}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Advance to Step 2
    fireEvent.press(getByText('🙂'));
    fireEvent.press(getByText('Next →'));

    expect(getByText('Step 2 of 3')).toBeTruthy();

    // Go back to Step 1
    fireEvent.press(getByText('← Back'));

    expect(getByText('Step 1 of 3')).toBeTruthy();
    expect(getByText('How are you feeling?')).toBeTruthy();
  });

  it('resets state when modal is reopened', () => {
    const { getByText, rerender } = render(
      <CheckInModal
        visible={true}
        userId={mockUserId}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Select mood and advance
    fireEvent.press(getByText('🙂'));
    fireEvent.press(getByText('Next →'));

    expect(getByText('Step 2 of 3')).toBeTruthy();

    // Close modal
    rerender(
      <CheckInModal
        visible={false}
        userId={mockUserId}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Reopen modal
    rerender(
      <CheckInModal
        visible={true}
        userId={mockUserId}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    );

    // Should be back at Step 1
    expect(getByText('Step 1 of 3')).toBeTruthy();
    expect(getByText('How are you feeling?')).toBeTruthy();
  });
});
