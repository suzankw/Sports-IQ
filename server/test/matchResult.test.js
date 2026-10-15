import { beforeEach, describe, expect, it } from 'vitest';
import { generateResult } from '../scripts/seed-data/matchDetails.js';
import { createRandom } from '../scripts/seed-data/random.js';
import { football } from '../scripts/seed-data/sports.js';
import { api, createMatch, createWorld, expectPermissions, id } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
});

const EVENT_KEYS = ['goals', 'assists', 'yellowCards', 'redCards'];
const typed = (stats) => Object.fromEntries(Object.entries(stats).filter(([key]) => !EVENT_KEYS.includes(key)));
const defined = (object) => Object.fromEntries(Object.entries(object).filter(([, value]) => value !== null && value !== undefined));

/** A consistent result for the coach's squad, shaped like the D14 form sends it (no event-sourced stats, no numbers). */
function resultInput({ score = { turi: 2, opponent: 1 }, ...overrides } = {}) {
  const r = generateResult(createRandom(11), football, w.ownTeam.members, score);
  return {
    version: 0,
    status: 'completed',
    score,
    periodScores: [],
    events: r.events.map(defined),
    formation: r.formation,
    lineup: r.lineup.map(({ player, slot }) => ({ player, slot })),
    teamStats: { turi: typed(r.teamStats.turi), opponent: r.teamStats.opponent },
    playerStats: r.playerStats.map(({ player, position, stats }) => ({ player, position, stats: typed(stats) })),
    topPerformers: r.topPerformers,
    report: r.report,
    heroPhotoUrl: null,
    galleryUrls: [],
    published: true,
    ...overrides,
  };
}

const save = (match, body, cookie = w.as.ownCoach) => api.put(`/api/v1/matches/${id(match)}/result`).set('Cookie', cookie).send(body);
const paths = (res) => res.body.error?.details.map((d) => d.path);

describe('match result entry', () => {
  it('publishes a full result, counting goals and cards from the events', async () => {
    const match = await createMatch(w);
    const res = await save(match, resultInput());
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    const { data } = res.body;
    expect(data).toMatchObject({ status: 'completed', score: { turi: 2, opponent: 1 }, published: true, version: 1 });
    expect(data.publishedAt).not.toBeNull();
    expect(data.playerStats.reduce((n, row) => n + row.stats.goals, 0)).toBe(2);
    expect(data.lineup.every((l) => Number.isInteger(l.number))).toBe(true);
  });

  it('keeps a draft private apart from the score', async () => {
    const match = await createMatch(w);
    await save(match, resultInput({ published: false }));
    const pub = await api.get(`/api/v1/matches/${id(match)}`);
    expect(pub.body.data).toMatchObject({ published: false, publishedAt: null, score: { turi: 2 } });
    expect(pub.body.data.events).toBeUndefined();
    expect((await api.get(`/api/v1/matches/${id(match)}`).set('Cookie', w.as.ownCoach)).body.data.events.length).toBeGreaterThan(0);
  });

  it('saves a live score without stats, and needs a score once started', async () => {
    const match = await createMatch(w);
    const empty = { events: [], lineup: [], playerStats: [], topPerformers: [], teamStats: { turi: {}, opponent: {} }, formation: null, report: null, published: false };
    const live = await save(match, resultInput({ ...empty, status: 'live', score: { turi: 1, opponent: 0 } }));
    expect(live.status, JSON.stringify(live.body)).toBe(200);
    const noScore = { ...resultInput({ ...empty, version: 1, status: 'live' }), score: null };
    expect(paths(await save(match, noScore))).toEqual(['/body/score']);
  });

  it('checks squad players, formation slots and stat keys', async () => {
    const match = await createMatch(w);
    const input = resultInput({ published: false });
    const starters = input.lineup.filter((l) => l.slot);
    input.lineup.push({ player: id(w.players[20]), slot: null });
    starters[1].slot = starters[0].slot;
    starters[2].slot = 'XX';
    input.playerStats[0].stats.goals = 3;
    input.playerStats[1].stats.minutes = 200;
    input.teamStats.turi.madeUp = 1;
    const res = await save(match, input);
    expect(res.status).toBe(400);
    expect(paths(res)).toEqual(
      expect.arrayContaining(['/body/lineup/14/player', '/body/lineup/1/slot', '/body/lineup/2/slot', '/body/playerStats/0/stats/goals', '/body/playerStats/1/stats/minutes', '/body/teamStats/turi/madeUp']),
    );
  });

  it('runs the publish checks: finished, score adds up, top performers played', async () => {
    const match = await createMatch(w);
    const input = resultInput({ status: 'live' });
    input.score = { turi: 3, opponent: 1 };
    input.topPerformers = [id(w.players[13])];
    input.playerStats = input.playerStats.filter((row) => String(row.player) !== id(w.players[13]));
    input.lineup = input.lineup.filter((l) => String(l.player) !== id(w.players[13]));
    input.events = input.events.filter((e) => ![e.player, e.assist, e.playerOff].map(String).includes(id(w.players[13])));
    const res = await save(match, input);
    expect(paths(res)).toEqual(['/body/status', '/body/score/turi', '/body/topPerformers/0']);
  });

  it('refuses a stale version', async () => {
    const match = await createMatch(w);
    expect((await save(match, resultInput({ published: false }))).status).toBe(200);
    expect((await save(match, resultInput({ published: false }))).status).toBe(409);
  });

  it('follows the permission matrix', async () => {
    await expectPermissions(
      w,
      { anonymous: 401, otherCoach: 403, ownCoach: 200, admin: 200 },
      (match) => api.put(`/api/v1/matches/${id(match)}/result`).send(resultInput()),
      () => createMatch(w),
    );
  });
});
