import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { openChat, sendMessage, persistSession } from '../../services/rexChatService';
import { getMemoryContext } from '../../services/rexMemoryService';
import { hasUserConsented, logConsent } from '../../services/legalConsentService';
import AITransparencyNotice from '../../components/legal/AITransparencyNotice';
import { ChatMessage, ChatSession } from '../../types';
import { colors, spacing, radius, typography } from '../../theme';

interface Props {
  userId: string;
  subscriptionStatus: string;
  visible: boolean;
  onClose: () => void;
}

export default function RexChatBottomSheet({ userId, subscriptionStatus, visible, onClose }: Props) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [showAINotice, setShowAINotice] = useState(false);
  const [aiNoticeChecked, setAiNoticeChecked] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Load/create session and send opening message when sheet opens
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    async function init() {
      setInitializing(true);
      try {
        // Check if user has seen AI transparency notice
        if (!aiNoticeChecked) {
          const hasConsented = await hasUserConsented(userId, 'ai_transparency');
          if (!hasConsented) {
            setShowAINotice(true);
            setInitializing(false);
            return; // Don't load chat until notice is accepted
          }
          setAiNoticeChecked(true);
        }

        const chatSession = await openChat(userId);
        if (cancelled) return;

        setSession(chatSession);

        // If this is a fresh session (no messages), send Rex's opening message
        if (chatSession.messages.length === 0) {
          const memCtx = await getMemoryContext(userId);
          if (cancelled) return;

          // Build opening prompt referencing a memory entry
          const memoryRef =
            memCtx.memories.length > 0
              ? `You know this about me: "${memCtx.memories[0].content}". `
              : '';
          const openingPrompt = `${memoryRef}Say hi and ask what's on my mind today. One sentence.`;

          setLoading(true);
          const { rexMessage, updatedSession } = await sendMessage(
            chatSession.sessionId,
            userId,
            openingPrompt,
            chatSession
          );
          if (cancelled) return;

          // Only show Rex's reply, not the internal prompt
          setSession(updatedSession);
          setMessages([rexMessage]);
        } else {
          setMessages(chatSession.messages);
        }
      } catch {
        // Non-fatal — show empty state
      } finally {
        if (!cancelled) {
          setInitializing(false);
          setLoading(false);
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [visible, userId, aiNoticeChecked]);

  async function handleSend() {
    const text = inputText.trim();
    if (!text || loading || !session) return;

    setInputText('');

    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: `tmp_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { rexMessage, updatedSession } = await sendMessage(
        session.sessionId,
        userId,
        text,
        session
      );
      setSession(updatedSession);
      setMessages((prev) => {
        // Replace temp user message with the real session messages
        const withoutTmp = prev.filter((m) => m.id !== userMsg.id);
        const realUserMsg = updatedSession.messages[updatedSession.messages.length - 2];
        return [...withoutTmp, realUserMsg ?? userMsg, rexMessage];
      });
    } catch {
      // Keep user message visible, show error as Rex message
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'rex',
        content: "I'm having trouble connecting right now. Try again in a sec.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  async function handleClose() {
    if (session) {
      await persistSession({ ...session, messages });
    }
    setMessages([]);
    setSession(null);
    onClose();
  }

  async function handleAcceptAINotice() {
    try {
      await logConsent(userId, 'ai_transparency', '1.0', 'click_through');
      setShowAINotice(false);
      setAiNoticeChecked(true);
    } catch (error) {
      console.error('Failed to log AI transparency consent:', error);
      // Still allow them to proceed
      setShowAINotice(false);
      setAiNoticeChecked(true);
    }
  }

  function scrollToBottom() {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowRex]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>R</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleRex]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextRex]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  }

  function renderLoadingDots() {
    return (
      <View style={[styles.messageRow, styles.messageRowRex]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </View>
        <View style={[styles.bubble, styles.bubbleRex, styles.loadingBubble]}>
          <ActivityIndicator size="small" color={colors.textMuted} />
        </View>
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      {/* AI Transparency Notice */}
      <AITransparencyNotice
        visible={showAINotice}
        onAccept={handleAcceptAINotice}
        onLearnMore={() => {
          // TODO: Navigate to full AI transparency documentation
        }}
      />

      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheet}
        >
          <SafeAreaView style={styles.sheetInner}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handle} />
              <View style={styles.headerContent}>
                <View style={styles.headerAvatar}>
                  <Text style={styles.headerAvatarText}>R</Text>
                </View>
                <Text style={styles.headerTitle}>Rex</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Message list */}
            {initializing ? (
              <View style={styles.initLoader}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={scrollToBottom}
                ListFooterComponent={loading ? renderLoadingDots() : null}
              />
            )}

            {/* Input */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message Rex..."
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim() || loading}
              >
                <Text style={styles.sendBtnText}>↑</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    minHeight: '60%',
  },
  sheetInner: {
    flex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  headerTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: spacing.xs,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  initLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    padding: spacing.md,
    gap: spacing.sm,
    flexGrow: 1,
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
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  bubbleUser: {
    backgroundColor: colors.info,
    borderBottomRightRadius: 4,
  },
  bubbleRex: {
    backgroundColor: colors.surfaceElevated,
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
  loadingBubble: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    ...typography.body,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
  },
  sendBtnText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
});
