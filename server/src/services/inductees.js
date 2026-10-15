import { Inductee } from '../models/Inductee.js';
import { Player } from '../models/Player.js';
import { Sport } from '../models/Sport.js';
import { crudService } from './crud.js';
import { badBody, sportFromQuery } from './lookup.js';
import { auditFields, idOf, playerRef, sportRef } from './serializers.js';

/** Public Hall of Fame page and D16. */
export const inducteeService = crudService({
  Model: Inductee,
  type: 'inductee',
  label: 'Inductee',
  populate: [
    { path: 'sport', select: 'slug name icon' },
    { path: 'player', select: 'firstName lastName photoUrl' },
  ],
  sort: { order: 1, name: 1 },
  toApi: (i) => ({
    id: idOf(i),
    name: i.name,
    photoUrl: i.photoUrl ?? null,
    sport: i.sport ? sportRef(i.sport) : null,
    years: i.years ?? null,
    achievement: i.achievement,
    citation: i.citation ?? null,
    player: i.player ? playerRef(i.player) : null,
    order: i.order,
    ...auditFields(i),
  }),
  async filter({ sport }) {
    const sportDoc = await sportFromQuery(sport);
    return sportDoc ? { sport: sportDoc._id } : {};
  },
  async prepare(input) {
    if (input.sport && !(await Sport.exists({ _id: input.sport }))) throw badBody('sport', 'Unknown sport');
    if (input.player && !(await Player.exists({ _id: input.player }))) throw badBody('player', 'Unknown player');
    return input;
  },
});
