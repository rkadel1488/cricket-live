import { NextResponse } from 'next/server';
import { fetchMatch, type MatchDetail } from '@/lib/cricapi';

const cache = new Map<string, { data: MatchDetail; expiresAt: number }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const now = Date.now();
  const hit = cache.get(id);
  if (hit && now < hit.expiresAt) {
    return NextResponse.json({ data: hit.data });
  }
  try {
    const data = await fetchMatch(id);
    cache.set(id, { data, expiresAt: now + 2 * 60 * 1000 });
    return NextResponse.json({ data });
  } catch {
    if (hit) {
      return NextResponse.json({ data: hit.data, stale: true });
    }
    return NextResponse.json({ error: 'Failed to fetch scorecard' }, { status: 500 });
  }
}
