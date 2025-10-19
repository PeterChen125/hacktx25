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

// Generate color palette for LLM-detected emotions
function generateColorPalette(emotion: string, intensity: number): string[] {
  const basePalettes: Record<string, string[]> = {
    joy: ['#4A90E2', '#B19CD9', '#E8DAEF', '#AED6F1'],
    calm: ['#9B59B6', '#D7BDE2', '#E8DAEF', '#A9CCE3'],
    sadness: ['#2C3E50', '#34495E', '#5D6D7E', '#85929E'],
    anger: ['#E74C3C', '#F39C12', '#DC7633', '#E59866'],
    anxiety: ['#E67E22', '#F5B041', '#FAD7A0', '#F8C471'],
    excitement: ['#E91E63', '#F06292', '#F8BBD9', '#FFCDD2'],
    disappointment: ['#795548', '#A1887F', '#D7CCC8', '#EFEBE9'],
    fear: ['#424242', '#616161', '#9E9E9E', '#E0E0E0'],
    hope: ['#00BCD4', '#4DD0E1', '#B2EBF2', '#E0F2F1'],
    frustration: ['#FF5722', '#FF7043', '#FFAB91', '#FFCCBC'],
    contentment: ['#4CAF50', '#81C784', '#C8E6C9', '#E8F5E8'],
    loneliness: ['#607D8B', '#90A4AE', '#CFD8DC', '#ECEFF1'],
    pride: ['#FF9800', '#FFB74D', '#FFCC80', '#FFF3E0'],
    shame: ['#9C27B0', '#BA68C8', '#E1BEE7', '#F3E5F5'],
    guilt: ['#673AB7', '#9575CD', '#D1C4E9', '#EDE7F6'],
    relief: ['#009688', '#4DB6AC', '#B2DFDB', '#E0F2F1'],
    confusion: ['#3F51B5', '#7986CB', '#C5CAE9', '#E8EAF6'],
    determination: ['#FF6F00', '#FF8F00', '#FFB74D', '#FFE0B2'],
    overwhelmed: ['#E91E63', '#F06292', '#F8BBD9', '#FFCDD2'],
    peaceful: ['#4CAF50', '#81C784', '#C8E6C9', '#E8F5E8'],
    neutral: ['#7F8C8D', '#95A5A6', '#BDC3C7', '#D5DBDB'],
  };

  // Get base palette or default to neutral
  let palette = basePalettes[emotion.toLowerCase()] || basePalettes.neutral;

  // Adjust intensity by modifying color saturation
  if (intensity < 0.3) {
    // Low intensity - more muted colors
    palette = palette.map(color => adjustColorSaturation(color, 0.5));
  } else if (intensity > 0.7) {
    // High intensity - more vibrant colors
    palette = palette.map(color => adjustColorSaturation(color, 1.3));
  }

  return palette;
}

// Helper function to adjust color saturation
function adjustColorSaturation(hex: string, factor: number): string {
  // Simple saturation adjustment - in a real app you'd use a proper color library
  return hex; // For now, return original color
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json() as { text: string };

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Access Cloudflare AI binding
    const env = process.env as unknown as Env;

    let sentiment = 'neutral';
    let confidence = 0.5;
    let emotions: string[] = ['neutral'];
    let intensity = 0.5;
    let colorPalette = ['#7F8C8D', '#95A5A6', '#BDC3C7', '#D5DBDB'];

    try {
      // Use LLM for sophisticated emotion analysis
      console.log('Using LLM for emotion analysis');
      const llmResponse = await fetch(
        'https://api.cloudflare.com/client/v4/accounts/4a33ce80d61202457f568bfd5d350224/ai/run/@cf/meta/llama-3.1-8b-instruct',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer dEcyAihbAnzbwyvdzEpViOlQaYrJ2LVCJn1irCkV',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: `You are an expert emotion analyst. Analyze the following journal entry and extract the underlying emotions, even if they're not explicitly stated. 

Consider:
- Implicit emotions (e.g., "I failed" → sadness, disappointment)
- Context and experiences described
- Tone and word choice
- Underlying feelings behind actions/thoughts

Respond with ONLY a JSON object in this exact format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.0-1.0,
  "emotions": ["primary_emotion", "secondary_emotion"],
  "intensity": 0.0-1.0,
  "reasoning": "brief explanation"
}

Valid emotions: joy, calm, sadness, anger, anxiety, excitement, disappointment, fear, hope, frustration, contentment, loneliness, pride, shame, guilt, relief, confusion, determination, overwhelmed, peaceful

Be empathetic and perceptive about human emotions.`
              },
              {
                role: 'user',
                content: text.slice(0, 800) // Limit text length
              }
            ],
            max_tokens: 300,
            temperature: 0.3
          }),
        }
      );

      if (llmResponse.ok) {
        const llmData = await llmResponse.json() as { result?: { response?: string } };
        if (llmData.result && llmData.result.response) {
          try {
            // Parse LLM response
            const cleanResponse = llmData.result.response.trim();
            const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const analysis = JSON.parse(jsonMatch[0]);
              
              sentiment = analysis.sentiment || 'neutral';
              confidence = Math.min(Math.max(analysis.confidence || 0.5, 0), 1);
              emotions = Array.isArray(analysis.emotions) ? analysis.emotions : ['neutral'];
              intensity = Math.min(Math.max(analysis.intensity || 0.5, 0), 1);
              
              console.log('LLM emotion analysis:', {
                sentiment,
                confidence,
                emotions,
                intensity,
                reasoning: analysis.reasoning
              });
            }
          } catch (parseError) {
            console.log('Failed to parse LLM response, using fallback:', parseError);
          }
        }
      } else {
        console.log('LLM request failed, using fallback');
      }
    } catch (llmError) {
      console.error('LLM analysis failed, using fallback:', llmError);
    }

    // Fallback to keyword-based analysis if LLM fails
    if (emotions.length === 0 || emotions[0] === 'neutral') {
      console.log('Using fallback emotion detection');
      const emotionData = deriveEmotion(text, sentiment);
      emotions = emotionData.emotions;
      intensity = emotionData.intensity;
      colorPalette = emotionData.colorPalette;
    } else {
      // Generate color palette based on LLM-detected emotions
      colorPalette = generateColorPalette(emotions[0], intensity);
    }

    return NextResponse.json({
      sentiment,
      confidence,
      emotions,
      intensity,
      colorPalette,
    });
  } catch (error) {
    console.error('Error analyzing text:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
}

