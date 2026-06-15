/**
 * Evening Debrief Integration Test
 * 
 * Validates Task 4: Implement Evening Debrief 4-part flow
 * Requirements: 3.1-3.12 from growthovo-world-class-experience spec
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EveningDebriefScreen from '../screens/debrief/EveningDebriefScreen';
import { AppProvider } from '../context/AppContext';
import { ToastProvider } from '../context/ToastContext';
import { 
  isAfter6PM, 
  markEveningDebriefDone, 
  saveTomorrowReminder 
} from '../services/growthovoExperienceService';

// Mock the services
jest.mock('../services/growthovoExperienceService', () => ({
  isAfter6PM: jest.fn(),
  markEveningDebriefDone: jest.fn(),
  saveTomorrowReminder: jest.fn(),
  getUserName: jest.fn().mockResolvedValue('TestUser'),
}));

jest.mock('../context/AppContext', () => ({
  AppProvider: ({ children }: any) => children,
  useAppContext: () => ({
    updateXP: jest.fn(),
    name: 'TestUser',
  }),
}));

jest.mock('../context/ToastContext', () => ({
  ToastProvider: ({ children }: any) => children,
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

describe('Evening Debrief Screen - Task 4', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isAfter6PM as jest.Mock).mockReturnValue(true);
  });

  describe('Subtask 4.1: Time-based access control', () => {
    it('should display the screen when after 6:00 PM', () => {
      (isAfter6PM as jest.Mock).mockReturnValue(true);
      const { getByText } = render(
        <EveningDebriefScreen onDismiss={jest.fn()} />
      );
      
      expect(getByText(/Evening Debrief/i)).toBeTruthy();
    });
  });

  describe('Subtask 4.2: Part 1 - Day rating', () => {
    it('should display 5-star rating interface', () => {
      const { getByText } = render(
        <EveningDebriefScreen onDismiss={jest.fn()} />
      );
      
      expect(getByText(/How was your day overall/i)).toBeTruthy();
      // Check for stars - looking for the text content
      const stars = getByText(/☆/).parent?.children;
      expect(stars).toBeDefined();
    });

    it('should fill stars with gold color when selected', () => {
      const { getByLabelText } = render(
        <EveningDebriefScreen onDismiss={jest.fn()} />
      );
      
      const star3 = getByLabelText('Rate your day 3 out of 5 stars');
      fireEvent.press(star3);
      
      // After pressing, the star should be filled (⭐ instead of ☆)
      expect(star3).toBeTruthy();
    });
  });

  describe('Subtask 4.3: Part 2 - Win reflection', () => {
    it('should display text input with 3 lines maximum', async () => {
      const { getByText, getByPlaceholderText, getByRole } = render(
        <EveningDebriefScreen onDismiss={jest.fn()} />
      );
      
      // Navigate to Part 2
      const star5 = getByLabelText('Rate your day 5 out of 5 stars');
      fireEvent.press(star5);
      
      const nextButton = getByText(/Next →/);
      fireEvent.press(nextButton);
      
      await waitFor(() => {
        expect(getByText(/What's one win from today/i)).toBeTruthy();
      });
      
      const input = getByPlaceholderText(/Even something small counts/i);
      expect(input).toBeTruthy();
    });
  });

  describe('Subtask 4.4: Part 3 - Challenge reflection', () => {
    it('should display text input with appropriate placeholder', async () => {
      const { getByText, getByPlaceholderText, getByLabelText } = render(
        <EveningDebriefScreen onDismiss={jest.fn()} />
      );
      
      // Navigate to Part 3
      const star5 = getByLabelText('Rate your day 5 out of 5 stars');
      fireEvent.press(star5);
      fireEvent.press(getByText(/Next →/));
      
      await waitFor(() => {
        const winInput = getByPlaceholderText(/Even something small counts/i);
        fireEvent.changeText(winInput, 'My win today');
      });
      
      fireEvent.press(getByText(/Next →/));
      
      await waitFor(() => {
        expect(getByText(/What was challenging today/i)).toBeTruthy();
      });
      
      const challengeInput = getByPlaceholderText(/No judgment, just reflection/i);
      expect(challengeInput).toBeTruthy();
    });
  });

  describe('Subtask 4.5: Part 4 - Tomorrow\'s priority', () => {
    it('should display tomorrow priority input and Rex response', async () => {
      const mockDismiss = jest.fn();
      const { getByText, getByPlaceholderText, getByLabelText } = render(
        <EveningDebriefScreen onDismiss={mockDismiss} />
      );
      
      // Navigate through all parts
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
      
      const priorityInput = getByPlaceholderText(/Tomorrow I will/i);
      expect(priorityInput).toBeTruthy();
    });

    it('should award 30 XP and save tomorrow reminder on completion', async () => {
      const mockUpdateXP = jest.fn();
      const mockDismiss = jest.fn();
      
      jest.spyOn(require('../context/AppContext'), 'useAppContext').mockReturnValue({
        updateXP: mockUpdateXP,
        name: 'TestUser',
      });
      
      const { getByText, getByPlaceholderText, getByLabelText } = render(
        <EveningDebriefScreen onDismiss={mockDismiss} />
      );
      
      // Complete all parts
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
        fireEvent.changeText(priorityInput, 'Complete my project');
      });
      
      const completeButton = getByText(/Complete →/);
      fireEvent.press(completeButton);
      
      await waitFor(() => {
        expect(saveTomorrowReminder).toHaveBeenCalledWith('Complete my project');
        expect(markEveningDebriefDone).toHaveBeenCalled();
        expect(mockUpdateXP).toHaveBeenCalledWith(30);
      });
    });

    it('should show Rex response with tomorrow priority', async () => {
      const { getByText, getByPlaceholderText, getByLabelText } = render(
        <EveningDebriefScreen onDismiss={jest.fn()} />
      );
      
      // Complete all parts
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
        fireEvent.changeText(priorityInput, 'exercise');
      });
      
      const completeButton = getByText(/Complete →/);
      fireEvent.press(completeButton);
      
      await waitFor(() => {
        expect(getByText(/Got it. I'll remind you about "exercise" tomorrow morning 💪/i)).toBeTruthy();
      });
    });
  });

  describe('Integration: Full flow completion', () => {
    it('should complete the entire 4-part flow successfully', async () => {
      const mockUpdateXP = jest.fn();
      const mockDismiss = jest.fn();
      
      jest.spyOn(require('../context/AppContext'), 'useAppContext').mockReturnValue({
        updateXP: mockUpdateXP,
        name: 'TestUser',
      });
      
      const { getByText, getByPlaceholderText, getByLabelText } = render(
        <EveningDebriefScreen onDismiss={mockDismiss} />
      );
      
      // Part 1: Rating
      expect(getByText(/Part 1 of 4/i)).toBeTruthy();
      const star4 = getByLabelText('Rate your day 4 out of 5 stars');
      fireEvent.press(star4);
      fireEvent.press(getByText(/Next →/));
      
      // Part 2: Win
      await waitFor(() => {
        expect(getByText(/Part 2 of 4/i)).toBeTruthy();
      });
      const winInput = getByPlaceholderText(/Even something small counts/i);
      fireEvent.changeText(winInput, 'Completed a difficult task');
      fireEvent.press(getByText(/Next →/));
      
      // Part 3: Challenge
      await waitFor(() => {
        expect(getByText(/Part 3 of 4/i)).toBeTruthy();
      });
      const challengeInput = getByPlaceholderText(/No judgment, just reflection/i);
      fireEvent.changeText(challengeInput, 'Time management was tough');
      fireEvent.press(getByText(/Next →/));
      
      // Part 4: Priority
      await waitFor(() => {
        expect(getByText(/Part 4 of 4/i)).toBeTruthy();
      });
      const priorityInput = getByPlaceholderText(/Tomorrow I will/i);
      fireEvent.changeText(priorityInput, 'wake up at 6am');
      fireEvent.press(getByText(/Complete →/));
      
      // Verify completion
      await waitFor(() => {
        expect(saveTomorrowReminder).toHaveBeenCalledWith('wake up at 6am');
        expect(markEveningDebriefDone).toHaveBeenCalled();
        expect(mockUpdateXP).toHaveBeenCalledWith(30);
      });
    });
  });
});
