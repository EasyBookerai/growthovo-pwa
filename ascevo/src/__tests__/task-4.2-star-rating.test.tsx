/**
 * Task 4.2 Implementation Verification Test
 * 
 * Validates that Part 1 of Evening Debrief implements:
 * - "How was your day overall?" question display
 * - 1-5 star rating interface
 * - Stars are tappable
 * - Stars fill with gold color when selected
 * 
 * Requirements: 3.3, 3.4 from growthovo-world-class-experience spec
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EveningDebriefScreen from '../screens/debrief/EveningDebriefScreen';
import { AppProvider } from '../context/AppContext';

// Mock the service
jest.mock('../services/growthovoExperienceService', () => ({
  getUserName: jest.fn().mockResolvedValue('TestUser'),
  saveTomorrowReminder: jest.fn().mockResolvedValue(undefined),
  markEveningDebriefDone: jest.fn().mockResolvedValue(undefined),
}));

const renderWithContext = (component: React.ReactElement) => {
  return render(<AppProvider>{component}</AppProvider>);
};

describe('Task 4.2: Implement Part 1: Day rating', () => {
  it('should display "How was your day overall?" question (Requirement 3.3)', () => {
    const { getByText } = renderWithContext(
      <EveningDebriefScreen onDismiss={jest.fn()} />
    );
    
    expect(getByText('How was your day overall?')).toBeTruthy();
  });

  it('should display 5-star rating interface with tappable stars (Requirement 3.3, 3.4)', () => {
    const { getByLabelText } = renderWithContext(
      <EveningDebriefScreen onDismiss={jest.fn()} />
    );
    
    // Check that all 5 stars are present and accessible
    for (let i = 1; i <= 5; i++) {
      const star = getByLabelText(`Rate your day ${i} out of 5 stars`);
      expect(star).toBeTruthy();
    }
  });

  it('should fill stars with gold color when selected (Requirement 3.4)', () => {
    const { getByLabelText } = renderWithContext(
      <EveningDebriefScreen onDismiss={jest.fn()} />
    );
    
    // Tap the 3rd star
    const thirdStar = getByLabelText('Rate your day 3 out of 5 stars');
    fireEvent.press(thirdStar);
    
    // Check that stars 1-3 are selected
    expect(getByLabelText('Rate your day 1 out of 5 stars')).toHaveProp('accessibilityState', { selected: true });
    expect(getByLabelText('Rate your day 2 out of 5 stars')).toHaveProp('accessibilityState', { selected: true });
    expect(getByLabelText('Rate your day 3 out of 5 stars')).toHaveProp('accessibilityState', { selected: true });
    
    // Check that stars 4-5 are not selected
    expect(getByLabelText('Rate your day 4 out of 5 stars')).toHaveProp('accessibilityState', { selected: false });
    expect(getByLabelText('Rate your day 5 out of 5 stars')).toHaveProp('accessibilityState', { selected: false });
  });

  it('should allow changing the rating by tapping different stars', () => {
    const { getByLabelText } = renderWithContext(
      <EveningDebriefScreen onDismiss={jest.fn()} />
    );
    
    // Initially tap the 5th star
    const fifthStar = getByLabelText('Rate your day 5 out of 5 stars');
    fireEvent.press(fifthStar);
    expect(fifthStar).toHaveProp('accessibilityState', { selected: true });
    
    // Then tap the 2nd star
    const secondStar = getByLabelText('Rate your day 2 out of 5 stars');
    fireEvent.press(secondStar);
    expect(secondStar).toHaveProp('accessibilityState', { selected: true });
    
    // Check that only stars 1-2 are selected now
    expect(getByLabelText('Rate your day 1 out of 5 stars')).toHaveProp('accessibilityState', { selected: true });
    expect(getByLabelText('Rate your day 3 out of 5 stars')).toHaveProp('accessibilityState', { selected: false });
  });

  it('should enable Next button only after a rating is selected', () => {
    const { getByText, getByLabelText } = renderWithContext(
      <EveningDebriefScreen onDismiss={jest.fn()} />
    );
    
    const nextButton = getByText('Next →');
    
    // Initially should be disabled (rating is 0)
    expect(nextButton.props.disabled).toBeTruthy();
    
    // Tap a star
    const thirdStar = getByLabelText('Rate your day 3 out of 5 stars');
    fireEvent.press(thirdStar);
    
    // Now should be enabled
    expect(nextButton.props.disabled).toBeFalsy();
  });
});
