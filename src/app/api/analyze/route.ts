import { NextRequest, NextResponse } from 'next/server';

// Cloudflare AI binding types
type Env = {
  AI: {
    run: (model: string, input: any) => Promise<any>;
  };
};

// Emotion mapping based on sentiment and keywords
function deriveEmotion(text: string, sentiment: string): {
  emotions: string[];
  intensity: number;
  colorPalette: string[];
} {
  const lowerText = text.toLowerCase();
  const emotions: string[] = [];
  let intensity = 0.5;

  // Joy indicators
  if (
    sentiment === 'positive' ||
    /happy|joy|excited|amazing|wonderful|great|love|brilliant/.test(lowerText)
  ) {
    emotions.push('joy');
    intensity = Math.min(intensity + 0.3, 1.0);
  }

  // Calm indicators
  if (/calm|peace|serene|tranquil|relaxed|quiet|gentle|still/.test(lowerText)) {
    emotions.push('calm');
    intensity = Math.max(intensity - 0.2, 0.3);
  }

  // Sadness indicators
  if (
    sentiment === 'negative' ||
    /sad|depressed|down|blue|melancholy|grief|lonely/.test(lowerText)
  ) {
    emotions.push('sadness');
    intensity = Math.min(intensity + 0.2, 0.9);
  }

  // Anger indicators
  if (/angry|mad|furious|rage|frustrated|annoyed|irritated/.test(lowerText)) {
    emotions.push('anger');
    intensity = Math.min(intensity + 0.4, 1.0);
  }

  // Anxiety indicators
  if (/anxious|worried|nervous|stressed|tense|fearful/.test(lowerText)) {
    emotions.push('anxiety');
    intensity = Math.min(intensity + 0.3, 0.95);
  }

  // Default to calm if no emotions detected
  if (emotions.length === 0) {
    emotions.push('neutral');
    intensity = 0.5;
  }

  // Color palette mapping
  const colorPalettes: Record<string, string[]> = {
    joy: ['#4A90E2', '#B19CD9', '#E8DAEF', '#AED6F1'],
    calm: ['#9B59B6', '#D7BDE2', '#E8DAEF', '#A9CCE3'],
    sadness: ['#2C3E50', '#34495E', '#5D6D7E', '#85929E'],
    anger: ['#E74C3C', '#F39C12', '#DC7633', '#E59866'],
    anxiety: ['#E67E22', '#F5B041', '#FAD7A0', '#F8C471'],
    neutral: ['#7F8C8D', '#95A5A6', '#BDC3C7', '#D5DBDB'],
  };

  // Mix colors based on dominant emotion
  const dominantEmotion = emotions[0] || 'neutral';
  const palette = colorPalettes[dominantEmotion] || colorPalettes.neutral;

  return {
    emotions,
    intensity,
    colorPalette: palette,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json() as { text: string };

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Access Cloudflare AI binding
    const env = process.env as unknown as Env;

    // Use Workers AI for sentiment analysis
    // Model: @cf/huggingface/distilbert-sst-2-int8
    let sentiment = 'neutral';
    let confidence = 0.5;

    try {
      const aiResponse = await env.AI?.run(
        '@cf/huggingface/distilbert-sst-2-int8',
        {
          text: text.slice(0, 500), // Limit to 500 chars for performance
        }
      );

      // Parse AI response
      if (aiResponse && Array.isArray(aiResponse) && aiResponse.length > 0) {
        const result = aiResponse[0];
        sentiment = result.label?.toLowerCase() || 'neutral';
        confidence = result.score || 0.5;
      }
    } catch (aiError) {
      console.error('AI analysis failed, using fallback:', aiError);
      // Fallback to simple keyword-based sentiment
      const lowerText = text.toLowerCase();
      if (
        /happy|joy|excited|amazing|wonderful|great|love/.test(lowerText)
      ) {
        sentiment = 'positive';
        confidence = 0.7;
      } else if (
        /sad|depressed|angry|frustrated|terrible|awful/.test(lowerText)
      ) {
        sentiment = 'negative';
        confidence = 0.7;
      }
    }

    // Derive emotions and visual properties
    const emotionData = deriveEmotion(text, sentiment);

    return NextResponse.json({
      sentiment,
      confidence,
      ...emotionData,
    });
  } catch (error) {
    console.error('Error analyzing text:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
}

