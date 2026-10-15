import { Competition } from '../models/Competition.js';
import { LeagueResult } from '../models/LeagueResult.js';
import { Match } from '../models/Match.js';
import { Sport } from '../models/Sport.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { anyExists, crudService } from './crud.js';
import { badBody, sportFromQuery } from './lookup.js';
import { auditFields, competitionRef, sportRef } from './serializers.js';

export const competitionService = crudService({
  Model: Competition,
  type: 'competition',
  label: 'Competition',
  populate: [{ path: 'sport', select: 'slug name icon' }],
  sort: { name: 1 },
  toApi: (c) => ({ ...competitionRef(c), sport: sportRef(c.sport), ...auditFields(c) }),
  async filter({ sport, type }) {
    const where = {};
    const sportDoc = await sportFromQuery(sport);
    if (sportDoc) where.sport = sportDoc._id;
    if (type) where.type = type;
    return where;
  },
  async prepare(input, competition) {
    if (!competition && !(await Sport.exists({ _id: input.sport }))) throw badBody('sport', 'Unknown sport');
    return input;
  },
  async guardDelete(competition) {
    const inUse = await anyExists([
      [Match, { competition: competition._id }],
      [LeagueResult, { competition: competition._id }],
      [TeamSeason, { leagueCompetition: competition._id }],
    ]);
    return inUse ? 'This competition is still used by matches, results or teams' : null;
  },
});
