import { beforeEach, describe, expect, it } from 'vitest';
import { Player } from '../src/models/Player.js';
import { TeamSeason } from '../src/models/TeamSeason.js';
import { api, createMatch, createWorld, expectPermissions, id } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
});

const squadOf = async (teamSeason) => {
  const ts = await TeamSeason.findById(teamSeason._id).lean();
  return {
    version: ts.__v,
    members: ts.members.map((m) => ({ player: String(m.player), number: m.number, position: m.position })),
    captain: null,
    depthChart: [],
  };
};

describe('players', () => {
  it('searches the start of first or last names and filters by squad', async () => {
    await Player.create({ firstName: 'Zawadi', lastName: 'Kamau', gender: 'female' });
    expect((await api.get('/api/v1/players?search=kam')).body.data.map((p) => p.shortName)).toEqual(['Z. Kamau']);
    expect((await api.get('/api/v1/players?search=zaw')).body.meta.total).toBe(1);
    expect((await api.get('/api/v1/players?search=' + encodeURIComponent('[a'))).body.meta.total).toBe(0);
    const squad = await api.get(`/api/v1/players?teamSeason=${id(w.ownTeam)}&pageSize=50`);
    expect(squad.body.meta.total).toBe(14);
    expect((await api.get(`/api/v1/players?teamSeason=${id(w.season)}`)).status).toBe(400);
  });

  it("won't delete a player who is in a squad or a match", async () => {
    expect((await api.delete(`/api/v1/players/${id(w.players[0])}`).set('Cookie', w.as.admin)).status).toBe(409);
  });

  it('follows the permission matrix', async () => {
    await expectPermissions(w, { anonymous: 401, otherCoach: 201, ownCoach: 201, admin: 201 }, () =>
      api.post('/api/v1/players').send({ firstName: 'Neema', lastName: 'Wairimu', gender: 'female' }),
    );
    await expectPermissions(w, { anonymous: 401, otherCoach: 403, ownCoach: 200, admin: 200 }, () =>
      api.patch(`/api/v1/players/${id(w.players[0])}`).send({ photoUrl: '/uploads/seed/player.jpg' }),
    );
    await expectPermissions(
      w,
      { anonymous: 401, otherCoach: 403, ownCoach: 403, admin: 204 },
      (p) => api.delete(`/api/v1/players/${id(p)}`),
      () => Player.create({ firstName: 'Temp', lastName: 'Player', gender: 'male' }),
    );
  });
});

describe('squad', () => {
  const save = (body, teamSeason = w.ownTeam) => api.put(`/api/v1/team-seasons/${id(teamSeason)}/squad`).set('Cookie', w.as.ownCoach).send(body);

  it('replaces members, captain and depth chart', async () => {
    const squad = await squadOf(w.ownTeam);
    const newcomer = await Player.create({ firstName: 'Baraka', lastName: 'Mwangi', gender: 'male' });
    squad.members = [...squad.members.slice(1), { player: id(newcomer), number: 99, position: 'FW' }];
    squad.captain = id(newcomer);
    squad.depthChart = [{ position: 'FW', players: [id(newcomer)] }];
    const res = await save(squad);
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body.data).toMatchObject({ captain: { shortName: 'B. Mwangi' }, version: squad.version + 1, depthChart: [{ position: 'FW', players: [{ shortName: 'B. Mwangi' }] }] });
    expect(res.body.data.members).toHaveLength(14);
  });

  it('checks numbers, positions, players, captain and depth chart', async () => {
    const squad = await squadOf(w.ownTeam);
    squad.members[1].number = squad.members[0].number;
    squad.members[2].position = 'QB';
    squad.members[3].player = squad.members[4].player;
    squad.captain = id(w.players[20]);
    squad.depthChart = [{ position: 'FW', players: [id(w.players[21])] }];
    const res = await save(squad);
    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.path)).toEqual(['/body/members/1/number', '/body/members/2/position', '/body/members/4/player', '/body/captain', '/body/depthChart/0/players']);
  });

  it('refuses a stale version', async () => {
    const squad = await squadOf(w.ownTeam);
    expect((await save(squad)).status).toBe(200);
    expect((await save(squad)).status).toBe(409);
  });

  it('keeps match numbers when the squad changes', async () => {
    const match = await createMatch(w, { score: { turi: 1, opponent: 0 } });
    const squad = await squadOf(w.ownTeam);
    squad.members = squad.members.map((m) => ({ ...m, number: m.number + 50 }));
    await save(squad);
    const res = await api.get(`/api/v1/matches/${id(match)}`);
    expect(res.body.data.lineup.every((l) => l.number < 50)).toBe(true);
  });

  it('follows the permission matrix', async () => {
    await expectPermissions(
      w,
      { anonymous: 401, otherCoach: 403, ownCoach: 200, admin: 200 },
      (squad) => api.put(`/api/v1/team-seasons/${id(w.ownTeam)}/squad`).send(squad),
      () => squadOf(w.ownTeam),
    );
  });
});
