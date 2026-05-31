import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type RexFeature =
  | 'chat'
  | 'morning_briefing'
  | 'evening_debrief'
  | 'lesson_companion'
  | 'lesson_insight'
  | 'daily_challenge'
  | 'sos'
  | 'weekly_wrapped'
  | 'speaking_feedback'
  | 'notification_copy'
  | 'profile_assessment';

export interface RexContext {
  userId?: string;
  name: string;
  streak: number;
  xp: number;
  level: number;
  moodEmoji: string;
  moodLabel: string;
  completedLessons: string[];
  selectedPillars: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  lastCheckIn: string;
  isPremium: boolean;
  language?: string;
  featureLabel?: string;
}

export interface RexChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RexRequestOptions {
  feature: RexFeature;
  context: RexContext;
  messages: RexChatMessage[];
  cacheKey?: string;
  cacheTtlMs?: number;
  fallback?: string;
  countTowardLimit?: boolean;
}

export interface RexCallResult {
  reply: string;
  fromCache: boolean;
  limitHit: boolean;
  remainingFreeCalls: number;
}

export interface RexStreamOptions {
  feature: RexFeature;
  context: RexContext;
  messages: RexChatMessage[];
  fallback?: string;
  countTowardLimit?: boolean;
  onOpen?: () => void;
  onFirstToken?: () => void;
  onToken?: (token: string, fullText: string) => void;
}

export interface MorningBriefingPayload {
  greeting: string;
  quote: string;
  quoteAuthor: string;
  focusSuggestion: string;
  rexMessage: string;
}

export interface DailyChallengePayload {
  challenge: string;
  xp: number;
}

export interface WeeklyWrappedPayload {
  headline: string;
  highlight: string;
  pattern: string;
  challenge: string;
  rexSign: string;
}

export interface NotificationCopyPayload {
  morning: string;
  evening: string;
  streakWarning: string;
}

export interface ProfileAssessmentPayload {
  strength: string;
  blindspot: string;
  nextLevel: string;
}

export interface SpeechFeedbackPayload {
  fillerWords: { word: string; count: number }[];
  pace: 'too slow' | 'good' | 'too fast';
  paceWPM: number;
  clarity: number;
  confidence: number;
  topStrength: string;
  topImprovement: string;
  rexFeedback: string;
}

const DAILY_FREE_LIMIT = 20;
const API_TIMEOUT_MS = 8000;
export const DEFAULT_REX_FALLBACK =
  "I'm having trouble connecting right now. Try again in a moment 🔄";

function getDateKey(date = new Date()): string {
  return date.toISOString().split('T')[0];
}

function getTodayUsageKey(): string {
  return `rex_usage_${getDateKey()}`;
}

function isWebStorageAvailable(): boolean {
  return Platform.OS === 'web' && typeof globalThis.localStorage !== 'undefined';
}

