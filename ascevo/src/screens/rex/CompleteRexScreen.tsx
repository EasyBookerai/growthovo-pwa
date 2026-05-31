import React, { useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { buildChatStarters, DEFAULT_REX_FALLBACK, streamRex } from '../../lib/rex';
import { useAppContext } from '../../context/AppContext';
import PaywallModal from '../../components/PaywallModal';

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

type FeedbackValue = 'up' | 'down';

const STORAGE_KEY = 'growthovo_rex_chat_history';
const FEEDBACK_KEY = 'growthovo_rex_chat_feedback';

function isWebStorageAvailable(): boolean {
  return Platform.OS === 'web' && typeof globalThis.localStorage !== 'undefined';
}

async function readStoredJson<T>(key: string): Promise<T | null> {
  try {
    if (isWebStorageAvailable()) {
      const raw = globalThis.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    }

    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function writeStoredJson(key: string, value: unknown): Promise<void> {
  try {
    const raw = JSON.stringify(value);
    if (isWebStorageAvailable()) {
      globalThis.localStorage.setItem(key, raw);
      return;
    }

    await AsyncStorage.setItem(key, raw);
  } catch (error) {
    console.error('[RexChat] Failed to persist:', error);
  }
}

async function removeStoredValue(key: string): Promise<void> {
  try {
    if (isWebStorageAvailable()) {
      globalThis.localStorage.removeItem(key);
      return;
    }

    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('[RexChat] Failed to clear storage:', error);
  }
}

function createWelcomeMessages(name: string): Message[] {
  const timestamp = new Date().toISOString();
  return [
    {
      id: 'welcome-1',
      role: 'rex',
      content: `Hey ${name}. I'm locked in with you today. What's the move?`,
      timestamp,
    },
  ];
}

function TypingIndicator() {
  return (
    <View style={[styles.messageRow, styles.messageRowRex]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>R</Text>
      </View>
      <View style={[styles.bubble, styles.bubbleRex]}>
        <Text style={styles.typingText}>Rex is thinking... 🧠</Text>
      </View>
    </View>
  );
}

export default function CompleteRexScreen({ userId, navigation }: Props) {
  const { rexContext, completedLessons, moodLabel, refreshUserData } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedback, setFeedback] = useState<Record<string, FeedbackValue>>({});
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  const suggestionChips = useMemo(
    () => buildChatStarters({
      streak: rexContext.streak,
      lastCompletedLesson: completedLessons[completedLessons.length - 1],
      moodLabel,
    }),
    [completedLessons, moodLabel, rexContext.streak]
  );

  useEffect(() => {
    loadPersistedState();
  }, [rexContext.name]);

  useEffect(() => {
    if (messages.length > 0) {
      writeStoredJson(STORAGE_KEY, messages);
    }
  }, [messages]);

  useEffect(() => {
    writeStoredJson(FEEDBACK_KEY, feedback);
  }, [feedback]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, [messages, isTyping]);

  async function loadPersistedState() {
    const [storedMessages, storedFeedback] = await Promise.all([
      readStoredJson<Message[]>(STORAGE_KEY),
      readStoredJson<Record<string, FeedbackValue>>(FEEDBACK_KEY),
    ]);

    setMessages(storedMessages && storedMessages.length > 0 ? storedMessages : createWelcomeMessages(rexContext.name));
    setFeedback(storedFeedback ?? {});
  }

  function updateRexMessage(messageId: string, content: string) {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, content } : message
      )
    );
  }

  async function handleSend(prefilledText?: string) {
    const trimmed = (prefilledText ?? inputText).trim();
    if (!trimmed) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const rexMessageId = `rex-${Date.now() + 1}`;
    const placeholderMessage: Message = {
      id: rexMessageId,
      role: 'rex',
      content: '',
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage, placeholderMessage];
    setMessages(nextMessages);
    setInputText('');
    setIsTyping(true);

    const streamedReply = await streamRex({
      feature: 'chat',
      context: {
        ...rexContext,
        userId,
        featureLabel: 'Rex chat',
      },
      messages: nextMessages.slice(-10).map((message) => ({
        role: message.role === 'user' ? 'user' : 'assistant',
        content: message.content,
      })),
      onFirstToken: () => setIsTyping(false),
      onToken: (_token, fullText) => updateRexMessage(rexMessageId, fullText),
    });

    if (streamedReply === DEFAULT_REX_FALLBACK) {
      updateRexMessage(rexMessageId, streamedReply);
      setIsTyping(false);
      return;
    }

    if (!streamedReply.trim()) {
      updateRexMessage(rexMessageId, DEFAULT_REX_FALLBACK);
      setIsTyping(false);
      return;
    }

    updateRexMessage(rexMessageId, streamedReply);
    setIsTyping(false);
  }

  function handleReaction(messageId: string, value: FeedbackValue) {
    setFeedback((current) => ({
      ...current,
      [messageId]: current[messageId] === value ? undefined as never : value,
    }));
  }

  async function handleCopy(message: Message) {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message.content);
        return;
      }

      await Share.share({ message: message.content });
    } catch (error) {
      console.error('[RexChat] Copy failed:', error);
    }
  }

  async function handleShare(message: Message) {
    const text = `${message.content}\n\n- Rex from Growthovo`;

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ text });
        return;
      }

      await Share.share({ message: text });
    } catch (error) {
      console.error('[RexChat] Share failed:', error);
    }
  }

  function handleNewConversation() {
    Alert.alert(
      'New conversation',
      'Clear the current conversation and start fresh?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await removeStoredValue(STORAGE_KEY);
            await removeStoredValue(FEEDBACK_KEY);
            setFeedback({});
            setMessages(createWelcomeMessages(rexContext.name));
          },
        },
      ]
    );
  }

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.role === 'user';
    const reaction = feedback[item.id];

    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowRex]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>R</Text>
          </View>
        )}
        <View style={styles.messageColumn}>
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={() => !isUser && handleCopy(item)}
            style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleRex]}
          >
            <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextRex]}>
              {item.content || ' '}
            </Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>

          {!isUser && item.content ? (
            <View style={styles.reactionRow}>
              <TouchableOpacity
                style={[styles.reactionChip, reaction === 'up' && styles.reactionChipActive]}
                onPress={() => handleReaction(item.id, 'up')}
              >
                <Text style={styles.reactionText}>👍</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reactionChip, reaction === 'down' && styles.reactionChipActive]}
                onPress={() => handleReaction(item.id, 'down')}
              >
                <Text style={styles.reactionText}>👎</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareChip}
                onPress={() => handleShare(item)}
              >
                <Text style={styles.shareChipText}>Share this advice</Text>
              </TouchableOpacity>
            </View>
          ) : null}
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
        <View style={styles.header}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>R</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>Rex</Text>
            <Text style={styles.headerSubtitle}>
              Live coach · last 10 messages remembered
            </Text>
          </View>
          <TouchableOpacity style={styles.clearButton} onPress={handleNewConversation}>
            <Text style={styles.clearButtonText}>New</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickReplies}
        >
          {suggestionChips.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={styles.quickReplyChip}
              onPress={() => handleSend(chip)}
            >
              <Text style={styles.quickReplyText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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

      <PaywallModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onStartTrial={() => {
          setShowUpgradeModal(false);
          navigation?.navigate?.('Paywall');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A12' },
  container: { flex: 1 },
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
  headerAvatarText: { ...typography.bodyBold, color: colors.text },
  headerInfo: { flex: 1 },
  headerName: { ...typography.bodyBold, color: colors.text },
  headerSubtitle: { ...typography.small, color: 'rgba(255,255,255,0.5)' },
  clearButton: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  clearButtonText: { ...typography.small, color: '#EF4444' },
  messagesList: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  messageRow: { flexDirection: 'row', marginBottom: spacing.sm, alignItems: 'flex-end' },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowRex: { justifyContent: 'flex-start' },
  messageColumn: { maxWidth: '80%' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(124,58,237,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  avatarText: { ...typography.small, color: '#7C3AED', fontWeight: '700' },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
  },
  bubbleRex: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { ...typography.body, lineHeight: 22 },
  bubbleTextUser: { color: colors.text },
  bubbleTextRex: { color: colors.text },
  timestamp: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
    fontSize: 10,
  },
  reactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  reactionChip: {
    backgroundColor: '#1A1A2E',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  reactionChipActive: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  reactionText: { fontSize: 14 },
  shareChip: {
    backgroundColor: '#1A1A2E',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  shareChipText: { ...typography.small, color: colors.text },
  typingText: { ...typography.body, color: colors.textMuted },
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
  quickReplyText: { ...typography.body, color: colors.text },
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
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    ...typography.body,
    maxHeight: 110,
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
