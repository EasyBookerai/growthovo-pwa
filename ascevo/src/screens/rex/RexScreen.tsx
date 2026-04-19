import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

interface Props {
  userId: string;
  subscriptionStatus: string;
  navigation?: any;
}

interface Message {
  id: string;
  role: 'user' | 'rex';
  content: string;
  timestamp: string;
}

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

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  function handleSend(text?: string) {
    const messageText = text || inputText.trim();
    if (!messageText) return;

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

    // Simulate Rex response after 1.5s
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

  function getRexResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    for (const [keyword, response] of Object.entries(REX_RESPONSES)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    return REX_RESPONSES.default;
  }

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowRex,
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
      </View>
    );
  }

  function renderTypingIndicator() {
    return (
      <View style={[styles.messageRow, styles.messageRowRex]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </View>
        <View style={[styles.bubble, styles.bubbleRex]}>
          <View style={styles.typingDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
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
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? renderTypingIndicator() : null}
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
            onChangeText={setInputText}
            placeholder="Message Rex..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.micButton}>
            <Text style={styles.micButtonText}>🎤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
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
  },
  bubbleUser: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
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
