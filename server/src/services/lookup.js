import { NotFoundError, ValidationError } from '../lib/errors.js';
import { School } from '../models/School.js';
import { Season } from '../models/Season.js';
import { Sport } from '../models/Sport.js';
import { Team } from '../models/Team.js';
import { TeamSeason } from '../models/TeamSeason.js';

// Resolve the slugs that page URLs carry into documents.

export async function findSportBySlug(slug) {
  const sport = await Sport.findOne({ slug }).lean();
  if (!sport) throw new NotFoundError('Sport');
  return sport;
}

/** Season by slug; no slug means the current season. */
export async function findSeason(slug) {
  const season = await Season.findOne(slug ? { slug } : { isCurrent: true }).lean();
  if (!season) throw new NotFoundError('Season');
  return season;
}

export const findPreviousSeason = (season) =>
  Season.findOne({ startDate: { $lt: season.startDate } }).sort({ startDate: -1 }).lean();

export async function findTeam(sportId, slug) {
  const team = await Team.findOne({ sport: sportId, slug }).lean();
  if (!team) throw new NotFoundError('Team');
  return team;
}

export async function findHomeSchool() {
  const school = await School.findOne({ isHome: true }).lean();
  if (!school) throw new NotFoundError('Home school');
  return school;
}

/** `?sport&team&season` → the matching filter values. `team` needs `sport`. */
export async function resolvePageFilters({ sport, team, season }) {
  if (team && !sport) {
    throw new ValidationError('The request is invalid', [{ path: '/query/team', message: 'team needs sport' }]);
  }
  const sportDoc = sport ? await findSportBySlug(sport) : null;
  const seasonDoc = await findSeason(season);
  const teamDoc = team ? await findTeam(sportDoc._id, team) : null;
  return { sport: sportDoc, season: seasonDoc, team: teamDoc };
}

export async function findTeamSeason(id) {
  const teamSeason = await TeamSeason.findById(id).lean();
  if (!teamSeason) throw new NotFoundError('Team-season');
  return teamSeason;
}
