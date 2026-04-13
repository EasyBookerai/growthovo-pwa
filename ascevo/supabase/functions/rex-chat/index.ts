import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REX_SYSTEM_PROMPT = `You are Rex, the AI coach inside the Growthovo self-improvement app.

Your personality:
- Brutally honest, funny, never corporate
- Like a cool older sibling who genuinely wants you to succeed
- You roast people kindly when they fail and hype them hard when they succeed
- You remember their history and call them out on it
- You never use corporate wellness language ("journey", "self-care", "holistic")
- You speak like a real person, not a chatbot
- Short, punchy responses — max 3 sentences unless the situation calls for more
- You use occasional profanity (mild) when it fits the tone
- You are never mean, always in their corner

Triggers and tone:
- lesson_complete: Hype them up. Reference what they just learned. Challenge them to apply it.
- checkin_positive: Big energy. They did the thing. Make them feel like a legend.
- checkin_negative: Gentle roast. No shame spiral. Get them back on track tomorrow.
- streak_risk: Guilt trip with love. Make them feel the weight of breaking the streak.
- level_up: Celebrate hard. Reference their progress. Raise the bar for what's next.

Keep responses under 100 words. Be real. Be Rex.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, trigger, context } = await req.json();

    if (!userId || !trigger) {
      return new Response(JSON.stringify({ error: 'Missing userId or trigger' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Init Supabase client with service role (server-side only)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch last 10 Rex messages for conversation history
    const { data: history } = await supabase
      .from('rex_messages')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const conversationHistory = (history ?? []).reverse().map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // Build user message from trigger + context
    const userMessage = buildUserMessage(trigger, context);

    const messages = [
      { role: 'system', content: REX_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    // Call OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OpenAI API key not configured.');

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 150,
        temperature: 0.85,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      throw new Error(`OpenAI error: ${err}`);
    }

    const openaiData = await openaiRes.json();
    const assistantMessage = openaiData.choices[0]?.message?.content ?? '';

    // Store user message and assistant response
    await supabase.from('rex_messages').insert([
      { user_id: userId, role: 'user', content: userMessage },
      { user_id: userId, role: 'assistant', content: assistantMessage },
    ]);

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('rex-chat error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildUserMessage(trigger: string, context: any): string {
  switch (trigger) {
    case 'lesson_complete':
      return `I just completed the lesson "${context?.lessonTitle ?? 'a lesson'}". Give me your reaction.`;
    case 'checkin_positive':
      return `I completed today's challenge: "${context?.challengeDescription ?? 'my challenge'}". React to this.`;
    case 'checkin_negative':
      return `I didn't complete today's challenge: "${context?.challengeDescription ?? 'my challenge'}". Be honest with me.`;
    case 'streak_risk':
      return `My streak is at risk. I haven't done anything today yet. My current streak is ${context?.streak ?? 0} days.`;
    case 'level_up':
      return `I just levelled up to level ${context?.newLevel ?? '?'} in ${context?.pillarName ?? 'a pillar'}!`;
    default:
      return `Trigger: ${trigger}. Context: ${JSON.stringify(context)}`;
  }
}
