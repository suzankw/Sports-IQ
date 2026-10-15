import { beforeEach, describe, expect, it } from 'vitest';
import { Inductee } from '../src/models/Inductee.js';
import { LeagueResult } from '../src/models/LeagueResult.js';
import { api, createWorld, expectPermissions, id } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
});

const ADMIN_ONLY = (ok) => ({ anonymous: 401, otherCoach: 403, ownCoach: 403, admin: ok });

describe('other schools’ league results', () => {
  const result = (overrides = {}) => ({
    competition: id(w.league),
    season: id(w.season),
    playedAt: '2026-10-03T10:00:00.000Z',
    home: { school: id(w.peponi), score: 2 },
    away: { school: id(w.brookhouse), score: 2 },
    ...overrides,
  });
  const create = (body) => api.post('/api/v1/league-results').set('Cookie', w.as.admin).send(body);

  it('adds a result that counts in the league table', async () => {
    expect((await create(result())).status).toBe(201);
    const table = await api.get(`/api/v1/competitions/${id(w.league)}/standings`);
    const peponi = table.body.data.rows.find((r) => r.school.id === id(w.peponi));
    expect(peponi).toMatchObject({ played: 1, drawn: 1 });
    const list = await api.get(`/api/v1/league-results?competition=${id(w.league)}`);
    expect(list.body.data[0]).toMatchObject({ home: { school: { shortName: 'Peponi' }, score: 2 }, season: { slug: '2026-2027' } });
  });

  it('only takes leagues, two different schools and never Turi', async () => {
    expect((await create(result({ competition: id(w.cup) }))).body.error.details[0].path).toBe('/body/competition');
    expect((await create(result({ away: { school: id(w.peponi), score: 1 } }))).body.error.details[0].path).toBe('/body/away/school');
    expect((await create(result({ home: { school: id(w.turi), score: 1 } }))).body.error.details[0].path).toBe('/body/home/school');
  });

  it('follows the permission matrix', async () => {
    await expectPermissions(w, ADMIN_ONLY(201), () => api.post('/api/v1/league-results').send(result()));
    const make = () => LeagueResult.create({ ...result(), home: { school: w.peponi._id, score: 1 }, away: { school: w.brookhouse._id, score: 0 } });
    await expectPermissions(w, ADMIN_ONLY(200), (r) => api.patch(`/api/v1/league-results/${id(r)}`).send({ away: { school: id(w.brookhouse), score: 3 } }), make);
    await expectPermissions(w, ADMIN_ONLY(204), (r) => api.delete(`/api/v1/league-results/${id(r)}`), make);
  });
});

describe('Hall of Fame', () => {
  it('lists inductees by order, filtered by sport', async () => {
    await Inductee.create([
      { name: 'Grace Wanjiru', achievement: 'Captained the 2019 champions', sport: w.sport._id, order: 2 },
      { name: 'Daniel Mutua', achievement: 'Record scorer', sport: w.sport._id, order: 1, player: w.players[0]._id },
      { name: 'Ruth Akinyi', achievement: 'Founding coach', order: 0 },
    ]);
    const all = await api.get('/api/v1/inductees');
    expect(all.body.data.map((i) => i.name)).toEqual(['Ruth Akinyi', 'Daniel Mutua', 'Grace Wanjiru']);
    expect(all.body.data[1]).toMatchObject({ sport: { slug: 'football' }, player: { shortName: 'A. Otieno0' } });
    expect((await api.get('/api/v1/inductees?sport=football')).body.meta.total).toBe(2);
  });

  it('follows the permission matrix', async () => {
    const make = () => Inductee.create({ name: 'Temp', achievement: 'Something' });
    await expectPermissions(w, ADMIN_ONLY(201), () => api.post('/api/v1/inductees').send({ name: 'Peter Kimani', achievement: 'Coach of 20 years', sport: id(w.sport), years: '2001–2021' }));
    await expectPermissions(w, ADMIN_ONLY(200), (i) => api.patch(`/api/v1/inductees/${id(i)}`).send({ citation: 'For service.' }), make);
    await expectPermissions(w, ADMIN_ONLY(204), (i) => api.delete(`/api/v1/inductees/${id(i)}`), make);
  });
});
