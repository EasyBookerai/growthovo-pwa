// analyze-speech Edge Function
// Orchestrates the full public speaking analysis pipeline:
// 1. Validate request
// 2. Upload audio to Supabase Storage
// 3. Call Whisper API (verbose_json) → transcript + word timestamps
// 4. Calculate pure metrics (pace, fillers, silence gaps)
// 5. [FREE TIER EXIT] Return partial result for free/canceled users
// 6. GPT-4o-mini analysis with SHA-256 caching
// 7. TTS generation with SHA-256 caching
// 8. Insert speech_sessions, upsert speech_progress
// 9. Log costs, store rex_memory
// Requirements: 2.1–2.6, 3.1–3.5, 4.1–4.4, 5.1–5.4, 6.1–6.3, 7.1–7.4,
//               8.1–8.3, 9.1–9.11, 11.1–11.3, 16.2, 16.4, 17.5, 18.1–18.6

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WHISPER_TIMEOUT_MS = 15000
const GPT_TIMEOUT_MS = 10000
const TTS_TIMEOUT_MS = 10000

const COST_WHISPER_PER_MIN = 0.006
const COST_GPT4O_MINI = 0.003
const COST_TTS = 0.003

const REX_SYSTEM_PROMPT =
  'You are Rex, brutally honest AI coach in GROWTHOVO. Analyze speech transcripts with precision. ' +
  'Return ONLY valid JSON. No explanation. No markdown. Be specific — reference actual words from the transcript. Never be generic.'


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WhisperWord {
  word: string
  start: number
  end: number
}

interface SilenceGap {
  start: number
  end: number
  duration: number
  type: 'anxious' | 'purposeful'
}

interface FillerPosition {
  word: string
  startTime: number
  endTime: number
  charOffset: number
}

interface SessionSummary {
  confidenceScore: number
  biggestFix: string
  date: string
}

interface AnalyzeSpeechRequest {
  userId: string
  level: number
  topic: string
  audioBase64: string
  durationSeconds: number
  language: string
  sessionNumber: number
  subscriptionStatus: string
  lastThreeSessions: SessionSummary[]
  userStruggles: string
}

interface GptAnalysis {
  language_strength: number
  filler_free_rate: number
  structure_score: number
  opening_strength: number
  closing_strength: number
  silence_gap_score: number
  weak_language_examples: string[]
  strong_language_examples: string[]
  biggest_win: string
  biggest_fix: string
  opening_analysis: string
  closing_analysis: string
  compared_to_last_session: string
  rex_verdict: string
  tomorrow_focus: string
}


// ---------------------------------------------------------------------------
// Pure metric calculation functions (inlined — Deno context, no client imports)
// ---------------------------------------------------------------------------

const FILLER_CATEGORIES: Record<string, string[]> = {
  hesitation: ['um', 'uh', 'er', 'hmm'],
  social: ['like', 'you know', 'right', 'okay'],
  padding: ['basically', 'literally', 'actually', 'honestly'],
  connector: ['so', 'and so', 'but so', 'and then'],
}

const MULTI_WORD_FILLERS = Object.values(FILLER_CATEGORIES)
  .flat()
  .filter((f) => f.includes(' '))
  .sort((a, b) => b.split(' ').length - a.split(' ').length)

const SINGLE_WORD_FILLERS = Object.values(FILLER_CATEGORIES)
  .flat()
  .filter((f) => !f.includes(' '))

function calculatePaceScore(wpm: number): number {
  if (wpm >= 130 && wpm <= 160) return 100
  if (wpm > 160) return Math.max(0, 100 - ((wpm - 160) / 60) * 100)
  return Math.max(0, 100 - ((130 - wpm) / 60) * 100)
}

function calculateFillerFreeRate(fillersPerMinute: number): number {
  return Math.max(0, Math.min(100, 100 - fillersPerMinute * 12.5))
}

function calculateConfidenceScore(components: {
  languageStrength: number
  fillerFreeRate: number
  paceScore: number
  openingStrength: number
  closingStrength: number
  structureScore: number
}): number {
  const raw =
    components.languageStrength * 0.30 +
    components.fillerFreeRate   * 0.20 +
    components.paceScore        * 0.15 +
    components.openingStrength  * 0.15 +
    components.closingStrength  * 0.10 +
    components.structureScore   * 0.10
  return Math.round(Math.max(0, Math.min(100, raw)))
}

