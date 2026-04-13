// extract-memories Edge Function
// Accepts { userId, text, source }, calls gpt-4o-mini to extract up to 3
// memory-worthy facts, and inserts them into the rex_memory table.
// Requirements: 14.1, 14.4, 14.5

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MEMORY_CAP = 200
const OPENAI_TIMEOUT_MS = 10000

const EXTRACTION_SYSTEM_PROMPT =
  'Extract up to 3 memory-worthy facts from the following text. For each fact, classify it as one of: goal, struggle, win, pattern, promise, person. Assign an importance_score from 1-10. Return ONLY a JSON array: [{"memory_type": "...", "content": "...", "importance_score": N}]. Do not store trivial or duplicate information. If nothing is worth remembering, return [].'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MemoryType = 'goal' | 'struggle' | 'win' | 'pattern' | 'promise' | 'person'

interface ExtractedMemory {
  memory_type: MemoryType
  content: string
  importance_score: number
}

interface RequestBody {
  userId: string
  text: string
  source: string
}

// ---------------------------------------------------------------------------
// Memory helpers (inline — no import from rexMemoryService)
// ---------------------------------------------------------------------------

interface RawMemoryRow {
  id: string
  importance_score: number
  last_referenced_at: string
}

/**
 * If the user already has >= 200 memories, delete the one with the lowest
 * importance_score (oldest last_referenced_at as tiebreak) before inserting.
 */
async function pruneIfNeeded(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<void> {
  const { count, error: countError } = await supabase
    .from('rex_memory')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countError) {
    console.error('pruneIfNeeded count error:', countError)
    return
  }

  if ((count ?? 0) < MEMORY_CAP) return

  // Fetch all rows to find the one to evict
  const { data, error: fetchError } = await supabase
    .from('rex_memory')
    .select('id, importance_score, last_referenced_at')
    .eq('user_id', userId)

  if (fetchError || !data || data.length === 0) return

  const rows = data as RawMemoryRow[]
  const toEvict = rows.sort((a, b) => {
    if (a.importance_score !== b.importance_score) {
      return a.importance_score - b.importance_score // lowest first
    }
    return (
      new Date(a.last_referenced_at).getTime() -
      new Date(b.last_referenced_at).getTime() // oldest first
    )
  })[0]

  await supabase.from('rex_memory').delete().eq('id', toEvict.id)
}

/**
 * Prune if needed, then insert a single memory row.
 */
async function addMemory(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  memory: ExtractedMemory
): Promise<void> {
  await pruneIfNeeded(supabase, userId)

  const now = new Date().toISOString()
  const { error } = await supabase.from('rex_memory').insert({
    user_id: userId,
    memory_type: memory.memory_type,
    content: memory.content,
    importance_score: memory.importance_score,
    created_at: now,
    last_referenced_at: now,
  })

  if (error) {
    console.error('addMemory insert error:', error)
    throw error
  }
}

// ---------------------------------------------------------------------------
// OpenAI extraction call
// ---------------------------------------------------------------------------

async function extractMemoriesFromOpenAI(
  text: string,
  apiKey: string
): Promise<ExtractedMemory[]> {
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
          { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
        max_tokens: 200,
        temperature: 0.3, // low temperature for consistent structured output
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`OpenAI ${res.status}: ${errText}`)
    }

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content?.trim() ?? '[]'

    // Parse the JSON array from the response
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      console.error('Failed to parse OpenAI extraction response:', raw)
      return []
    }

    if (!Array.isArray(parsed)) return []

    // Validate and sanitise each entry
    const VALID_TYPES = new Set<string>(['goal', 'struggle', 'win', 'pattern', 'promise', 'person'])
    const memories: ExtractedMemory[] = []

    for (const item of parsed) {
      if (
        typeof item !== 'object' ||
        item === null ||
        typeof item.memory_type !== 'string' ||
        typeof item.content !== 'string' ||
        typeof item.importance_score !== 'number'
      ) {
        continue
      }

      if (!VALID_TYPES.has(item.memory_type)) continue

      const score = Math.round(item.importance_score)
      if (score < 1 || score > 10) continue

      memories.push({
        memory_type: item.memory_type as MemoryType,
        content: item.content.trim(),
        importance_score: score,
      })

      // Enforce the "up to 3" cap at parse time
      if (memories.length >= 3) break
    }

    return memories
  } finally {
    clearTimeout(timeout)
  }
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

  if (!openaiKey) {
    // Graceful degradation — no extraction without API key
    return json({ extracted: 0 }, 200)
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { userId, text, source } = body

  if (!userId || !text) {
    return json({ error: 'Missing required fields: userId, text' }, 400)
  }

  console.log(`extract-memories: userId=${userId}, source=${source ?? 'unknown'}, textLength=${text.length}`)

  // Extract memories via OpenAI
  let extracted: ExtractedMemory[]
  try {
    extracted = await extractMemoriesFromOpenAI(text, openaiKey)
  } catch (err) {
    console.error('Extraction failed:', err)
    return json({ extracted: 0 }, 200) // graceful degradation
  }

  if (extracted.length === 0) {
    return json({ extracted: 0 }, 200)
  }

  // Use service role key so RLS doesn't block server-side inserts
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  let insertedCount = 0
  for (const memory of extracted) {
    try {
      await addMemory(supabase, userId, memory)
      insertedCount++
    } catch (err) {
      console.error('Failed to insert memory:', err)
      // Continue inserting remaining memories even if one fails
    }
  }

  return json({ extracted: insertedCount }, 200)
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
