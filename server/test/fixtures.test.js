import { beforeEach, describe, expect, it } from 'vitest';
import { Match } from '../src/models/Match.js';
import { Sport } from '../src/models/Sport.js';
import { Team } from '../src/models/Team.js';
import { TeamSeason } from '../src/models/TeamSeason.js';
import { basketball } from '../scripts/seed-data/sports.js';
import { api, createMatch, createWorld, expectPermissions, id } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
});

const fixture = (overrides = {}) => ({
  teamSeason: id(w.ownTeam),
  competition: id(w.league),
  round: 'Matchday 4',
  opponent: id(w.brookhouse),
  homeAway: 'away',
  kickoffAt: '2026-10-24T11:00:00.000Z',
  venue: 'Brookhouse Field',
  ...overrides,
});

describe('fixtures', () => {
  it('adds an upcoming, unpublished fixture in the team’s season', async () => {
    const res = await api.post('/api/v1/matches').set('Cookie', w.as.ownCoach).send(fixture());
    expect(res.status, JSON.stringify(res.body)).toBe(201);
    expect(res.body.data).toMatchObject({ status: 'upcoming', publishedAt: null, round: 'Matchday 4', opponent: { shortName: 'Brookhouse' }, season: { slug: '2026-2027' } });
  });

  it('rejects a competition of another sport and Turi as the opponent', async () => {
    const hoops = await Sport.create(basketball);
    const cup = await api.post('/api/v1/competitions').set('Cookie', w.as.admin).send({ sport: id(hoops), name: 'Hoops Cup', shortName: 'HC', type: 'cup' });
    const send = (body) => api.post('/api/v1/matches').set('Cookie', w.as.ownCoach).send(body);
    expect((await send(fixture({ competition: cup.body.data.id }))).body.error.details[0].path).toBe('/body/competition');
    expect((await send(fixture({ opponent: id(w.turi) }))).body.error.details[0].path).toBe('/body/opponent');
  });

  it('edits details with the version and refuses a stale one', async () => {
    const match = await createMatch(w);
    const edit = (version) => api.patch(`/api/v1/matches/${id(match)}`).set('Cookie', w.as.ownCoach).send({ version, venue: 'Turi Lower Pitch' });
    const ok = await edit(0);
    expect(ok.body.data).toMatchObject({ venue: 'Turi Lower Pitch', version: 1 });
    expect((await edit(0)).status).toBe(409);
  });

  it('only moves a fixture to a team the coach also runs, of the same sport', async () => {
    const match = await createMatch(w);
    const move = (cookie, teamSeason) => api.patch(`/api/v1/matches/${id(match)}`).set('Cookie', cookie).send({ version: 0, teamSeason });
    expect((await move(w.as.ownCoach, id(w.otherTeam))).status).toBe(403);
    const hoops = await Sport.create(basketball);
    const team = await Team.create({ sport: hoops._id, slug: 'senior-boys', name: 'Senior Boys', gender: 'boys' });
    const court = await TeamSeason.create({ team: team._id, season: w.season._id, sport: hoops._id });
    expect((await move(w.as.admin, id(court))).body.error.details[0].path).toBe('/body/teamSeason');
    const moved = await move(w.as.admin, id(w.otherTeam));
    expect(moved.body.data.team.slug).toBe('second-xi');
  });

  it('follows the permission matrix', async () => {
    await expectPermissions(w, { anonymous: 401, otherCoach: 403, ownCoach: 201, admin: 201 }, () => api.post('/api/v1/matches').send(fixture()));
    await expectPermissions(
      w,
      { anonymous: 401, otherCoach: 403, ownCoach: 200, admin: 200 },
      (m) => api.patch(`/api/v1/matches/${id(m)}`).send({ version: m.__v, round: 'Final' }),
      () => createMatch(w),
    );
    await expectPermissions(
      w,
      { anonymous: 401, otherCoach: 403, ownCoach: 204, admin: 204 },
      (m) => api.delete(`/api/v1/matches/${id(m)}`),
      () => createMatch(w),
    );
    expect(await Match.countDocuments()).toBe(8); // 2 created + 4 to edit + 4 to delete − 2 deleted
  });
});
