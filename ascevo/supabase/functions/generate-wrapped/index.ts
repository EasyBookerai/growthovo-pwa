// generate-wrapped Edge Function
// Generates (or returns cached) an GROWTHOVO Wrapped summary for a given user and period.
// Period format: "2025-01" for monthly, "2025" for yearly.
// Idempotent: if a summary already exists for (user_id, period), returns it immediately.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FALLBACK_VERDICT =
  "You showed up. That's more than most people manage. Now do it again next month."

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RequestBody {
  userId: string
  period: string // "2025-01" or "2025"
}

interface WrappedData {
  totalLessons: number
  totalChallenges: number
  longestStreak: number
  totalXp: number
  mostActiveDayOfWeek: string
  mostActiveTimeOfDay: string
  strongestPillar: string
  weakestPillar: string
  totalMinutesInApp: number
  leaguePromotions: number
  friendsInvited: number
  globalPercentileRank: number
}

// ---------------------------------------------------------------------------
// Period helpers
// ---------------------------------------------------------------------------

/**
 * Returns a date range [start, end] for the given period string.
 * "2025-01" → Jan 1 – Jan 31 2025
 * "2025"    → Jan 1 – Dec 31 2025
 */
function periodToDateRange(period: string): { start: string; end: string } {
  const isMonthly = /^\d{4}-\d{2}$/.test(period)
  if (isMonthly) {
    const [year, month] = period.split('-').map(Number)
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0) // last day of month
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  }
  // Yearly
  const year = parseInt(period, 10)
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  }
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { userId, period } = body
  if (!userId || !period) {
    return json({ error: 'Missing userId or period' }, 400)
  }

  // ── 1. Idempotency check ──────────────────────────────────────────────────
  const { data: existing } = await supabase
    .from('wrapped_summaries')
    .select('*')
    .eq('user_id', userId)
    .eq('period', period)
    .single()

  if (existing) {
    return json(mapSummary(existing), 200)
  }

  // ── 2. Compute date range ─────────────────────────────────────────────────
  const { start, end } = periodToDateRange(period)
  const startTs = `${start}T00:00:00.000Z`
  const endTs = `${end}T23:59:59.999Z`

  // ── 3. Aggregate data ─────────────────────────────────────────────────────

  // 3a. Total lessons completed in period
  const { count: totalLessons } = await supabase
    .from('user_progress')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('completed_at', startTs)
    .lte('completed_at', endTs)

  // 3b. Total challenges completed in period
  const { count: totalChallenges } = await supabase
    .from('challenge_completions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('completed_at', startTs)
    .lte('completed_at', endTs)

  // 3c. Longest streak
  const { data: streakRow } = await supabase
    .from('streaks')
    .select('longest_streak')
    .eq('user_id', userId)
    .single()
  const longestStreak: number = (streakRow as any)?.longest_streak ?? 0

  // 3d. Total XP earned in period
  const { data: xpRows } = await supabase
    .from('xp_transactions')
    .select('amount')
    .eq('user_id', userId)
    .gte('created_at', startTs)
    .lte('created_at', endTs)
  const totalXp = (xpRows ?? []).reduce((sum: number, r: any) => sum + (r.amount ?? 0), 0)

  // 3e. Strongest / weakest pillar from users table
  const { data: userRow } = await supabase
    .from('users')
    .select('primary_pillar, secondary_pillar')
    .eq('id', userId)
    .single()
  const strongestPillar: string = (userRow as any)?.primary_pillar ?? 'mind'
  const weakestPillar: string = (userRow as any)?.secondary_pillar ?? 'discipline'

  // 3f. Most active day of week — derived from user_progress completed_at timestamps
  const { data: progressRows } = await supabase
    .from('user_progress')
    .select('completed_at')
    .eq('user_id', userId)
    .gte('completed_at', startTs)
    .lte('completed_at', endTs)
    .not('completed_at', 'is', null)

  const dayCounts: Record<number, number> = {}
  const hourCounts: Record<number, number> = {}
  for (const row of progressRows ?? []) {
    const d = new Date((row as any).completed_at)
    dayCounts[d.getUTCDay()] = (dayCounts[d.getUTCDay()] ?? 0) + 1
    hourCounts[d.getUTCHours()] = (hourCounts[d.getUTCHours()] ?? 0) + 1
  }

  const mostActiveDayIndex = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const mostActiveDayOfWeek = mostActiveDayIndex !== undefined
    ? DAYS_OF_WEEK[parseInt(mostActiveDayIndex, 10)]
    : 'Monday'

  const mostActiveHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const mostActiveTimeOfDay = mostActiveHour !== undefined
    ? `${mostActiveHour.padStart(2, '0')}:00`
    : '09:00'

  // 3g. Placeholder fields (require additional tracking not yet in schema)
  const totalMinutesInApp = (totalLessons ?? 0) * 5 // rough estimate: 5 min per lesson
  const leaguePromotions = 0 // placeholder
  const friendsInvited = 0 // placeholder
  const globalPercentileRank = Math.floor(Math.random() * 40) + 10 // placeholder 10–50

  const dataJson: WrappedData = {
    totalLessons: totalLessons ?? 0,
    totalChallenges: totalChallenges ?? 0,
    longestStreak,
    totalXp,
    mostActiveDayOfWeek,
    mostActiveTimeOfDay,
    strongestPillar,
    weakestPillar,
    totalMinutesInApp,
    leaguePromotions,
    friendsInvited,
    globalPercentileRank,
  }

  // ── 4. Get Rex verdict via rex-response function ──────────────────────────
  let rexVerdict = FALLBACK_VERDICT
  try {
    const { data: rexData, error: rexError } = await supabase.functions.invoke('rex-response', {
      body: {
        type: 'weekly_summary',
        userId,
        subscriptionStatus: 'active',
        params: {
          userId,
          lessonsCompleted: dataJson.totalLessons,
          challengesCompleted: dataJson.totalChallenges,
          streakDays: dataJson.longestStreak,
          xpEarned: dataJson.totalXp,
          strongestPillar: dataJson.strongestPillar,
          weakestPillar: dataJson.weakestPillar,
          previousWeekLessons: 0,
        },
      },
    })
    if (!rexError && rexData?.message) {
      rexVerdict = rexData.message
    }
  } catch (err) {
    console.error('Rex verdict failed, using fallback:', err)
  }

  // ── 5. Upsert into wrapped_summaries ──────────────────────────────────────
  const { data: upserted, error: upsertError } = await supabase
    .from('wrapped_summaries')
    .upsert(
      {
        user_id: userId,
        period,
        data_json: dataJson,
        rex_verdict: rexVerdict,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,period' }
    )
    .select()
    .single()

  if (upsertError) {
    console.error('Upsert error:', upsertError)
    return json({ error: 'Failed to save wrapped summary' }, 500)
  }

  return json(mapSummary(upserted), 200)
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapSummary(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    period: row.period,
    dataJson: row.data_json,
    rexVerdict: row.rex_verdict,
    createdAt: row.created_at,
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