function detectFillers(words: WhisperWord[]): {
  fillerWords: Record<string, number>
  fillerPositions: FillerPosition[]
} {
  const fillerWords: Record<string, number> = {}
  const fillerPositions: FillerPosition[] = []
  const consumed = new Set<number>()

  for (let i = 0; i < words.length; i++) {
    if (consumed.has(i)) continue
    let matched = false

    for (const filler of MULTI_WORD_FILLERS) {
      const parts = filler.split(' ')
      if (i + parts.length > words.length) continue
      const windowWords = words.slice(i, i + parts.length).map((w) => w.word.toLowerCase())
      if (windowWords.join(' ') === filler) {
        const charOffset = words.slice(0, i).reduce((acc, w) => acc + w.word.length + 1, 0)
        fillerWords[filler] = (fillerWords[filler] ?? 0) + 1
        fillerPositions.push({
          word: filler,
          startTime: words[i].start,
          endTime: words[i + parts.length - 1].end,
          charOffset,
        })
        for (let k = i; k < i + parts.length; k++) consumed.add(k)
        matched = true
        break
      }
    }

    if (matched) continue

    const wordLower = words[i].word.toLowerCase()
    if (SINGLE_WORD_FILLERS.includes(wordLower)) {
      const charOffset = words.slice(0, i).reduce((acc, w) => acc + w.word.length + 1, 0)
      fillerWords[wordLower] = (fillerWords[wordLower] ?? 0) + 1
      fillerPositions.push({
        word: wordLower,
        startTime: words[i].start,
        endTime: words[i].end,
        charOffset,
      })
      consumed.add(i)
    }
  }

  return { fillerWords, fillerPositions }
}

function detectSilenceGaps(words: WhisperWord[], threshold = 1.5): SilenceGap[] {
  const gaps: SilenceGap[] = []
  for (let i = 0; i < words.length - 1; i++) {
    const gapStart = words[i].end
    const gapEnd = words[i + 1].start
    const duration = gapEnd - gapStart
    if (duration > threshold) {
      gaps.push({ start: gapStart, end: gapEnd, duration, type: duration > 2.5 ? 'purposeful' : 'anxious' })
    }
  }
  return gaps
}


// ---------------------------------------------------------------------------
// SHA-256 helper (Deno crypto.subtle)
// ---------------------------------------------------------------------------

async function sha256(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ---------------------------------------------------------------------------
// Whisper API
// ---------------------------------------------------------------------------

async function callWhisper(
  audioBlob: Blob,
  language: string,
  apiKey: string
): Promise<{ text: string; words: WhisperWord[]; duration: number } | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), WHISPER_TIMEOUT_MS)

  try {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'verbose_json')
    formData.append('timestamp_granularities[]', 'word')
    if (language) formData.append('language', language)

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
      signal: controller.signal,
    })

    if (!res.ok) {
      console.error(`Whisper error ${res.status}: ${await res.text()}`)
      return null
    }

    const data = await res.json()
    return {
      text: data.text ?? '',
      words: (data.words ?? []) as WhisperWord[],
      duration: data.duration ?? 0,
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('Whisper call timed out')
    } else {
      console.error('Whisper call failed:', err)
    }
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// GPT-4o-mini analysis
// ---------------------------------------------------------------------------

