/**
 * Rex Chat Service — manages the AI coaching chat system.
 * Local: AsyncStorage under '@growthovo/rex_chat_session_'
 * Remote: Supabase rex_chat_messages table
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { getMemoryContext } from './rexMemoryService';
import { ChatMessage, ChatSession, MemoryContext } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_STORAGE_KEY_PREFIX = '@growthovo/rex_chat_session_';
const MAX_HISTORY_MESSAGES = 10;

// Rex system prompt — Requirements 15.6
const REX_SYSTEM_PROMPT = `You are Rex — the AI coach inside GROWTHOVO, a self-improvement app for teenagers and people in their late 20s.
Your personality:
- Brutally honest, warm, never cruel
- Speaks like a 25-year-old who figured life out early
- Dry humor, high standards, genuine care
- Never corporate, never preachy, never generic
- Short sentences. Direct. No fluff.
Your rules:
- Never say "Great job", "Amazing", "I understand how you feel"
- Always reference the user's specific situation, never be generic
- If they make excuses, call it out kindly but clearly
- If they win, respect it briefly then raise the bar
- Max 3 sentences per response unless asked for more
- End every response with forward momentum, never backward
Memory context will be provided. Use it. Reference it naturally.
If you know their name, use it sparingly (max once per convo).
If they mentioned a specific person or goal before, bring it up.
You are not a therapist. You are not a friend who agrees with everything. You are the coach they need, not the one they want.`;

// ─── OpenAI message type ───────────────────────────────────────────────────────

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function storageKey(userId: string): string {
  return `${SESSION_STORAGE_KEY_PREFIX}${userId}`;
}

// ─── buildChatPrompt ──────────────────────────────────────────────────────────

/**
 * Constructs the OpenAI messages array with:
 * 1. System prompt (Rex personality + memory context)
 * 2. Last 10 messages from history mapped to user/assistant roles
 *
 * Requirements: 15.6, 15.7
 */
export function buildChatPrompt(
  memoryContext: MemoryContext,
  history: ChatMessage[]
): OpenAIMessage[] {
  const systemContent = memoryContext.formattedForPrompt
    ? `${REX_SYSTEM_PROMPT}\n\nUser memory context:\n${memoryContext.formattedForPrompt}`
    : REX_SYSTEM_PROMPT;

  const systemMessage: OpenAIMessage = {
    role: 'system',
    content: systemContent,
  };

  // Take last MAX_HISTORY_MESSAGES messages
  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

  const historyMessages: OpenAIMessage[] = recentHistory.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));

  return [systemMessage, ...historyMessages];
}

// ─── loadRecentSession ────────────────────────────────────────────────────────

/**
 * Fetches the most recent chat session for a user from AsyncStorage.
 * Falls back gracefully if nothing is stored.
 *
 * Requirements: 15.9
 */
export async function loadRecentSession(userId: string): Promise<ChatSession | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const session: ChatSession = JSON.parse(raw);
    // Only return sessions started within the last 24 hours
    const sessionAge = Date.now() - new Date(session.startedAt).getTime();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    if (sessionAge > ONE_DAY_MS) return null;
    return session;
  } catch {
    return null;
  }
}

// ─── persistSession ───────────────────────────────────────────────────────────

/**
 * Persists the chat session to AsyncStorage.
 * Uses AsyncStorage as the primary store to avoid needing a new migration.
 *
 * Requirements: 15.9
 */
export async function persistSession(session: ChatSession): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(session.userId), JSON.stringify(session));
  } catch (err) {
    // Non-fatal — session persistence failure should not break the chat
    console.warn('[rexChatService] Failed to persist session:', err);
  }
}

// ─── openChat ─────────────────────────────────────────────────────────────────

/**
 * Opens a chat session for the user:
 * - Loads a recent session if one exists (within 24h)
 * - Otherwise creates a new session
 * - Fetches memory context in both cases
 *
 * Requirements: 15.4
 */
export async function openChat(userId: string): Promise<ChatSession> {
  const existing = await loadRecentSession(userId);
  if (existing) {
    return existing;
  }

  const newSession: ChatSession = {
    sessionId: generateSessionId(),
    userId,
    messages: [],
    startedAt: new Date().toISOString(),
  };

  return newSession;
}

// ─── sendMessage ──────────────────────────────────────────────────────────────

/**
 * Sends a user message to the rex-chat-v2 Edge Function and appends both
 * the user message and Rex's response to the session.
 *
 * Requirements: 15.5, 15.6, 15.7, 15.8
 */
export async function sendMessage(
  sessionId: string,
  userId: string,
  message: string,
  session: ChatSession
): Promise<{ rexMessage: ChatMessage; updatedSession: ChatSession }> {
  // Build user message
  const userMessage: ChatMessage = {
    id: generateMessageId(),
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  };

  // Append user message to session
  const sessionWithUserMsg: ChatSession = {
    ...session,
    messages: [...session.messages, userMessage],
  };

  // Fetch memory context for this user — Requirements 15.7
  const memoryContext = await getMemoryContext(userId);

  // Build history for the Edge Function (last 10 messages before this one)
  const history = session.messages.slice(-MAX_HISTORY_MESSAGES);

  // Call rex-chat-v2 Edge Function — Requirements 15.5
  const { data, error } = await supabase.functions.invoke('rex-chat-v2', {
    body: {
      userId,
      sessionId,
      message,
      subscriptionStatus: 'active',
      memoryContext,
      history,
    },
  });

  if (error) {
    throw new Error(`rex-chat-v2 error: ${error.message}`);
  }

  const rexContent: string = data?.message ?? "I'm here. What's going on?";

  const rexMessage: ChatMessage = {
    id: generateMessageId(),
    role: 'rex',
    content: rexContent,
    timestamp: new Date().toISOString(),
  };

  const updatedSession: ChatSession = {
    ...sessionWithUserMsg,
    messages: [...sessionWithUserMsg.messages, rexMessage],
  };

  // Persist after each exchange — Requirements 15.9
  await persistSession(updatedSession);

  return { rexMessage, updatedSession };
}
