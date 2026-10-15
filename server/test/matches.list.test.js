import { beforeEach, describe, expect, it } from 'vitest';
import { api, createMatch, createWorld, id } from './helpers.js';

let w;
const at = (iso) => new Date(iso);

beforeEach(async () => {
  w = await createWorld();
  await createMatch(w, { kickoffAt: at('2026-09-12T12:00:00Z'), score: { turi: 2, opponent: 0 } });
  await createMatch(w, { kickoffAt: at('2026-09-30T22:30:00Z'), score: { turi: 1, opponent: 1 }, published: false }); // 1 Oct, 01:30 EAT
  await createMatch(w, { kickoffAt: at('2026-10-24T12:00:00Z'), status: 'live', score: { turi: 0, opponent: 0 }, published: false, opponent: w.brookhouse._id });
  await createMatch(w, { kickoffAt: at('2026-11-07T12:00:00Z') });
  await createMatch(w, { kickoffAt: at('2026-11-01T10:00:00Z'), teamSeason: w.otherTeam });
});

const list = (query, cookie) => {
  const req = api.get(`/api/v1/matches?${query}`);
  return cookie ? req.set('Cookie', cookie) : req;
};
const kickoffs = (res) => res.body.data.map((m) => m.kickoffAt.slice(0, 10));

describe('GET /matches', () => {
  it('lists a sport’s current season with public fields only', async () => {
    const res = await list('sport=football');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(5);
    expect(res.body.data[0]).toMatchObject({ team: { slug: 'first-xi' }, opponent: { shortName: 'Peponi' }, competition: { shortName: 'KISL' } });
    expect(res.body.data[0].lineup).toBeUndefined();
  });

  it('splits upcoming (soonest first, live included) from completed (latest first)', async () => {
    expect(kickoffs(await list('sport=football&view=upcoming'))).toEqual(['2026-10-24', '2026-11-01', '2026-11-07']);
    expect(kickoffs(await list('sport=football&view=completed'))).toEqual(['2026-09-30', '2026-09-12']);
  });

  it('filters by team and by EAT calendar month', async () => {
    expect((await list('sport=football&team=second-xi')).body.meta.total).toBe(1);
    expect(kickoffs(await list('sport=football&month=2026-10'))).toEqual(['2026-09-30', '2026-10-24']);
  });

  it('finds the live match for the banner', async () => {
    const res = await list('sport=football&status=live&pageSize=1');
    expect(res.body.data).toEqual([expect.objectContaining({ status: 'live', opponent: expect.objectContaining({ shortName: 'Brookhouse' }) })]);
  });

  it('lists my unpublished results for the dashboard, and needs a session for mine', async () => {
    expect((await list('mine=true')).status).toBe(401);
    const res = await list('mine=true&status=completed&published=false', w.as.ownCoach);
    expect(kickoffs(res)).toEqual(['2026-09-30']);
    expect((await list('mine=true', w.as.otherCoach)).body.meta.total).toBe(1);
  });

  it('rejects bad filters', async () => {
    expect((await list('team=first-xi')).status).toBe(400);
    expect((await list('month=2026-13')).status).toBe(400);
    expect((await list('sport=quidditch')).status).toBe(400);
  });

  it('pages results', async () => {
    const res = await list('sport=football&pageSize=2&page=2');
    expect(res.body.meta).toEqual({ page: 2, pageSize: 2, total: 5 });
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((m) => typeof m.id === 'string' && m.id !== id(w.ownTeam))).toBe(true);
  });
});
