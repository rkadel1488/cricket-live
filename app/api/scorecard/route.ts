import { NextResponse } from 'next/server';
import { fetchMatch, type MatchDetail } from '@/lib/cricapi';

// Module-scope cache: persists across requests in a long-lived Node process
// but resets on each serverless cold start (e.g. Vercel). Best-effort for personal use.
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
    if (cache.size > 200) {
      cache.delete(cache.keys().next().value!);
    }
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[/api/scorecard]', err);
    if (hit) {
      return NextResponse.json({ data: hit.data, stale: true });
    }
    return NextResponse.json({ error: 'Failed to fetch scorecard' }, { status: 500 });
  }
}
