import { beforeEach, describe, expect, it } from 'vitest';
import { Competition } from '../src/models/Competition.js';
import { Team } from '../src/models/Team.js';
import { TeamSeason } from '../src/models/TeamSeason.js';
import { api, createMatch, createWorld, expectPermissions, id } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
});

const ADMIN_ONLY = (ok) => ({ anonymous: 401, otherCoach: 403, ownCoach: 403, admin: ok });

describe('competitions', () => {
  it('lists by sport and type, sorted by name', async () => {
    const res = await api.get('/api/v1/competitions?sport=football');
    expect(res.body.data.map((c) => c.shortName)).toEqual(['IAPS', 'KISL']);
    expect(res.body.data[0].sport).toMatchObject({ slug: 'football' });
    expect((await api.get('/api/v1/competitions?type=league')).body.data).toHaveLength(1);
    expect((await api.get('/api/v1/competitions?sport=rugby')).status).toBe(400);
  });

  it('rejects an unknown sport on create', async () => {
    const res = await api.post('/api/v1/competitions').set('Cookie', w.as.admin).send({ sport: id(w.season), name: 'X', shortName: 'X', type: 'cup' });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].path).toBe('/body/sport');
  });

  it("won't delete a competition in use", async () => {
    expect((await api.delete(`/api/v1/competitions/${id(w.league)}`).set('Cookie', w.as.admin)).status).toBe(409);
    await createMatch(w, { competition: w.cup._id });
    expect((await api.delete(`/api/v1/competitions/${id(w.cup)}`).set('Cookie', w.as.admin)).status).toBe(409);
  });

  it('follows the permission matrix', async () => {
    let n = 0;
    await expectPermissions(w, ADMIN_ONLY(201), () =>
      api.post('/api/v1/competitions').send({ sport: id(w.sport), name: `Friendly ${(n += 1)}`, shortName: 'F', type: 'friendly' }),
    );
    await expectPermissions(w, ADMIN_ONLY(200), () => api.patch(`/api/v1/competitions/${id(w.cup)}`).send({ shortName: 'IAPS Cup' }));
    await expectPermissions(
      w,
      ADMIN_ONLY(204),
      (c) => api.delete(`/api/v1/competitions/${id(c)}`),
      () => Competition.create({ sport: w.sport._id, name: `Temporary ${(n += 1)}`, shortName: 'T', type: 'cup' }),
    );
  });
});

describe('teams', () => {
  it('lists by sport in order', async () => {
    const res = await api.get('/api/v1/teams?sport=football');
    expect(res.body.data.map((t) => t.slug)).toEqual(['first-xi', 'second-xi']);
    expect(res.body.data[0]).toMatchObject({ gender: 'boys', ageGroup: 'Open', order: 1 });
  });

  it('rejects a duplicate slug in the same sport', async () => {
    const res = await api.post('/api/v1/teams').set('Cookie', w.as.admin).send({ sport: id(w.sport), slug: 'first-xi', name: 'Copy', ageGroup: 'U19', gender: 'boys' });
    expect(res.status).toBe(409);
  });

  it("won't delete a team that has seasons", async () => {
    expect((await api.delete(`/api/v1/teams/${id(w.firstXI)}`).set('Cookie', w.as.admin)).status).toBe(409);
  });

  it('follows the permission matrix', async () => {
    let n = 0;
    await expectPermissions(w, ADMIN_ONLY(201), () =>
      api.post('/api/v1/teams').send({ sport: id(w.sport), slug: `u14-${(n += 1)}`, name: 'Under 14', ageGroup: 'U14', gender: 'mixed' }),
    );
    await expectPermissions(w, ADMIN_ONLY(200), () => api.patch(`/api/v1/teams/${id(w.secondXI)}`).send({ ageGroup: 'U17' }));
    await expectPermissions(
      w,
      ADMIN_ONLY(204),
      (t) => api.delete(`/api/v1/teams/${id(t)}`),
      () => Team.create({ sport: w.sport._id, slug: `temp-${(n += 1)}`, name: 'Temp', gender: 'girls' }),
    );
  });
});

describe('team-seasons (season setup)', () => {
  const enter = (body) => api.post('/api/v1/team-seasons').set('Cookie', w.as.admin).send(body);

  it('enters a team in a season, copying last season’s members', async () => {
    const last = await TeamSeason.create({ team: w.firstXI._id, season: w.previous._id, sport: w.sport._id, members: w.ownTeam.members, captain: w.players[0]._id });
    await TeamSeason.deleteOne({ _id: w.ownTeam._id });
    const res = await enter({ team: id(w.firstXI), season: id(w.season), leagueCompetition: id(w.league), copyFrom: id(last) });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ team: { slug: 'first-xi' }, leagueCompetition: { shortName: 'KISL' }, captain: null, version: 0 });
    expect(res.body.data.members).toHaveLength(14);
  });

  it('only accepts a league of the same sport, and copies only from the same team', async () => {
    await TeamSeason.deleteOne({ _id: w.ownTeam._id });
    const cup = await enter({ team: id(w.firstXI), season: id(w.season), leagueCompetition: id(w.cup) });
    expect(cup.status).toBe(400);
    expect(cup.body.error.details[0].path).toBe('/body/leagueCompetition');
    const copy = await enter({ team: id(w.firstXI), season: id(w.season), copyFrom: id(w.otherTeam) });
    expect(copy.body.error.details[0].path).toBe('/body/copyFrom');
  });

  it('rejects entering the same team twice in a season', async () => {
    expect((await enter({ team: id(w.firstXI), season: id(w.season) })).status).toBe(409);
  });

  it('updates the league and quote with the version, 409 when stale', async () => {
    const send = (version) =>
      api.patch(`/api/v1/team-seasons/${id(w.otherTeam)}`).set('Cookie', w.as.admin).send({ version, leagueCompetition: id(w.league), seasonQuote: { text: 'Together.', attribution: 'Head Coach' } });
    const ok = await send(0);
    expect(ok.status, JSON.stringify(ok.body)).toBe(200);
    expect(ok.body.data).toMatchObject({ leagueCompetition: { shortName: 'KISL' }, seasonQuote: { text: 'Together.' }, version: 1 });
    expect((await send(0)).status).toBe(409);
  });

  it("won't remove a team-season with matches or coaches", async () => {
    expect((await api.delete(`/api/v1/team-seasons/${id(w.ownTeam)}`).set('Cookie', w.as.admin)).status).toBe(409);
  });

  it('follows the permission matrix', async () => {
    await expectPermissions(
      w,
      ADMIN_ONLY(201),
      () => api.post('/api/v1/team-seasons').send({ team: id(w.secondXI), season: id(w.previous) }),
      () => TeamSeason.deleteMany({ season: w.previous._id }),
    );
    await expectPermissions(
      w,
      ADMIN_ONLY(200),
      (ts) => api.patch(`/api/v1/team-seasons/${id(ts)}`).send({ version: ts.__v, seasonQuote: null }),
      () => TeamSeason.findById(w.ownTeam._id).lean(),
    );
    await expectPermissions(
      w,
      ADMIN_ONLY(204),
      (ts) => api.delete(`/api/v1/team-seasons/${id(ts)}`),
      () => TeamSeason.findOneAndUpdate({ team: w.secondXI._id, season: w.previous._id }, { sport: w.sport._id }, { upsert: true, new: true }),
    );
  });
});