async function getStoredValue(key: string): Promise<string | null> {
  try {
    if (isWebStorageAvailable()) {
      return globalThis.localStorage.getItem(key);
    }

    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function setStoredValue(key: string, value: string): Promise<void> {
  try {
    if (isWebStorageAvailable()) {
      globalThis.localStorage.setItem(key, value);
      return;
    }

    await AsyncStorage.setItem(key, value);
  } catch {
    // Ignore storage failures so Rex still works live.
  }
}

async function removeStoredValue(key: string): Promise<void> {
  try {
    if (isWebStorageAvailable()) {
      globalThis.localStorage.removeItem(key);
      return;
    }

    await AsyncStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function getDailyUsageCount(): Promise<number> {
  const raw = await getStoredValue(getTodayUsageKey());
  const parsed = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getRexUsageStatus(isPremium: boolean): Promise<{
  used: number;
  remaining: number;
  limitHit: boolean;
}> {
  if (isPremium) {
    return {
      used: 0,
      remaining: Number.POSITIVE_INFINITY,
      limitHit: false,
    };
  }

  const used = await getDailyUsageCount();
  return {
    used,
    remaining: Math.max(0, DAILY_FREE_LIMIT - used),
    limitHit: used >= DAILY_FREE_LIMIT,
  };
}

export async function incrementRexUsage(isPremium: boolean): Promise<number> {
  if (isPremium) {
    return Number.POSITIVE_INFINITY;
  }

  const next = (await getDailyUsageCount()) + 1;
  await setStoredValue(getTodayUsageKey(), String(next));
  return Math.max(0, DAILY_FREE_LIMIT - next);
}

function getCacheEnvelopeKey(feature: string, dateKey: string): string {
  return `rex_cache_${feature}_${dateKey}`;
}

export function getTodayCacheKey(feature: string): string {
  return getCacheEnvelopeKey(feature, getDateKey());
}

export function getWeeklyCacheKey(feature: string): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  return getCacheEnvelopeKey(feature, getDateKey(monday));
}

export function getTimedCacheTtlMs(hours: number): number {
  return hours * 60 * 60 * 1000;
}

export function getCacheUntilMidnightMs(): number {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight.getTime() - now.getTime();
}

export function getCacheUntilNextMondayMs(): number {
  const now = new Date();
  const nextMonday = new Date(now);
  const day = now.getDay();
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7;
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday.getTime() - now.getTime();
}

export async function getCachedRexValue<T>(key: string): Promise<T | null> {
  const parsed = safeJsonParse<{ expiresAt: number; value: T }>(await getStoredValue(key));

  if (!parsed) {
    return null;
  }

  if (Date.now() > parsed.expiresAt) {
    await removeStoredValue(key);
    return null;
  }

  return parsed.value;
}

export async function setCachedRexValue<T>(key: string, value: T, ttlMs: number): Promise<void> {
  await setStoredValue(
    key,
    JSON.stringify({
      expiresAt: Date.now() + ttlMs,
      value,
    })
  );
}

export function detectTimeOfDay(): RexContext['timeOfDay'] {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'morning';
  }

  if (hour < 18) {
    return 'afternoon';
  }

  return 'evening';
}

export function buildSystemPrompt(context: RexContext, feature: RexFeature): string {
  const featureInstruction = getFeatureInstruction(feature);
  const completedLessons = context.completedLessons.length > 0
    ? context.completedLessons.join(', ')
    : 'none yet';
  const selectedPillars = context.selectedPillars.length > 0
    ? context.selectedPillars.join(', ')
    : 'none selected';

  return [
    'You are Rex, the AI growth coach inside Growthovo.',
    '',
    'PERSONALITY:',
    '- Warm, direct, and real - never robotic or generic',
    '- You speak like a brilliant friend who happens to know psychology, productivity, fitness, finance, and relationships',
    '- Short sentences. High energy. Occasional emoji.',
    '- Never say "I understand your concern" or corporate phrases',
    '- Never give a list of 10 things. Max 3 actionable points.',
    '- Always end with either a question OR one clear next action',
    '- You remember everything the user tells you in this session',
    '',
    'USER CONTEXT:',
    `- Name: ${context.name}`,
    `- Current streak: ${context.streak} days`,
    `- XP: ${context.xp} points, Level ${context.level}`,
    `- Today's mood: ${context.moodEmoji} ${context.moodLabel}`,
    `- Completed lessons: ${completedLessons}`,
    `- Selected pillars: ${selectedPillars}`,
    `- Time of day: ${context.timeOfDay}`,
    `- Last check-in: ${context.lastCheckIn}`,
    `- Feature calling Rex: ${context.featureLabel ?? feature}`,
    '',
    'RULES:',
    '- Responses max 120 words unless user asks for detail',
    '- Always personalize using their name and stats above',
    '- Never recommend professional help unless crisis detected',
    '- If crisis detected (self-harm, suicide keywords) respond with care and provide emergency resources immediately',
    '- Speak the user\'s language',
    '- Never break character',
    '',
    'FEATURE INSTRUCTIONS:',
    featureInstruction,
  ].join('\n');
}

function getFeatureInstruction(feature: RexFeature): string {
  switch (feature) {
    case 'morning_briefing':
      return 'You are generating a morning briefing. Follow the user format exactly and return valid JSON only.';
    case 'evening_debrief':
      return 'You are responding to an evening debrief. Be specific, warm, and concise.';
    case 'lesson_companion':
      return 'You are answering questions about the active lesson. Use the lesson content as your source of truth.';
    case 'lesson_insight':
      return 'You are generating one personalized insight and one reflection question after a lesson. Max 50 words.';
    case 'daily_challenge':
      return 'You are generating a single daily micro-challenge. Return valid JSON only.';
    case 'sos':
      return 'User is in distress. Start with one grounding technique. No long lists. Keep it calm, specific, and warm.';
    case 'weekly_wrapped':
      return 'You are generating a weekly wrapped summary. Return valid JSON only.';
    case 'speaking_feedback':
      return 'You are analyzing a speech transcript and returning valid JSON only.';
    case 'notification_copy':
      return 'You are writing daily notification copy. Return valid JSON only.';
    case 'profile_assessment':
      return 'You are giving an honest growth assessment. Return valid JSON only.';
    case 'chat':
    default:
      return 'You are in the main Rex chat. Stay personal, fast, and useful.';
  }
}

function extractJsonBlock(reply: string): string {
  const fencedMatch = reply.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const objectStart = reply.indexOf('{');
  const objectEnd = reply.lastIndexOf('}');
  if (objectStart !== -1 && objectEnd > objectStart) {
    return reply.slice(objectStart, objectEnd + 1);
  }

  return reply.trim();
}

export function parseStructuredReply<T>(reply: string): T {
  return JSON.parse(extractJsonBlock(reply)) as T;
}

async function fetchWithTimeout(
  url: string,
  body: unknown
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function callRex(options: RexRequestOptions): Promise<RexCallResult> {
  const {
    feature,
    context,
    messages,
    cacheKey,
    cacheTtlMs,
    fallback = DEFAULT_REX_FALLBACK,
    countTowardLimit = true,
  } = options;

  if (cacheKey) {
    const cached = await getCachedRexValue<string>(cacheKey);
    if (cached) {
      const usage = await getRexUsageStatus(context.isPremium);
      return {
        reply: cached,
        fromCache: true,
        limitHit: false,
        remainingFreeCalls: usage.remaining,
      };
    }
  }

  const usage = await getRexUsageStatus(context.isPremium);
  if (countTowardLimit && usage.limitHit) {
    return {
      reply: fallback,
      fromCache: false,
      limitHit: true,
      remainingFreeCalls: 0,
    };
  }

  let remaining = usage.remaining;
  if (countTowardLimit) {
    remaining = await incrementRexUsage(context.isPremium);
  }

  try {
    const response = await fetchWithTimeout('/api/rex', {
      feature,
      context,
      messages,
    });

    if (!response.ok) {
      console.error('[Rex] Non-OK response:', response.status);
      return {
        reply: fallback,
        fromCache: false,
        limitHit: false,
        remainingFreeCalls: remaining,
      };
    }

    const data = (await response.json()) as { reply?: string };
    const reply = data.reply?.trim() || fallback;

    if (cacheKey && cacheTtlMs) {
      await setCachedRexValue(cacheKey, reply, cacheTtlMs);
    }

    return {
      reply,
      fromCache: false,
      limitHit: false,
      remainingFreeCalls: remaining,
    };
  } catch (error) {
    console.error('[Rex] request failed:', error);
    return {
      reply: fallback,
      fromCache: false,
      limitHit: false,
      remainingFreeCalls: remaining,
    };
  }
}

function parseSseEvents(chunk: string): Array<Record<string, string>> {
  const events: Array<Record<string, string>> = [];
  const rawEvents = chunk.split('\n\n');

  for (const rawEvent of rawEvents) {
    const event: Record<string, string> = {};
    const lines = rawEvent.split('\n');

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const separator = line.indexOf(':');
      if (separator === -1) {
        continue;
      }

      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      event[key] = value;
    }

    if (Object.keys(event).length > 0) {
      events.push(event);
    }
  }

  return events;
}

export async function streamRex(options: RexStreamOptions): Promise<string> {
  const {
    feature,
    context,
    messages,
    fallback = DEFAULT_REX_FALLBACK,
    countTowardLimit = true,
    onOpen,
    onFirstToken,
    onToken,
  } = options;

  const usage = await getRexUsageStatus(context.isPremium);
  if (countTowardLimit && usage.limitHit) {
    return fallback;
  }

  if (countTowardLimit) {
    await incrementRexUsage(context.isPremium);
  }

  try {
    const response = await fetchWithTimeout('/api/rex-stream', {
      feature,
      context,
      messages,
    });

    if (!response.ok || !response.body) {
      return fallback;
    }

    onOpen?.();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    let sawFirstToken = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';

      for (const part of parts) {
        const events = parseSseEvents(part);
        for (const event of events) {
          if (!event.data) {
            continue;
          }

          if (event.data === '[DONE]') {
            return fullText.trim() || fallback;
          }

          try {
            const parsed = JSON.parse(event.data) as {
              type?: string;
              content?: string;
            };

            if (parsed.type === 'token' && parsed.content) {
              if (!sawFirstToken) {
                sawFirstToken = true;
                onFirstToken?.();
              }

              fullText += parsed.content;
              onToken?.(parsed.content, fullText);
            }
          } catch {
            // Ignore malformed SSE chunks and continue streaming.
          }
        }
      }
    }

    return fullText.trim() || fallback;
  } catch (error) {
    console.error('[Rex] stream failed:', error);
    return fallback;
  }
}

export async function callRexJson<T>(options: RexRequestOptions): Promise<{
  data: T | null;
  rawReply: string;
  fromCache: boolean;
  limitHit: boolean;
}> {
  const result = await callRex(options);

  try {
    return {
      data: parseStructuredReply<T>(result.reply),
      rawReply: result.reply,
      fromCache: result.fromCache,
      limitHit: result.limitHit,
    };
  } catch (error) {
    console.error('[Rex] failed to parse structured reply:', error);
    return {
      data: null,
      rawReply: result.reply,
      fromCache: result.fromCache,
      limitHit: result.limitHit,
    };
  }
}

export function buildChatStarters(args: {
  streak: number;
  lastCompletedLesson?: string;
  moodLabel: string;
}): string[] {
  const starters: string[] = [];
  const today = new Date();

  if (args.streak <= 1) {
    starters.push('Your streak dropped. Want to talk about what happened?');
  }

  if (args.streak >= 7) {
    starters.push(`${args.streak} days strong 🔥 What's your secret?`);
  }

  if (today.getDay() === 1) {
    starters.push("New week. What's the ONE thing that would make it great?");
  }

  if (args.lastCompletedLesson) {
    starters.push(`You just finished ${args.lastCompletedLesson}. What hit hardest?`);
  }

  if (args.moodLabel && args.moodLabel.toLowerCase() !== 'good') {
    starters.push(`You logged ${args.moodLabel} today. What's going on?`);
  }

  if (starters.length === 0) {
    starters.push("What's the thing you keep thinking about lately?");
  }

  return starters.slice(0, 3);
}
