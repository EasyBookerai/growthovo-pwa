// admin-ai-costs Edge Function
// GET /functions/v1/admin-ai-costs
// Returns weekly and monthly AI spend totals from ai_costs table.
// Protected by ADMIN_SECRET env var.
// Sends alert email if today's cost exceeds €50.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DAILY_ALERT_THRESHOLD_EUR = 50
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AiCostRow {
  date: string
  calls: number
  estimated_cost_eur: number
}

interface SpendSummary {
  calls: number
  estimated_cost_eur: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  // Auth check — must match ADMIN_SECRET env var
  const adminSecret = Deno.env.get('ADMIN_SECRET')
  const authHeader = req.headers.get('Authorization')

  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return json({ error: 'Unauthorized' }, 401)
  }

  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Weekly: last 7 days
  const weekAgo = new Date(today)
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  // Monthly: last 30 days
  const monthAgo = new Date(today)
  monthAgo.setUTCDate(monthAgo.getUTCDate() - 30)
  const monthAgoStr = monthAgo.toISOString().split('T')[0]

  const { data: rows, error } = await supabase
    .from('ai_costs')
    .select('date, calls, estimated_cost_eur')
    .gte('date', monthAgoStr)
    .order('date', { ascending: false })

  if (error) {
    console.error('ai_costs query failed:', error)
    return json({ error: 'Database error' }, 500)
  }

  const allRows = (rows ?? []) as AiCostRow[]

  // Aggregate weekly
  const weeklyRows = allRows.filter((r) => r.date >= weekAgoStr)
  const weekly: SpendSummary = weeklyRows.reduce(
    (acc, r) => ({
      calls: acc.calls + r.calls,
      estimated_cost_eur: acc.estimated_cost_eur + Number(r.estimated_cost_eur),
    }),
    { calls: 0, estimated_cost_eur: 0 }
  )

  // Aggregate monthly
  const monthly: SpendSummary = allRows.reduce(
    (acc, r) => ({
      calls: acc.calls + r.calls,
      estimated_cost_eur: acc.estimated_cost_eur + Number(r.estimated_cost_eur),
    }),
    { calls: 0, estimated_cost_eur: 0 }
  )

  // Round to 4 decimal places
  weekly.estimated_cost_eur = Math.round(weekly.estimated_cost_eur * 10000) / 10000
  monthly.estimated_cost_eur = Math.round(monthly.estimated_cost_eur * 10000) / 10000

  // Check daily alert threshold
  const todayRow = allRows.find((r) => r.date === todayStr)
  const todayCost = todayRow ? Number(todayRow.estimated_cost_eur) : 0

  if (todayCost > DAILY_ALERT_THRESHOLD_EUR) {
    await sendCostAlert(todayCost, todayStr)
  }

  return json(
    {
      weekly,
      monthly,
      daily_breakdown: allRows.map((r) => ({
        date: r.date,
        calls: r.calls,
        estimated_cost_eur: Math.round(Number(r.estimated_cost_eur) * 10000) / 10000,
      })),
      alert_threshold_eur: DAILY_ALERT_THRESHOLD_EUR,
      today_cost_eur: Math.round(todayCost * 10000) / 10000,
      alert_triggered: todayCost > DAILY_ALERT_THRESHOLD_EUR,
    },
    200
  )
})

async function sendCostAlert(cost: number, date: string): Promise<void> {
  const webhookUrl = Deno.env.get('COST_ALERT_WEBHOOK_URL')
  if (!webhookUrl) {
    console.warn(`[Rex] Daily cost alert: €${cost} on ${date} — no webhook configured`)
    return
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Rex AI cost alert: €${cost.toFixed(4)} spent on ${date} (threshold: €${DAILY_ALERT_THRESHOLD_EUR})`,
        date,
        cost_eur: cost,
        threshold_eur: DAILY_ALERT_THRESHOLD_EUR,
      }),
    })
  } catch (err) {
    console.error('Cost alert webhook failed:', err)
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
