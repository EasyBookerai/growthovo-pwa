// generate-weekly-report Edge Function
// Generates (or returns cached) the Weekly Rex Report for a given user and week.
// Idempotent: if a report already exists for (user_id, week_start), returns it immediately.
//
// Logic:
//   1. Check weekly_rex_reports for existing record — return cached if found
//   2. Aggregate WeeklyReportNumbers from all relevant tables
//   3. Fetch context: last 7 evening debriefs (Q2+Q3), SOS events, morning states
//   4. Call gpt-4o for Pattern Analysis (3 observations, max 200 tokens)
//   5. Call gpt-4o for The Verdict (1 paragraph, max 150 tokens)
//   6. Call gpt-4o for Next Week's Focus (JSON, max 100 tokens)
//   7. Call OpenAI TTS (tts-1-hd, voice onyx) with verdict text → upload to Storage
//   8. Insert into weekly_rex_reports
//   9. Return the complete report
//
// Requirements: 22.1, 22.4, 22.5, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 24.1, 24.2

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
- End every response with forward momentum, never backward
You are not a therapist. You are not a friend who agrees with everything. You are the coach they need, not the one they want.`

// ---------------------------------------------------------------------------
// Fallback content
// ---------------------------------------------------------------------------

const FALLBACK_PATTERN_ANALYSIS =
  "You tend to start the week strong and fade by Thursday. Your energy isn't the problem — your pacing is. Front-load the hard stuff on Monday.\n" +
  "Your SOS usage spikes mid-week, which tells me Wednesday is your pressure point. Build a buffer into Tuesday evening so Wednesday doesn't catch you off guard.\n" +
  "Evening debriefs are your weakest habit. You skip them when you're tired — which is exactly when you need them most. Set a 60-second minimum and stick to it."

const FALLBACK_VERDICT =
  "You showed up more than most. That's not nothing — but you know there's a gap between showing up and actually pushing. Close it this week."

const FALLBACK_NEXT_WEEK_FOCUS = {
  pillar: 'discipline',
  habit: 'Complete your daily challenge before noon',
  challengeToDoDifferently: 'Stop negotiating with yourself in the morning — decide the night before',
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SOSType =
  | 'anxiety_spike'
  | 'about_to_react'
  | 'zero_motivation'
  | 'hard_conversation'
  | 'habit_urge'
  | 'overwhelmed'

interface WeeklyReportNumbers {
  lessonsCompleted: number
  challengesDone: number
  challengesMissed: number
  sosByType: Record<SOSType, number>
  morningCheckinStreak: number
  eveningDebriefRate: number
  xpEarned: number
}

interface NextWeekFocus {
  pillar: string
  habit: string
  challengeToDoDifferently: string
}

interface WeeklyRexReport {
  id: string
  userId: string
  weekStart: string
  numbersJson: WeeklyReportNumbers
  patternAnalysis: string
  verdictText: string
  audioUrl: string | null
  nextWeekFocusJson: NextWeekFocus
  createdAt: string
}

// ---------------------------------------------------------------------------
// OpenAI helper with 10-second timeout
// ---------------------------------------------------------------------------

async function callOpenAI(
  prompt: string,
  maxTokens: number,
  apiKey: string,
  responseFormat?: 'json'
): Promise<string | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS)

  try {
    const body: Record<string, unknown> = {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: REX_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.85,
    }

    if (responseFormat === 'json') {
      body.response_format = { type: 'json_object' }
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) {
      console.error(`OpenAI error ${res.status}: ${await res.text()}`)
      return null
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('OpenAI call timed out after 10s')
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

function buildPatternAnalysisPrompt(
  numbers: WeeklyReportNumbers,
  debriefContext: string,
  sosContext: string,
  morningStatesContext: string
): string {
  return `Weekly data for a user:
- Lessons completed: ${numbers.lessonsCompleted}
- Challenges done: ${numbers.challengesDone}, missed: ${numbers.challengesMissed}
- XP earned: ${numbers.xpEarned}
- Morning check-in streak: ${numbers.morningCheckinStreak} days
- Evening debrief rate: ${Math.round(numbers.eveningDebriefRate * 100)}%
- SOS events: ${JSON.stringify(numbers.sosByType)}

Evening debrief context (last 7 days, Q2 obstacles + Q3 notes):
${debriefContext || 'No debrief data available.'}

SOS events this week:
${sosContext || 'No SOS events this week.'}

