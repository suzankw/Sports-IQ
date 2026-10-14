import { ConflictError, ValidationError } from '../lib/errors.js';
import { LeagueResult } from '../models/LeagueResult.js';
import { Match } from '../models/Match.js';
import { Season } from '../models/Season.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { anyExists, crudService } from './crud.js';
import { auditFields, idOf, iso } from './serializers.js';

export const toSeason = (s) => ({
  id: idOf(s),
  slug: s.slug,
  label: s.label,
  startDate: iso(s.startDate),
  endDate: iso(s.endDate),
  isCurrent: s.isCurrent,
  ...auditFields(s),
});

export const seasonService = crudService({
  Model: Season,
  type: 'season',
  label: 'Season',
  sort: { startDate: -1 },
  toApi: toSeason,
  async prepare(input, season) {
    const start = new Date(input.startDate ?? season?.startDate);
    const end = new Date(input.endDate ?? season?.endDate);
    if (end <= start) {
      throw new ValidationError('The request is invalid', [{ path: '/body/endDate', message: 'The season must end after it starts' }]);
    }
    if (input.slug && (await Season.exists({ slug: input.slug }))) throw new ConflictError('That slug is already in use');
    // Only one current season: unset the old one first (unique index on isCurrent: true).
    if (input.isCurrent) await Season.updateMany({ isCurrent: true, _id: { $ne: season?._id } }, { isCurrent: false });
    return input;
  },
  async guardDelete(season) {
    if (season.isCurrent) return "The current season can't be deleted";
    const inUse = await anyExists([
      [TeamSeason, { season: season._id }],
      [Match, { season: season._id }],
      [LeagueResult, { season: season._id }],
    ]);
    return inUse ? 'This season is still used by teams, matches or results' : null;
  },
});
