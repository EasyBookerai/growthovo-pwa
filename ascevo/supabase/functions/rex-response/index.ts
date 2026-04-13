// rex-response Edge Function
// Handles check-in, weekly summary, and streak warning responses with
// caching, rate limiting, cost tracking, and OpenAI integration.
// Supports multilingual responses — Rex responds in the user's chosen language.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REX_SYSTEM_PROMPT = `You are Rex — a brutally honest, funny, warm AI coach inside a self-improvement app for teenagers and people in their late 20s. You speak like a 25-year-old who figured life out early and genuinely wants to help, but won't sugarcoat anything. Rules:
- Never say "Great job", "Amazing", "Fantastic" or any corporate praise
- Max 2 sentences for check-ins, max 1 sentence for warnings
- Reference their specific challenge or streak number — make it personal
- If they failed: acknowledge it, find the smallest win, push them forward
- If they succeeded: respect it briefly, immediately raise the bar
- Dry humor is encouraged. Sarcasm is allowed. Cruelty is not.
- Never use emojis except sparingly (max 1 per message, only when it lands)
- End check-in responses with a forward-looking statement, never backward`

const OPENAI_TIMEOUT_MS = 8000
const DAILY_AI_LIMIT = 3

const COST_GPT4O_MINI = 0.0002
const COST_GPT4O = 0.002

const SUPPORTED_LANGUAGES = ['en', 'ro', 'it', 'fr', 'de', 'es', 'pt', 'nl'] as const
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ResponseType = 'checkin' | 'weekly_summary' | 'streak_warning'
type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'canceled'

interface CheckInParams {
  userId: string
  challengeCompleted: boolean
  challengeText: string
  streakDays: number
  pillar: string
  recentHistory?: string[]
}

interface WeeklySummaryParams {
  userId: string
  lessonsCompleted: number
  challengesCompleted: number
  streakDays: number
  xpEarned: number
  strongestPillar: string
  weakestPillar: string
  previousWeekLessons: number
}

interface StreakWarningParams {
  userId: string
  streakDays: number
  hoursLeft: number
  lastChallenge: string
}

interface RequestBody {
  type: ResponseType
  userId: string
  subscriptionStatus: SubscriptionStatus
  language?: string  // optional for backwards compatibility
  params: CheckInParams | WeeklySummaryParams | StreakWarningParams
}

// ---------------------------------------------------------------------------
// Language helpers
// ---------------------------------------------------------------------------

function resolveLanguage(lang?: string): SupportedLanguage {
  if (!lang) return 'en'
  const lower = lang.toLowerCase().split('-')[0]
  return SUPPORTED_LANGUAGES.includes(lower as SupportedLanguage)
    ? (lower as SupportedLanguage)
    : 'en'
}

/**
 * Build the language instruction prepended to every system prompt.
 * This ensures Rex responds in the user's chosen language while maintaining personality.
 */
function buildLanguageInstruction(language: SupportedLanguage): string {
  if (language === 'en') return '' // No instruction needed for English
  return `Respond only in ${language}. Maintain Rex's personality and tone in that language. `
}

// ---------------------------------------------------------------------------
// Cache helpers (Deno-compatible SHA-256 via crypto.subtle)
// ---------------------------------------------------------------------------

function getStreakBracket(streakDays: number): string {
  if (streakDays <= 7) return '1-7'
  if (streakDays <= 30) return '8-30'
  if (streakDays <= 100) return '31-100'
  return '100+'
}

/**
 * Compute a cache key that includes the language so responses are
 * cached per language — a German response is never served to a French user.
 */
