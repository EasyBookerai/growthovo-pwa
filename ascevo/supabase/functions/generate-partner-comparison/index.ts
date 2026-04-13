// generate-partner-comparison Edge Function
// Triggered every Sunday at 20:00 UTC (via pg_cron or HTTP POST).
// For each active accountability_pairs row:
//   1. Aggregate week stats for both users (challenges, streak, SOS count)
//   2. Determine winner (challenges first, streak tiebreak)
//   3. Send push notifications to both users with comparison result
// Returns { processed: N }
//
// Requirements: 21.1, 21.2, 21.3

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PartnerWeekStats {
  userId: string
  name: string
  challengesCompleted: number
  currentStreak: number
  sosEventsCount: number
}

interface ComparisonResult {
  pairId: string
  weekStart: string
  userStats: PartnerWeekStats
  partnerStats: PartnerWeekStats
  winnerId: string
  notificationText: string
}

// ---------------------------------------------------------------------------
// Winner determination (mirrors partnerService.ts determineComparisonWinner)
// Requirements: 21.2
// ---------------------------------------------------------------------------

function determineWinner(
  userChallenges: number,
  partnerChallenges: number,
  userStreak: number,
  partnerStreak: number,
  userId: string,
  partnerId: string
): string {
  if (userChallenges !== partnerChallenges) {
    return userChallenges > partnerChallenges ? userId : partnerId
  }
  if (userStreak !== partnerStreak) {
    return userStreak > partnerStreak ? userId : partnerId
  }
  // Still tied — user wins by default
  return userId
}

// ---------------------------------------------------------------------------
// Expo push helper
// ---------------------------------------------------------------------------

