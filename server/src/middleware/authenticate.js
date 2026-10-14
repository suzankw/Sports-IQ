import { User } from '../models/User.js';
import { SESSION_COOKIE, verifySession } from '../auth/session.js';

/** Sets req.actor from the session cookie, or null. The user is reloaded so disabling or reassigning takes effect at once. */
export async function authenticate(req, _res, next) {
  req.actor = null;
  const claims = verifySession(req.cookies?.[SESSION_COOKIE]);
  if (claims) {
    const user = await User.findById(claims.sub).lean();
    if (user?.active && user.tokenVersion === claims.tv) req.actor = toActor(user);
  }
  next();
}

const toActor = (user) => ({
  id: String(user._id),
  role: user.role,
  mustChangePassword: user.mustChangePassword,
  teamSeasonIds: new Set(user.assignments.map((a) => String(a.teamSeason))),
});
