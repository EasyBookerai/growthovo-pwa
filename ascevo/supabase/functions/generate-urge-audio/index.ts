// generate-urge-audio Edge Function
// Premium-only: generates a 5-minute urge surfing guided audio for a specific habit.
// Flow:
//   1. Generate urge surfing script via gpt-4o-mini (max 600 tokens)
//   2. Call OpenAI TTS API (tts-1-hd, voice: onyx) with the script
//   3. Upload audio to Supabase Storage at sos_audio/{userId}/{timestamp}.mp3
//   4. Return { audioUrl: string }
// On TTS failure: return { audioUrl: null, fallback: true }
// Requirements: 11.3, 11.7

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_TIMEOUT_MS = 30000 // TTS can take longer than chat completions
const SCRIPT_MODEL = 'gpt-4o-mini'
const TTS_MODEL = 'tts-1-hd'
const TTS_VOICE = 'onyx'
const SCRIPT_MAX_TOKENS = 600
const STORAGE_BUCKET = 'audio'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'canceled'

interface RequestBody {
  userId: string
  habit: string
  subscriptionStatus?: SubscriptionStatus
}

// ---------------------------------------------------------------------------
// Script generation prompt
// ---------------------------------------------------------------------------

function buildUrgeSurfingPrompt(habit: string): string {
  return `Write a calm, guided 5-minute urge surfing audio script for someone who is about to break their habit: "${habit}".

The script should:
- Open by acknowledging the urge without judgment
- Use the wave metaphor: "The urge will pass in 4-7 minutes. Don't feed it. Watch it like a wave."
- Guide the listener through slow, deep breathing (inhale 4 counts, hold 4 counts, exhale 6 counts) — at least 3 rounds
- Include a body scan grounding technique: notice feet on the floor, hands in lap, breath in chest
- Remind them that urges peak and then fade — they don't have to act on it
- Reference the specific habit ("${habit}") naturally throughout — make it personal
- Use a calm, measured, supportive tone — this is a guided meditation, not Rex's usual blunt coaching
- End with a moment of stillness and a quiet affirmation of their strength
- Be approximately 5 minutes when read aloud at a slow, meditative pace (roughly 500-600 words)

Do not include stage directions, timestamps, or formatting markers. Write only the spoken words.`
}

// ---------------------------------------------------------------------------
// OpenAI chat completion (script generation)
// ---------------------------------------------------------------------------

async function generateScript(habit: string, apiKey: string): Promise<string> {
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
        model: SCRIPT_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a calm, compassionate mindfulness guide. Write guided meditation scripts that are warm, grounding, and supportive. Use simple, clear language. Speak directly to the listener in second person.',
          },
          {
            role: 'user',
            content: buildUrgeSurfingPrompt(habit),
          },
        ],
        max_tokens: SCRIPT_MAX_TOKENS,
        temperature: 0.7,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`OpenAI script generation ${res.status}: ${errText}`)
    }

    const data = await res.json()
    const script = data.choices?.[0]?.message?.content?.trim() ?? ''
    if (!script) throw new Error('Empty script returned from OpenAI')
    return script
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// OpenAI TTS (audio generation)
// ---------------------------------------------------------------------------

async function generateAudio(script: string, apiKey: string): Promise<ArrayBuffer> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS)

  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        voice: TTS_VOICE,
        input: script,
        response_format: 'mp3',
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`OpenAI TTS ${res.status}: ${errText}`)
    }

    return await res.arrayBuffer()
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// Supabase Storage upload
// ---------------------------------------------------------------------------

async function uploadAudio(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  audioBuffer: ArrayBuffer
): Promise<string> {
  const timestamp = Date.now()
  const storagePath = `sos_audio/${userId}/${timestamp}.mp3`

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: false,
    })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
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
    console.error('OPENAI_API_KEY not set')
    return json({ audioUrl: null, fallback: true }, 200)
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { userId, habit, subscriptionStatus } = body

  if (!userId || !habit) {
    return json({ error: 'Missing required fields: userId, habit' }, 400)
  }

  // Premium-only feature — free/canceled users get fallback
  if (
    subscriptionStatus === 'free' ||
    subscriptionStatus === 'canceled'
  ) {
    return json({ audioUrl: null, fallback: true }, 200)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Step 1: Generate the urge surfing script
  let script: string
  try {
    script = await generateScript(habit, openaiKey)
  } catch (err) {
    console.error('Script generation failed:', err)
    return json({ audioUrl: null, fallback: true }, 200)
  }

  // Step 2: Convert script to audio via TTS
  let audioBuffer: ArrayBuffer
  try {
    audioBuffer = await generateAudio(script, openaiKey)
  } catch (err) {
    console.error('TTS generation failed:', err)
    // Requirement 11.7: fall back to text guide without surfacing an error
    return json({ audioUrl: null, fallback: true }, 200)
  }

  // Step 3: Upload audio to Supabase Storage
  let audioUrl: string
  try {
    audioUrl = await uploadAudio(supabase, userId, audioBuffer)
  } catch (err) {
    console.error('Storage upload failed:', err)
    return json({ audioUrl: null, fallback: true }, 200)
  }

  return json({ audioUrl }, 200)
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
