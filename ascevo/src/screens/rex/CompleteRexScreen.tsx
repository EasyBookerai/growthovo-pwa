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
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';

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

interface MessageBubbleProps {
  item: Message;
  index: number;
}

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
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </Animated.View>
  );
});

const QUICK_REPLIES = [
  { id: '1', text: 'I feel anxious 😰', keyword: 'anxious' },
  { id: '2', text: 'Help me focus 🎯', keyword: 'focus' },
  { id: '3', text: 'Motivate me 💪', keyword: 'motivate' },
  { id: '4', text: 'Relationship issue 💬', keyword: 'relationship' },
  { id: '5', text: 'Career help 💼', keyword: 'career' },
  { id: '6', text: 'Money stress 💰', keyword: 'money' },
];

const REX_RESPONSES: Record<string, string> = {
  // Anxiety/Stress/Panic
  anxi: "I hear you. Anxiety is your body's alarm system—it's not dangerous, just uncomfortable. Try this: Take 3 deep breaths. In for 4, hold for 4, out for 4. Ground yourself by naming 5 things you can see. You've got this. 💜 What triggered this feeling?",
  stress: "Stress is energy. Let's channel it. First, take 5 deep breaths. Then ask yourself: What's ONE thing I can control right now? Focus there. What's stressing you most?",
  panic: "You're safe. This will pass. Breathe with me: In for 4, hold for 4, out for 6. Repeat 3 times. Your body is protecting you, but there's no real danger. What's happening right now?",
  
  // Focus/Distraction/Productivity
  focus: "Here's what works: Pick ONE thing. Set a 25-minute timer. No phone, no distractions. Just you and that one task. When the timer ends, take a 5-minute break. Ready to try? What's the one thing?",
  distract: "Distraction is normal. Your brain is wired to seek novelty. Fight it with structure: 1) Clear your space. 2) Set a timer. 3) Put phone in another room. 4) Start with 10 minutes. What are you trying to focus on?",
  productiv: "Productivity isn't about doing more—it's about doing what matters. What's the ONE thing that, if you did it today, would make everything else easier? Start there.",
  
  // Motivation/Lazy/Energy
  motiv: "Motivation is a myth. Discipline is the key. Here's the secret: Start with 2 minutes. Just 2. Action creates momentum, not the other way around. What's the smallest step you can take right now?",
  lazy: "You're not lazy—you're overwhelmed or unclear. Let's fix that. What's ONE tiny thing you can do in the next 5 minutes? Do that. Then the next. Small wins build momentum.",
  energy: "Low energy? Check these: 1) Did you sleep 7+ hours? 2) Did you drink water today? 3) Did you move your body? Fix one of these first. Which one needs attention?",
  
  // Relationships/Partner/Friend/Conflict
  relation: "Relationships are mirrors. What you give, you get. The foundation is listening—really listening, not just waiting to talk. What's going on in your relationship?",
  partner: "Strong partnerships need 3 things: Communication, boundaries, and appreciation. Which one feels missing right now? Let's work on that.",
  friend: "Friendships need tending like gardens. When did you last reach out? Send a message today—something real, not just 'hey.' What's on your mind about this friendship?",
  conflict: "Conflict isn't bad—it's information. It shows where boundaries were crossed or needs weren't met. Before reacting, ask: What do I need? What do they need? Can both be true? What happened?",
  
  // Career/Job/Work/Boss
  career: "Your career is a marathon, not a sprint. Focus on skills, not titles. What's one skill you want to build this month? Let's make a plan.",
  job: "Feeling stuck at work? Ask yourself: Am I learning? Am I growing? Am I valued? If the answer is no to all three, it might be time for a change. What's your situation?",
  work: "Work-life balance is a myth. It's about work-life integration. What matters most to you outside of work? How can you protect time for that?",
  boss: "Boss issues? Remember: You can't control them, only your response. Document everything, set boundaries, and know your worth. What's happening?",
  
  // Money/Debt/Budget/Finance
  money: "Money stress is real. Let's tackle it. Step 1: Track every euro for 7 days. Step 2: Identify one expense to cut. Step 3: Automate savings. What's your biggest money worry?",
  debt: "Debt feels heavy, but it's just math. List all debts. Pay minimums on everything except the smallest. Attack that one with everything extra. Snowball effect. What's your total debt?",
  budget: "Budgeting isn't restriction—it's permission to spend guilt-free. Try 50/30/20: 50% needs, 30% wants, 20% savings. What's your income and expenses?",
  financ: "Financial freedom starts with one decision: Spend less than you earn. Then: 1) Build €1000 emergency fund. 2) Pay off debt. 3) Invest. Where are you in this journey?",
  
  // Sad/Depression/Low/Down
  sad: "I see you. Sadness is valid. You don't have to fix it right now—just feel it. Then, one small step: Go outside for 5 minutes. Drink water. Call someone. What feels doable?",
  depress: "Depression lies. It tells you nothing will get better. But you've survived 100% of your worst days so far. That's strength. Have you talked to a professional? What's one thing that used to bring you joy?",
  low: "Feeling low is your body asking for something. Rest? Connection? Purpose? What do you think you need right now?",
  down: "You're not alone in this. Sometimes we just need to survive the day, and that's enough. What's one thing you can do today to take care of yourself?",
  
  // Angry/Frustrated/Annoyed
  angry: "Anger is energy. It's telling you a boundary was crossed. Take 5 deep breaths. Then ask: What boundary? What do I need? How can I communicate that? What made you angry?",
  frustrat: "Frustration means you care. Channel it: 1) Name what's frustrating you. 2) Identify what you can control. 3) Take action on that. What's frustrating you?",
  annoyed: "Annoyance is a signal. What's the pattern? Is this person/situation repeatedly crossing a line? Time to set a boundary. What's annoying you?",
  
  // Default
  default: "I'm here to support you. Tell me more about what's on your mind, and let's figure this out together. What's the biggest challenge you're facing right now?",
};

