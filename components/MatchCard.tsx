'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Match } from '@/lib/cricapi';

interface MatchCardProps { match: Match }

const TYPE_LABELS: Record<string, string> = {
  test: 'TEST', t20: 'T20', odi: 'ODI', ipl: 'IPL',
};

function ScoreLine({ inning, r, w, o }: { inning: string; r: number; w: number; o: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: 'var(--muted)' }}>{inning}</span>
      <span className="font-semibold">{r}/{w} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({o})</span></span>
    </div>
  );
}

function NotifyButton({ match }: { match: Match }) {
  const [granted, setGranted] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setGranted(true);
      const matchTime = new Date(match.dateTimeGMT).getTime() - Date.now();
      if (matchTime > 0) {
        setTimeout(() => {
          new Notification(`🏏 ${match.name} is starting now!`, {
            body: `${match.teams[0]} vs ${match.teams[1]}`,
          });
        }, matchTime);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className="mt-2 text-xs px-2 py-1 rounded"
      style={{ border: '1px solid var(--border)', color: granted ? 'var(--accent)' : 'var(--muted)' }}
    >
      {granted ? '✓ Notified' : '🔔 Notify Me'}
    </button>
  );
}

export default function MatchCard({ match }: MatchCardProps) {
  const isLive = match.matchStarted && !match.matchEnded;
  const typeLabel = TYPE_LABELS[match.matchType?.toLowerCase()] ?? match.matchType?.toUpperCase() ?? '—';

  return (
    <Link href={`/match/${match.id}`}>
      <div
        className="rounded-xl p-4 hover:scale-[1.01] transition-transform cursor-pointer border"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded"
            style={{ backgroundColor: 'var(--border)', color: 'var(--muted)' }}
          >
            {typeLabel}
          </span>
          {isLive && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded animate-pulse"
              style={{ backgroundColor: 'var(--live)', color: '#fff' }}
            >
              LIVE
            </span>
          )}
        </div>

        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold">{match.teams[0]}</span>
          <span style={{ color: 'var(--muted)' }} className="text-sm">vs</span>
          <span className="font-semibold">{match.teams[1]}</span>
        </div>

        {match.score && match.score.length > 0 && (
          <div className="space-y-1 mb-2">
            {match.score.map((s) => (
              <ScoreLine key={s.inning} {...s} />
            ))}
          </div>
        )}

        <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
          {match.status}
        </p>

        {!match.matchStarted && <NotifyButton match={match} />}
      </div>
    </Link>
  );
}
