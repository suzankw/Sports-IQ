import { beforeEach, describe, expect, it } from 'vitest';
import { Season } from '../src/models/Season.js';
import { Sport } from '../src/models/Sport.js';
import { api, createMatch, createWorld } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
  await createMatch(w, { kickoffAt: new Date('2026-09-05T12:00:00Z'), score: { turi: 3, opponent: 0 } });
  await createMatch(w, { kickoffAt: new Date('2026-09-12T12:00:00Z'), score: { turi: 2, opponent: 2 }, teamSeason: w.otherTeam });
  for (const d of [24, 25, 26, 27, 28]) await createMatch(w, { kickoffAt: new Date(`2026-11-${d}T12:00:00Z`) });
});

const overview = (slug = 'football') => api.get(`/api/v1/sports/${slug}/overview`);

describe('GET /sports/{sport}/overview', () => {
  it('returns content, the next 4 fixtures, top scorers across teams and the first team’s table', async () => {
    const res = await overview();
    expect(res.status).toBe(200);
    const { sport, upcoming, topScorers, standings } = res.body.data;
    expect(sport.content.hero.title).toBe('Football IQ');
    expect(upcoming.map((m) => m.kickoffAt.slice(0, 10))).toEqual(['2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27']);
    expect(topScorers.length).toBeGreaterThan(0);
    expect(topScorers.reduce((sum, r) => sum + r.value, 0)).toBeLessThanOrEqual(5);
    expect(standings).toMatchObject({ team: { slug: 'first-xi' }, competition: { shortName: 'KISL' } });
    expect(standings.rows.length).toBeLessThanOrEqual(4);
  });

  it('has empty widgets for a coming-soon sport', async () => {
    await Sport.create({ slug: 'rugby', name: 'Rugby', icon: 'sports_rugby', order: 4 });
    const res = await overview('rugby');
    expect(res.body.data).toMatchObject({ sport: { status: 'comingSoon' }, upcoming: [], topScorers: [], standings: null });
  });

  it('has empty widgets before any season is current', async () => {
    await Season.updateMany({}, { isCurrent: false });
    expect((await overview()).body.data).toMatchObject({ upcoming: [], standings: null });
  });

  it('404s for an unknown sport', async () => {
    expect((await overview('quidditch')).status).toBe(404);
  });
});
