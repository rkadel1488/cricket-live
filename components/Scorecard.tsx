'use client';

import { useState } from 'react';
import type { Inning } from '@/lib/cricapi';

interface ScorecardProps { innings: Inning[] }

const INNINGS_LABELS = ['1st Inn', '2nd Inn', '3rd Inn', '4th Inn'];

export default function Scorecard({ innings }: ScorecardProps) {
  const [active, setActive] = useState(0);
  const inning = innings[active];

  if (!inning) return <p style={{ color: 'var(--muted)' }}>Scorecard not available yet</p>;

  return (
    <div>
      {innings.length > 1 && (
        <div className="flex gap-2 mb-4">
          {innings.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="px-3 py-1 rounded text-sm"
              style={{
                backgroundColor: active === i ? 'var(--accent)' : 'var(--surface)',
                color: active === i ? '#000' : 'var(--muted)',
                border: '1px solid var(--border)',
                fontWeight: active === i ? 600 : 400,
              }}
            >
              {INNINGS_LABELS[i] ?? `Inn ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--muted)' }}>{inning.inning}</h3>

      {/* Batting */}
      <div className="mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th className="text-left py-2 pr-4 font-medium">Batter</th>
              <th className="text-right py-2 px-2 font-medium">R</th>
              <th className="text-right py-2 px-2 font-medium">B</th>
              <th className="text-right py-2 px-2 font-medium">4s</th>
              <th className="text-right py-2 px-2 font-medium">6s</th>
              <th className="text-right py-2 pl-2 font-medium">SR</th>
            </tr>
          </thead>
          <tbody>
            {inning.batting.map((b) => (
              <tr key={b.batsman.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="py-2 pr-4">
                  <div>{b.batsman.name}</div>
                  {b['out-by'] && <div className="text-xs" style={{ color: 'var(--muted)' }}>{b['out-by']}</div>}
                </td>
                <td className="text-right py-2 px-2 font-semibold">{b.r}</td>
                <td className="text-right py-2 px-2" style={{ color: 'var(--muted)' }}>{b.b}</td>
                <td className="text-right py-2 px-2" style={{ color: 'var(--muted)' }}>{b['4s']}</td>
                <td className="text-right py-2 px-2" style={{ color: 'var(--muted)' }}>{b['6s']}</td>
                <td className="text-right py-2 pl-2" style={{ color: 'var(--muted)' }}>{b.sr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bowling */}
      {inning.bowling.length > 0 && (
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-2 pr-4 font-medium">Bowler</th>
                <th className="text-right py-2 px-2 font-medium">O</th>
                <th className="text-right py-2 px-2 font-medium">M</th>
                <th className="text-right py-2 px-2 font-medium">R</th>
                <th className="text-right py-2 px-2 font-medium">W</th>
                <th className="text-right py-2 pl-2 font-medium">Econ</th>
              </tr>
            </thead>
            <tbody>
              {inning.bowling.map((b) => (
                <tr key={b.bowler.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-2 pr-4">{b.bowler.name}</td>
                  <td className="text-right py-2 px-2" style={{ color: 'var(--muted)' }}>{b.o}</td>
                  <td className="text-right py-2 px-2" style={{ color: 'var(--muted)' }}>{b.m}</td>
                  <td className="text-right py-2 px-2" style={{ color: 'var(--muted)' }}>{b.r}</td>
                  <td className="text-right py-2 px-2 font-semibold">{b.w}</td>
                  <td className="text-right py-2 pl-2" style={{ color: 'var(--muted)' }}>{b.eco}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fall of Wickets */}
      {inning.fallofwickets && inning.fallofwickets.length > 0 && (
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          <span className="font-medium">FOW: </span>
          {inning.fallofwickets.join(' · ')}
        </div>
      )}
    </div>
  );
}
