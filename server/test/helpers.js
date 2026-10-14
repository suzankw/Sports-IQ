import request from 'supertest';
import { expect } from 'vitest';
import { buildApp } from '../src/app.js';
import { hashPassword } from '../src/auth/password.js';
import { SESSION_COOKIE, signSession } from '../src/auth/session.js';
import { Competition } from '../src/models/Competition.js';
import { Player } from '../src/models/Player.js';
import { School } from '../src/models/School.js';
import { Season } from '../src/models/Season.js';
import { Sport } from '../src/models/Sport.js';
import { Team } from '../src/models/Team.js';
import { TeamSeason } from '../src/models/TeamSeason.js';
import { Match } from '../src/models/Match.js';
import { User } from '../src/models/User.js';
import { generateResult } from '../scripts/seed-data/matchDetails.js';
import { createRandom } from '../scripts/seed-data/random.js';
import { football } from '../scripts/seed-data/sports.js';

export const api = request(buildApp());
export const cookieFor = (user) => `${SESSION_COOKIE}=${signSession(user)}`;
export const PASSWORD = 'correct-horse-battery';

let userCount = 0;
export async function createUser({ role = 'coach', assignments = [], ...rest } = {}) {
  userCount += 1;
  return User.create({
    email: `${role}${userCount}@turi.test`,
    name: `Test ${role} ${userCount}`,
    role,
    passwordHash: await hashPassword(PASSWORD),
    mustChangePassword: false,
    assignments,
    ...rest,
  });
}

const position = (i) => (i === 0 ? 'GK' : i < 5 ? 'DF' : i < 8 ? 'MF' : 'FW');
const squad = (players) => players.map((p, i) => ({ player: p._id, number: i + 1, position: position(i) }));

/** A small football world: two seasons, Turi + 2 opponents, First XI (coach's) and Second XI (other coach's). */
export async function createWorld() {
  const sport = await Sport.create(football);
  const previous = await Season.create({ slug: '2025-2026', label: '2025/2026', startDate: '2025-08-31T21:00:00Z', endDate: '2026-07-31T20:59:59Z' });
  const season = await Season.create({ slug: '2026-2027', label: '2026/2027', startDate: '2026-08-31T21:00:00Z', endDate: '2027-07-31T20:59:59Z', isCurrent: true });
  const turi = await School.create({ name: "St. Andrew's Turi", shortName: "St. Andrew's Turi", isHome: true });
  const peponi = await School.create({ name: 'Peponi School', shortName: 'Peponi' });
  const brookhouse = await School.create({ name: 'Brookhouse School', shortName: 'Brookhouse' });
  const league = await Competition.create({ sport: sport._id, name: 'KISL Premier Division', shortName: 'KISL', type: 'league' });
  const cup = await Competition.create({ sport: sport._id, name: 'IAPS Cup', shortName: 'IAPS', type: 'cup' });
  const firstXI = await Team.create({ sport: sport._id, slug: 'first-xi', name: 'First XI', gender: 'boys', order: 1 });
  const secondXI = await Team.create({ sport: sport._id, slug: 'second-xi', name: 'Second XI', gender: 'boys', order: 2 });
  const players = await Player.insertMany(
    Array.from({ length: 18 }, (_, i) => ({ firstName: `Amani${i}`, lastName: `Otieno${i}`, gender: i % 3 ? 'male' : 'female' })),
  );
  const ownTeam = await TeamSeason.create({ team: firstXI._id, season: season._id, sport: sport._id, members: squad(players.slice(0, 14)), leagueCompetition: league._id });
  const otherTeam = await TeamSeason.create({ team: secondXI._id, season: season._id, sport: sport._id, members: squad(players.slice(14)) });
  const admin = await createUser({ role: 'admin' });
  const coach = await createUser({ assignments: [{ teamSeason: ownTeam._id, role: 'head' }] });
  const otherCoach = await createUser({ assignments: [{ teamSeason: otherTeam._id, role: 'head' }] });
  return {
    sport, season, previous, turi, peponi, brookhouse, league, cup, firstXI, secondXI, players, ownTeam, otherTeam,
    admin, coach, otherCoach,
    as: { anonymous: null, ownCoach: cookieFor(coach), otherCoach: cookieFor(otherCoach), admin: cookieFor(admin) },
  };
}

/**
 * The permission matrix (docs/03-api.md §3): runs the request once per column with that column's session.
 * `setup` runs before each column so deletes etc. always act on a fresh resource.
 */
export async function expectPermissions(world, expected, send, setup = async () => undefined) {
  for (const column of ['anonymous', 'otherCoach', 'ownCoach', 'admin']) {
    const fresh = await setup();
    const req = send(fresh);
    const res = await (world.as[column] ? req.set('Cookie', world.as[column]) : req);
    expect({ column, status: res.status, body: res.status >= 400 ? res.body : undefined }).toMatchObject({ column, status: expected[column] });
  }
}

export const id = (doc) => String(doc._id);

/** A fixture for the coach's own team; with `score` it's a completed result built like the seed's. */
export async function createMatch(w, { score, published = true, teamSeason = w.ownTeam, ...fields } = {}) {
  const result = score ? { status: 'completed', score, ...generateResult(createRandom(7), football, teamSeason.members, score) } : {};
  return Match.create({
    teamSeason: teamSeason._id,
    sport: w.sport._id,
    season: w.season._id,
    competition: w.league._id,
    opponent: w.peponi._id,
    homeAway: 'home',
    kickoffAt: new Date('2026-10-10T12:00:00Z'),
    venue: 'Turi Main Pitch',
    ...result,
    publishedAt: score && published ? new Date('2026-10-10T16:00:00Z') : null,
    ...fields,
  });
}
