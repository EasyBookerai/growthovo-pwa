// submit-evening-debrief Edge Function
// Handles two modes:
//   1. action: 'q2_insight' — returns a one-sentence insight for Q2 obstacle (called mid-flow)
//   2. Full debrief submission — validates Q2, generates verdict, inserts record, awards XP, updates streak
//
// Requirements: 16.5, 16.6, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 18.1, 7.6, 14.3

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_TIMEOUT_MS = 10000

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

const XP_DEBRIEF = 20

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Q1Answer = 'yes_crushed_it' | 'partially' | 'no_didnt_happen'

interface DebriefFlowState {
  q1Answer: Q1Answer | null
  q1Detail: string
  q2Obstacle: string
  q3Note: string
  q2Insight?: string | null
  rexVerdict?: string | null
}

interface EveningDebrief {
  id: string
  userId: string
  date: string
  q1Answer: Q1Answer
  q1Detail: string
  q2Obstacle: string
  q3Note: string | null
  rexVerdict: string
  xpEarned: number
}

// ---------------------------------------------------------------------------
// Word count validation (matches validateMinWordCount in debriefService.ts)
// ---------------------------------------------------------------------------

function validateMinWordCount(text: string, minWords: number): boolean {
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0)
  return words.length >= minWords
}

// ---------------------------------------------------------------------------
// OpenAI helper
// ---------------------------------------------------------------------------

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  apiKey: string
): Promise<string | null> {
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
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.85,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`OpenAI error ${res.status}: ${errText}`)
      return null
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('OpenAI call timed out')
    } else {
      console.error('OpenAI call failed:', err)
    }
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// XP award — inserts into xp_transactions directly
// ---------------------------------------------------------------------------

