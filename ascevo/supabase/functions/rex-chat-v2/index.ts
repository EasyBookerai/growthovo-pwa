// rex-chat-v2 Edge Function
// Memory-aware Rex chat with Free/Premium tier handling.
// Free users receive a fallback from a pre-written pool (no OpenAI call).
// Premium users get a gpt-4o-mini response with Rex personality + memory context.
// Async memory extraction is triggered from the user's message (fire-and-forget).
// Requirements: 15.5, 15.6, 15.7, 15.8, 15.10

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_TIMEOUT_MS = 8000

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
You are not a therapist. You are not a friend who agrees with everything. You are the coach they need, not the one they want.`

// Pre-written fallback pool for Free users (Requirement 15.10)
const FREE_USER_FALLBACKS = [
  "Show up. That's the whole game.",
  "What's the one thing you're avoiding right now?",
  "You already know what to do. The question is whether you'll do it.",
  "Stop planning. Start doing. Even badly.",
  "The version of you that does the work is already inside you. Let them out.",
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'canceled'

interface ChatMessage {
  id: string
  role: 'user' | 'rex'
  content: string
  timestamp: string
}

interface MemoryContext {
  memories: Array<{
    id: string
    memoryType: string
    content: string
    importanceScore: number
  }>
  formattedForPrompt: string
}

interface RequestBody {
  userId: string
  sessionId: string
  message: string
  subscriptionStatus: SubscriptionStatus
  memoryContext?: MemoryContext
  history?: ChatMessage[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPremium(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing'
}

function getRandomFallback(): string {
  return FREE_USER_FALLBACKS[Math.floor(Math.random() * FREE_USER_FALLBACKS.length)]
}

// ---------------------------------------------------------------------------
// OpenAI call
// ---------------------------------------------------------------------------

async function callOpenAI(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS)

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 80,
        temperature: 0.85,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`OpenAI ${res.status}: ${errText}`)
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? ''
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// Build system prompt with Rex personality + memory context
// ---------------------------------------------------------------------------

function buildSystemPrompt(memoryContext?: MemoryContext): string {
  if (!memoryContext || !memoryContext.formattedForPrompt) {
    return REX_SYSTEM_PROMPT
  }
  return `${REX_SYSTEM_PROMPT}\n\nUser memory context:\n${memoryContext.formattedForPrompt}`
}

// ---------------------------------------------------------------------------
// Convert chat history to OpenAI message format (last 10 messages)
// ---------------------------------------------------------------------------

function buildMessageHistory(
  history: ChatMessage[],
  userMessage: string
): Array<{ role: string; content: string }> {
  const recent = history.slice(-10)
  const openaiMessages = recent.map((msg) => ({
    role: msg.role === 'rex' ? 'assistant' : 'user',
    content: msg.content,
  }))
  openaiMessages.push({ role: 'user', content: userMessage })
  return openaiMessages
}

// ---------------------------------------------------------------------------
// Async memory extraction — fire-and-forget (Requirement 15.8)
// ---------------------------------------------------------------------------

function triggerMemoryExtraction(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
  message: string
): void {
  const extractUrl = `${supabaseUrl}/functions/v1/extract-memories`

  // Non-blocking — we intentionally do not await this
  fetch(extractUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, text: message, source: 'rex_chat' }),
  }).catch((err) => {
    // Silently swallow errors — memory extraction is best-effort
    console.error('Memory extraction trigger failed:', err)
  })
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const openaiKey = Deno.env.get('OPENAI_API_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Supabase env vars not configured' }, 500)
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { userId, sessionId, message, subscriptionStatus, memoryContext, history } = body

  if (!userId || !sessionId || !message || !subscriptionStatus) {
    return json({ error: 'Missing required fields: userId, sessionId, message, subscriptionStatus' }, 400)
  }

  // Free users: return fallback immediately, no OpenAI call (Requirement 15.10)
  if (!isPremium(subscriptionStatus)) {
    return json({ message: getRandomFallback() }, 200)
  }

  // Premium users: build prompt and call OpenAI
  if (!openaiKey) {
    // Graceful degradation if API key is missing
    return json({ message: getRandomFallback() }, 200)
  }

  const systemPrompt = buildSystemPrompt(memoryContext)
  const messages = buildMessageHistory(history ?? [], message)

  let responseMessage: string
  try {
    responseMessage = await callOpenAI(systemPrompt, messages, openaiKey)
  } catch (err) {
    console.error('OpenAI rex-chat-v2 error:', err)
    return json({ message: getRandomFallback() }, 200)
  }

  // Trigger async memory extraction from user's message (non-blocking)
  triggerMemoryExtraction(supabaseUrl, serviceRoleKey, userId, message)

  return json({ message: responseMessage }, 200)
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
