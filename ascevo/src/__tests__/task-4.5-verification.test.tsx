/**
 * Task 4.5 Verification Test
 * 
 * Validates that Part 4 of Evening Debrief implements:
 * - Display "What's the ONE thing you want to do tomorrow?"
 * - Text input for user's answer
 * - Rex response showing the reminder
 * - Award 30 XP on completion
 * - Save tomorrow's priority to localStorage
 * 
 * Requirements: 3.8, 3.9, 3.10, 3.11, 3.12 from growthovo-world-class-experience spec
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EveningDebriefScreen from '../screens/debrief/EveningDebriefScreen';
import { AppProvider } from '../context/AppContext';
import {
  getUserName,
  saveTomorrowReminder,
  markEveningDebriefDone,
} from '../services/growthovoExperienceService';

// Mock the services
jest.mock('../services/growthovoExperienceService', () => ({
  getUserName: jest.fn().mockResolvedValue('TestUser'),
  saveTomorrowReminder: jest.fn().mockResolvedValue(undefined),
  markEveningDebriefDone: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../context/AppContext', () => ({
  AppProvider: ({ children }: any) => children,
  useAppContext: () => ({
    updateXP: jest.fn(),
    name: 'TestUser',
  }),
}));

function renderWithContext(component: React.ReactElement) {
  return render(<AppProvider>{component}</AppProvider>);
}

describe('Task 4.5: Implement Part 4 - Tomorrow\'s priority', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display "What\'s the ONE thing you want to do tomorrow?" question (Requirement 3.8)', async () => {
    const { getByText, getByLabelText, getByPlaceholderText } = renderWithContext(
      <EveningDebriefScreen onDismiss={jest.fn()} />
    );

    // Navigate to Part 4
    const star5 = getByLabelText('Rate your day 5 out of 5 stars');
    fireEvent.press(star5);
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const winInput = getByPlaceholderText(/Even something small counts/i);
      fireEvent.changeText(winInput, 'My win');
    });
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const challengeInput = getByPlaceholderText(/No judgment, just reflection/i);
      fireEvent.changeText(challengeInput, 'My challenge');
    });
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      expect(getByText(/What's the ONE thing you want to do tomorrow/i)).toBeTruthy();
    });
  });

  it('should provide text input for user\'s answer (Requirement 3.9)', async () => {
    const { getByText, getByLabelText, getByPlaceholderText } = renderWithContext(
      <EveningDebriefScreen onDismiss={jest.fn()} />
    );

    // Navigate to Part 4
    const star5 = getByLabelText('Rate your day 5 out of 5 stars');
    fireEvent.press(star5);
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const winInput = getByPlaceholderText(/Even something small counts/i);
      fireEvent.changeText(winInput, 'My win');
    });
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const challengeInput = getByPlaceholderText(/No judgment, just reflection/i);
      fireEvent.changeText(challengeInput, 'My challenge');
    });
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const priorityInput = getByPlaceholderText(/Tomorrow I will/i);
      expect(priorityInput).toBeTruthy();
      
      // Test that we can type in the input
      fireEvent.changeText(priorityInput, 'Complete my project');
      expect(priorityInput.props.value).toBe('Complete my project');
    });
  });

  it('should show Rex response with tomorrow\'s reminder (Requirement 3.10)', async () => {
    const { getByText, getByLabelText, getByPlaceholderText } = renderWithContext(
      <EveningDebriefScreen onDismiss={jest.fn()} />
    );

    // Navigate to Part 4 and complete
    const star5 = getByLabelText('Rate your day 5 out of 5 stars');
    fireEvent.press(star5);
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const winInput = getByPlaceholderText(/Even something small counts/i);
      fireEvent.changeText(winInput, 'My win');
    });
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const challengeInput = getByPlaceholderText(/No judgment, just reflection/i);
      fireEvent.changeText(challengeInput, 'My challenge');
    });
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const priorityInput = getByPlaceholderText(/Tomorrow I will/i);
      fireEvent.changeText(priorityInput, 'exercise for 30 minutes');
    });

    fireEvent.press(getByText(/Complete →/));

    await waitFor(() => {
      expect(getByText(/Got it. I'll remind you about "exercise for 30 minutes" tomorrow morning 💪/i)).toBeTruthy();
    });
  });

  it('should award 30 XP on completion (Requirement 3.11)', async () => {
    const mockUpdateXP = jest.fn();

    jest.spyOn(require('../context/AppContext'), 'useAppContext').mockReturnValue({
      updateXP: mockUpdateXP,
      name: 'TestUser',
    });

    const { getByText, getByLabelText, getByPlaceholderText } = renderWithContext(
      <EveningDebriefScreen onDismiss={jest.fn()} />
    );

    // Navigate to Part 4 and complete
    const star5 = getByLabelText('Rate your day 5 out of 5 stars');
    fireEvent.press(star5);
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const winInput = getByPlaceholderText(/Even something small counts/i);
      fireEvent.changeText(winInput, 'My win');
    });
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const challengeInput = getByPlaceholderText(/No judgment, just reflection/i);
      fireEvent.changeText(challengeInput, 'My challenge');
    });
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const priorityInput = getByPlaceholderText(/Tomorrow I will/i);
      fireEvent.changeText(priorityInput, 'wake up at 6am');
    });

    fireEvent.press(getByText(/Complete →/));

    await waitFor(() => {
      expect(mockUpdateXP).toHaveBeenCalledWith(30);
    });
  });

  it('should save tomorrow\'s priority to localStorage (Requirement 3.12)', async () => {
    const { getByText, getByLabelText, getByPlaceholderText } = renderWithContext(
      <EveningDebriefScreen onDismiss={jest.fn()} />
    );

    // Navigate to Part 4 and complete
    const star5 = getByLabelText('Rate your day 5 out of 5 stars');
    fireEvent.press(star5);
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const winInput = getByPlaceholderText(/Even something small counts/i);
      fireEvent.changeText(winInput, 'My win');
    });
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const challengeInput = getByPlaceholderText(/No judgment, just reflection/i);
      fireEvent.changeText(challengeInput, 'My challenge');
    });
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const priorityInput = getByPlaceholderText(/Tomorrow I will/i);
      fireEvent.changeText(priorityInput, 'finish the presentation');
    });

    fireEvent.press(getByText(/Complete →/));

    await waitFor(() => {
      expect(saveTomorrowReminder).toHaveBeenCalledWith('finish the presentation');
    });
  });

  it('should display +30 XP badge after completion', async () => {
    const { getByText, getByLabelText, getByPlaceholderText } = renderWithContext(
      <EveningDebriefScreen onDismiss={jest.fn()} />
    );

    // Navigate to Part 4 and complete
    const star5 = getByLabelText('Rate your day 5 out of 5 stars');
    fireEvent.press(star5);
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const winInput = getByPlaceholderText(/Even something small counts/i);
      fireEvent.changeText(winInput, 'My win');
    });
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const challengeInput = getByPlaceholderText(/No judgment, just reflection/i);
      fireEvent.changeText(challengeInput, 'My challenge');
    });
    fireEvent.press(getByText(/Next →/));

    await waitFor(() => {
      const priorityInput = getByPlaceholderText(/Tomorrow I will/i);
      fireEvent.changeText(priorityInput, 'meditate');
    });

    fireEvent.press(getByText(/Complete →/));

    await waitFor(() => {
      expect(getByText(/\+30 XP/i)).toBeTruthy();
    });
  });
});