async function awardXP(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  amount: number,
  source: string
): Promise<void> {
  const { error } = await supabase.from('xp_transactions').insert({
    user_id: userId,
    amount,
    source,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error('awardXP error:', error)
    // Non-fatal — log and continue
  }
}

// ---------------------------------------------------------------------------
// Streak update — calls increment_streak RPC (same as streakService.ts)
// ---------------------------------------------------------------------------

async function updateStreak(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<void> {
  const { error } = await supabase.rpc('increment_streak', { p_user_id: userId })
  if (error) {
    console.error('updateStreak error:', error)
    // Non-fatal — log and continue
  }
}

// ---------------------------------------------------------------------------
// Check anxiety SOS pattern and create rex_memory entry if triggered (async, non-blocking)
// Requirements: 7.6, 14.3
// ---------------------------------------------------------------------------

function checkAnxietyPatternAndStore(
  supabase: ReturnType<typeof createClient>,
  userId: string
): void {
  // Fire-and-forget — do not await
  ;(async () => {
    try {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { count, error: countError } = await supabase
        .from('sos_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'anxiety_spike')
        .gte('timestamp', since)

      if (countError) {
        console.error('checkAnxietyPattern count error:', countError)
        return
      }

      if ((count ?? 0) >= 3) {
        const { error: insertError } = await supabase.from('rex_memory').insert({
          user_id: userId,
          memory_type: 'pattern',
          content:
            'User has had 3+ anxiety spikes this week — this is a recurring pattern that needs attention.',
          importance_score: 9,
          created_at: new Date().toISOString(),
          last_referenced_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error('checkAnxietyPattern insert error:', insertError)
        }
      }
    } catch (err) {
      console.error('checkAnxietyPattern unexpected error:', err)
    }
  })()
}

// ---------------------------------------------------------------------------
// Trigger memory extraction (async, non-blocking)
// ---------------------------------------------------------------------------

function triggerMemoryExtraction(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
  text: string
): void {
  // Fire-and-forget — do not await
  fetch(`${supabaseUrl}/functions/v1/extract-memories`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, text, source: 'evening_debrief' }),
  }).catch((err) => {
    console.error('triggerMemoryExtraction failed:', err)
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

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  // ── Mode: q2_insight ────────────────────────────────────────────────────────
  // Called from debriefService.getQ2Insight mid-flow to get a quick insight
  // on the user's Q2 obstacle before the full debrief is submitted.
  if (body.action === 'q2_insight') {
    const { userId, obstacle } = body as { userId?: string; obstacle?: string }

    if (!userId || !obstacle) {
      return json({ error: 'Missing userId or obstacle' }, 400)
    }

    if (!validateMinWordCount(obstacle as string, 10)) {
      return json({ error: 'Q2 obstacle must be at least 10 words' }, 400)
    }

    const fallbackInsight = "Obstacles are information. What this one is telling you matters."

    if (!openaiKey) {
      return json({ insight: fallbackInsight }, 200)
    }

    const insightPrompt = `The user described their obstacle today: "${obstacle}". Give one sharp insight about what this obstacle reveals. 1 sentence, max 40 tokens. Be specific, not generic.`
    const insight = await callOpenAI(REX_SYSTEM_PROMPT, insightPrompt, 40, openaiKey)

    return json({ insight: insight ?? fallbackInsight }, 200)
  }

  // ── Mode: full debrief submission ───────────────────────────────────────────
  const { userId, debriefData } = body as { userId?: string; debriefData?: DebriefFlowState }

  if (!userId || !debriefData) {
    return json({ error: 'Missing required fields: userId, debriefData' }, 400)
  }

  const { q1Answer, q1Detail, q2Obstacle, q3Note } = debriefData

  if (!q1Answer || !q2Obstacle) {
    return json({ error: 'Missing q1Answer or q2Obstacle' }, 400)
  }

  // ── 1. Validate Q2 obstacle has ≥ 10 words (Requirement 17.5) ──────────────
  if (!validateMinWordCount(q2Obstacle, 10)) {
    return json({ error: 'Q2 obstacle must be at least 10 words' }, 400)
  }

  const today = new Date().toISOString().split('T')[0]

  // ── 2. Generate Q2 insight (Requirement 17.6) ──────────────────────────────
  const fallbackInsight = "Obstacles are information. What this one is telling you matters."
  let q2InsightText = fallbackInsight

  if (openaiKey) {
    const insightPrompt = `The user described their obstacle today: "${q2Obstacle}". Give one sharp insight about what this obstacle reveals. 1 sentence, max 40 tokens. Be specific, not generic.`
    const aiInsight = await callOpenAI(REX_SYSTEM_PROMPT, insightPrompt, 40, openaiKey)
    if (aiInsight) {
      q2InsightText = aiInsight
    }
  }

  // ── 3. Generate closing verdict (Requirement 17.9) ─────────────────────────
  const fallbackVerdict = "You showed up and reflected. That's already more than most. Tomorrow, take what you learned today and act on it."
  let rexVerdict = fallbackVerdict

  if (openaiKey) {
    const q1Label =
      q1Answer === 'yes_crushed_it'
        ? 'crushed their daily focus'
        : q1Answer === 'partially'
        ? 'partially completed their daily focus'
        : 'did not complete their daily focus'

    const verdictPrompt = `Evening debrief summary:
- Daily focus: ${q1Label}
- Detail: ${q1Detail || 'none provided'}
- Obstacle today: ${q2Obstacle}
- Note for tomorrow: ${q3Note || 'none'}

Give Rex's closing verdict for this day. 2 sentences, max 60 tokens. Be honest, specific, forward-looking. Reference their actual obstacle and outcome.`

    const aiVerdict = await callOpenAI(REX_SYSTEM_PROMPT, verdictPrompt, 60, openaiKey)
    if (aiVerdict) {
      rexVerdict = aiVerdict
    }
  }

  // ── 4. Insert into evening_debriefs (Requirement 16.6) ─────────────────────
  const { data: insertedDebrief, error: insertError } = await supabase
    .from('evening_debriefs')
    .insert({
      user_id: userId,
      date: today,
      q1_answer: q1Answer,
      q1_detail: q1Detail ?? '',
      q2_obstacle: q2Obstacle,
      q3_note: q3Note || null,
      rex_verdict: rexVerdict,
      xp_earned: XP_DEBRIEF,
    })
    .select()
    .single()

  if (insertError) {
    console.error('evening_debriefs insert error:', insertError)
    return json({ error: 'Failed to save debrief' }, 500)
  }

  const debrief = insertedDebrief as any

  // ── 5. Trigger memory extraction async (Requirement 14.1) ──────────────────
  const memoryText = [q2Obstacle, q3Note].filter(Boolean).join('\n')
  if (memoryText.trim()) {
    triggerMemoryExtraction(supabaseUrl, serviceRoleKey, userId, memoryText)
  }

  // ── 6. Award 20 XP (Requirement 16.5) ──────────────────────────────────────
  await awardXP(supabase, userId, XP_DEBRIEF, 'evening_debrief')

  // ── 7. Update streak (Requirement 16.5) ────────────────────────────────────
  await updateStreak(supabase, userId)

  // ── 8. Check anxiety SOS pattern for the week (Requirements 7.6, 14.3) ────
  // Non-blocking: if count >= 3, insert a rex_memory 'pattern' entry
  checkAnxietyPatternAndStore(supabase, userId)

  // ── 9. Return completed EveningDebrief ─────────────────────────────────────
  const result: EveningDebrief = {
    id: debrief.id,
    userId: debrief.user_id,
    date: debrief.date,
    q1Answer: debrief.q1_answer,
    q1Detail: debrief.q1_detail,
    q2Obstacle: debrief.q2_obstacle,
    q3Note: debrief.q3_note,
    rexVerdict: debrief.rex_verdict,
    xpEarned: debrief.xp_earned,
  }

  return json(result, 200)
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
