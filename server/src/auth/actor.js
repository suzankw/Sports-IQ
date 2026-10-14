/** The caller as services see it. Built only from a stored user, never from client input. */
export const toActor = (user) => ({
  id: String(user._id),
  role: user.role,
  mustChangePassword: user.mustChangePassword,
  teamSeasonIds: new Set(user.assignments.map((a) => String(a.teamSeason))),
});
