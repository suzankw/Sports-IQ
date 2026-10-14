import { beforeEach, describe, expect, it } from 'vitest';
import { Match } from '../src/models/Match.js';
import { api, createWorld, expectPermissions, id } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
});

describe('GET /sports', () => {
  it('lists sports by order with paging meta', async () => {
    const res = await api.get('/api/v1/sports');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ id: id(w.sport), slug: 'football', name: 'Football', icon: 'sports_soccer', order: 1, status: 'active' }]);
    expect(res.body.meta).toEqual({ page: 1, pageSize: 50, total: 1 });
  });
});

describe('GET /sports/{sport}', () => {
  it('returns definitions and content', async () => {
    const res = await api.get('/api/v1/sports/football');
    expect(res.status).toBe(200);
    expect(res.body.data.formations.map((f) => f.key)).toEqual(['4-3-3', '4-4-2', '4-2-3-1']);
    expect(res.body.data.playerStats.find((s) => s.key === 'goals')).toMatchObject({ source: 'events', abbr: 'G' });
    expect(res.body.data.content.hero.title).toBe('Football IQ');
  });

  it('404s for an unknown sport', async () => {
    expect((await api.get('/api/v1/sports/quidditch')).status).toBe(404);
  });
});

describe('PATCH /sports/{sport}', () => {
  const patch = (body) => api.patch('/api/v1/sports/football').set('Cookie', w.as.admin).send(body);

  it('updates and bumps the version', async () => {
    const res = await patch({ version: 0, name: 'Association Football' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ name: 'Association Football', version: 1 });
  });

  it('rejects a stale version', async () => {
    await patch({ version: 0, order: 3 });
    expect((await patch({ version: 0, order: 4 })).status).toBe(409);
  });

  it('rejects definitions that refer to unknown stats', async () => {
    const res = await patch({ version: 0, scoringStat: 'touchdowns' });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toContainEqual({ path: '/body/scoringStat', message: 'Unknown player stat' });
  });

  it("won't remove a stat that matches already use", async () => {
    await Match.collection.insertOne({ sport: w.sport._id, playerStats: [{ stats: { tackles: 3 } }] });
    const sport = (await api.get('/api/v1/sports/football')).body.data;
    const playerStats = sport.playerStats.filter((s) => s.key !== 'tackles');
    const leaderboards = sport.leaderboards.map((l) => ({ ...l, stats: l.stats.filter((k) => k !== 'tackles') }));
    const res = await patch({ version: 0, playerStats, leaderboards, positions: sport.positions.map((p) => ({ ...p, headlineStats: p.headlineStats.filter((k) => k !== 'tackles') })) });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].message).toContain('"tackles" is used');
  });

  it('follows the permission matrix', async () => {
    await expectPermissions(w, { anonymous: 401, otherCoach: 403, ownCoach: 403, admin: 200 }, () =>
      api.patch('/api/v1/sports/football').send({ version: 0, order: 1 }),
    );
  });
});

describe('POST /sports', () => {
  it('follows the permission matrix and starts as coming soon', async () => {
    let n = 0;
    await expectPermissions(w, { anonymous: 401, otherCoach: 403, ownCoach: 403, admin: 201 }, () =>
      api.post('/api/v1/sports').send({ slug: `rugby-${(n += 1)}`, name: 'Rugby', icon: 'sports_rugby', order: 4 }),
    );
    const res = await api.get('/api/v1/sports/rugby-4');
    expect(res.body.data).toMatchObject({ status: 'comingSoon', periods: null, positions: [] });
  });
});
