const BASE = 'https://api.cricapi.com/v1';

export interface MatchScore {
  r: number;
  w: number;
  o: number;
  inning: string;
}

export interface Match {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue?: string;
  date: string;
  dateTimeGMT: string;
  teams: [string, string];
  score?: MatchScore[];
  matchStarted: boolean;
  matchEnded: boolean;
}

export interface BatsmanScore {
  batsman: { name: string; id: string };
  r: number;
  b: number;
  '4s': number;
  '6s': number;
  sr: number;
  'out-by'?: string;
}

export interface BowlerScore {
  bowler: { name: string; id: string };
  o: number;
  m: number;
  r: number;
  w: number;
  wd: number;
  nb: number;
  eco: number;
}

export interface Inning {
  inning: string;
  batting: BatsmanScore[];
  bowling: BowlerScore[];
  fallofwickets?: string[];
}

export interface MatchDetail extends Match {
  scorecard?: Inning[];
}

export async function fetchCurrentMatches(): Promise<Match[]> {
  const key = process.env.CRICAPI_KEY;
  if (!key) throw new Error('CRICAPI_KEY environment variable is not set');
  const url = new URL(`${BASE}/currentMatches`);
  url.searchParams.set('apikey', key);
  url.searchParams.set('offset', '0');
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`CricAPI error: ${res.status}`);
  const json = await res.json();
  if (json.status !== 'success') throw new Error('CricAPI non-success');
  return json.data as Match[];
}

export async function fetchMatch(id: string): Promise<MatchDetail> {
  const key = process.env.CRICAPI_KEY;
  if (!key) throw new Error('CRICAPI_KEY environment variable is not set');
  // Free tier only supports /match_info; /match requires a paid plan
  const url = new URL(`${BASE}/match_info`);
  url.searchParams.set('apikey', key);
  url.searchParams.set('id', id);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`CricAPI error: ${res.status}`);
  const json = await res.json();
  if (json.status !== 'success') throw new Error('CricAPI non-success');
  return json.data as MatchDetail;
}
