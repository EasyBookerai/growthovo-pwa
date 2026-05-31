import OpenAI from 'openai';

export const config = {
  runtime: 'edge',
};

type RexFeature =
  | 'chat'
  | 'morning_briefing'
  | 'evening_debrief'
  | 'lesson_companion'
  | 'lesson_insight'
  | 'daily_challenge'
  | 'sos'
  | 'weekly_wrapped'
  | 'speaking_feedback'
  | 'notification_copy'
  | 'profile_assessment';

interface RexContext {
  name?: string;
  streak?: number;
  xp?: number;
  level?: number;
  moodEmoji?: string;
  moodLabel?: string;
  completedLessons?: string[];
  selectedPillars?: string[];
  timeOfDay?: string;
  lastCheckIn?: string;
  featureLabel?: string;
}

interface RexMessage {
  role: 'user' | 'assistant';
  content: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function getFeatureInstruction(feature: RexFeature): string {
  switch (feature) {
    case 'morning_briefing':
      return 'You are generating a morning briefing. Return valid JSON only.';
    case 'evening_debrief':
      return 'You are responding to an evening debrief. Validate one thing, challenge one thing, and end with excitement about tomorrow.';
    case 'lesson_companion':
      return 'You are answering questions inside a lesson. Use the lesson content provided in the user message as the main source of truth.';
    case 'lesson_insight':
      return 'You are creating a short personalized insight after lesson completion. Max 50 words.';
    case 'daily_challenge':
      return 'You are creating a daily micro-challenge. Return valid JSON only.';
    case 'sos':
      return 'User is in distress. Start with one breathing or grounding technique. Be specific. No generic lists.';
    case 'weekly_wrapped':
      return 'You are writing a weekly wrapped summary. Return valid JSON only.';
    case 'speaking_feedback':
      return 'You are analyzing a speech transcript. Return valid JSON only.';
    case 'notification_copy':
      return 'You are writing short notification copy. Return valid JSON only.';
    case 'profile_assessment':
      return 'You are writing an honest growth assessment. Return valid JSON only.';
    case 'chat':
    default:
      return 'You are in the main Rex chat. Stay conversational, personal, and useful.';
  }
}

function buildSystemPrompt(context: RexContext = {}, feature: RexFeature): string {
  const completedLessons = context.completedLessons?.length
    ? context.completedLessons.join(', ')
    : 'none yet';
  const selectedPillars = context.selectedPillars?.length
    ? context.selectedPillars.join(', ')
    : 'none selected';

  return [
    'You are Rex, the AI growth coach inside Growthovo.',
    '',
    'PERSONALITY:',
    '- Warm, direct, and real - never robotic or generic',
    '- You speak like a brilliant friend who happens to know psychology, productivity, fitness, finance, and relationships',
    '- Short sentences. High energy. Occasional emoji.',
    '- Never say "I understand your concern" or corporate phrases',
    '- Never give a list of 10 things. Max 3 actionable points.',
    '- Always end with either a question OR one clear next action',
    '- You remember everything the user tells you in this session',
    '',
    'USER CONTEXT:',
    `- Name: ${context.name ?? 'Champion'}`,
    `- Current streak: ${context.streak ?? 0} days`,
    `- XP: ${context.xp ?? 0} points, Level ${context.level ?? 1}`,
    `- Today's mood: ${context.moodEmoji ?? '🙂'} ${context.moodLabel ?? 'steady'}`,
    `- Completed lessons: ${completedLessons}`,
    `- Selected pillars: ${selectedPillars}`,
    `- Time of day: ${context.timeOfDay ?? 'afternoon'}`,
    `- Last check-in: ${context.lastCheckIn ?? 'unknown'}`,
    `- Feature calling Rex: ${context.featureLabel ?? feature}`,
    '',
    'RULES:',
    '- Responses max 120 words unless user asks for detail',
    '- Always personalize using their name and stats above',
    '- Never recommend professional help unless crisis detected',
    '- If crisis detected (self-harm, suicide keywords) respond with care and provide emergency resources immediately',
    '- Speak the user\'s language based on the latest user messages',
    '- Never break character',
    '',
    'FEATURE INSTRUCTIONS:',
    getFeatureInstruction(feature),
  ].join('\n');
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('[rex] Missing OPENAI_API_KEY');
    return json({ error: 'Rex unavailable' }, 500);
  }

  try {
    const body = (await req.json()) as {
      messages?: RexMessage[];
      context?: RexContext;
      feature?: RexFeature;
    };

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const feature = body.feature ?? 'chat';
    const systemPrompt = buildSystemPrompt(body.context, feature);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.85,
      stream: false,
    });

    return json({
      reply: response.choices[0]?.message?.content ?? '',
    });
  } catch (error) {
    console.error('[rex] Request failed:', error);
    return json({ error: 'Rex unavailable' }, 500);
  }
}
