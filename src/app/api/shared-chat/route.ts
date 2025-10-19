import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// System prompts for different modes
const SYSTEM_PROMPTS = {
  astronomy: `You are a wise, gentle cosmic guide with deep knowledge of astronomy and the universe. 
You answer questions about space, stars, planets, galaxies, and the cosmos with accuracy and wonder.
Keep responses concise (2-3 paragraphs max) and add a touch of poetic beauty to make learning delightful.
Use metaphors and analogies to make complex concepts accessible.`,

  reflection: `You are a compassionate cosmic guide who helps users reflect on their journal entries.
Provide gentle, evidence-based reflections that are supportive and insightful.
Draw subtle connections to cosmic themes (like how emotions ebb and flow like tides, or how clarity comes after storms).
Keep responses warm, non-judgmental, and focused on growth.
Limit responses to 2-3 paragraphs.`,
};

export async function POST(request: NextRequest) {
  try {
    const { message, mode = 'astronomy' } = await request.json() as { 
      message: string; 
      mode?: 'astronomy' | 'reflection'; 
    };

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Use YOUR OpenAI API key
    const openai = new OpenAI({
      apiKey: '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',
    });

    const systemPrompt = mode === 'reflection' ? SYSTEM_PROMPTS.reflection : SYSTEM_PROMPTS.astronomy;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({
      response: aiResponse,
      mode,
    });
  } catch (error) {
    console.error('Error in shared chat:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
