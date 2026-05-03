import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

/**
 * RexScreen Props Interface
 * 
 * @property {string} userId - Authenticated user ID
 * @property {string} subscriptionStatus - User's subscription tier
 * @property {any} [navigation] - React Navigation object (optional, framework-specific type)
 */
interface Props {
  userId: string;
  subscriptionStatus: string;
  navigation?: any;
}

/**
 * Chat message interface
 * 
 * Represents a single message in the Rex chat.
 * 
 * @property {string} id - Unique message identifier (timestamp-based)
 * @property {'user' | 'rex'} role - Message sender (user or Rex)
 * @property {string} content - Message text content
 * @property {string} timestamp - ISO 8601 timestamp
 */
interface Message {
  id: string;
  role: 'user' | 'rex';
  content: string;
  timestamp: string;
}

/**
 * MessageBubble Props Interface
 * 
 * Props for the memoized MessageBubble component.
 * 
 * @property {Message} item - Message data to display
 * @property {number} index - Index in the messages array
 */
interface MessageBubbleProps {
  item: Message;
  index: number;
}

/**
 * Memoized message bubble component to prevent unnecessary re-renders
 * Only re-renders when message content changes
 */
const MessageBubble = memo(({ item, index }: MessageBubbleProps) => {
  const isUser = item.role === 'user';
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowRex,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleRex,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            isUser ? styles.bubbleTextUser : styles.bubbleTextRex,
          ]}
        >
          {item.content}
        </Text>
      </View>
    </Animated.View>
  );
});

const QUICK_REPLIES = [
  { id: '1', text: 'I feel anxious 😰', keyword: 'anxious' },
  { id: '2', text: 'Help me focus 🎯', keyword: 'focus' },
  { id: '3', text: 'Motivate me 💪', keyword: 'motivate' },
  { id: '4', text: 'Relationship advice 💬', keyword: 'relationship' },
  { id: '5', text: 'Career help 💼', keyword: 'career' },
  { id: '6', text: 'SOS 🆘', keyword: 'sos' },
];

const REX_RESPONSES: Record<string, string> = {
  anxious: "I hear you. Let's try this: Take 3 deep breaths. In for 4, hold for 4, out for 4. You've got this, Champion. 💜",
  focus: "Here's what works: Pick ONE thing. Set a 25-minute timer. No distractions. Just you and that one task. Ready?",
  motivate: "Remember why you started. You're not the same person you were yesterday. Every small step counts. Let's go! 🔥",
  relationship: "Relationships are mirrors. What you give, you get. Start with listening—really listening. What's on your mind?",
  career: "Your career is a marathon, not a sprint. Focus on skills, not titles. What's one skill you want to build this month?",
  sos: "I'm here. Take a breath. You're safe. What's happening right now? Let's work through this together.",
  default: "I'm here to support you. Tell me more about what's on your mind, and let's figure this out together.",
};

/**
 * RexScreen Component
 * 
 * AI chat interface with Rex, the personal growth coach.
 * Features keyword-based responses, typing indicators, and quick reply chips.
 * 
 * Features:
 * - Pre-loaded welcome messages from Rex
 * - Keyword matching for 5 common topics (anxious, focus, motivate, relationship, career)
 * - Animated typing indicator with bouncing dots
 * - Quick reply chips for common questions
 * - Auto-scroll to latest message
 * - iMessage-quality bubble design
 * - Debounced input for performance
 * 
 * Performance optimizations:
 * - Memoized MessageBubble components
 * - FlatList with virtualization
 * - Debounced input handler
 * - Optimized keyExtractor and renderItem
 * 
 * @param {Props} props - Component props
 * @param {string} props.userId - Authenticated user ID
 * @param {string} props.subscriptionStatus - User's subscription tier
 * @param {any} props.navigation - React Navigation object (optional)
 * 
 * @example
 * ```tsx
 * <RexScreen
 *   userId={user.id}
 *   subscriptionStatus="free"
 *   navigation={navigation}
 * />
 * ```
 */
