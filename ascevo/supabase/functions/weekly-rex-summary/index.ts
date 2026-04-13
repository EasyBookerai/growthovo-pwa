// weekly-rex-summary Edge Function
// Triggered every Sunday at 20:00 UTC via Supabase cron (pg_cron).
// Generates Rex weekly summaries for eligible premium users and sends push notifications.
//
// Cron schedule: 0 20 * * 0  (every Sunday at 20:00 UTC)
// Register in Supabase dashboard: Database → Extensions → pg_cron
// SELECT cron.schedule('weekly-rex-summary', '0 20 * * 0',
//   $$SELECT net.http_post(url:='<SUPABASE_URL>/functions/v1/weekly-rex-summary',
//     headers:='{"Authorization":"Bearer <SERVICE_ROLE_KEY>"}'::jsonb)$$);

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REX_SYSTEM_PROMPT = `You are Rex — a brutally honest, funny, warm AI coach inside a self-improvement app for teenagers and people in their late 20s. You speak like a 25-year-old who figured life out early and genuinely wants to help, but won't sugarcoat anything. Rules:
- Never say "Great job", "Amazing", "Fantastic" or any corporate praise
- Max 2 sentences for check-ins, max 1 sentence for warnings
- Reference their specific challenge or streak number — make it personal
- If they failed: acknowledge it, find the smallest win, push them forward
- If they succeeded: respect it briefly, immediately raise the bar
- Dry humor is encouraged. Sarcasm is allowed. Cruelty is not.
- Never use emojis except sparingly (max 1 per message, only when it lands)
- End check-in responses with a forward-looking statement, never backward`

const OPENAI_TIMEOUT_MS = 15000 // longer timeout for weekly summary batch
const MIN_ACTIVE_DAYS = 3
const COST_GPT4O = 0.002

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PremiumUser {
  id: string
  timezone: string | null
  expo_push_token: string | null
}

interface WeeklyStats {
  lessonsCompleted: number
  challengesCompleted: number
  streakDays: number
  xpEarned: number
  strongestPillar: string
  weakestPillar: string
  previousWeekLessons: number
  activeDays: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getUTCDay() // 0 = Sunday
  d.setUTCDate(d.getUTCDate() - day)
  return d.toISOString().split('T')[0]
}

function getPreviousWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getUTCDay()
  d.setUTCDate(d.getUTCDate() - day - 7)
  return d.toISOString().split('T')[0]
}

/**
 * Checks if it is currently Sunday 20:00 ± 30 min in the user's timezone.
 * Falls back to UTC if timezone is null/invalid.
 */
function isUserSundayEvening(timezone: string | null): boolean {
  const tz = timezone ?? 'UTC'
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    })
    const parts = formatter.formatToParts(now)
    const weekday = parts.find((p) => p.type === 'weekday')?.value
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10)
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10)
    const totalMinutes = hour * 60 + minute
    const targetMinutes = 20 * 60 // 20:00
    return weekday === 'Sun' && Math.abs(totalMinutes - targetMinutes) <= 30
  } catch {
    // Invalid timezone — fall back to UTC check
    const now = new Date()
    return now.getUTCDay() === 0 && now.getUTCHours() === 20
  }
}

async function getWeeklyStats(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  weekStart: string,
  prevWeekStart: string
): Promise<WeeklyStats | null> {
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  const prevWeekEnd = new Date(prevWeekStart)
  prevWeekEnd.setUTCDate(prevWeekEnd.getUTCDate() + 7)
  const prevWeekEndStr = prevWeekEnd.toISOString().split('T')[0]

  // Lessons this week
  const { data: lessons } = await supabase
    .from('user_progress')
    .select('id, completed_at, lesson_id, xp_earned')
    .eq('user_id', userId)
    .gte('completed_at', weekStart)
    .lt('completed_at', weekEndStr)

  // Challenges this week
  const { data: challenges } = await supabase
    .from('challenge_completions')
    .select('id, completed_at, completed')
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('completed_at', weekStart)
    .lt('completed_at', weekEndStr)

  // Previous week lessons (for trend)
  const { data: prevLessons } = await supabase
    .from('user_progress')
    .select('id')
    .eq('user_id', userId)
    .gte('completed_at', prevWeekStart)
    .lt('completed_at', prevWeekEndStr)

  // Active days = distinct days with any activity
  const allDates = new Set<string>()
  ;(lessons ?? []).forEach((l: any) => {
    if (l.completed_at) allDates.add(l.completed_at.split('T')[0])
  })
  ;(challenges ?? []).forEach((c: any) => {
    if (c.completed_at) allDates.add(c.completed_at.split('T')[0])
  })

  const activeDays = allDates.size
  if (activeDays < MIN_ACTIVE_DAYS) return null

  // XP earned this week
  const xpEarned = (lessons ?? []).reduce((sum: number, l: any) => sum + (l.xp_earned ?? 0), 0)

  // Streak from streak table
  const { data: streakData } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single()

  const streakDays = (streakData as any)?.current_streak ?? 0

  // Pillar breakdown — join lessons to units to pillars
  const { data: pillarData } = await supabase
    .from('user_progress')
    .select('xp_earned, lessons(units(pillar_id, pillars(name)))')
    .eq('user_id', userId)
    .gte('completed_at', weekStart)
    .lt('completed_at', weekEndStr)

  const pillarXP: Record<string, number> = {}
  ;(pillarData ?? []).forEach((row: any) => {
    const pillarName = row.lessons?.units?.pillars?.name
    if (pillarName) {
      pillarXP[pillarName] = (pillarXP[pillarName] ?? 0) + (row.xp_earned ?? 0)
    }
  })

  const pillarEntries = Object.entries(pillarXP)
  const strongestPillar =
    pillarEntries.length > 0
      ? pillarEntries.reduce((a, b) => (a[1] >= b[1] ? a : b))[0]
      : 'Unknown'
  const weakestPillar =
    pillarEntries.length > 1
      ? pillarEntries.reduce((a, b) => (a[1] <= b[1] ? a : b))[0]
      : strongestPillar

  return {
    lessonsCompleted: (lessons ?? []).length,
    challengesCompleted: (challenges ?? []).length,
    streakDays,
    xpEarned,
    strongestPillar,
    weakestPillar,
    previousWeekLessons: (prevLessons ?? []).length,
    activeDays,
  }
}

