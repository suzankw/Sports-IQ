import { Sport } from '../models/Sport.js';
import { Team } from '../models/Team.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { crudService } from './crud.js';
import { badBody, sportFromQuery } from './lookup.js';
import { auditFields, sportRef, teamRef } from './serializers.js';

export const teamService = crudService({
  Model: Team,
  type: 'team',
  label: 'Team',
  populate: [{ path: 'sport', select: 'slug name icon order' }],
  sort: { sport: 1, order: 1, name: 1 },
  toApi: (t) => ({ ...teamRef(t), sport: sportRef(t.sport), ageGroup: t.ageGroup, gender: t.gender, order: t.order, ...auditFields(t) }),
  async filter({ sport }) {
    const sportDoc = await sportFromQuery(sport);
    return sportDoc ? { sport: sportDoc._id } : {};
  },
  async prepare(input, team) {
    if (!team && !(await Sport.exists({ _id: input.sport }))) throw badBody('sport', 'Unknown sport');
    return input;
  },
  guardDelete: async (team) => ((await TeamSeason.exists({ team: team._id })) ? 'This team has seasons — remove it from those first' : null),
});
