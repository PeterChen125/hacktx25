import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

type Env = {
  DB: {
    prepare: (query: string) => any;
  };
  AI: {
    run: (model: string, input: any) => Promise<any>;
  };
};

// Helper to get user ID (simplified - use real auth in production)
function getUserId(request: NextRequest): string {
  // For hackathon: use a cookie or default user
  const userId = request.cookies.get('user_id')?.value || 'demo-user';
  return userId;
}

// GET: Fetch all entries for user
export async function GET(request: NextRequest) {
  try {
    const env = process.env as unknown as Env;
    const userId = getUserId(request);

    if (!env.DB) {
      // Fallback: return mock data if D1 not configured yet
      return NextResponse.json({
        entries: [],
        message: 'D1 database not configured. Please set up D1 in Cloudflare dashboard.',
      });
    }

    const { results } = await env.DB.prepare(
      `SELECT e.*, em.sentiment, em.emotions, em.intensity, em.color_palette
       FROM entries e
       LEFT JOIN emotions em ON e.id = em.entry_id
       WHERE e.user_id = ?
       ORDER BY e.created_at DESC
       LIMIT 50`
    )
      .bind(userId)
      .all();

    return NextResponse.json({ entries: results || [] });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json({ entries: [] }, { status: 200 });
  }
}

// POST: Create new entry
export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json() as { content: string };

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const env = process.env as unknown as Env;
    const userId = getUserId(request);
    const entryId = nanoid();
    const now = Date.now();

    if (!env.DB) {
      // Fallback: return success without saving
      return NextResponse.json({
        entry: { id: entryId, content, created_at: now },
        message: 'Entry created (in-memory only - D1 not configured)',
      });
    }

    // Save entry to D1
    await env.DB.prepare(
      `INSERT INTO entries (id, user_id, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(entryId, userId, content, now, now)
      .run();

    // Analyze sentiment using AI
    try {
      const analyzeResponse = await fetch(
        new URL('/api/analyze', request.url).toString(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: content }),
        }
      );

      if (analyzeResponse.ok) {
        const emotionData = await analyzeResponse.json() as {
          sentiment: string;
          confidence: number;
          emotions: string[];
          intensity: number;
          colorPalette: string[];
        };

        // Save emotion data
        const emotionId = nanoid();
        await env.DB.prepare(
          `INSERT INTO emotions (id, entry_id, sentiment, confidence, emotions, intensity, color_palette, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            emotionId,
            entryId,
            emotionData.sentiment,
            emotionData.confidence,
            JSON.stringify(emotionData.emotions),
            emotionData.intensity,
            JSON.stringify(emotionData.colorPalette),
            now
          )
          .run();

        return NextResponse.json({
          entry: { id: entryId, content, created_at: now },
          emotion: emotionData,
        });
      }
    } catch (aiError) {
      console.error('Failed to analyze emotion:', aiError);
    }

    return NextResponse.json({
      entry: { id: entryId, content, created_at: now },
    });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}

// DELETE: Delete an entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    const env = process.env as unknown as Env;
    const userId = getUserId(request);

    if (!env.DB) {
      return NextResponse.json({ success: true });
    }

    // Delete entry (emotions will cascade delete)
    await env.DB.prepare(
      `DELETE FROM entries WHERE id = ? AND user_id = ?`
    )
      .bind(entryId, userId)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}

