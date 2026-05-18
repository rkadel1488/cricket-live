import { render, screen } from '@testing-library/react';
import MatchCard from '@/components/MatchCard';
import type { Match } from '@/lib/cricapi';

const liveMatch: Match = {
  id: 'abc-123',
  name: 'India vs Australia, 1st T20I',
  matchType: 't20',
  status: 'India need 45 runs in 5 overs',
  date: '2026-05-18',
  dateTimeGMT: '2026-05-18T14:00:00',
  teams: ['India', 'Australia'],
  score: [
    { r: 180, w: 3, o: 20, inning: 'Australia 1st Innings' },
    { r: 136, w: 2, o: 15, inning: 'India 1st Innings' },
  ],
  matchStarted: true,
  matchEnded: false,
};

const upcomingMatch: Match = {
  ...liveMatch,
  id: 'def-456',
  matchStarted: false,
  matchEnded: false,
  score: undefined,
};

test('renders LIVE badge for live matches', () => {
  render(<MatchCard match={liveMatch} />);
  expect(screen.getByText('LIVE')).toBeInTheDocument();
});

test('does not render LIVE badge for upcoming matches', () => {
  render(<MatchCard match={upcomingMatch} />);
  expect(screen.queryByText('LIVE')).not.toBeInTheDocument();
});

test('renders both team names', () => {
  render(<MatchCard match={liveMatch} />);
  expect(screen.getByText('India')).toBeInTheDocument();
  expect(screen.getByText('Australia')).toBeInTheDocument();
});

test('renders match type badge', () => {
  render(<MatchCard match={liveMatch} />);
  expect(screen.getByText('T20')).toBeInTheDocument();
});
