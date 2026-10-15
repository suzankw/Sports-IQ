import { beforeEach, describe, expect, it } from 'vitest';
import { Match } from '../src/models/Match.js';
import { TeamSeason } from '../src/models/TeamSeason.js';
import { api, createMatch, createWorld, id } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
});

describe('GET /team-seasons', () => {
  it('lists a sport’s teams for the current season in team order', async () => {
    const res = await api.get('/api/v1/team-seasons?sport=football');
    expect(res.status).toBe(200);
    expect(res.body.data.map((ts) => ts.team.slug)).toEqual(['first-xi', 'second-xi']);
    expect(res.body.data[0]).toMatchObject({ memberCount: 14, season: { slug: '2026-2027' }, leagueCompetition: { shortName: 'KISL' } });
  });

  it('resolves a page URL (sport + team + season) to one team-season', async () => {
    const res = await api.get('/api/v1/team-seasons?sport=football&team=second-xi&season=2026-2027');
    expect(res.body.data).toEqual([expect.objectContaining({ id: id(w.otherTeam) })]);
  });

  it('needs a sport when filtering by team', async () => {
    expect((await api.get('/api/v1/team-seasons?team=first-xi')).status).toBe(400);
  });

  it('lists only my assignments with mine=true, and needs a session for it', async () => {
    expect((await api.get('/api/v1/team-seasons?mine=true')).status).toBe(401);
    const res = await api.get('/api/v1/team-seasons?mine=true').set('Cookie', w.as.ownCoach);
    expect(res.body.data.map((ts) => ts.id)).toEqual([id(w.ownTeam)]);
  });
});

describe('GET /team-seasons/{id}', () => {
  it('returns the roster page: squad, coaches, captain and analytics', async () => {
    await TeamSeason.updateOne({ _id: w.ownTeam._id }, { captain: w.players[5]._id });
    const res = await api.get(`/api/v1/team-seasons/${id(w.ownTeam)}`);
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.members).toHaveLength(14);
    expect(data.captain.id).toBe(id(w.players[5]));
    expect(data.staff).toEqual([{ user: expect.objectContaining({ id: id(w.coach) }), role: 'head' }]);
    expect(data.analytics.playerCount).toBe(14);
    expect(data.analytics.gender.female + data.analytics.gender.male).toBe(14);
    expect(data.analytics.academy.map((a) => [a.team.slug, a.playerCount, a.share])).toEqual([['first-xi', 14, 50], ['second-xi', 14, 50]]);
  });

  it('counts players from last season’s squads as returning', async () => {
    await TeamSeason.create({ team: w.firstXI._id, season: w.previous._id, sport: w.sport._id, members: w.ownTeam.members.slice(0, 9) });
    const res = await api.get(`/api/v1/team-seasons/${id(w.ownTeam)}`);
    const comparison = Object.fromEntries(res.body.data.analytics.comparison.map((c) => [c.metric, c]));
    expect(comparison.returning).toEqual({ metric: 'returning', current: 9, previous: 0 });
    expect(comparison.new).toEqual({ metric: 'new', current: 5, previous: 9 });
  });

  it('shows the three latest photos from published matches only', async () => {
    const match = await createMatch(w, { score: { turi: 1, opponent: 0 } });
    await Match.updateOne({ _id: match._id }, { galleryUrls: ['/uploads/a.jpg', '/uploads/b.jpg', '/uploads/c.jpg', '/uploads/d.jpg'] });
    const draft = await createMatch(w, { score: { turi: 2, opponent: 0 }, published: false, kickoffAt: new Date('2026-10-20T12:00:00Z') });
    await Match.updateOne({ _id: draft._id }, { galleryUrls: ['/uploads/draft.jpg'] });
    const res = await api.get(`/api/v1/team-seasons/${id(w.ownTeam)}`);
    expect(res.body.data.gallery.map((g) => g.url)).toEqual(['/uploads/a.jpg', '/uploads/b.jpg', '/uploads/c.jpg']);
  });
});
