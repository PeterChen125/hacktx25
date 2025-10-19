import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// This API route simulates localStorage behavior for server-side rendering
// In a real app, you'd use proper authentication and user sessions

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, return empty array
    // The real data will be handled by client-side localStorage
    return NextResponse.json({ entries: [] });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json({ entries: [] }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json() as { content: string };

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // For demo purposes, return a mock entry
    // The real saving will be handled by client-side localStorage
    const entryId = nanoid();
    const now = Date.now();

    return NextResponse.json({
      entry: { id: entryId, content, created_at: now },
      message: 'Entry will be saved locally in your browser'
    });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    // For demo purposes, return success
    // The real deletion will be handled by client-side localStorage
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