const STORAGE_KEY = 'growthovo_rex_chat';

export default function CompleteRexScreen({ userId, subscriptionStatus, navigation }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    if (messages.length > 0 && !isFirstLoad) {
      saveChatHistory();
    }
  }, [messages]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  async function loadChatHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(parsed);
      } else {
        // First time - show welcome messages
        setMessages([
          {
            id: '1',
            role: 'rex',
            content: "Hey Champion! 👋 Ready to grow today?",
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            role: 'rex',
            content: "I'm here to help with all 6 areas of your life.",
            timestamp: new Date().toISOString(),
          },
          {
            id: '3',
            role: 'rex',
            content: "What's on your mind? Or pick a topic below 👇",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsFirstLoad(false);
    }
  }

  async function saveChatHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }

  function handleClearHistory() {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to delete all messages? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            localStorage.removeItem(STORAGE_KEY);
            setMessages([
              {
                id: Date.now().toString(),
                role: 'rex',
                content: "Chat cleared. What's on your mind?",
                timestamp: new Date().toISOString(),
              },
            ]);
          },
        },
      ]
    );
  }

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    return <MessageBubble item={item} index={index} />;
  }, []);

  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

  function handleSend(text?: string) {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

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
    }, 1200);
  }

  function getRexResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Check each keyword pattern
    for (const [keyword, response] of Object.entries(REX_RESPONSES)) {
      if (keyword === 'default') continue;
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    return REX_RESPONSES.default;
  }

  function renderTypingIndicator() {
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
              <Text style={styles.headerSubtitle}>Your AI Coach • Online</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearHistory}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
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
  clearButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearButtonText: {
    ...typography.small,
    color: '#EF4444',
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
    backgroundColor: 'rgba(124,58,237,0.15)',
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
  timestamp: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
    fontSize: 10,
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
