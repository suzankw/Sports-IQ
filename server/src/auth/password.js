import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { config } from '../config.js';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;
// OWASP parameters in real use; a cheap cost keeps the test suite fast. N is stored in the hash.
const COST = config.isTest ? { N: 2 ** 10, r: 8, p: 1 } : { N: 2 ** 17, r: 8, p: 1 };
const MAX_MEMORY = 256 * 1024 * 1024;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, KEY_LENGTH, { ...COST, maxmem: MAX_MEMORY });
  return ['scrypt', COST.N, COST.r, COST.p, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password, stored) {
  const [, N, r, p, salt, hash] = stored.split('$');
  const expected = Buffer.from(hash, 'base64');
  const key = await scryptAsync(password, Buffer.from(salt, 'base64'), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: MAX_MEMORY,
  });
  return timingSafeEqual(key, expected);
}

// Verified against when the email is unknown, so response time doesn't reveal which emails exist.
export const dummyHash = await hashPassword(randomBytes(16).toString('hex'));
