import { beforeEach, describe, expect, it } from 'vitest';
import { Match } from '../src/models/Match.js';
import { TeamSeason } from '../src/models/TeamSeason.js';
import { api, createMatch, createWorld, id } from './helpers.js';

let w;
const day = (d) => new Date(`2026-09-${String(d).padStart(2, '0')}T12:00:00Z`);

beforeEach(async () => {
  w = await createWorld();
  await createMatch(w, { kickoffAt: day(5), score: { turi: 3, opponent: 0 } });
  await createMatch(w, { kickoffAt: day(12), score: { turi: 1, opponent: 1 }, opponent: w.brookhouse._id });
  await createMatch(w, { kickoffAt: day(19), score: { turi: 0, opponent: 2 } });
  await createMatch(w, { kickoffAt: day(26), score: { turi: 5, opponent: 0 }, published: false });
});

const stats = (ts = w.ownTeam) => api.get(`/api/v1/team-seasons/${id(ts)}/stats`);

describe('GET /team-seasons/{id}/stats', () => {
  it('computes KPIs from published results only', async () => {
    const res = await stats();
    expect(res.status).toBe(200);
    expect(res.body.data.kpis).toMatchObject({ played: 3, won: 1, drawn: 1, lost: 1, winRate: 33.3, scored: 4, conceded: 3, cleanSheets: 1, winRateChange: null });
    expect(res.body.data.kpis.teamStat).toMatchObject({ key: 'possession', label: 'Possession' });
  });

  it('compares the win rate with the same team last season', async () => {
    const lastSeason = await TeamSeason.create({ team: w.firstXI._id, season: w.previous._id, sport: w.sport._id, members: w.ownTeam.members });
    await createMatch(w, { teamSeason: lastSeason, season: w.previous._id, kickoffAt: new Date('2026-03-01T12:00:00Z'), score: { turi: 0, opponent: 1 } });
    expect((await stats()).body.data.kpis.winRateChange).toBe(33.3);
  });

  it('gives the form for the last results, oldest first', async () => {
    const res = await stats();
    expect(res.body.data.form.map((f) => f.goalDifference)).toEqual([3, 0, -2]);
    expect(res.body.data.form[0].teamStat).toEqual(expect.any(Number));
  });

  it('ranks every leaderboard the sport defines, with appearances', async () => {
    const res = await stats();
    const boards = Object.fromEntries(res.body.data.leaderboards.map((b) => [b.key, b]));
    expect(Object.keys(boards)).toEqual(['scorers', 'playmakers', 'defense', 'yellowCards', 'redCards']);
    const totalGoals = boards.scorers.rows.reduce((sum, r) => sum + r.value, 0);
    expect(totalGoals).toBe(4);
    expect(boards.scorers.rows[0]).toMatchObject({ rank: 1, appearances: expect.any(Number), player: expect.objectContaining({ shortName: expect.any(String) }) });
    const values = boards.defense.rows.map((r) => r.value);
    expect(values).toEqual([...values].sort((a, b) => b - a));
  });

  it('finds the season records', async () => {
    const res = await stats();
    const records = Object.fromEntries(res.body.data.records.map((r) => [r.key, r]));
    expect(records.scoringPeak).toMatchObject({ value: 3, match: { score: { turi: 3, opponent: 0 } } });
    expect(records.dominantWin.value).toBe(3);
    expect(records.defensiveStruggle).toMatchObject({ value: 2, match: { opponent: { shortName: 'Peponi' } } });
  });

  it('copes with a team that has no results yet', async () => {
    await Match.deleteMany({});
    const res = await stats(w.otherTeam);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ kpis: { played: 0, winRate: 0 }, form: [], records: [] });
    expect(res.body.data.leaderboards.every((b) => b.rows.length === 0)).toBe(true);
  });
});
