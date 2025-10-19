import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

type Env = {
  AI: {
    run: (model: string, input: any) => Promise<any>;
  };
  OPENAI_API_KEY?: string;
};

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
    const { message, mode = 'astronomy', journalContext } = await request.json() as { 
      message: string; 
      mode?: 'astronomy' | 'reflection'; 
      journalContext?: string; 
    };

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemPrompt =
      mode === 'reflection' ? SYSTEM_PROMPTS.reflection : SYSTEM_PROMPTS.astronomy;

    let aiResponse = '';

    // Try Cloudflare Workers AI REST API (FREE!)
    try {
      console.log('Using Cloudflare Workers AI REST API (Free!)');
      const workersAIResponse = await fetch(
        'https://api.cloudflare.com/client/v4/accounts/4a33ce80d61202457f568bfd5d350224/ai/run/@cf/meta/llama-3.1-8b-instruct',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer dEcyAihbAnzbwyvdzEpViOlQaYrJ2LVCJn1irCkV',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
            max_tokens: 512,
            temperature: 0.7,
          }),
        }
      );

      if (workersAIResponse.ok) {
        const data = await workersAIResponse.json() as { result?: { response?: string } };
        if (data.result && data.result.response) {
          aiResponse = data.result.response;
          console.log('Workers AI response received:', aiResponse.substring(0, 100) + '...');
        } else {
          console.log('Invalid Workers AI response:', data);
          throw new Error('Invalid AI response');
        }
      } else {
        console.log('Workers AI request failed:', workersAIResponse.status, await workersAIResponse.text());
        throw new Error('Workers AI request failed');
      }
    } catch (workersAIError) {
      console.log('Workers AI failed, using smart fallback:', workersAIError);
      // Don't throw error, use fallback instead
    }

    // Smart fallback responses
    if (!aiResponse) {
      const lowerMessage = message.toLowerCase();
      
      if (mode === 'astronomy') {
        // Provide specific answers for common astronomy questions
        if (lowerMessage.includes('fast radio burst') || lowerMessage.includes('frb')) {
          aiResponse = `Fast Radio Bursts (FRBs) are mysterious, millisecond-long bursts of radio waves from deep space. First discovered in 2007, these powerful signals can outshine entire galaxies for brief moments. They originate billions of light-years away, suggesting they're incredibly energetic events. Scientists theorize they might come from magnetars (highly magnetized neutron stars), black holes, or even advanced civilizations. Each FRB carries the equivalent energy of our Sun's output over 80 years, compressed into a fraction of a second! 🌌`;
        } else if (lowerMessage.includes('sidereal day')) {
          aiResponse = `A sidereal day is the time it takes for Earth to complete one full rotation relative to the distant stars (about 23 hours, 56 minutes, 4 seconds). This is slightly shorter than a solar day (24 hours) because Earth also moves along its orbit around the Sun. Think of it like this: if you're walking forward and spinning at the same time, you need to spin a bit extra to face the same point ahead of you again! Astronomers use sidereal time because it helps them track the positions of stars and celestial objects. 🌟`;
        } else if (lowerMessage.includes('magnetar') || lowerMessage.includes('pulsar')) {
          aiResponse = `Magnetars and pulsars are both types of neutron stars! 🧲

**Pulsars** are rapidly rotating neutron stars that emit beams of radiation (like a cosmic lighthouse). They spin incredibly fast - some hundreds of times per second! The Crab Pulsar, for example, rotates 30 times per second.

**Magnetars** are neutron stars with extremely powerful magnetic fields - trillions of times stronger than Earth's! They can produce massive starquakes and gamma-ray bursts. Some magnetars also pulse, making them magnetar-pulsar hybrids.

Both form when massive stars collapse, but magnetars are much rarer and more extreme. Think of pulsars as cosmic lighthouses and magnetars as cosmic magnets with attitude! ⭐`;
        } else if (lowerMessage.includes('distance') && lowerMessage.includes('moon')) {
          aiResponse = `The Moon is approximately **384,400 kilometers (238,900 miles)** away from Earth on average! 🌙

But here's the cool part - it's not always the same distance! The Moon's orbit is elliptical, so it varies:
- **Closest (perigee)**: ~356,500 km (221,500 miles)
- **Farthest (apogee)**: ~406,700 km (252,700 miles)

That's about 50,000 km difference! To put it in perspective, you could fit about 30 Earths in that gap. The Moon is slowly drifting away from us at about 3.8 cm per year - so in a billion years, it'll be about 38,000 km farther away! 🌍➡️🌙`;
        } else if (lowerMessage.includes('distance') && lowerMessage.includes('mars')) {
          aiResponse = `Mars is much farther than the Moon! The distance to Mars varies dramatically because both Earth and Mars orbit the Sun at different speeds. 🪐

**Average distance**: ~225 million km (140 million miles)
**Closest approach**: ~54.6 million km (34 million miles) - when Earth and Mars are on the same side of the Sun
**Farthest distance**: ~401 million km (249 million miles) - when they're on opposite sides

This is why Mars missions are planned during "opposition" - when Mars is closest to Earth. The journey takes about 6-8 months with current technology. At its closest, Mars appears as a bright red dot in the night sky! 🔴`;
        } else if (lowerMessage.includes('nebula')) {
          aiResponse = `Nebulae are vast clouds of gas and dust in space, often called "stellar nurseries" where new stars are born! They come in many types: emission nebulae (glow with their own light), reflection nebulae (reflect starlight), and dark nebulae (block background light). The most famous is the Orion Nebula, visible to the naked eye. These cosmic clouds can span hundreds of light-years and contain enough material to form thousands of stars. Their beautiful colors come from different elements - hydrogen glows red, oxygen glows green, and sulfur glows yellow! ✨`;
        } else if (lowerMessage.includes('black hole')) {
          aiResponse = `Black holes are regions of spacetime where gravity is so strong that nothing, not even light, can escape once it crosses the event horizon. They form when massive stars collapse at the end of their lives. There are stellar-mass black holes (3-20 times our Sun's mass) and supermassive ones at galaxy centers (millions to billions of solar masses). The first image of a black hole was captured in 2019 by the Event Horizon Telescope, showing the shadow of M87's supermassive black hole. They're not cosmic vacuum cleaners - they follow the same gravitational laws as any massive object! 🕳️`;
        } else {
          aiResponse = `🌌 Welcome to the cosmic realm! I can help you explore the wonders of space and astronomy. Ask me about planets, stars, galaxies, black holes, nebulae, or any celestial phenomena that spark your curiosity. 

What cosmic mystery would you like to explore? ✨`;
        }
      } else {
        aiResponse = `Thank you for sharing your thoughts with me. Your feelings are valid and important. Like the phases of the moon, our emotions wax and wane—this is a natural part of being human. Take a moment to acknowledge what you're experiencing without judgment. Sometimes, the simple act of writing down our thoughts can bring clarity, much like how stars become visible when we let our eyes adjust to the darkness.`;
      }
    }

    return NextResponse.json({
      response: aiResponse,
      mode,
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}