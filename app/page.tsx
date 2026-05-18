'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import MatchCard from '@/components/MatchCard';
import type { Match } from '@/lib/cricapi';

type Tab = 'live' | 'upcoming' | 'completed';

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>('live');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/matches');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setMatches(json.data ?? []);
      setStale(!!json.stale);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  const live = matches.filter((m) => m.matchStarted && !m.matchEnded);
  const upcoming = matches.filter((m) => !m.matchStarted);
  const completed = matches.filter((m) => m.matchEnded);
  const shown = tab === 'live' ? live : tab === 'upcoming' ? upcoming : completed;

  return (
    <>
      <Navbar activeTab={tab} onTabChange={setTab} liveCounts={live.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {stale && (
          <div
            className="mb-4 px-4 py-2 rounded text-sm"
            style={{ backgroundColor: '#78350f22', color: '#fbbf24' }}
          >
            Data may be delayed — CricAPI rate limit reached
          </div>
        )}

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded text-sm flex items-center justify-between"
            style={{ backgroundColor: '#7f1d1d22', color: '#fca5a5' }}
          >
            <span>Failed to load matches</span>
            <button onClick={load} className="underline text-xs">Retry</button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-4 h-40 animate-pulse"
                style={{ backgroundColor: 'var(--surface)' }}
              />
            ))}
          </div>
        )}

        {!loading && shown.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
            {tab === 'live'
              ? 'No live matches right now'
              : tab === 'upcoming'
              ? 'No upcoming matches found'
              : 'No completed matches found'}
          </div>
        )}

        {!loading && shown.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
