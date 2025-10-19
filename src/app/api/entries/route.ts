import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getCloudflareContext } from '@opennextjs/cloudflare';

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
    const userId = getUserId(request);
    
    // Try different ways to access the environment
    const env = process.env as unknown as Env;
    const globalEnv = globalThis as any;
    const cloudflareContext = getCloudflareContext();
    
    console.log('Environment check:', { 
      hasDB: !!env.DB, 
      hasGlobalDB: !!globalEnv.DB,
      hasCloudflareContext: !!cloudflareContext,
      hasCloudflareDB: !!(cloudflareContext as any)?.env?.DB,
      envKeys: Object.keys(env),
      globalKeys: Object.keys(globalEnv).filter(k => k.includes('DB') || k.includes('env') || k.includes('DB'))
    });

    // Try to get DB from cloudflare context, env, or global - OpenNext might expose it differently
    const db = (cloudflareContext as any)?.env?.DB || env.DB || globalEnv.DB;

    if (!db) {
      console.log('D1 database not detected in environment, trying direct API call');
      
      // Try direct D1 API call as fallback
      try {
        const d1Response = await fetch(`https://api.cloudflare.com/client/v4/accounts/4a33ce80d61202457f568bfd5d350224/d1/database/e4d691fa-9856-4306-b90f-82c63ef3d6d0/query`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer dEcyAihbAnzbwyvdzEpViOlQaYrJ2LVCJn1irCkV',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sql: `SELECT e.*, em.sentiment, em.emotions, em.intensity, em.color_palette
                  FROM entries e
                  LEFT JOIN emotions em ON e.id = em.entry_id
                  WHERE e.user_id = ?
                  ORDER BY e.created_at DESC
                  LIMIT 50`,
            params: [userId]
          }),
        });

        if (d1Response.ok) {
          const result = await d1Response.json() as { result?: any[] };
          return NextResponse.json({ entries: result.result || [] });
        }
      } catch (d1Error) {
        console.log('Direct D1 API call failed:', d1Error);
      }

      // Fallback: return mock data if D1 not configured yet
      return NextResponse.json({
        entries: [],
        message: 'D1 database not configured. Please set up D1 in Cloudflare dashboard.',
      });
    }

    const { results } = await db.prepare(
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
    const globalEnv = globalThis as any;
    const cloudflareContext = getCloudflareContext();
    const userId = getUserId(request);
    const entryId = nanoid();
    const now = Date.now();

    console.log('Environment check for POST:', { 
      hasDB: !!env.DB, 
      hasGlobalDB: !!globalEnv.DB,
      hasCloudflareContext: !!cloudflareContext,
      hasCloudflareDB: !!(cloudflareContext as any)?.env?.DB,
      envKeys: Object.keys(env),
      globalKeys: Object.keys(globalEnv).filter(k => k.includes('DB') || k.includes('env'))
    });

    // Try to get DB from cloudflare context, env, or global - OpenNext might expose it differently
    const db = (cloudflareContext as any)?.env?.DB || env.DB || globalEnv.DB;

    if (!db) {
      console.log('D1 database not detected in environment for POST');
      // Fallback: return success without saving
      return NextResponse.json({
        entry: { id: entryId, content, created_at: now },
        message: 'Entry created (in-memory only - D1 not configured)',
      });
    }

    // Save entry to D1
    await db.prepare(
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
        await db.prepare(
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
    const globalEnv = globalThis as any;
    const cloudflareContext = getCloudflareContext();
    const userId = getUserId(request);

    // Try to get DB from cloudflare context, env, or global - OpenNext might expose it differently
    const db = (cloudflareContext as any)?.env?.DB || env.DB || globalEnv.DB;

    if (!db) {
      return NextResponse.json({ success: true });
    }

    // Delete entry (emotions will cascade delete)
    await db.prepare(
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

