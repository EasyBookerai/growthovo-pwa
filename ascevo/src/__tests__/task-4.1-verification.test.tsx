/**
 * Task 4.1 Verification Test
 * 
 * Validates that EveningDebriefScreen exists with time-based access control
 * Requirements: 3.1, 3.2 from growthovo-world-class-experience spec
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import EveningDebriefScreen from '../screens/debrief/EveningDebriefScreen';
import { isAfter6PM } from '../services/growthovoExperienceService';

// Mock dependencies
jest.mock('../services/growthovoExperienceService', () => ({
  isAfter6PM: jest.fn(),
  markEveningDebriefDone: jest.fn(),
  saveTomorrowReminder: jest.fn(),
  getUserName: jest.fn().mockResolvedValue('TestUser'),
}));

jest.mock('../context/AppContext', () => ({
  useAppContext: () => ({
    updateXP: jest.fn(),
    name: 'TestUser',
  }),
}));

describe('Task 4.1: Create EveningDebriefScreen with time-based access control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render EveningDebriefScreen component (Requirement 3.1)', () => {
    (isAfter6PM as jest.Mock).mockReturnValue(true);
    
    const { getByText } = render(
      <EveningDebriefScreen onDismiss={jest.fn()} />
    );
    
    // Verify the screen renders with the Evening Debrief header
    expect(getByText(/🌙 Evening Debrief/i)).toBeTruthy();
    expect(getByText(/4 quick reflections to close your day/i)).toBeTruthy();
  });

  it('should display 4-part flow structure', () => {
    (isAfter6PM as jest.Mock).mockReturnValue(true);
    
    const { getByText } = render(
      <EveningDebriefScreen onDismiss={jest.fn()} />
    );
    
    // Verify Part 1 is displayed initially
    expect(getByText(/Part 1 of 4/i)).toBeTruthy();
    expect(getByText(/How was your day overall/i)).toBeTruthy();
  });

  it('should verify isAfter6PM function returns true after 6:00 PM (Requirement 3.1)', () => {
    // Mock current time to 7:00 PM (19:00)
    const mockDate = new Date('2024-01-01T19:00:00');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    
    // Import fresh to get the actual implementation
    jest.resetModules();
    const { isAfter6PM: actualIsAfter6PM } = jest.requireActual('../services/growthovoExperienceService');
    
    expect(actualIsAfter6PM()).toBe(true);
    
    jest.restoreAllMocks();
  });

  it('should verify isAfter6PM function returns false before 6:00 PM (Requirement 3.2)', () => {
    // Mock current time to 3:00 PM (15:00)
    const mockDate = new Date('2024-01-01T15:00:00');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    
    // Import fresh to get the actual implementation
    jest.resetModules();
    const { isAfter6PM: actualIsAfter6PM } = jest.requireActual('../services/growthovoExperienceService');
    
    expect(actualIsAfter6PM()).toBe(false);
    
    jest.restoreAllMocks();
  });

  it('should verify isAfter6PM function returns true at exactly 6:00 PM (Requirement 3.1)', () => {
    // Mock current time to exactly 6:00 PM (18:00)
    const mockDate = new Date('2024-01-01T18:00:00');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    
    // Import fresh to get the actual implementation
    jest.resetModules();
    const { isAfter6PM: actualIsAfter6PM } = jest.requireActual('../services/growthovoExperienceService');
    
    expect(actualIsAfter6PM()).toBe(true);
    
    jest.restoreAllMocks();
  });
});
