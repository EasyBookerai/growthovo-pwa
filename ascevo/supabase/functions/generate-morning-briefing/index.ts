// generate-morning-briefing Edge Function
// Assembles the full MorningBriefingData for a given user:
//   - Rex's Daily Truth (gpt-4o-mini, day-of-week-aware, max 60 tokens)
//   - Today's Single Focus (gpt-4o-mini, weakest pillar, max 30 tokens)
//   - Streak, hearts, league position
//   - Partner check-in status
// Applies a 5-second timeout on each OpenAI call; returns fallback content on timeout.

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

const REX_SYSTEM_PROMPT = `You are Rex — the AI coach inside GROWTHOVO, a self-improvement app for teenagers and people in their late 20s. Your personality: Brutally honest, warm, never cruel. Speaks like a 25-year-old who figured life out early. Dry humor, high standards, genuine care. Never corporate, never preachy, never generic. Short sentences. Direct. No fluff. Never say 'Great job', 'Amazing', 'I understand how you feel'. Always reference the user's specific situation. Max 3 sentences per response unless asked for more.`

// ---------------------------------------------------------------------------
// Fallback content
// ---------------------------------------------------------------------------

const FALLBACK_TRUTHS: Record<number, string> = {
  0: "Sunday is the day most people waste. You're already ahead.",
  1: "Monday sets the tone. Don't negotiate with yourself today.",
  2: "The week is young. What you do today compounds.",
  3: "Midweek is where most people slow down. Speed up.",
  4: "The finish line is close. Don't ease up now.",
  5: "Look back at this week. What did you actually do?",
  6: "Saturday is for people who do the work when no one's watching.",
}

const FALLBACK_FOCUS = "Before noon: do the one task you've been avoiding."

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MorningBriefingData {
  rexDailyTruth: string
  todaysFocus: string
  streakCount: number
  heartsRemaining: number
  leaguePosition: number
  leaguePositionDelta: number
  streakMilestone: number | null
  partnerStatus: PartnerStatus | null
}

interface PartnerStatus {
  partnerName: string
  checkedIn: boolean
  partnerStreak: number
}

// ---------------------------------------------------------------------------
// OpenAI helper with 5-second timeout
// ---------------------------------------------------------------------------

async function callOpenAI(
  prompt: string,
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
          { role: 'system', content: REX_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.85,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      console.error(`OpenAI error ${res.status}`)
      return null
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('OpenAI call timed out after 5s')
    } else {
      console.error('OpenAI call failed:', err)
    }
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildDailyTruthPrompt(
  primaryPillar: string,
  lastObstacles: string[],
  streakCount: number,
  dayOfWeek: number,
  recentMorningStates: string[]
): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayName = dayNames[dayOfWeek]

  const dayInstruction =
    dayOfWeek === 1
      ? 'Today is Monday — deliver a harder push, no softness.'
      : dayOfWeek === 5
      ? 'Today is Friday — deliver a reflection prompt, make them look back at the week honestly.'
      : `Today is ${dayName}.`

  const obstaclesText =
    lastObstacles.length > 0
      ? `Their last reported obstacles: ${lastObstacles.join(' | ')}.`
      : 'No recent obstacle data available.'

  const statesText =
    recentMorningStates.length > 0
      ? `Recent morning states: ${recentMorningStates.join(', ')}.`
      : ''

  return `${dayInstruction} The user's primary pillar is ${primaryPillar}. They are on a ${streakCount}-day streak. ${obstaclesText} ${statesText} Generate Rex's Daily Truth: exactly 2 sentences, max 60 tokens. Never use generic phrases like "You've got this" or "Believe in yourself". Be specific to their situation.`
}

function buildSingleFocusPrompt(weakestPillar: string): string {
  return `The user's weakest pillar this week is ${weakestPillar} (lowest XP earned). Generate Today's Single Focus: exactly 1 specific, time-bound action for the ${weakestPillar} pillar. Must include a time constraint (e.g. "Before 2pm:", "Tonight:") and a specific observable behaviour. Max 30 tokens. No fluff.`
}

// ---------------------------------------------------------------------------
// Weakest pillar determination
// ---------------------------------------------------------------------------

async function getWeakestPillar(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  primaryPillar: string
): Promise<string> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('xp_transactions')
    .select('source, amount')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo)

  if (error || !data || data.length === 0) {
    return primaryPillar
  }

  // Group XP by pillar — source field contains pillar name or pillar-prefixed source
  const PILLARS = ['mind', 'discipline', 'communication', 'money', 'career', 'relationships']
  const xpByPillar: Record<string, number> = {}

  for (const pillar of PILLARS) {
    xpByPillar[pillar] = 0
  }

  for (const tx of data as Array<{ source: string; amount: number }>) {
    const source = tx.source?.toLowerCase() ?? ''
    for (const pillar of PILLARS) {
      if (source.includes(pillar)) {
        xpByPillar[pillar] += tx.amount
        break
      }
    }
  }

  // Find the pillar with minimum XP
  let weakest = primaryPillar
  let minXP = Infinity

  for (const [pillar, xp] of Object.entries(xpByPillar)) {
    if (xp < minXP) {
      minXP = xp
      weakest = pillar
    }
  }

  return weakest
}

// ---------------------------------------------------------------------------
// Streak milestone check
// ---------------------------------------------------------------------------

