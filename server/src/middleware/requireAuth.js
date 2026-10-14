import { ForbiddenError, UnauthorizedError } from '../lib/errors.js';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const OPEN_WRITES = new Set(['POST /auth/login']);
const ALLOWED_WITH_TEMPORARY_PASSWORD = new Set(['POST /auth/logout', 'POST /auth/password']);

const isStaffRead = (req) => req.path.startsWith('/users') || req.query.mine === 'true';

/** Mounted once for the whole API: every write and staff-only read needs a session. */
export function requireAuth(req, _res, next) {
  const route = `${req.method} ${req.path}`;
  const needsSession = WRITE_METHODS.has(req.method) ? !OPEN_WRITES.has(route) : isStaffRead(req);
  if (!needsSession) return next();
  if (!req.actor) throw new UnauthorizedError();
  if (req.actor.mustChangePassword && !ALLOWED_WITH_TEMPORARY_PASSWORD.has(route)) {
    throw new ForbiddenError('Set a new password to continue', 'PASSWORD_CHANGE_REQUIRED');
  }
  next();
}