Morning states this week:
${morningStatesContext || 'No morning state data.'}

Generate Rex's Pattern Analysis: exactly 3 observations about this user's week, each on a new line. Be specific, reference the actual data. No bullet points or numbering — just 3 plain sentences separated by newlines. Max 200 tokens total.`
}

function buildVerdictPrompt(
  numbers: WeeklyReportNumbers,
  patternAnalysis: string
): string {
  return `Based on this user's week:
- ${numbers.challengesDone} challenges done, ${numbers.challengesMissed} missed
- ${numbers.lessonsCompleted} lessons, ${numbers.xpEarned} XP
- ${Math.round(numbers.eveningDebriefRate * 100)}% evening debrief rate
- Morning streak: ${numbers.morningCheckinStreak} days

Pattern analysis: ${patternAnalysis}

Write Rex's Verdict: 1 paragraph (3-4 sentences), brutally honest, warm, specific to this data. This is the main message they'll hear in audio. Make it land. Max 150 tokens.`
}

function buildNextWeekFocusPrompt(
  numbers: WeeklyReportNumbers,
  patternAnalysis: string
): string {
  return `Based on this user's week performance and patterns:
${patternAnalysis}

Challenges done: ${numbers.challengesDone}, missed: ${numbers.challengesMissed}
SOS events: ${JSON.stringify(numbers.sosByType)}

Generate Next Week's Focus as a JSON object with exactly these fields:
- "pillar": the one pillar they should focus on (mind/discipline/communication/money/career/relationships)
- "habit": one specific daily habit to build (1 sentence)
- "challengeToDoDifferently": one thing to change from this week (1 sentence)

