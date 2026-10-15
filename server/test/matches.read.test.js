import { beforeEach, describe, expect, it } from 'vitest';
import { withRatios } from '../src/services/matchViews.js';
import { api, createMatch, createWorld, id } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
});

const get = (match, cookie) => {
  const req = api.get(`/api/v1/matches/${id(match)}`);
  return cookie ? req.set('Cookie', cookie) : req;
};

describe('GET /matches/{id}', () => {
  it('returns the whole match page for a published result', async () => {
    const match = await createMatch(w, { score: { turi: 3, opponent: 1 }, round: 'Regional Final' });
    const res = await get(match);
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data).toMatchObject({ status: 'completed', score: { turi: 3, opponent: 1 }, published: true, round: 'Regional Final' });
    expect(data.turi.name).toBe("St. Andrew's Turi");
    expect(data.sport.formations.length).toBeGreaterThan(0);
    expect(data.lineup.filter((l) => l.slot)).toHaveLength(11);
    expect(data.lineup.every((l) => l.number !== null)).toBe(true);
    expect(data.staff).toEqual([{ user: expect.objectContaining({ id: id(w.coach) }), role: 'head' }]);
    const turiGoals = data.events.filter((e) => e.type === 'goal' && e.side === 'turi');
    expect(turiGoals).toHaveLength(3);
    expect(data.playerStats.reduce((sum, row) => sum + row.stats.goals, 0)).toBe(3);
    expect(data.topPerformers).toHaveLength(3);
  });

  it('shows a draft result only to the team’s coaches and admins', async () => {
    const draft = await createMatch(w, { score: { turi: 1, opponent: 0 }, published: false });
    for (const cookie of [undefined, w.as.otherCoach]) {
      const res = await get(draft, cookie);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ published: false, score: { turi: 1, opponent: 0 } });
      expect(res.body.data.lineup).toBeUndefined();
      expect(res.body.data.events).toBeUndefined();
    }
    for (const cookie of [w.as.ownCoach, w.as.admin]) {
      expect((await get(draft, cookie)).body.data.lineup.length).toBeGreaterThan(0);
    }
  });

  it('returns a fixture with no result yet', async () => {
    const fixture = await createMatch(w, { kickoffAt: new Date('2026-11-01T12:00:00Z') });
    const res = await get(fixture);
    expect(res.body.data).toMatchObject({ status: 'upcoming', score: null, published: false });
  });

  it('404s for a missing match', async () => {
    const res = await api.get('/api/v1/matches/6650a1f0c0a8e1a1b2c3d470');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('ratio stats', () => {
  it('are computed from their parts, never stored', () => {
    const defs = [{ key: 'freeThrowPct', type: 'ratio', ratio: { numerator: 'freeThrowsMade', denominator: 'freeThrowsAttempted' } }];
    expect(withRatios(defs, { freeThrowsMade: 3, freeThrowsAttempted: 4 })).toEqual({ freeThrowsMade: 3, freeThrowsAttempted: 4, freeThrowPct: 75 });
    expect(withRatios(defs, {}).freeThrowPct).toBe(0);
  });
});
