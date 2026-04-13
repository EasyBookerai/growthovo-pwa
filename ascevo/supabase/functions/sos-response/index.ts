// sos-response Edge Function
// Handles all SOS AI generation dispatched by type:
//   anxiety_spike, about_to_react, zero_motivation, hard_conversation, overwhelmed
// All calls use gpt-4o-mini with a 5-second timeout.
// Returns fallback content on timeout or error.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_TIMEOUT_MS = 5000
const MODEL = 'gpt-4o-mini'

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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SOSType =
  | 'anxiety_spike'
  | 'about_to_react'
  | 'zero_motivation'
  | 'hard_conversation'
  | 'overwhelmed'

type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'canceled'

interface AnxietySpikePayload {
  anxietyCount: number
}

interface AboutToReactPayload {
  situation: string
}

interface ZeroMotivationPayload {
  goals?: string[]
  primaryPillar?: string
  streakCount?: number
}

interface HardConversationPayload {
  situation: string
}

interface OverwhelmedPayload {
  brainDump: string
}

type SOSPayload =
  | AnxietySpikePayload
  | AboutToReactPayload
  | ZeroMotivationPayload
  | HardConversationPayload
  | OverwhelmedPayload

interface RequestBody {
  type: SOSType
  userId: string
  subscriptionStatus: SubscriptionStatus
  payload: SOSPayload
}

// ---------------------------------------------------------------------------
// Fallbacks
// ---------------------------------------------------------------------------

