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

export const badQuery = (param, message) => new ValidationError('The request is invalid', [{ path: `/query/${param}`, message }]);
export const badBody = (field, message) => new ValidationError('The request is invalid', [{ path: `/body/${field}`, message }]);

/** `?sport=` slug → the sport (400 if unknown), or null when not given. */
export async function sportFromQuery(slug) {
  if (!slug) return null;
  const sport = await Sport.findOne({ slug }).lean();
  if (!sport) throw badQuery('sport', `Unknown sport "${slug}"`);
  return sport;
}

/**
 * `?sport&team&season` → documents. Unknown values are a 400 (a bad filter, not a missing page).
 * No `season` means the current one, which may not exist yet on a fresh install (then `season` is null).
 */
export async function resolvePageFilters({ sport, team, season }) {
  if (team && !sport) throw badQuery('team', 'team needs sport');
  const sportDoc = await sportFromQuery(sport);
  const seasonDoc = await Season.findOne(season ? { slug: season } : { isCurrent: true }).lean();
  if (season && !seasonDoc) throw badQuery('season', `Unknown season "${season}"`);
  const teamDoc = team ? await Team.findOne({ sport: sportDoc._id, slug: team }).lean() : null;
  if (team && !teamDoc) throw badQuery('team', `Unknown team "${team}"`);
  return { sport: sportDoc, season: seasonDoc, team: teamDoc };
}
