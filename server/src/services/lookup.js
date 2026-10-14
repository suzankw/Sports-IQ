import { NotFoundError, ValidationError } from '../lib/errors.js';
import { School } from '../models/School.js';
import { Season } from '../models/Season.js';
import { Sport } from '../models/Sport.js';
import { Team } from '../models/Team.js';

// Resolve the slugs that page URLs carry into documents.

export const findPreviousSeason = (season) =>
  Season.findOne({ startDate: { $lt: season.startDate } }).sort({ startDate: -1 }).lean();

export async function findHomeSchool() {
  const school = await School.findOne({ isHome: true }).lean();
  if (!school) throw new NotFoundError('Home school');
  return school;
}

const badQuery = (param, message) => new ValidationError('The request is invalid', [{ path: `/query/${param}`, message }]);

/**
 * `?sport&team&season` → documents. Unknown values are a 400 (a bad filter, not a missing page).
 * No `season` means the current one, which may not exist yet on a fresh install (then `season` is null).
 */
export async function resolvePageFilters({ sport, team, season }) {
  if (team && !sport) throw badQuery('team', 'team needs sport');
  const sportDoc = sport ? await Sport.findOne({ slug: sport }).lean() : null;
  if (sport && !sportDoc) throw badQuery('sport', `Unknown sport "${sport}"`);
  const seasonDoc = await Season.findOne(season ? { slug: season } : { isCurrent: true }).lean();
  if (season && !seasonDoc) throw badQuery('season', `Unknown season "${season}"`);
  const teamDoc = team ? await Team.findOne({ sport: sportDoc._id, slug: team }).lean() : null;
  if (team && !teamDoc) throw badQuery('team', `Unknown team "${team}"`);
  return { sport: sportDoc, season: seasonDoc, team: teamDoc };
}
