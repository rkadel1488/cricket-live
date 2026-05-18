import { fetchCurrentMatches, fetchMatch } from '@/lib/cricapi';

const mockMatch = {
  id: 'abc-123',
  name: 'India vs Australia, 1st Test',
  matchType: 'test',
  status: 'India won by 7 wickets',
  date: '2026-05-18',
  dateTimeGMT: '2026-05-18T09:30:00',
  teams: ['India', 'Australia'],
  score: [{ r: 280, w: 10, o: 87.4, inning: 'India 1st Innings' }],
  matchStarted: true,
  matchEnded: true,
};

global.fetch = jest.fn();

beforeEach(() => jest.clearAllMocks());

test('fetchCurrentMatches returns match array on success', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ status: 'success', data: [mockMatch] }),
  });
  const result = await fetchCurrentMatches();
  expect(result).toHaveLength(1);
  expect(result[0].id).toBe('abc-123');
});

test('fetchCurrentMatches throws on HTTP error', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 429 });
  await expect(fetchCurrentMatches()).rejects.toThrow('CricAPI error: 429');
});

test('fetchMatch returns match detail on success', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ status: 'success', data: { ...mockMatch, scorecard: [] } }),
  });
  const result = await fetchMatch('abc-123');
  expect(result.id).toBe('abc-123');
  expect(result.scorecard).toEqual([]);
});
