'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Scorecard from '@/components/Scorecard';
import StreamPlayer from '@/components/StreamPlayer';
import { getStreamUrl, getYouTubeSearchUrl } from '@/lib/streams';
import type { MatchDetail } from '@/lib/cricapi';

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState(false);

  const streamUrl = match ? getStreamUrl(id) : null;
  const searchUrl = match
    ? getYouTubeSearchUrl(match.teams[0], match.teams[1])
    : '';

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/scorecard?id=${id}`);
      const json = await res.json();
      if (json.error) {
        if (res.status === 400) { router.push('/'); return; }
        throw new Error(json.error);
      }
      setMatch(json.data);
      setStale(!!json.stale);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            style={{ color: 'var(--muted)' }}
            className="text-sm hover:text-white transition-colors"
          >
            ← Back
          </button>
          {match && (
            <h1 className="text-sm font-semibold truncate">
              {match.teams[0]} vs {match.teams[1]}
            </h1>
          )}
          {match && !match.matchEnded && (
            <span
              className="ml-auto text-xs font-bold px-2 py-0.5 rounded animate-pulse"
              style={{ backgroundColor: 'var(--live)', color: '#fff' }}
            >
              LIVE
            </span>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {stale && (
          <div
            className="px-4 py-2 rounded text-sm"
            style={{ backgroundColor: '#78350f22', color: '#fbbf24' }}
          >
            Data may be delayed — CricAPI rate limit reached
          </div>
        )}

        {error && (
          <div
            className="px-4 py-3 rounded text-sm flex items-center justify-between"
            style={{ backgroundColor: '#7f1d1d22', color: '#fca5a5' }}
          >
            <span>Failed to load scorecard</span>
            <button onClick={load} className="underline text-xs">Retry</button>
          </div>
        )}

        {/* Stream */}
        {!loading && match && (
          <StreamPlayer youtubeUrl={streamUrl} searchUrl={searchUrl} />
        )}

        {/* Scorecard skeleton */}
        {loading && (
          <div
            className="rounded-xl p-6 h-64 animate-pulse"
            style={{ backgroundColor: 'var(--surface)' }}
          />
        )}

        {/* Scorecard */}
        {!loading && match && (
          <div
            className="rounded-xl p-4 sm:p-6"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Scorecard</h2>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {match.status}
              </p>
            </div>
            {match.scorecard && match.scorecard.length > 0 ? (
              <Scorecard innings={match.scorecard} />
            ) : (
              <p style={{ color: 'var(--muted)' }} className="text-sm">
                Scorecard not yet available for this match
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
