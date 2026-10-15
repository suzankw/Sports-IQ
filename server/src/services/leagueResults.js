import { Competition } from '../models/Competition.js';
import { LeagueResult } from '../models/LeagueResult.js';
import { School } from '../models/School.js';
import { Season } from '../models/Season.js';
import { crudService } from './crud.js';
import { badBody, resolvePageFilters } from './lookup.js';
import { auditFields, competitionRef, idOf, iso, schoolRef, seasonRef } from './serializers.js';

const SCHOOL = { select: 'name shortName crestUrl' };
const side = (s) => ({ school: schoolRef(s.school), score: s.score });

/** Two different schools, neither of them Turi (Turi's games are matches). */
async function checkSides(home, away) {
  if (String(home.school) === String(away.school)) throw badBody('away/school', 'Choose two different schools');
  const schools = await School.find({ _id: { $in: [home.school, away.school] } }).select('isHome').lean();
  for (const [field, s] of [['home', home], ['away', away]]) {
    const school = schools.find((doc) => idOf(doc) === String(s.school));
    if (!school) throw badBody(`${field}/school`, 'Unknown school');
    if (school.isHome) throw badBody(`${field}/school`, "Turi's own games are entered as fixtures");
  }
}

/** D15: score-only results between two other schools, so the league table is complete. Public at once. */
export const leagueResultService = crudService({
  Model: LeagueResult,
  type: 'leagueResult',
  label: 'League result',
  populate: [
    { path: 'competition', select: 'name shortName type' },
    { path: 'season', select: 'slug label' },
    { path: 'home.school', ...SCHOOL },
    { path: 'away.school', ...SCHOOL },
  ],
  sort: ({ sort }) => (sort === 'playedAt' ? { playedAt: 1 } : { playedAt: -1 }),
  toApi: (r) => ({
    id: idOf(r),
    competition: competitionRef(r.competition),
    season: seasonRef(r.season),
    playedAt: iso(r.playedAt),
    home: side(r.home),
    away: side(r.away),
    ...auditFields(r),
  }),
  async filter(query) {
    const { season } = await resolvePageFilters({ season: query.season });
    return { season: season?._id ?? null, ...(query.competition ? { competition: query.competition } : {}) };
  },
  async prepare(input, result) {
    if (!result) {
      const competition = await Competition.findById(input.competition).select('type').lean();
      if (competition?.type !== 'league') throw badBody('competition', 'Choose a league');
      if (!(await Season.exists({ _id: input.season }))) throw badBody('season', 'Unknown season');
    }
    await checkSides(input.home ?? result.home, input.away ?? result.away);
    return input;
  },
});