async function callGptAnalysis(
  transcript: string,
  words: WhisperWord[],
  duration: number,
  req: AnalyzeSpeechRequest,
  apiKey: string
): Promise<GptAnalysis | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), GPT_TIMEOUT_MS)

  const openingWords = words.filter((w) => w.start < 15).map((w) => w.word).join(' ')
  const closingCutoff = duration - 15
  const closingWords = words.filter((w) => w.start >= closingCutoff).map((w) => w.word).join(' ')

  const lastSessionsSummary = req.lastThreeSessions.length > 0
    ? req.lastThreeSessions.map((s) => `${s.date}: confidence ${s.confidenceScore}, fix: ${s.biggestFix}`).join('\n')
    : 'No previous sessions.'

  const userPrompt = `Analyze this speech transcript.

Level: ${req.level}/5 | Topic: "${req.topic}" | Duration: ${Math.round(duration)}s | Session #${req.sessionNumber}
Language: ${req.language}

FULL TRANSCRIPT:
${transcript}

OPENING (first 15s): ${openingWords || '(none)'}
CLOSING (last 15s): ${closingWords || '(none)'}

LAST 3 SESSIONS:
${lastSessionsSummary}

USER KNOWN STRUGGLES: ${req.userStruggles || 'none'}

Return ONLY this JSON (no markdown, no explanation):
{
  "language_strength": <0-100>,
  "filler_free_rate": <0-100>,
  "structure_score": <0-100>,
  "opening_strength": <0-100>,
  "closing_strength": <0-100>,
  "silence_gap_score": <0-100>,
  "weak_language_examples": ["<exact quote>", "<exact quote>", "<exact quote>"],
  "strong_language_examples": ["<exact quote>", "<exact quote>", "<exact quote>"],
  "biggest_win": "<one sentence>",
  "biggest_fix": "<one sentence>",
  "opening_analysis": "<one sentence>",
  "closing_analysis": "<one sentence>",
  "compared_to_last_session": "<one sentence>",
  "rex_verdict": "<2 sentences max, brutally honest, specific>",
  "tomorrow_focus": "<one specific improvement for next session>"
}`

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
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 600,
        temperature: 0.2,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      console.error(`GPT error ${res.status}: ${await res.text()}`)
      return null
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim() ?? ''
    return JSON.parse(content) as GptAnalysis
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('GPT call timed out')
    } else {
      console.error('GPT call failed:', err)
    }
    return null
  } finally {
    clearTimeout(timeout)
  }
}


// ---------------------------------------------------------------------------
// TTS generation
// ---------------------------------------------------------------------------

async function callTts(
  text: string,
  apiKey: string
): Promise<ArrayBuffer | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS)

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
        input: text.slice(0, 200),
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      console.error(`TTS error ${res.status}: ${await res.text()}`)
      return null
    }

    return await res.arrayBuffer()
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('TTS call timed out')
    } else {
      console.error('TTS call failed:', err)
    }
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// Cost logging helpers
// ---------------------------------------------------------------------------

async function logCosts(
  supabase: ReturnType<typeof createClient>,
  today: string,
  costs: number[]
): Promise<void> {
  const total = costs.reduce((a, b) => a + b, 0)
  if (total <= 0) return
  try {
    await supabase.rpc('increment_ai_costs', { p_date: today, p_cost: total })
  } catch (err) {
    console.error('logCosts failed:', err)
  }
}

async function logUsage(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  today: string
): Promise<void> {
  try {
    await supabase.rpc('increment_ai_usage', { p_user_id: userId, p_date: today })
  } catch (err) {
    console.error('logUsage failed:', err)
  }
}

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

async function getCachedAnalysis(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string
): Promise<GptAnalysis | null> {
  const { data, error } = await supabase
    .from('rex_cache')
    .select('response')
    .eq('cache_key', cacheKey)
    .single()

  if (error || !data) return null
  try {
    return JSON.parse((data as any).response) as GptAnalysis
  } catch {
    return null
  }
}

