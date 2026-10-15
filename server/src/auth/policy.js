import { ForbiddenError } from '../lib/errors.js';

// The only module that decides who may do what (docs/01-architecture.md §4.2).
// actor: null (anonymous) or { id, role, teamSeasonIds: Set<string> } built by `authenticate`.

const ADMIN_ONLY = new Set([
  'sport',
  'season',
  'school',
  'competition',
  'team',
  'teamSeason',
  'user',
  'leagueResult',
  'inductee',
]);

const COACH_SCREENS = ['home', 'account', 'players', 'rosters', 'fixtures', 'results'];
const ADMIN_SCREENS = [
  ...COACH_SCREENS,
  'sports',
  'seasons',
  'teams',
  'competitions',
  'schools',
  'users',
  'leagueResults',
  'hallOfFame',
];

const isAdmin = (actor) => actor?.role === 'admin';
const ownsTeamSeason = (actor, teamSeasonId) => actor.teamSeasonIds.has(String(teamSeasonId));

/**
 * Team-scoped resources pass what they belong to:
 * match and squad → `{ teamSeason }`; player → `{ teamSeasons: [...] }` (every squad they are in).
 */
export function can(actor, action, type, resource = {}) {
  if (action === 'read') return type !== 'user' || isAdmin(actor);
  if (!actor) return false;
  if (isAdmin(actor)) return true;
  if (ADMIN_ONLY.has(type)) return false;

  switch (type) {
    case 'account':
    case 'upload':
      return true;
    case 'player':
      if (action === 'create') return true;
      if (action === 'update') return (resource.teamSeasons ?? []).some((id) => ownsTeamSeason(actor, id));
      return false;
    case 'squad':
    case 'match':
      return ownsTeamSeason(actor, resource.teamSeason);
    default:
      return false;
  }
}

export function assertCan(actor, action, type, resource, message) {
  if (!can(actor, action, type, resource)) {
    throw new ForbiddenError(message ?? 'You can only change your own teams');
  }
}

/** What the client may show: menu screens and the team-seasons this user can write to. */
export const describe = (actor) => ({
  screens: isAdmin(actor) ? ADMIN_SCREENS : COACH_SCREENS,
  teamSeasonIds: isAdmin(actor) ? [] : [...actor.teamSeasonIds],
});