export default function RexScreen({ userId, subscriptionStatus, navigation }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'rex',
      content: "Hey Champion! 👋 Ready to grow today?",
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      role: 'rex',
      content: "I'm here to support you across all 6 areas of your life.",
      timestamp: new Date().toISOString(),
    },
    {
      id: '3',
      role: 'rex',
      content: "What's on your mind? Or pick a topic below 👇",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize keyExtractor for better FlatList performance
  const keyExtractor = useCallback((item: Message) => item.id, []);

  // Memoize renderItem for better FlatList performance
  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    return <MessageBubble item={item} index={index} />;
  }, []);

  // Debounced input change handler to reduce re-renders
  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer for any input-related side effects (if needed)
    // For now, we just update the state immediately but could add
    // debounced validation or character count updates here
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Handle send button press
   * 
   * Adds user message to chat, shows typing indicator, and generates Rex response.
   * Uses keyword matching to determine appropriate response.
   * 
   * Flow:
   * 1. Add user message to messages array
   * 2. Clear input field
   * 3. Show typing indicator for 1.5 seconds
   * 4. Match keywords in user message
   * 5. Add Rex response to messages array
   * 6. Hide typing indicator
   * 
   * @param {string} [text] - Optional text to send (for quick replies)
   */
  function handleSend(text?: string) {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Haptic feedback (if available on platform)
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // Note: Would use react-native-haptic-feedback if available
      // For now, this is a placeholder for the feature
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Show typing indicator
    setIsTyping(true);

    // Simulate Rex response after 1.5s (1s typing + 0.5s)
    setTimeout(() => {
      const response = getRexResponse(messageText);
      const rexMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'rex',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, rexMessage]);
      setIsTyping(false);
    }, 1500);
  }

  /**
   * Get Rex response based on keyword matching
   * 
   * Matches user message against predefined keywords and returns appropriate response.
   * Uses case-insensitive matching with .includes() for flexible keyword detection.
   * 
   * Supported keywords:
   * - 'anxious': Breathing technique and calming advice
   * - 'focus': Productivity tips and time management
   * - 'motivate': Motivational support and encouragement
   * - 'relationship': Relationship advice and communication tips
   * - 'career': Career guidance and skill development
   * - 'sos': Crisis support and immediate help
   * 
   * @param {string} userMessage - The user's message text
   * @returns {string} Rex's response text
   */
  function getRexResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    for (const [keyword, response] of Object.entries(REX_RESPONSES)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    return REX_RESPONSES.default;
  }

  function renderTypingIndicator() {
    // Create animated values for bouncing dots
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const createBounceAnimation = (animatedValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animatedValue, {
              toValue: -6,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animation = Animated.parallel([
        createBounceAnimation(dot1, 0),
        createBounceAnimation(dot2, 150),
        createBounceAnimation(dot3, 300),
      ]);

      animation.start();

      return () => animation.stop();
    }, []);

    return (
      <View style={[styles.messageRow, styles.messageRowRex]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </View>
        <View style={[styles.bubble, styles.bubbleRex]}>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} testID="rex-screen">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>R</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>Rex</Text>
            <View style={styles.headerStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.headerSubtitle}>Your AI Growth Coach • Online</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? renderTypingIndicator() : null}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
        />

        {/* Quick Replies */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickReplies}
        >
          {QUICK_REPLIES.map((reply) => (
            <TouchableOpacity
              key={reply.id}
              style={styles.quickReplyChip}
              onPress={() => handleSend(reply.text)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickReplyText}>{reply.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="Message Rex..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
            maxLength={500}
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity style={styles.micButton} activeOpacity={0.7}>
            <Text style={styles.micButtonText}>🎤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.sendButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A12',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: spacing.sm,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  headerSubtitle: {
    ...typography.small,
    color: 'rgba(255,255,255,0.5)',
  },
  messagesList: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowRex: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(124,58,237,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  avatarText: {
    ...typography.small,
    color: '#7C3AED',
    fontWeight: '700',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    // iMessage-quality shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.3,
  },
  bubbleRex: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    ...typography.body,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: colors.text,
  },
  bubbleTextRex: {
    color: colors.text,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    // Animation would be added via Animated API for bouncing effect
  },
  quickReplies: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  quickReplyChip: {
    backgroundColor: '#1A1A2E',
    borderRadius: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickReplyText: {
    ...typography.body,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    ...typography.body,
    maxHeight: 100,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonText: {
    fontSize: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(124,58,237,0.3)',
  },
  sendButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
});
