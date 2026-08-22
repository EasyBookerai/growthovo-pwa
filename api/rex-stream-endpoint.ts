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

function getFeatureInstruction(feature: RexFeature): string {
  switch (feature) {
    case 'sos':
      return 'User is in distress. Start with one grounding or breathing technique. Keep it calm, warm, and specific.';
    case 'lesson_companion':
      return 'You are answering lesson questions. Stay grounded in the lesson content supplied by the user.';
    case 'chat':
    default:
      return 'You are in the main Rex chat. Be warm, sharp, and personal.';
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
    '- Personalize naturally using the user context',
    '- If crisis detected (self-harm, suicide keywords) respond with care and provide emergency resources immediately',
    '- Speak the user\'s language',
    '- Never break character',
    '',
    'FEATURE INSTRUCTIONS:',
    getFeatureInstruction(feature),
  ].join('\n');
}

function createEvent(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('[rex-stream] Missing OPENAI_API_KEY');
    return new Response('Rex unavailable', { status: 500 });
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

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.85,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content;
            if (!token) {
              continue;
            }

            controller.enqueue(
              encoder.encode(createEvent({ type: 'token', content: token }))
            );
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('[rex-stream] Streaming failed:', error);
          controller.enqueue(
            encoder.encode(createEvent({ type: 'error', content: 'stream_failed' }))
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[rex-stream] Request failed:', error);
    return new Response('Rex unavailable', { status: 500 });
  }
}
