import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const SESSION_COOKIE = 'siq_session';
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict',
  path: '/',
};

export const signSession = (user) =>
  jwt.sign({ sub: String(user._id), tv: user.tokenVersion }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: MAX_AGE_SECONDS,
  });

/** Returns `{ sub, tv }` or null for a missing, expired or tampered token. */
export function verifySession(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}

export const setSessionCookie = (res, user) =>
  res.cookie(SESSION_COOKIE, signSession(user), { ...cookieOptions, maxAge: MAX_AGE_SECONDS * 1000 });

export const clearSessionCookie = (res) => res.clearCookie(SESSION_COOKIE, cookieOptions);
