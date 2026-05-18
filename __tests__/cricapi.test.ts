import { fetchCurrentMatches, fetchMatch } from '@/lib/cricapi';

const mockLiveResponse = {
  typeMatches: [
    {
      matchType: 'International',
      seriesMatches: [
        {
          seriesAdWrapper: {
            seriesId: 12070,
            seriesName: 'Pakistan tour of Bangladesh, 2026',
            matches: [
              {
                matchInfo: {
                  matchId: 153791,
                  seriesName: 'Pakistan tour of Bangladesh, 2026',
                  matchDesc: '2nd Test',
                  matchFormat: 'TEST',
                  startDate: '1778904000000',
                  state: 'In Progress',
                  status: 'Day 3: 3rd Session',
                  team1: { teamId: 6, teamName: 'Bangladesh', teamSName: 'BAN' },
                  team2: { teamId: 3, teamName: 'Pakistan', teamSName: 'PAK' },
                  venueInfo: { ground: 'Sylhet International Cricket Stadium' },
                },
                matchScore: {
                  team1Score: { inngs1: { inningsId: 1, runs: 278, wickets: 10, overs: 76.6 } },
                  team2Score: { inngs1: { inningsId: 2, runs: 232, wickets: 10, overs: 57.4 } },
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

const mockUpcomingResponse = { typeMatches: [] };

const mockInfoResponse = {
  matchid: 153791,
  matchdesc: '2nd Test',
  matchformat: 'TEST',
  startdate: 1778904000000,
  state: 'In Progress',
  status: 'Day 3: 3rd Session',
  team1: { teamid: 6, teamname: 'Bangladesh', teamsname: 'BAN' },
  team2: { teamid: 3, teamname: 'Pakistan', teamsname: 'PAK' },
  venueinfo: { ground: 'Sylhet International Cricket Stadium' },
};

const mockScardResponse = {
  scorecard: [
    {
      inningsid: 1,
      batteamname: 'Bangladesh',
      batsman: [
        {
          id: 14273, name: 'Rohit Sharma',
          runs: 85, balls: 62, fours: 10, sixes: 3,
          strkrate: '137.10', outdec: 'c Smith b Cummins',
        },
      ],
      bowler: [
        { id: 11298, name: 'Pat Cummins', overs: '18', maidens: 2, runs: 58, wickets: 3, economy: '3.22' },
      ],
      fow: { fow: [{ batsmanname: 'Rohit Sharma', overnbr: 12.4, runs: 44 }] },
    },
  ],
};

global.fetch = jest.fn();
beforeAll(() => { process.env.RAPIDAPI_KEY = 'test-key'; });
beforeEach(() => jest.clearAllMocks());

test('fetchCurrentMatches returns mapped Match array on success', async () => {
  (fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: true, json: async () => mockLiveResponse })
    .mockResolvedValueOnce({ ok: true, json: async () => mockUpcomingResponse });

  const result = await fetchCurrentMatches();
  expect(result).toHaveLength(1);
  expect(result[0].id).toBe('153791');
  expect(result[0].teams).toEqual(['Bangladesh', 'Pakistan']);
  expect(result[0].matchStarted).toBe(true);
  expect(result[0].matchEnded).toBe(false);
  expect(result[0].score).toHaveLength(2);
});

test('fetchCurrentMatches throws on HTTP error', async () => {
  (fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: false, status: 429 })
    .mockResolvedValueOnce({ ok: true, json: async () => mockUpcomingResponse });

  await expect(fetchCurrentMatches()).rejects.toThrow('Cricbuzz error: 429');
});

test('fetchMatch returns MatchDetail with full scorecard on success', async () => {
  (fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: true, json: async () => mockInfoResponse })
    .mockResolvedValueOnce({ ok: true, json: async () => mockScardResponse });

  const result = await fetchMatch('153791');
  expect(result.id).toBe('153791');
  expect(result.teams).toEqual(['Bangladesh', 'Pakistan']);
  expect(result.scorecard).toHaveLength(1);
  expect(result.scorecard![0].batting[0].batsman.name).toBe('Rohit Sharma');
  expect(result.scorecard![0].batting[0]['4s']).toBe(10);
  expect(result.scorecard![0].batting[0]['out-by']).toBe('c Smith b Cummins');
  expect(result.scorecard![0].bowling[0].bowler.name).toBe('Pat Cummins');
  expect(result.scorecard![0].bowling[0].w).toBe(3);
  expect(result.scorecard![0].fallofwickets).toEqual(['44-Rohit Sharma (12.4 ov)']);
});
