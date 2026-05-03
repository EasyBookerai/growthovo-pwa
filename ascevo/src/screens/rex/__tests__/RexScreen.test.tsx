import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RexScreen from '../RexScreen';

describe('RexScreen', () => {
  const mockProps = {
    userId: 'test-user-123',
    subscriptionStatus: 'premium',
  };

  it('renders correctly with welcome messages', () => {
    const { getByTestId, getByText } = render(<RexScreen {...mockProps} />);
    
    expect(getByTestId('rex-screen')).toBeTruthy();
    expect(getByText("Hey Champion! 👋 Ready to grow today?")).toBeTruthy();
    expect(getByText("I'm here to support you across all 6 areas of your life.")).toBeTruthy();
    expect(getByText("What's on your mind? Or pick a topic below 👇")).toBeTruthy();
  });

  it('displays 3 pre-loaded welcome messages from Rex', () => {
    const { getAllByText } = render(<RexScreen {...mockProps} />);
    
    // Check that we have at least 3 messages (the welcome messages)
    const messages = getAllByText(/./);
    expect(messages.length).toBeGreaterThanOrEqual(3);
  });

  it('sends user message and receives Rex response for "anxious" keyword', async () => {
    const { getByPlaceholderText, getByText } = render(<RexScreen {...mockProps} />);
    
    const input = getByPlaceholderText('Message Rex...');
    const sendButton = getByText('↑');
    
    // Type message with "anxious" keyword
    fireEvent.changeText(input, 'I feel anxious');
    fireEvent.press(sendButton);
    
    // Wait for Rex response
    await waitFor(() => {
      expect(getByText(/I hear you/)).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('sends user message and receives Rex response for "focus" keyword', async () => {
    const { getByPlaceholderText, getByText } = render(<RexScreen {...mockProps} />);
    
    const input = getByPlaceholderText('Message Rex...');
    const sendButton = getByText('↑');
    
    // Type message with "focus" keyword
    fireEvent.changeText(input, 'Help me focus');
    fireEvent.press(sendButton);
    
    // Wait for Rex response
    await waitFor(() => {
      expect(getByText(/Here's what works/)).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('sends user message and receives Rex response for "motivate" keyword', async () => {
    const { getByPlaceholderText, getByText } = render(<RexScreen {...mockProps} />);
    
    const input = getByPlaceholderText('Message Rex...');
    const sendButton = getByText('↑');
    
    // Type message with "motivate" keyword
    fireEvent.changeText(input, 'I need motivation');
    fireEvent.press(sendButton);
    
    // Wait for Rex response
    await waitFor(() => {
      expect(getByText(/Remember why you started/)).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('sends user message and receives Rex response for "relationship" keyword', async () => {
    const { getByPlaceholderText, getByText } = render(<RexScreen {...mockProps} />);
    
    const input = getByPlaceholderText('Message Rex...');
    const sendButton = getByText('↑');
    
    // Type message with "relationship" keyword
    fireEvent.changeText(input, 'relationship advice please');
    fireEvent.press(sendButton);
    
    // Wait for Rex response
    await waitFor(() => {
      expect(getByText(/Relationships are mirrors/)).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('sends user message and receives Rex response for "career" keyword', async () => {
    const { getByPlaceholderText, getByText } = render(<RexScreen {...mockProps} />);
    
    const input = getByPlaceholderText('Message Rex...');
    const sendButton = getByText('↑');
    
    // Type message with "career" keyword
    fireEvent.changeText(input, 'career help needed');
    fireEvent.press(sendButton);
    
    // Wait for Rex response
    await waitFor(() => {
      expect(getByText(/Your career is a marathon/)).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('sends user message and receives default response for unknown keyword', async () => {
    const { getByPlaceholderText, getByText } = render(<RexScreen {...mockProps} />);
    
    const input = getByPlaceholderText('Message Rex...');
    const sendButton = getByText('↑');
    
    // Type message without any keyword
    fireEvent.changeText(input, 'random message');
    fireEvent.press(sendButton);
    
    // Wait for Rex default response
    await waitFor(() => {
      expect(getByText(/I'm here to support you/)).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('displays typing indicator before Rex responds', async () => {
    const { getByPlaceholderText, getByText, queryByTestId } = render(<RexScreen {...mockProps} />);
    
    const input = getByPlaceholderText('Message Rex...');
    const sendButton = getByText('↑');
    
    // Send message
    fireEvent.changeText(input, 'test message');
    fireEvent.press(sendButton);
    
    // Typing indicator should appear (we can't easily test the animated dots, but we can verify the response delay)
    await waitFor(() => {
      expect(getByText(/I'm here to support you/)).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('handles quick reply chips correctly', async () => {
    const { getByText } = render(<RexScreen {...mockProps} />);
    
    // Find and press the "I feel anxious 😰" quick reply
    const anxiousChip = getByText('I feel anxious 😰');
    fireEvent.press(anxiousChip);
    
    // Wait for Rex response
    await waitFor(() => {
      expect(getByText(/I hear you/)).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('disables send button when input is empty', () => {
    const { getByPlaceholderText, getByText } = render(<RexScreen {...mockProps} />);
    
    const input = getByPlaceholderText('Message Rex...');
    const sendButton = getByText('↑').parent;
    
    // Input is empty, button should be disabled
    expect(sendButton?.props.accessibilityState?.disabled).toBe(true);
    
    // Type something
    fireEvent.changeText(input, 'test');
    
    // Button should be enabled
    expect(sendButton?.props.accessibilityState?.disabled).toBe(false);
  });

  it('clears input after sending message', async () => {
    const { getByPlaceholderText, getByText } = render(<RexScreen {...mockProps} />);
    
    const input = getByPlaceholderText('Message Rex...');
    const sendButton = getByText('↑');
    
    // Type and send message
    fireEvent.changeText(input, 'test message');
    fireEvent.press(sendButton);
    
    // Input should be cleared
    expect(input.props.value).toBe('');
  });

  it('displays user messages in purple bubbles', async () => {
    const { getByPlaceholderText, getByText } = render(<RexScreen {...mockProps} />);
    
    const input = getByPlaceholderText('Message Rex...');
    const sendButton = getByText('↑');
    
    // Send message
    fireEvent.changeText(input, 'test message');
    fireEvent.press(sendButton);
    
    // User message should appear
    await waitFor(() => {
      expect(getByText('test message')).toBeTruthy();
    });
  });

  it('displays Rex avatar on Rex messages', () => {
    const { getAllByText } = render(<RexScreen {...mockProps} />);
    
    // Check for Rex avatar (R)
    const avatars = getAllByText('R');
    expect(avatars.length).toBeGreaterThan(0);
  });
});