async function setCachedAnalysis(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string,
  analysis: GptAnalysis
): Promise<void> {
  try {
    await supabase.from('rex_cache').upsert({
      cache_key: cacheKey,
      response: JSON.stringify(analysis),
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('setCachedAnalysis failed:', err)
  }
}

async function getCachedTtsUrl(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('rex_cache')
    .select('response')
    .eq('cache_key', `tts_${cacheKey}`)
    .single()

  if (error || !data) return null
  return (data as any).response ?? null
}

async function setCachedTtsUrl(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string,
  url: string
): Promise<void> {
  try {
    await supabase.from('rex_cache').upsert({
      cache_key: `tts_${cacheKey}`,
      response: url,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('setCachedTtsUrl failed:', err)
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
    return json({ error: 'OpenAI API key not configured' }, 500)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  let body: AnalyzeSpeechRequest
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  // ── 1. Validate request ────────────────────────────────────────────────────
  const { userId, level, topic, audioBase64, durationSeconds, language, sessionNumber, subscriptionStatus } = body

  if (!userId || !audioBase64 || !topic) {
    return json({ error: 'Missing required fields: userId, audioBase64, topic' }, 400)
  }

  if (!level || level < 1 || level > 5) {
    return json({ error: 'Invalid level: must be 1–5' }, 400)
  }

  if (!durationSeconds || durationSeconds < 5) {
    return json({ error: 'Audio too short: minimum 5 seconds' }, 400)
  }

  const isFree = subscriptionStatus === 'free' || subscriptionStatus === 'canceled'
  const today = new Date().toISOString().split('T')[0]

  // ── 2. Upload audio to Supabase Storage ────────────────────────────────────
  const audioBytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0))
  const audioBlob = new Blob([audioBytes], { type: 'audio/webm' })
  const audioPath = `${userId}/${Date.now()}.webm`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('speech-audio')
    .upload(audioPath, audioBlob, { contentType: 'audio/webm', upsert: false })

  if (uploadError) {
    console.error('Audio upload error:', uploadError)
    return json({ error: 'Failed to upload audio' }, 500)
  }

  const { data: publicUrlData } = supabase.storage.from('speech-audio').getPublicUrl(audioPath)
  const audioUrl = publicUrlData?.publicUrl ?? ''

  // ── 3. Call Whisper API ────────────────────────────────────────────────────
  const whisperResult = await callWhisper(audioBlob, language ?? '', openaiKey)

  if (!whisperResult) {
    return json({ error: 'Whisper transcription failed. Please try again.' }, 500)
  }

  const { text: transcript, words, duration: whisperDuration } = whisperResult
  const effectiveDuration = whisperDuration > 0 ? whisperDuration : durationSeconds

  // ── 4. Calculate pure metrics ──────────────────────────────────────────────
  const wordCount = words.length
  const paceWpm = Math.round(wordCount / (effectiveDuration / 60))
  const paceScore = calculatePaceScore(paceWpm)

  const { fillerWords, fillerPositions } = detectFillers(words)
  const totalFillers = Object.values(fillerWords).reduce((a, b) => a + b, 0)
  const fillersPerMinute = Math.round((totalFillers / (effectiveDuration / 60)) * 10) / 10

  const silenceGaps = detectSilenceGaps(words, 1.5)
  const anxiousPauses = silenceGaps.filter((g) => g.type === 'anxious').length
  const purposefulPauses = silenceGaps.filter((g) => g.type === 'purposeful').length

  // Log Whisper cost (non-blocking)
  const whisperCost = (effectiveDuration / 60) * COST_WHISPER_PER_MIN
  logCosts(supabase, today, [whisperCost]).catch(console.error)
  logUsage(supabase, userId, today).catch(console.error)

  // ── 5. FREE TIER EXIT ──────────────────────────────────────────────────────
  if (isFree) {
    const fillerFreeRate = calculateFillerFreeRate(fillersPerMinute)
    return json({
      sessionId: null,
      transcript,
      audioUrl,
      paceWpm,
      paceScore,
      fillerWords,
      fillerPositions,
      fillersPerMinute,
      anxiousPauses,
      purposefulPauses,
      silenceGaps: silenceGaps.length,
      // GPT-derived fields are null for free tier
      confidenceScore: null,
      languageStrength: null,
      structureScore: null,
      openingStrength: null,
      closingStrength: null,
      weakLanguageExamples: null,
      strongLanguageExamples: null,
      biggestWin: null,
      biggestFix: null,
      openingAnalysis: null,
      closingAnalysis: null,
      comparedToLastSession: null,
      rexVerdict: null,
      rexAudioUrl: null,
      tomorrowFocus: null,
      sessionNumber,
      isFree: true,
    }, 200)
  }


  // ── 6. GPT-4o-mini analysis with caching ──────────────────────────────────
  const transcriptCacheKey = await sha256(transcript)
  let gptAnalysis = await getCachedAnalysis(supabase, transcriptCacheKey)
  let gptCacheHit = gptAnalysis !== null

  if (!gptAnalysis) {
    // First attempt
    gptAnalysis = await callGptAnalysis(transcript, words, effectiveDuration, body, openaiKey)

    // Retry once on invalid/null JSON
    if (!gptAnalysis) {
      console.warn('GPT first attempt failed, retrying...')
      gptAnalysis = await callGptAnalysis(transcript, words, effectiveDuration, body, openaiKey)
    }

    if (gptAnalysis) {
      await setCachedAnalysis(supabase, transcriptCacheKey, gptAnalysis)
      // Log GPT cost
      logCosts(supabase, today, [COST_GPT4O_MINI]).catch(console.error)
    }
  }

  // If GPT failed entirely, return partial result with pure metrics only
  if (!gptAnalysis) {
    console.error('GPT analysis failed after retry — returning partial result')
    const fillerFreeRate = calculateFillerFreeRate(fillersPerMinute)
    return json({
      sessionId: null,
      transcript,
      audioUrl,
      paceWpm,
      paceScore,
      fillerWords,
      fillerPositions,
      fillersPerMinute,
      anxiousPauses,
      purposefulPauses,
      silenceGaps: silenceGaps.length,
      confidenceScore: null,
      languageStrength: null,
      structureScore: null,
      openingStrength: null,
      closingStrength: null,
      weakLanguageExamples: null,
      strongLanguageExamples: null,
      biggestWin: null,
      biggestFix: null,
      openingAnalysis: null,
      closingAnalysis: null,
      comparedToLastSession: null,
      rexVerdict: null,
      rexAudioUrl: null,
      tomorrowFocus: null,
      sessionNumber,
      partialResult: true,
    }, 200)
  }

  // ── 7. Extract GPT fields and calculate confidence score ──────────────────
  const {
    language_strength,
    filler_free_rate,
    structure_score,
    opening_strength,
    closing_strength,
    silence_gap_score,
    weak_language_examples,
    strong_language_examples,
    biggest_win,
    biggest_fix,
    opening_analysis,
    closing_analysis,
    compared_to_last_session,
    rex_verdict,
    tomorrow_focus,
  } = gptAnalysis

  const confidenceScore = calculateConfidenceScore({
    languageStrength: language_strength,
    fillerFreeRate: filler_free_rate,
    paceScore,
    openingStrength: opening_strength,
    closingStrength: closing_strength,
    structureScore: structure_score,
  })

  // ── 8. TTS generation with caching ────────────────────────────────────────
  const verdictCacheKey = await sha256(rex_verdict)
  let rexAudioUrl = await getCachedTtsUrl(supabase, verdictCacheKey)

  if (!rexAudioUrl) {
    const ttsAudio = await callTts(rex_verdict, openaiKey)

    if (ttsAudio) {
      const ttsPath = `${userId}/rex_${Date.now()}.mp3`
      const ttsBlob = new Blob([ttsAudio], { type: 'audio/mpeg' })

      const { error: ttsUploadError } = await supabase.storage
        .from('speech-audio')
        .upload(ttsPath, ttsBlob, { contentType: 'audio/mpeg', upsert: false })

      if (!ttsUploadError) {
        const { data: ttsUrlData } = supabase.storage.from('speech-audio').getPublicUrl(ttsPath)
        rexAudioUrl = ttsUrlData?.publicUrl ?? null

        if (rexAudioUrl) {
          await setCachedTtsUrl(supabase, verdictCacheKey, rexAudioUrl)
          logCosts(supabase, today, [COST_TTS]).catch(console.error)
        }
      } else {
        console.error('TTS upload error:', ttsUploadError)
      }
    }
  }


  // ── 9. Insert speech_sessions ──────────────────────────────────────────────
  const { data: sessionData, error: sessionError } = await supabase
    .from('speech_sessions')
    .insert({
      user_id: userId,
      session_number: sessionNumber,
      level,
      topic,
      duration_seconds: Math.round(effectiveDuration),
      audio_url: audioUrl,
      transcript,
      filler_words: fillerWords,
      filler_positions: fillerPositions,
      fillers_per_minute: fillersPerMinute,
      pace_wpm: paceWpm,
      language_strength,
      confidence_score: confidenceScore,
      structure_score,
      opening_strength,
      closing_strength,
      silence_gaps: silenceGaps.length,
      anxious_pauses: anxiousPauses,
      purposeful_pauses: purposefulPauses,
      weak_language_examples: weak_language_examples ?? [],
      strong_language_examples: strong_language_examples ?? [],
      biggest_win: biggest_win ?? null,
      biggest_fix: biggest_fix ?? null,
      opening_analysis: opening_analysis ?? null,
      closing_analysis: closing_analysis ?? null,
      compared_to_last_session: compared_to_last_session ?? null,
      rex_verdict: rex_verdict ?? null,
      rex_audio_url: rexAudioUrl ?? null,
      tomorrow_focus: tomorrow_focus ?? null,
    })
    .select('id')
    .single()

  if (sessionError) {
    console.error('speech_sessions insert error:', sessionError)
    return json({ error: 'Failed to save session' }, 500)
  }

  const sessionId = (sessionData as any).id

  // ── 10. Upsert speech_progress ─────────────────────────────────────────────
  // Fetch last 7 sessions for rolling averages
  const { data: recentSessions } = await supabase
    .from('speech_sessions')
    .select('confidence_score, fillers_per_minute, pace_wpm')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(7)

  const sessions7 = (recentSessions ?? []) as Array<{
    confidence_score: number
    fillers_per_minute: number
    pace_wpm: number
  }>

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

  const avgConfidenceLast7 = avg(sessions7.map((s) => s.confidence_score))
  const avgFillersLast7 = avg(sessions7.map((s) => s.fillers_per_minute))
  const avgPaceLast7 = avg(sessions7.map((s) => s.pace_wpm))

  // Fetch existing progress for personal bests
  const { data: existingProgress } = await supabase
    .from('speech_progress')
    .select('personal_best_confidence, personal_best_opening, personal_best_closing, total_sessions, sessions_this_week')
    .eq('user_id', userId)
    .single()

  const prev = (existingProgress as any) ?? {}
  const newPersonalBestConfidence = Math.max(prev.personal_best_confidence ?? 0, confidenceScore)
  const newPersonalBestOpening = Math.max(prev.personal_best_opening ?? 0, opening_strength)
  const newPersonalBestClosing = Math.max(prev.personal_best_closing ?? 0, closing_strength)
  const newTotalSessions = (prev.total_sessions ?? 0) + 1
  const newSessionsThisWeek = (prev.sessions_this_week ?? 0) + 1

  await supabase.from('speech_progress').upsert({
    user_id: userId,
    total_sessions: newTotalSessions,
    avg_confidence_last_7: Math.round(avgConfidenceLast7 * 100) / 100,
    avg_fillers_last_7: Math.round(avgFillersLast7 * 100) / 100,
    avg_pace_last_7: Math.round(avgPaceLast7),
    sessions_this_week: newSessionsThisWeek,
    personal_best_confidence: newPersonalBestConfidence,
    personal_best_opening: newPersonalBestOpening,
    personal_best_closing: newPersonalBestClosing,
    updated_at: new Date().toISOString(),
  })

  // ── 11. Store rex_memory entry ─────────────────────────────────────────────
  if (biggest_win || biggest_fix) {
    const memoryContent = [
      biggest_win ? `Speaking session biggest win: ${biggest_win}` : '',
      biggest_fix ? `Speaking session biggest fix: ${biggest_fix}` : '',
    ].filter(Boolean).join(' | ')

    supabase.from('rex_memory').insert({
      user_id: userId,
      memory_type: 'speaking_session',
      content: memoryContent,
      importance_score: 7,
      created_at: new Date().toISOString(),
      last_referenced_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (error) console.error('rex_memory insert error:', error)
    })
  }

  // ── 12. Return SpeechAnalysisResult ───────────────────────────────────────
  return json({
    sessionId,
    transcript,
    audioUrl,
    paceWpm,
    paceScore,
    fillerWords,
    fillerPositions,
    fillersPerMinute,
    anxiousPauses,
    purposefulPauses,
    silenceGaps: silenceGaps.length,
    confidenceScore,
    languageStrength: language_strength,
    structureScore: structure_score,
    openingStrength: opening_strength,
    closingStrength: closing_strength,
    silenceGapScore: silence_gap_score,
    weakLanguageExamples: weak_language_examples ?? [],
    strongLanguageExamples: strong_language_examples ?? [],
    biggestWin: biggest_win ?? null,
    biggestFix: biggest_fix ?? null,
    openingAnalysis: opening_analysis ?? null,
    closingAnalysis: closing_analysis ?? null,
    comparedToLastSession: compared_to_last_session ?? null,
    rexVerdict: rex_verdict ?? null,
    rexAudioUrl: rexAudioUrl ?? null,
    tomorrowFocus: tomorrow_focus ?? null,
    sessionNumber,
    gptCacheHit,
  }, 200)
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