const FALLBACKS: Record<SOSType, unknown> = {
  anxiety_spike: {
    closingLine: "Anxiety is just energy without direction. You've handled worse — redirect it.",
  },
  about_to_react: {
    calmDraft:
      "I hear you, and I want to respond thoughtfully. Can we talk about this when I've had a moment to think it through?",
  },
  zero_motivation: {
    resetMessage:
      "You don't need motivation right now — you need one small action. Pick the smallest possible thing and do just that.",
  },
  hard_conversation: {
    openingLine: "I want to talk about something important, and I need you to hear me out.",
    thingsToAvoid: ['Bringing up past issues', 'Raising your voice', 'Making it personal'],
    targetOutcome: 'Mutual understanding and a clear next step forward.',
  },
  overwhelmed: {
    topPriority: 'Focus on the single most urgent task in front of you right now.',
    thingsToIgnore: ['Everything that can wait until tomorrow', 'Other people's urgency', 'Perfectionism'],
    resetSentence: 'One thing at a time — you can only do what you can do.',
  },
}

// ---------------------------------------------------------------------------
// OpenAI call with 5-second timeout
// ---------------------------------------------------------------------------

async function callOpenAI(
  userPrompt: string,
  maxTokens: number,
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
        model: MODEL,
        messages: [
          { role: 'system', content: REX_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
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
// Type-specific handlers
// ---------------------------------------------------------------------------

async function handleAnxietySpike(
  payload: AnxietySpikePayload,
  apiKey: string
): Promise<{ closingLine: string }> {
  const { anxietyCount } = payload
  const prompt = `The user just completed a 4-7-8 breathing exercise for an anxiety spike. They've had ${anxietyCount} anxiety episodes in the last 7 days. Give them a single closing line — grounding, forward-looking, no fluff. Max 1 sentence.`

  const closingLine = await callOpenAI(prompt, 25, apiKey)
  return { closingLine }
}

async function handleAboutToReact(
  payload: AboutToReactPayload,
  apiKey: string
): Promise<{ calmDraft: string }> {
  const { situation } = payload
  const prompt = `The user was about to send an impulsive message or react to this situation: "${situation}". They waited 90 seconds. Now write a calm, measured response draft they could actually send. Keep it real — not passive-aggressive, not a pushover. Max 3 sentences.`

  const calmDraft = await callOpenAI(prompt, 80, apiKey)
  return { calmDraft }
}

async function handleZeroMotivation(
  payload: ZeroMotivationPayload,
  userId: string,
  supabase: ReturnType<typeof createClient>,
  apiKey: string
): Promise<{ resetMessage: string }> {
  let goals = payload.goals ?? []
  const { primaryPillar, streakCount } = payload

  // Fetch goals from rex_memory if not provided
  if (goals.length === 0) {
    const { data } = await supabase
      .from('rex_memory')
      .select('content')
      .eq('user_id', userId)
      .eq('memory_type', 'goal')
      .order('importance_score', { ascending: false })
      .limit(3)

    if (data && data.length > 0) {
      goals = (data as Array<{ content: string }>).map((m) => m.content)
    }
  }

  const goalsText = goals.length > 0 ? `Their goals: ${goals.join(', ')}.` : ''
  const pillarText = primaryPillar ? ` They're working on ${primaryPillar}.` : ''
  const streakText = streakCount !== undefined ? ` Current streak: ${streakCount} days.` : ''

  const prompt = `The user has zero motivation right now.${goalsText}${pillarText}${streakText} Write a reset message that reconnects them to why they started. No toxic positivity. Reference their actual goals if available. End with one concrete micro-action they can do in the next 5 minutes.`

  const resetMessage = await callOpenAI(prompt, 100, apiKey)
  return { resetMessage }
}

async function handleHardConversation(
  payload: HardConversationPayload,
  apiKey: string
): Promise<{ openingLine: string; thingsToAvoid: string[]; targetOutcome: string }> {
  const { situation } = payload
  const prompt = `The user needs to have a hard conversation about: "${situation}". Give them:
1. An opening line (1 sentence, non-confrontational but direct)
2. Three things to avoid saying or doing (as a JSON array of strings)
3. The target outcome (1 sentence — what does a successful conversation look like?)

Respond in this exact JSON format:
{
  "openingLine": "...",
  "thingsToAvoid": ["...", "...", "..."],
  "targetOutcome": "..."
}`

  const raw = await callOpenAI(prompt, 150, apiKey)

  // Parse JSON response
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid JSON response from OpenAI')

  const parsed = JSON.parse(jsonMatch[0])
  return {
    openingLine: parsed.openingLine ?? '',
    thingsToAvoid: Array.isArray(parsed.thingsToAvoid) ? parsed.thingsToAvoid : [],
    targetOutcome: parsed.targetOutcome ?? '',
  }
}

async function handleOverwhelmed(
  payload: OverwhelmedPayload,
  apiKey: string
): Promise<{ topPriority: string; thingsToIgnore: string[]; resetSentence: string }> {
  const { brainDump } = payload
  const prompt = `The user is overwhelmed. Here's their brain dump: "${brainDump}". Help them cut through the noise:
1. Top priority (1 sentence — the single most important thing right now)
2. Three things to ignore for now (as a JSON array of strings)
3. A reset sentence (1 sentence — something grounding to bring them back to the present)

Respond in this exact JSON format:
{
  "topPriority": "...",
  "thingsToIgnore": ["...", "...", "..."],
  "resetSentence": "..."
}`

  const raw = await callOpenAI(prompt, 120, apiKey)

  // Parse JSON response
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid JSON response from OpenAI')

  const parsed = JSON.parse(jsonMatch[0])
  return {
    topPriority: parsed.topPriority ?? '',
    thingsToIgnore: Array.isArray(parsed.thingsToIgnore) ? parsed.thingsToIgnore : [],
    resetSentence: parsed.resetSentence ?? '',
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return json('ok', 200)
  }

  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    return json({ fallback: true, data: FALLBACKS['anxiety_spike'] }, 200)
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { type, userId, subscriptionStatus, payload } = body

  if (!type || !userId || !subscriptionStatus || !payload) {
    return json({ error: 'Missing required fields' }, 400)
  }

  // Free users get fallback — no OpenAI call
  if (subscriptionStatus === 'free' || subscriptionStatus === 'canceled') {
    return json({ fallback: true, data: FALLBACKS[type] }, 200)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    let result: unknown

    switch (type) {
      case 'anxiety_spike':
        result = await handleAnxietySpike(payload as AnxietySpikePayload, openaiKey)
        break

      case 'about_to_react':
        result = await handleAboutToReact(payload as AboutToReactPayload, openaiKey)
        break

      case 'zero_motivation':
        result = await handleZeroMotivation(
          payload as ZeroMotivationPayload,
          userId,
          supabase,
          openaiKey
        )
        break

      case 'hard_conversation':
        result = await handleHardConversation(payload as HardConversationPayload, openaiKey)
        break

      case 'overwhelmed':
        result = await handleOverwhelmed(payload as OverwhelmedPayload, openaiKey)
        break

      default:
        return json({ error: `Unknown SOS type: ${type}` }, 400)
    }

    return json({ data: result }, 200)
  } catch (err: unknown) {
    const isTimeout =
      err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'))

    console.error(`SOS ${type} error:`, err)

    // Return fallback on timeout or any error
    return json({ fallback: true, data: FALLBACKS[type] }, 200)
  }
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
