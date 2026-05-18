// Cricket data via Cricbuzz API (RapidAPI)
// Endpoints: /matches/v1/live, /matches/v1/upcoming, /mcenter/v1/{id}, /mcenter/v1/{id}/scard

const BASE = 'https://cricbuzz-cricket.p.rapidapi.com';

function headers(): HeadersInit {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error('RAPIDAPI_KEY environment variable is not set');
  return {
    'x-rapidapi-key': key,
    'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
  };
}

// ── Public interfaces (unchanged — all components depend on these) ──────────

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

// ── Cricbuzz raw types ───────────────────────────────────────────────────────

interface CbTeam { teamId?: number; teamName?: string; teamname?: string }
interface CbInningsScore { runs: number; wickets: number; overs: number }
interface CbMatchScore {
  team1Score?: { inngs1?: CbInningsScore; inngs2?: CbInningsScore };
  team2Score?: { inngs1?: CbInningsScore; inngs2?: CbInningsScore };
}
interface CbMatchInfo {
  matchId?: number; matchid?: number;
  seriesName?: string; seriesname?: string;
  matchDesc?: string; matchdesc?: string;
  matchFormat?: string; matchformat?: string;
  startDate?: string | number; startdate?: string | number;
  state?: string;
  status?: string;
  team1: CbTeam;
  team2: CbTeam;
  venueInfo?: { ground?: string }; venueinfo?: { ground?: string };
}
interface CbMatch { matchInfo: CbMatchInfo; matchScore?: CbMatchScore }

interface CbBatsman {
  id: number; name: string;
  runs: number; balls: number; fours: number; sixes: number;
  strkrate: string; outdec?: string;
}
interface CbBowler {
  id: number; name: string;
  overs: string; maidens: number; runs: number; wickets: number; economy: string;
}
interface CbFOW { batsmanname: string; overnbr: number; runs: number }
interface CbInning {
  inningsid: number;
  batsman?: CbBatsman[]; bowler?: CbBowler[];
  fow?: { fow?: CbFOW[] };
  batteamname?: string;
}

// ── Mapping helpers ──────────────────────────────────────────────────────────

function teamName(t: CbTeam): string {
  return t.teamName ?? t.teamname ?? 'Unknown';
}

function matchId(info: CbMatchInfo): string {
  return String(info.matchId ?? info.matchid ?? 0);
}

function startDt(info: CbMatchInfo): string {
  const raw = info.startDate ?? info.startdate;
  if (!raw) return new Date().toISOString();
  const ms = typeof raw === 'string' ? parseInt(raw, 10) : raw;
  return isNaN(ms) ? new Date().toISOString() : new Date(ms).toISOString();
}

function mapScores(info: CbMatchInfo, ms?: CbMatchScore): MatchScore[] {
  const scores: MatchScore[] = [];
  if (!ms) return scores;
  const push = (team: string, label: string, i?: CbInningsScore) => {
    if (i) scores.push({ r: i.runs, w: i.wickets, o: i.overs, inning: `${team} ${label}` });
  };
  const t1 = teamName(info.team1), t2 = teamName(info.team2);
  push(t1, '1st Innings', ms.team1Score?.inngs1);
  push(t2, '1st Innings', ms.team2Score?.inngs1);
  push(t1, '2nd Innings', ms.team1Score?.inngs2);
  push(t2, '2nd Innings', ms.team2Score?.inngs2);
  return scores;
}

function mapMatch(item: CbMatch): Match {
  const info = item.matchInfo;
  const dt = startDt(info);
  const t1 = teamName(info.team1), t2 = teamName(info.team2);
  const fmt = (info.matchFormat ?? info.matchformat ?? 't20').toLowerCase();
  const desc = info.matchDesc ?? info.matchdesc ?? '';
  const venue = info.venueInfo?.ground ?? info.venueinfo?.ground;
  return {
    id: matchId(info),
    name: `${t1} vs ${t2}${desc ? ', ' + desc : ''}`,
    matchType: fmt,
    status: info.status ?? '',
    venue,
    date: dt.split('T')[0],
    dateTimeGMT: dt,
    teams: [t1, t2],
    score: mapScores(info, item.matchScore),
    matchStarted: info.state !== 'Preview',
    matchEnded: info.state === 'Complete',
  };
}

function mapInning(sc: CbInning): Inning {
  return {
    inning: sc.batteamname ? `${sc.batteamname} Innings` : `Innings ${sc.inningsid}`,
    batting: (sc.batsman ?? []).map(b => ({
      batsman: { name: b.name, id: String(b.id) },
      r: b.runs, b: b.balls, '4s': b.fours, '6s': b.sixes,
      sr: parseFloat(b.strkrate) || 0,
      'out-by': b.outdec || undefined,
    })),
    bowling: (sc.bowler ?? []).map(b => ({
      bowler: { name: b.name, id: String(b.id) },
      o: parseFloat(b.overs) || 0, m: b.maidens,
      r: b.runs, w: b.wickets, wd: 0, nb: 0,
      eco: parseFloat(b.economy) || 0,
    })),
    fallofwickets: sc.fow?.fow?.map(f => `${f.runs}-${f.batsmanname} (${f.overnbr} ov)`) ?? [],
  };
}

function extractMatches(data: {
  typeMatches?: Array<{
    seriesMatches?: Array<{ seriesAdWrapper?: { matches?: CbMatch[] } }>
  }>
}): Match[] {
  const out: Match[] = [];
  for (const tm of data.typeMatches ?? []) {
    for (const sm of tm.seriesMatches ?? []) {
      for (const m of sm.seriesAdWrapper?.matches ?? []) {
        out.push(mapMatch(m));
      }
    }
  }
  return out;
}

// ── Public fetch functions ───────────────────────────────────────────────────

export async function fetchCurrentMatches(): Promise<Match[]> {
  const h = headers();
  const [liveRes, upcomingRes] = await Promise.all([
    fetch(`${BASE}/matches/v1/live`, { headers: h }),
    fetch(`${BASE}/matches/v1/upcoming`, { headers: h }),
  ]);
  if (!liveRes.ok) throw new Error(`Cricbuzz error: ${liveRes.status}`);
  if (!upcomingRes.ok) throw new Error(`Cricbuzz error: ${upcomingRes.status}`);
  const [liveJson, upcomingJson] = await Promise.all([liveRes.json(), upcomingRes.json()]);
  return [...extractMatches(liveJson), ...extractMatches(upcomingJson)];
}

export async function fetchMatch(id: string): Promise<MatchDetail> {
  const h = headers();
  const [infoRes, scardRes] = await Promise.all([
    fetch(`${BASE}/mcenter/v1/${id}`, { headers: h }),
    fetch(`${BASE}/mcenter/v1/${id}/scard`, { headers: h }),
  ]);
  if (!infoRes.ok) throw new Error(`Cricbuzz error: ${infoRes.status}`);
  if (!scardRes.ok) throw new Error(`Cricbuzz error: ${scardRes.status}`);
  const [infoJson, scardJson] = await Promise.all([infoRes.json(), scardRes.json()]);
  const base = mapMatch({ matchInfo: infoJson, matchScore: infoJson.matchScore });
  const scorecard: Inning[] = (scardJson.scorecard ?? []).map(mapInning);
  return { ...base, scorecard };
}
