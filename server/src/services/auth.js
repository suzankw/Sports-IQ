import { toActor } from '../auth/actor.js';
import { dummyHash, hashPassword, verifyPassword } from '../auth/password.js';
import { assertCan, describe } from '../auth/policy.js';
import { UnauthorizedError, ValidationError } from '../lib/errors.js';
import { stamp } from '../models/audit.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { User } from '../models/User.js';
import { idOf, seasonRef, sportRef, teamRef } from './serializers.js';

/** The signed-in user and what the client may show them, or null for a visitor. */
export async function getMe(actor) {
  if (!actor) return null;
  const user = await User.findById(actor.id).lean();
  const { screens, teamSeasonIds } = describe(actor);
  const roles = new Map(user.assignments.map((a) => [String(a.teamSeason), a.role]));
  const teamSeasons = await TeamSeason.find({ _id: { $in: teamSeasonIds } }).populate(['sport', 'team', 'season']).lean();
  return {
    user: {
      id: idOf(user),
      email: user.email,
      name: user.name,
      title: user.title ?? null,
      photoUrl: user.photoUrl ?? null,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
    permissions: {
      screens,
      teamSeasons: teamSeasons.map((ts) => ({
        id: idOf(ts),
        sport: sportRef(ts.sport),
        team: teamRef(ts.team),
        season: seasonRef(ts.season),
        role: roles.get(idOf(ts)),
      })),
    },
  };
}

/** Same error for unknown email, wrong password and disabled account, with the same timing. */
export async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  const valid = await verifyPassword(password, user?.passwordHash ?? dummyHash);
  if (!user || !user.active || !valid) throw new UnauthorizedError('Invalid email or password');
  return { user, me: await getMe(toActor(user)) };
}

export async function updateMe(actor, changes) {
  assertCan(actor, 'update', 'account');
  const user = await User.findById(actor.id);
  user.set(changes);
  await stamp(user, actor).save();
  return getMe(actor);
}

/** Also signs out every other session (token version bump); the caller gets a fresh cookie. */
export async function changePassword(actor, { currentPassword, newPassword }) {
  assertCan(actor, 'update', 'account');
  const user = await User.findById(actor.id).select('+passwordHash');
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new ValidationError('The request is invalid', [{ path: '/body/currentPassword', message: 'Your current password is wrong' }]);
  }
  user.passwordHash = await hashPassword(newPassword);
  user.mustChangePassword = false;
  user.tokenVersion += 1;
  await stamp(user, actor).save();
  return { user, me: await getMe(toActor(user)) };
}
