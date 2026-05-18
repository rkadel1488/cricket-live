import streams from '@/data/streams.json';

export function getStreamUrl(matchId: string): string | null {
  return (streams as Record<string, string>)[matchId] ?? null;
}

export function getYouTubeSearchUrl(teamA: string, teamB: string): string {
  const q = encodeURIComponent(`${teamA} vs ${teamB} live cricket`);
  return `https://www.youtube.com/results?search_query=${q}`;
}