async function computeCacheKey(
  challengeText: string,
  completed: boolean,
  streakDays: number,
  language: SupportedLanguage
): Promise<string> {
  const bracket = getStreakBracket(streakDays)
  const raw = `${challengeText}|${completed}|${bracket}|${language}`
  const encoded = new TextEncoder().encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildCheckInPrompt(p: CheckInParams): string {
  const status = p.challengeCompleted ? 'completed' : 'did not complete'
  const historyNote =
    p.recentHistory && p.recentHistory.length > 0
      ? ` Recent history: ${p.recentHistory.slice(-3).join(', ')}.`
      : ''
  return `The user ${status} their ${p.pillar} challenge: "${p.challengeText}". They are on a ${p.streakDays}-day streak.${historyNote} Respond as Rex.`
}

function buildWeeklySummaryPrompt(p: WeeklySummaryParams): string {
  const trend = p.lessonsCompleted >= p.previousWeekLessons ? 'up or equal' : 'down'
  return `Weekly summary for a user: ${p.lessonsCompleted} lessons completed (${trend} from ${p.previousWeekLessons} last week), ${p.challengesCompleted} challenges done, ${p.streakDays}-day streak, ${p.xpEarned} XP earned. Strongest pillar: ${p.strongestPillar}. Weakest: ${p.weakestPillar}. Give Rex's weekly summary — honest, direct, max 300 tokens.`
}

function buildStreakWarningPrompt(p: StreakWarningParams): string {
  return `The user has a ${p.streakDays}-day streak and only ${p.hoursLeft} hours left today. Their last challenge was: "${p.lastChallenge}". Give Rex's streak warning — 1 sentence, no fluff.`
}

// ---------------------------------------------------------------------------
// OpenAI call
// ---------------------------------------------------------------------------

async function callOpenAI(
  model: string,
  userPrompt: string,
  maxTokens: number,
  apiKey: string,
  language: SupportedLanguage
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS)

  const languageInstruction = buildLanguageInstruction(language)
  const systemPrompt = languageInstruction
    ? `${languageInstruction}\n\n${REX_SYSTEM_PROMPT}`
    : REX_SYSTEM_PROMPT

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
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
// Rate limit helpers
// ---------------------------------------------------------------------------

async function getUsageCount(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  today: string
): Promise<number> {
  const { data } = await supabase
    .from('ai_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  return (data as any)?.count ?? 0
}

async function incrementUsage(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  today: string
): Promise<void> {
  const { error } = await supabase.rpc('increment_ai_usage', { p_user_id: userId, p_date: today })
  if (error) console.error('Usage increment failed:', error)
}

// ---------------------------------------------------------------------------
// Cost logging
// ---------------------------------------------------------------------------

async function logCost(
  supabase: ReturnType<typeof createClient>,
  model: string,
  today: string
): Promise<void> {
  const cost = model === 'gpt-4o' ? COST_GPT4O : COST_GPT4O_MINI
  try {
    await supabase.rpc('increment_ai_costs', { p_date: today, p_cost: cost })
  } catch (err) {
    console.error('Cost log failed:', err)
  }
}

// ---------------------------------------------------------------------------
// Cache helpers — language-aware
// ---------------------------------------------------------------------------

async function getCached(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string,
  language: SupportedLanguage
): Promise<string | null> {
  const { data, error } = await supabase
    .from('rex_cache')
    .select('response, created_at')
    .eq('cache_key', cacheKey)
    .eq('language', language)  // Filter by language to prevent cross-language cache hits
    .single()

  if (error || !data) return null

  const createdAt = new Date((data as any).created_at)
  const diffDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays > 7) return null

  return (data as any).response
}

async function setCache(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string,
  response: string,
  language: SupportedLanguage
): Promise<void> {
  try {
    await supabase
      .from('rex_cache')
      .upsert({
        cache_key: cacheKey,
        response,
        language,  // Store language with cache entry
        created_at: new Date().toISOString(),
      })
  } catch (err) {
    console.error('Cache write failed:', err)
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    return json({ fallback: true }, 200)
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { type, userId, subscriptionStatus, params } = body

  if (!type || !userId || !subscriptionStatus || !params) {
    return json({ error: 'Missing required fields' }, 400)
  }

  // Resolve language — defaults to 'en' for backwards compatibility
  const language = resolveLanguage(body.language)

  // 1. Free users always get fallback — no OpenAI call
  if (subscriptionStatus === 'free' || subscriptionStatus === 'canceled') {
    return json({ fallback: true }, 200)
  }

  const today = new Date().toISOString().split('T')[0]

  // 2. Rate limit check
  const usageCount = await getUsageCount(supabase, userId, today)
  if (usageCount >= DAILY_AI_LIMIT) {
    return json({ fallback: true }, 200)
  }

  // 3. Check-in: cache lookup + OpenAI call
  if (type === 'checkin') {
    const p = params as CheckInParams
    const cacheKey = await computeCacheKey(p.challengeText, p.challengeCompleted, p.streakDays, language)
    const cached = await getCached(supabase, cacheKey, language)
    if (cached) {
      return json({ message: cached, cached: true }, 200)
    }

    let message: string
    try {
      message = await callOpenAI('gpt-4o-mini', buildCheckInPrompt(p), 120, openaiKey, language)
    } catch (err: any) {
      console.error('OpenAI checkin error:', err)
      return json({ fallback: true }, 200)
    }

    await Promise.allSettled([
      setCache(supabase, cacheKey, message, language),
      logCost(supabase, 'gpt-4o-mini', today),
      incrementUsage(supabase, userId, today),
    ])

    return json({ message }, 200)
  }

  if (type === 'streak_warning') {
    const p = params as StreakWarningParams
    let message: string
    try {
      message = await callOpenAI('gpt-4o-mini', buildStreakWarningPrompt(p), 80, openaiKey, language)
    } catch (err: any) {
      console.error('OpenAI streak_warning error:', err)
      return json({ fallback: true }, 200)
    }

    await Promise.allSettled([
      logCost(supabase, 'gpt-4o-mini', today),
      incrementUsage(supabase, userId, today),
    ])

    return json({ message }, 200)
  }

  if (type === 'weekly_summary') {
    const p = params as WeeklySummaryParams
    let message: string
    try {
      message = await callOpenAI('gpt-4o', buildWeeklySummaryPrompt(p), 300, openaiKey, language)
    } catch (err: any) {
      console.error('OpenAI weekly_summary error:', err)
      return json({ fallback: true }, 200)
    }

    await Promise.allSettled([
      logCost(supabase, 'gpt-4o', today),
      incrementUsage(supabase, userId, today),
    ])

    return json({ message }, 200)
  }

  return json({ error: 'Unknown type' }, 400)
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
