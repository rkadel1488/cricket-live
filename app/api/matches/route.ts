import { NextResponse } from 'next/server';
import { fetchCurrentMatches, type Match } from '@/lib/cricapi';

// Module-scope cache: persists across requests in a long-lived Node process
// but resets on each serverless cold start (e.g. Vercel). Best-effort for personal use.
let cache: { data: Match[]; expiresAt: number } | null = null;

export async function GET() {
  const now = Date.now();
  if (cache && now < cache.expiresAt) {
    return NextResponse.json({ data: cache.data });
  }
  try {
    const data = await fetchCurrentMatches();
    cache = { data, expiresAt: now + 5 * 60 * 1000 };
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[/api/matches]', err);
    if (cache) {
      return NextResponse.json({ data: cache.data, stale: true });
    }
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