async function sendExpoPush(
  token: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: token, title, body, data: data ?? {}, sound: 'default' }),
    })
  } catch (err) {
    console.error('Failed to send Expo push notification:', err)
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return json({ ok: true }, 200)
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // ── 1. Determine current week start (Monday) ──────────────────────────────
  const now = new Date()
  const dayOfWeek = now.getUTCDay() // 0 = Sunday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(now)
  weekStart.setUTCDate(now.getUTCDate() - daysToMonday)
  weekStart.setUTCHours(0, 0, 0, 0)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // ── 2. Fetch all active accountability pairs ──────────────────────────────
  const { data: pairs, error: pairsError } = await supabase
    .from('accountability_pairs')
    .select('id, user_id, partner_id')
    .eq('active', true)

  if (pairsError) {
    console.error('Failed to fetch pairs:', pairsError)
    return json({ error: 'Failed to fetch pairs' }, 500)
  }

  if (!pairs || pairs.length === 0) {
    return json({ processed: 0 }, 200)
  }

  // Collect all unique user IDs for batch queries
  const allUserIds = [...new Set(pairs.flatMap((p: any) => [p.user_id, p.partner_id]))]

  // ── 3. Batch fetch user names ─────────────────────────────────────────────
  const { data: users } = await supabase
    .from('users')
    .select('id, username, push_token')
    .in('id', allUserIds)

  const userMap: Record<string, { name: string; pushToken: string | null }> = {}
  for (const u of users ?? []) {
    userMap[(u as any).id] = {
      name: (u as any).username ?? 'User',
      pushToken: (u as any).push_token ?? null,
    }
  }

  // ── 4. Batch fetch challenge completions for the week ─────────────────────
  const { data: completions } = await supabase
    .from('challenge_completions')
    .select('user_id')
    .in('user_id', allUserIds)
    .eq('completed', true)
    .gte('completed_at', weekStartStr)

  const completionCounts: Record<string, number> = {}
  for (const uid of allUserIds) completionCounts[uid] = 0
  for (const c of completions ?? []) {
    const uid = (c as any).user_id
    if (completionCounts[uid] !== undefined) completionCounts[uid]++
  }

  // ── 5. Batch fetch current streaks ────────────────────────────────────────
  const { data: streaks } = await supabase
    .from('streaks')
    .select('user_id, current_streak')
    .in('user_id', allUserIds)

  const streakMap: Record<string, number> = {}
  for (const uid of allUserIds) streakMap[uid] = 0
  for (const s of streaks ?? []) {
    const uid = (s as any).user_id
    streakMap[uid] = (s as any).current_streak ?? 0
  }

  // ── 6. Batch fetch SOS event counts for the week ──────────────────────────
  const { data: sosEvents } = await supabase
    .from('sos_events')
    .select('user_id')
    .in('user_id', allUserIds)
    .gte('timestamp', weekStartStr)

  const sosCounts: Record<string, number> = {}
  for (const uid of allUserIds) sosCounts[uid] = 0
  for (const e of sosEvents ?? []) {
    const uid = (e as any).user_id
    if (sosCounts[uid] !== undefined) sosCounts[uid]++
  }

  // ── 7. Process each pair ──────────────────────────────────────────────────
  let processed = 0
  const results: ComparisonResult[] = []

  for (const pair of pairs) {
    const userId = (pair as any).user_id
    const partnerId = (pair as any).partner_id
    const pairId = (pair as any).id

    const userStats: PartnerWeekStats = {
      userId,
      name: userMap[userId]?.name ?? 'User',
      challengesCompleted: completionCounts[userId] ?? 0,
      currentStreak: streakMap[userId] ?? 0,
      sosEventsCount: sosCounts[userId] ?? 0,
    }

    const partnerStats: PartnerWeekStats = {
      userId: partnerId,
      name: userMap[partnerId]?.name ?? 'Partner',
      challengesCompleted: completionCounts[partnerId] ?? 0,
      currentStreak: streakMap[partnerId] ?? 0,
      sosEventsCount: sosCounts[partnerId] ?? 0,
    }

    const winnerId = determineWinner(
      userStats.challengesCompleted,
      partnerStats.challengesCompleted,
      userStats.currentStreak,
      partnerStats.currentStreak,
      userId,
      partnerId
    )

    const winnerName = winnerId === userId ? userStats.name : partnerStats.name

    const notificationText =
      `Week recap: ${userStats.name} ${userStats.challengesCompleted} challenges vs ` +
      `${partnerStats.name} ${partnerStats.challengesCompleted} challenges. ` +
      `${winnerName} wins this week.`

    results.push({
      pairId,
      weekStart: weekStartStr,
      userStats,
      partnerStats,
      winnerId,
      notificationText,
    })

    // ── 8. Send push notifications to both users ────────────────────────────
    const pushPromises: Promise<void>[] = []

    const userToken = userMap[userId]?.pushToken
    const partnerToken = userMap[partnerId]?.pushToken

    if (userToken) {
      const isUserWinner = winnerId === userId
      const userBody = isUserWinner
        ? `You won this week! ${userStats.challengesCompleted} challenges vs ${partnerStats.name}'s ${partnerStats.challengesCompleted}. Keep it up.`
        : `${winnerName} beat you this week. ${partnerStats.challengesCompleted} challenges vs your ${userStats.challengesCompleted}. Come back stronger.`

      pushPromises.push(
        sendExpoPush(userToken, 'Weekly Partner Recap', userBody, {
          type: 'partner_comparison',
          pairId,
          weekStart: weekStartStr,
          winnerId,
        })
      )
    }

    if (partnerToken) {
      const isPartnerWinner = winnerId === partnerId
      const partnerBody = isPartnerWinner
        ? `You won this week! ${partnerStats.challengesCompleted} challenges vs ${userStats.name}'s ${userStats.challengesCompleted}. Keep it up.`
        : `${winnerName} beat you this week. ${userStats.challengesCompleted} challenges vs your ${partnerStats.challengesCompleted}. Come back stronger.`

      pushPromises.push(
        sendExpoPush(partnerToken, 'Weekly Partner Recap', partnerBody, {
          type: 'partner_comparison',
          pairId,
          weekStart: weekStartStr,
          winnerId,
        })
      )
    }

    await Promise.allSettled(pushPromises)
    processed++
  }

  return json({ processed, weekStart: weekStartStr }, 200)
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
