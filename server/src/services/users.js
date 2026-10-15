import { hashPassword } from '../auth/password.js';
import { assertCan } from '../auth/policy.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';
import { pageOf } from '../lib/pagination.js';
import { stamp } from '../models/audit.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { User } from '../models/User.js';
import { badBody } from './lookup.js';
import { AUDIT_POPULATE, auditFields, idOf, teamSeasonRef } from './serializers.js';

const POPULATE = [
  AUDIT_POPULATE,
  {
    path: 'assignments.teamSeason',
    select: 'sport team season',
    populate: [
      { path: 'sport', select: 'slug name icon' },
      { path: 'team', select: 'slug name' },
      { path: 'season', select: 'slug label' },
    ],
  },
];

const toUser = (u) => ({
  id: idOf(u),
  email: u.email,
  name: u.name,
  title: u.title ?? null,
  photoUrl: u.photoUrl ?? null,
  role: u.role,
  active: u.active,
  mustChangePassword: u.mustChangePassword,
  assignments: u.assignments.map((a) => ({ teamSeason: teamSeasonRef(a.teamSeason), role: a.role })),
  ...auditFields(u),
});

const reload = async (id) => toUser(await User.findById(id).populate(POPULATE).lean());

async function load(id) {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError('User');
  return user;
}

/** Each team-season once, and it must exist. */
async function checkAssignments(assignments = []) {
  const ids = assignments.map((a) => String(a.teamSeason));
  if (new Set(ids).size !== ids.length) throw badBody('assignments', 'A team can only be listed once');
  if ((await TeamSeason.countDocuments({ _id: { $in: ids } })) !== ids.length) throw badBody('assignments', 'Unknown team-season');
}

/** D9 Users, by name. */
export async function listUsers(actor, query) {
  assertCan(actor, 'read', 'user');
  const { pageSize, skip } = pageOf(query);
  const [users, total] = await Promise.all([User.find().sort({ name: 1 }).skip(skip).limit(pageSize).populate(POPULATE).lean(), User.countDocuments()]);
  return { items: users.map(toUser), total };
}

/** New staff sign in with the temporary password and must change it first. */
export async function createUser(actor, { temporaryPassword, ...input }) {
  assertCan(actor, 'create', 'user');
  await checkAssignments(input.assignments);
  const user = new User({ ...input, passwordHash: await hashPassword(temporaryPassword), mustChangePassword: true });
  await stamp(user, actor).save();
  return reload(user._id);
}

/** Disabling or changing someone's role signs them out everywhere; admins can't lock themselves out. */
export async function updateUser(actor, id, changes) {
  assertCan(actor, 'update', 'user');
  const user = await load(id);
  const disabling = changes.active === false && user.active;
  const roleChange = changes.role !== undefined && changes.role !== user.role;
  if (idOf(user) === actor.id && (disabling || roleChange)) throw new ConflictError("You can't disable your own account or change your own role");
  if ('assignments' in changes) await checkAssignments(changes.assignments);
  user.set(changes);
  if (disabling || roleChange) user.tokenVersion += 1;
  await stamp(user, actor).save();
  return reload(id);
}

export async function resetPassword(actor, id, { temporaryPassword }) {
  assertCan(actor, 'update', 'user');
  const user = await load(id);
  user.passwordHash = await hashPassword(temporaryPassword);
  user.mustChangePassword = true;
  user.tokenVersion += 1;
  await stamp(user, actor).save();
}
