import { beforeEach, describe, expect, it } from 'vitest';
import { LeagueResult } from '../src/models/LeagueResult.js';
import { School } from '../src/models/School.js';
import { api, createMatch, createWorld, id } from './helpers.js';

let w;
let hillcrest;
const day = (d) => new Date(`2026-09-${String(d).padStart(2, '0')}T12:00:00Z`);

beforeEach(async () => {
  w = await createWorld();
  hillcrest = await School.create({ name: 'Hillcrest International School', shortName: 'Hillcrest' });
  // Turi: W 2–0 Peponi, D 1–1 Brookhouse, L 0–1 Peponi; plus a draft and a cup game that must not count.
  await createMatch(w, { kickoffAt: day(5), score: { turi: 2, opponent: 0 } });
  await createMatch(w, { kickoffAt: day(12), score: { turi: 1, opponent: 1 }, opponent: w.brookhouse._id });
  await createMatch(w, { kickoffAt: day(19), score: { turi: 0, opponent: 1 } });
  await createMatch(w, { kickoffAt: day(26), score: { turi: 9, opponent: 0 }, published: false });
  await createMatch(w, { kickoffAt: day(27), score: { turi: 5, opponent: 0 }, competition: w.cup._id });
  // Other schools: Peponi 3–0 Hillcrest, Brookhouse 2–2 Hillcrest.
  const result = (playedAt, home, homeScore, away, awayScore) => ({ competition: w.league._id, season: w.season._id, playedAt, home: { school: home._id, score: homeScore }, away: { school: away._id, score: awayScore } });
  await LeagueResult.insertMany([result(day(6), w.peponi, 3, hillcrest, 0), result(day(13), w.brookhouse, 2, hillcrest, 2)]);
});

const standings = () => api.get(`/api/v1/competitions/${id(w.league)}/standings`);

describe('GET /competitions/{id}/standings', () => {
  it('builds the table from Turi’s published league results and other schools’ results', async () => {
    const res = await standings();
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ competition: { shortName: 'KISL' }, season: { slug: '2026-2027' }, sport: { slug: 'football' } });
    const rows = res.body.data.rows.map((r) => [r.position, r.school.shortName, r.played, r.won, r.drawn, r.lost, r.goalsFor, r.goalsAgainst, r.goalDifference, r.points, r.form.join('')]);
    expect(rows).toEqual([
      [1, 'Peponi', 3, 2, 0, 1, 4, 2, 2, 6, 'LWW'],
      [2, "St. Andrew's Turi", 3, 1, 1, 1, 3, 2, 1, 4, 'WDL'],
      [3, 'Brookhouse', 2, 0, 2, 0, 3, 3, 0, 2, 'DD'],
      [4, 'Hillcrest', 2, 0, 1, 1, 2, 5, -3, 1, 'LD'],
    ]);
    expect(res.body.data.rows.find((r) => r.isHome).school.id).toBe(id(w.turi));
  });

  it('uses the sport’s points rules', async () => {
    w.sport.standingsPoints = { win: 2, draw: 1, loss: 0 };
    await w.sport.save();
    const peponi = (await standings()).body.data.rows.find((r) => r.school.shortName === 'Peponi');
    expect(peponi.points).toBe(4);
  });

  it('keeps only the last five results in the form guide', async () => {
    for (let d = 1; d <= 4; d += 1) await createMatch(w, { kickoffAt: new Date(`2026-10-0${d}T12:00:00Z`), score: { turi: 3, opponent: 0 } });
    const turi = (await standings()).body.data.rows.find((r) => r.isHome);
    expect(turi.form).toEqual(['L', 'W', 'W', 'W', 'W']);
  });

  it('404s for an unknown competition and 400s for an unknown season', async () => {
    expect((await api.get('/api/v1/competitions/6650a1f0c0a8e1a1b2c3d470/standings')).status).toBe(404);
    expect((await api.get(`/api/v1/competitions/${id(w.league)}/standings?season=1999-2000`)).status).toBe(400);
  });
});