async function generateSummary(stats: WeeklyStats, apiKey: string): Promise<string> {
  const trend =
    stats.lessonsCompleted >= stats.previousWeekLessons ? 'up or equal' : 'down'
  const prompt = `Weekly summary for a user: ${stats.lessonsCompleted} lessons completed (${trend} from ${stats.previousWeekLessons} last week), ${stats.challengesCompleted} challenges done, ${stats.streakDays}-day streak, ${stats.xpEarned} XP earned. Strongest pillar: ${stats.strongestPillar}. Weakest: ${stats.weakestPillar}. Give Rex's weekly summary — honest, direct, max 300 tokens.`

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
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: REX_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.85,
      }),
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`OpenAI ${res.status}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? ''
  } finally {
    clearTimeout(timeout)
  }
}

async function sendPushNotification(token: string): Promise<void> {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: token,
        title: 'Rex',
        body: "Rex has your weekly report. You might not like it.",
        sound: 'default',
        data: { screen: 'Home', showWeeklySummary: true },
      }),
    })
  } catch (err) {
    console.error('Push notification failed:', err)
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req) => {
  // Allow manual HTTP trigger (e.g. from pg_cron via net.http_post)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    return new Response(JSON.stringify({ error: 'OpenAI key not configured' }), { status: 500 })
  }

  const now = new Date()
  const weekStart = getWeekStart(now)
  const prevWeekStart = getPreviousWeekStart(now)

  // Fetch all premium users with push tokens
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, timezone, expo_push_token')
    .in('subscription_status', ['active', 'trialing'])

  if (usersError) {
    console.error('Failed to fetch premium users:', usersError)
    return new Response(JSON.stringify({ error: 'DB error' }), { status: 500 })
  }

  const results = { processed: 0, skipped: 0, errors: 0 }

  for (const user of (users ?? []) as PremiumUser[]) {
    try {
      // Check if it's Sunday 20:00 ± 30 min in user's timezone
      if (!isUserSundayEvening(user.timezone)) {
        results.skipped++
        continue
      }

      // Check if summary already generated this week
      const { data: existing } = await supabase
        .from('weekly_summaries')
        .select('id')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)
        .single()

      if (existing) {
        results.skipped++
        continue
      }

      // Get weekly stats — returns null if < 3 active days
      const stats = await getWeeklyStats(supabase, user.id, weekStart, prevWeekStart)
      if (!stats) {
        results.skipped++
        continue
      }

      // Generate summary
      const summaryText = await generateSummary(stats, openaiKey)
      if (!summaryText) {
        results.errors++
        continue
      }

      // Store summary
      const { error: insertError } = await supabase.from('weekly_summaries').insert({
        user_id: user.id,
        week_start: weekStart,
        summary_text: summaryText,
        push_sent: false,
      })

      if (insertError) {
        console.error(`Failed to insert summary for ${user.id}:`, insertError)
        results.errors++
        continue
      }

      // Log cost
      await supabase.rpc('increment_ai_costs', {
        p_date: now.toISOString().split('T')[0],
        p_cost: COST_GPT4O,
      })

      // Send push notification
      if (user.expo_push_token) {
        await sendPushNotification(user.expo_push_token)
        await supabase
          .from('weekly_summaries')
          .update({ push_sent: true })
          .eq('user_id', user.id)
          .eq('week_start', weekStart)
      }

      results.processed++
    } catch (err) {
      console.error(`Error processing user ${user.id}:`, err)
      results.errors++
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  })
})