Return only valid JSON. Max 100 tokens.`
}

// ---------------------------------------------------------------------------
// Data aggregation
// ---------------------------------------------------------------------------

function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + 6)
  return d.toISOString().split('T')[0]
}

function buildSOSByType(rows: Array<{ type: string }>): Record<SOSType, number> {
  const allTypes: SOSType[] = [
    'anxiety_spike',
    'about_to_react',
    'zero_motivation',
    'hard_conversation',
    'habit_urge',
    'overwhelmed',
  ]
  const counts = Object.fromEntries(allTypes.map((t) => [t, 0])) as Record<SOSType, number>
  for (const row of rows) {
    if (row.type in counts) {
      counts[row.type as SOSType]++
    }
  }
  return counts
}

function calcMorningCheckinStreak(
  checkins: Array<{ date: string; briefing_viewed_at: string | null }>
): number {
  const sorted = [...checkins].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  let streak = 0
  for (const c of sorted) {
    if (c.briefing_viewed_at) {
      streak++
    } else {
      break
    }
  }
  return streak
}

async function aggregateWeeklyNumbers(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  weekStart: string
): Promise<WeeklyReportNumbers> {
  const weekEnd = getWeekEnd(weekStart)

  const [debriefResult, sosResult, checkinResult, xpResult, challengeResult, lessonXpResult] =
    await Promise.all([
      supabase
        .from('evening_debriefs')
        .select('id')
        .eq('user_id', userId)
        .gte('date', weekStart)
        .lte('date', weekEnd),

      supabase
        .from('sos_events')
        .select('type')
        .eq('user_id', userId)
        .gte('timestamp', `${weekStart}T00:00:00Z`)
        .lte('timestamp', `${weekEnd}T23:59:59Z`),

      supabase
        .from('daily_checkins')
        .select('date, briefing_viewed_at')
        .eq('user_id', userId)
        .gte('date', weekStart)
        .lte('date', weekEnd)
        .order('date', { ascending: true }),

      supabase
        .from('xp_transactions')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', `${weekStart}T00:00:00Z`)
        .lte('created_at', `${weekEnd}T23:59:59Z`),

      supabase
        .from('challenge_completions')
        .select('id, completed')
        .eq('user_id', userId)
        .gte('completed_at', `${weekStart}T00:00:00Z`)
        .lte('completed_at', `${weekEnd}T23:59:59Z`),

      supabase
        .from('xp_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('source', 'lesson')
        .gte('created_at', `${weekStart}T00:00:00Z`)
        .lte('created_at', `${weekEnd}T23:59:59Z`),
    ])

  const allChallenges = (challengeResult.data ?? []) as Array<{ completed: boolean }>
  const challengesDone = allChallenges.filter((c) => c.completed).length
  const challengesMissed = allChallenges.filter((c) => !c.completed).length

  const sosByType = buildSOSByType((sosResult.data ?? []) as Array<{ type: string }>)

  const checkins = (checkinResult.data ?? []) as Array<{
    date: string
    briefing_viewed_at: string | null
  }>
  const morningCheckinStreak = calcMorningCheckinStreak(checkins)

  const debriefCount = debriefResult.data?.length ?? 0
  const eveningDebriefRate = Math.min(debriefCount / 7, 1.0)

  const xpEarned = ((xpResult.data ?? []) as Array<{ amount: number }>).reduce(
    (sum, row) => sum + (row.amount ?? 0),
    0
  )

  const lessonsCompleted = lessonXpResult.data?.length ?? 0

  return {
    lessonsCompleted,
    challengesDone,
    challengesMissed,
    sosByType,
    morningCheckinStreak,
    eveningDebriefRate,
    xpEarned,
  }
}

// ---------------------------------------------------------------------------
// Context fetching
// ---------------------------------------------------------------------------

async function fetchDebriefContext(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  weekStart: string
): Promise<string> {
  const weekEnd = getWeekEnd(weekStart)

  const { data } = await supabase
    .from('evening_debriefs')
    .select('date, q2_obstacle, q3_note')
    .eq('user_id', userId)
    .gte('date', weekStart)
    .lte('date', weekEnd)
    .order('date', { ascending: true })
    .limit(7)

  if (!data || data.length === 0) return ''

  return (data as Array<{ date: string; q2_obstacle: string; q3_note: string | null }>)
    .map((d) => {
      const q2 = d.q2_obstacle ? `Obstacle: ${d.q2_obstacle}` : ''
      const q3 = d.q3_note ? `Note: ${d.q3_note}` : ''
      return [q2, q3].filter(Boolean).join(' | ')
    })
    .filter(Boolean)
    .join('\n')
}

async function fetchSOSContext(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  weekStart: string
): Promise<string> {
  const weekEnd = getWeekEnd(weekStart)

  const { data } = await supabase
    .from('sos_events')
    .select('type, outcome, notes')
    .eq('user_id', userId)
    .gte('timestamp', `${weekStart}T00:00:00Z`)
    .lte('timestamp', `${weekEnd}T23:59:59Z`)
    .order('timestamp', { ascending: true })

  if (!data || data.length === 0) return ''

  return (data as Array<{ type: string; outcome: string; notes: string | null }>)
    .map((e) => `${e.type} (${e.outcome})${e.notes ? ': ' + e.notes : ''}`)
    .join('\n')
}

async function fetchMorningStatesContext(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  weekStart: string
): Promise<string> {
  const weekEnd = getWeekEnd(weekStart)

  const { data } = await supabase
    .from('daily_checkins')
    .select('date, morning_state')
    .eq('user_id', userId)
    .gte('date', weekStart)
    .lte('date', weekEnd)
    .order('date', { ascending: true })

  if (!data || data.length === 0) return ''

  return (data as Array<{ date: string; morning_state: string | null }>)
    .filter((c) => c.morning_state)
    .map((c) => `${c.date}: ${c.morning_state}`)
    .join(', ')
}

// ---------------------------------------------------------------------------
// TTS audio generation
// ---------------------------------------------------------------------------

async function generateVerdictAudio(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  weekStart: string,
  verdictText: string,
  apiKey: string
): Promise<string | null> {
  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        voice: 'onyx',
        input: verdictText,
      }),
    })

    if (!res.ok) {
      console.error(`TTS error ${res.status}: ${await res.text()}`)
      return null
    }

    const audioBuffer = await res.arrayBuffer()
    const path = `weekly_reports/${userId}/${weekStart}/verdict.mp3`

    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(path, audioBuffer, { contentType: 'audio/mpeg', upsert: true })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return null
    }

    const { data: urlData } = supabase.storage.from('audio').getPublicUrl(path)
    return urlData.publicUrl
  } catch (err) {
    console.error('TTS generation failed:', err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Row mapper
// ---------------------------------------------------------------------------

function mapRowToReport(row: Record<string, unknown>): WeeklyRexReport {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    weekStart: row.week_start as string,
    numbersJson: (row.numbers_json ?? {}) as WeeklyReportNumbers,
    patternAnalysis: (row.pattern_analysis ?? '') as string,
    verdictText: (row.verdict_text ?? '') as string,
    audioUrl: (row.audio_url ?? null) as string | null,
    nextWeekFocusJson: (row.next_week_focus_json ?? FALLBACK_NEXT_WEEK_FOCUS) as NextWeekFocus,
    createdAt: row.created_at as string,
  }
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

  let body: { userId: string; weekStart: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { userId, weekStart } = body
  if (!userId || !weekStart) {
    return json({ error: 'Missing userId or weekStart' }, 400)
  }

  // ── 1. Idempotency check — return cached report if it exists ──────────────
  const { data: existing } = await supabase
    .from('weekly_rex_reports')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .single()

  if (existing) {
    return json(mapRowToReport(existing as Record<string, unknown>), 200)
  }

  // ── 2. Aggregate WeeklyReportNumbers ──────────────────────────────────────
  const numbers = await aggregateWeeklyNumbers(supabase, userId, weekStart)

  // ── 3. Fetch context for AI calls ─────────────────────────────────────────
  const [debriefContext, sosContext, morningStatesContext] = await Promise.all([
    fetchDebriefContext(supabase, userId, weekStart),
    fetchSOSContext(supabase, userId, weekStart),
    fetchMorningStatesContext(supabase, userId, weekStart),
  ])

  // ── 4. Call gpt-4o for Pattern Analysis (max 200 tokens, 10s timeout) ─────
  let patternAnalysis = FALLBACK_PATTERN_ANALYSIS

  if (openaiKey) {
    const patternPrompt = buildPatternAnalysisPrompt(
      numbers,
      debriefContext,
      sosContext,
      morningStatesContext
    )
    const aiPattern = await callOpenAI(patternPrompt, 200, openaiKey)
    if (aiPattern) {
      patternAnalysis = aiPattern
    }
  }

  // ── 5. Call gpt-4o for The Verdict (max 150 tokens, 10s timeout) ──────────
  let verdictText = FALLBACK_VERDICT

  if (openaiKey) {
    const verdictPrompt = buildVerdictPrompt(numbers, patternAnalysis)
    const aiVerdict = await callOpenAI(verdictPrompt, 150, openaiKey)
    if (aiVerdict) {
      verdictText = aiVerdict
    }
  }

  // ── 6. Call gpt-4o for Next Week's Focus (max 100 tokens, JSON) ───────────
  let nextWeekFocusJson: NextWeekFocus = FALLBACK_NEXT_WEEK_FOCUS

  if (openaiKey) {
    const focusPrompt = buildNextWeekFocusPrompt(numbers, patternAnalysis)
    const aiFocus = await callOpenAI(focusPrompt, 100, openaiKey, 'json')
    if (aiFocus) {
      try {
        const parsed = JSON.parse(aiFocus)
        if (parsed.pillar && parsed.habit && (parsed.challengeToDoDifferently || parsed.challengeToDodifferently)) {
          nextWeekFocusJson = {
            pillar: parsed.pillar,
            habit: parsed.habit,
            challengeToDoDifferently: parsed.challengeToDoDifferently ?? parsed.challengeToDodifferently,
          }
        }
      } catch {
        console.warn('Failed to parse Next Week Focus JSON, using fallback')
      }
    }
  }

  // ── 7. Generate TTS audio for verdict ─────────────────────────────────────
  let audioUrl: string | null = null

  if (openaiKey) {
    audioUrl = await generateVerdictAudio(supabase, userId, weekStart, verdictText, openaiKey)
  }

  // ── 8. Insert into weekly_rex_reports ─────────────────────────────────────
  const { data: inserted, error: insertError } = await supabase
    .from('weekly_rex_reports')
    .insert({
      user_id: userId,
      week_start: weekStart,
      numbers_json: numbers,
      pattern_analysis: patternAnalysis,
      verdict_text: verdictText,
      audio_url: audioUrl,
      next_week_focus_json: nextWeekFocusJson,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) {
    // Handle race condition: another request may have inserted concurrently
    if (insertError.code === '23505') {
      const { data: raceResult } = await supabase
        .from('weekly_rex_reports')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start', weekStart)
        .single()

      if (raceResult) {
        return json(mapRowToReport(raceResult as Record<string, unknown>), 200)
      }
    }
    console.error('Insert error:', insertError)
    return json({ error: 'Failed to save weekly report' }, 500)
  }

  // ── 9. Return the complete report ─────────────────────────────────────────
  return json(mapRowToReport(inserted as Record<string, unknown>), 200)
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
