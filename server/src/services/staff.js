import { User } from '../models/User.js';

/** Coaches assigned to a team-season (public: name, title and photo only). */
export async function staffOf(teamSeasonId) {
  const users = await User.find({ 'assignments.teamSeason': teamSeasonId }).select('name title photoUrl assignments').lean();
  const roleOf = (user) => user.assignments.find((a) => String(a.teamSeason) === String(teamSeasonId)).role;
  return users
    .map((user) => ({ user, role: roleOf(user) }))
    .sort((a, b) => (a.role === b.role ? a.user.name.localeCompare(b.user.name) : a.role === 'head' ? -1 : 1));
}