function getStreakMilestone(streak: number): number | null {
  const milestones = [7, 14, 30, 60, 90]
  return milestones.includes(streak) ? streak : null
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const openaiKey = Deno.env.get('OPENAI_API_KEY')

  let body: { userId: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { userId } = body
  if (!userId) {
    return json({ error: 'Missing userId' }, 400)
  }

  const today = new Date().toISOString().split('T')[0]
  const dayOfWeek = new Date().getDay() // 0=Sunday … 6=Saturday

  // ── 1. Fetch user profile (primary_pillar) ─────────────────────────────────
  const { data: userRow } = await supabase
    .from('users')
    .select('primary_pillar')
    .eq('id', userId)
    .single()

  const primaryPillar: string = (userRow as any)?.primary_pillar ?? 'discipline'

  // ── 2. Fetch last 3 evening debrief Q2 obstacle answers ───────────────────
  const { data: debriefs } = await supabase
    .from('evening_debriefs')
    .select('q2_obstacle')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(3)

  const lastObstacles: string[] = ((debriefs as any[]) ?? [])
    .map((d) => d.q2_obstacle)
    .filter(Boolean)

  // ── 3. Fetch current streak ────────────────────────────────────────────────
  const { data: streakRow } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single()

  const streakCount: number = (streakRow as any)?.current_streak ?? 0

  // ── 4. Fetch last 3 daily_checkins morning_state ──────────────────────────
  const { data: checkins } = await supabase
    .from('daily_checkins')
    .select('morning_state')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(3)

  const recentMorningStates: string[] = ((checkins as any[]) ?? [])
    .map((c) => c.morning_state)
    .filter(Boolean)

  // ── 5. Determine weakest pillar ────────────────────────────────────────────
  const weakestPillar = await getWeakestPillar(supabase, userId, primaryPillar)

  // ── 6. Fetch hearts ────────────────────────────────────────────────────────
  const { data: heartsRow } = await supabase
    .from('hearts')
    .select('count')
    .eq('user_id', userId)
    .single()

  const heartsRemaining: number = (heartsRow as any)?.count ?? 5

  // ── 7. Fetch league position ───────────────────────────────────────────────
  // Get the current active league for this user and their rank
  const { data: leagueMemberRow } = await supabase
    .from('league_members')
    .select('rank, weekly_xp, league_id')
    .eq('user_id', userId)
    .order('league_id', { ascending: false })
    .limit(1)
    .single()

  const leaguePosition: number = (leagueMemberRow as any)?.rank ?? 0

  // Compute leaguePositionDelta: compare today's rank vs yesterday's
  // We approximate by checking if rank improved vs the stored rank (no history table)
  // For now, delta is 0 unless we have a previous snapshot — return 0 as safe default
  const leaguePositionDelta = 0

  // ── 8. Fetch partner check-in status ──────────────────────────────────────
  let partnerStatus: PartnerStatus | null = null

  const { data: pairRow } = await supabase
    .from('accountability_pairs')
    .select('id, partner_id')
    .eq('user_id', userId)
    .eq('active', true)
    .single()

  if (pairRow) {
    const partnerId = (pairRow as any).partner_id

    // Get partner's username
    const { data: partnerUser } = await supabase
      .from('users')
      .select('username')
      .eq('id', partnerId)
      .single()

    // Check if partner has checked in today
    const { data: partnerCheckin } = await supabase
      .from('daily_checkins')
      .select('briefing_viewed_at')
      .eq('user_id', partnerId)
      .eq('date', today)
      .single()

    // Get partner's streak
    const { data: partnerStreak } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', partnerId)
      .single()

    partnerStatus = {
      partnerName: (partnerUser as any)?.username ?? 'Your partner',
      checkedIn: (partnerCheckin as any)?.briefing_viewed_at != null,
      partnerStreak: (partnerStreak as any)?.current_streak ?? 0,
    }
  }

  // ── 9. Generate Rex's Daily Truth (with 5s timeout fallback) ──────────────
  let rexDailyTruth: string = FALLBACK_TRUTHS[dayOfWeek] ?? FALLBACK_TRUTHS[0]

  if (openaiKey) {
    const truthPrompt = buildDailyTruthPrompt(
      primaryPillar,
      lastObstacles,
      streakCount,
      dayOfWeek,
      recentMorningStates
    )
    const aiTruth = await callOpenAI(truthPrompt, 60, openaiKey)
    if (aiTruth) {
      rexDailyTruth = aiTruth
    }
  }

  // ── 10. Generate Today's Single Focus (with 5s timeout fallback) ──────────
  let todaysFocus: string = FALLBACK_FOCUS

  if (openaiKey) {
    const focusPrompt = buildSingleFocusPrompt(weakestPillar)
    const aiFocus = await callOpenAI(focusPrompt, 30, openaiKey)
    if (aiFocus) {
      todaysFocus = aiFocus
    }
  }

  // ── 11. Assemble and return MorningBriefingData ────────────────────────────
  const briefingData: MorningBriefingData = {
    rexDailyTruth,
    todaysFocus,
    streakCount,
    heartsRemaining,
    leaguePosition,
    leaguePositionDelta,
    streakMilestone: getStreakMilestone(streakCount),
    partnerStatus,
  }

  return json(briefingData, 200)
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
