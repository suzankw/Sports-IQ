// Each team-season's fixtures and results, plus the other schools' results in its league.
import { Competition } from '../../src/models/Competition.js';
import { LeagueResult } from '../../src/models/LeagueResult.js';
import { Match } from '../../src/models/Match.js';
import { doubleRoundRobin, LEAGUE_WEEKS, saturday } from './fixtures.js';
import { generateResult } from './matchDetails.js';
import { CUPS, OPPONENTS, VENUES } from './teams.js';

export const findOrCreateCompetition = (sport, { name, shortName, type }, audit) =>
  Competition.findOneAndUpdate({ sport: sport._id, name }, { $setOnInsert: { shortName, type, ...audit } }, { upsert: true, returnDocument: 'after' });

const LEAGUE_SCHOOLS = OPPONENTS.filter((o) => o.league).map((o) => o.key);

function scoreFor(rand, sport, ours, theirs) {
  if (sport.slug === 'football') return { turi: rand.poisson(ours), opponent: rand.poisson(0.5 + theirs * 0.6) };
  const [base, spread] = sport.slug === 'basketball' ? [42, 10] : [26, 7];
  const turi = base + Math.round(ours * spread) + rand.int(-8, 8);
  const opponent = base + Math.round(theirs * spread) + rand.int(-8, 8);
  // Basketball has no draws.
  return sport.slug === 'basketball' && turi === opponent ? { turi: turi + 2, opponent } : { turi, opponent };
}

/** League double round-robin, a friendly, a cup tie, and for the First XI the regional final (3–1, as in the mockups). */
async function planFixtures({ def, sport, season, league, audit }, now) {
  const year = season.startDate.getUTCFullYear();
  const cup = async (key) => (await findOrCreateCompetition(sport, CUPS[key], audit))._id;
  const fixtures = [];
  const others = [];
  doubleRoundRobin(['turi', ...LEAGUE_SCHOOLS]).forEach((pairs, round) => {
    const kickoffAt = saturday(year, LEAGUE_WEEKS[round], def.hour);
    for (const [home, away] of pairs) {
      if (home === 'turi' || away === 'turi') fixtures.push({ competition: league._id, opponent: home === 'turi' ? away : home, homeAway: home === 'turi' ? 'home' : 'away', kickoffAt });
      else if (kickoffAt < now) others.push({ home, away, kickoffAt });
    }
  });
  fixtures.push({ competition: await cup('friendly'), opponent: 'kenton', homeAway: 'home', kickoffAt: saturday(year, 2, def.hour) });
  fixtures.push({ competition: await cup('cup'), opponent: 'brookhouse', homeAway: 'away', round: 'Quarter-final', kickoffAt: saturday(year, 12, def.hour) });
  if (def.slug === 'first-xi') {
    fixtures.push({ competition: await cup('regional'), opponent: 'peponi', homeAway: 'home', round: 'Regional Final', kickoffAt: saturday(year, 4, def.hour), score: { turi: 3, opponent: 1 } });
    if (season.isCurrent) fixtures.push({ competition: await cup('friendly'), opponent: 'bge', homeAway: 'home', kickoffAt: new Date(now.getTime() - 35 * 60_000), live: true });
  }
  return { fixtures, others };
}

export async function createMatches(rand, context) {
  const { def, sport, season, teamSeason, league, schools, head, audit } = context;
  const now = new Date();
  const { fixtures, others } = await planFixtures(context, now);
  const played = fixtures.filter((f) => f.kickoffAt < now && !f.live).map((f) => f.kickoffAt.getTime());
  const latestPlayed = Math.max(...played);

  const docs = fixtures.map((f) => {
    const opponent = schools[f.opponent];
    const base = {
      teamSeason: teamSeason._id, sport: sport._id, season: season._id, competition: f.competition, round: f.round ?? null,
      opponent: opponent.doc._id, homeAway: f.homeAway, kickoffAt: f.kickoffAt,
      venue: f.homeAway === 'home' ? VENUES[sport.slug] : opponent.shortName, createdBy: head._id, updatedBy: head._id,
    };
    if (f.live) return { ...base, status: 'live', score: { turi: 1, opponent: 0 } };
    if (f.kickoffAt > now) return base;
    const score = f.score ?? scoreFor(rand, sport, def.strength, opponent.strength);
    // One finished but unpublished result shows the draft state.
    const draft = def.slug === 'second-xi' && season.isCurrent && f.kickoffAt.getTime() === latestPlayed;
    const publishedAt = draft ? null : new Date(f.kickoffAt.getTime() + 4 * 36e5);
    return { ...base, status: 'completed', score, ...generateResult(rand, sport, teamSeason.members, score), publishedAt };
  });
  await Match.insertMany(docs);

  await LeagueResult.insertMany(
    others.map(({ home, away, kickoffAt }) => {
      const score = scoreFor(rand, sport, schools[home].strength, schools[away].strength);
      return {
        competition: league._id, season: season._id, playedAt: kickoffAt,
        home: { school: schools[home].doc._id, score: score.turi }, away: { school: schools[away].doc._id, score: score.opponent }, ...audit,
      };
    }),
  );
}
