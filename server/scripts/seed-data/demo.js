// Demo data for development (docs/02-database.md §8). Never loaded in production.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../../src/config.js';
import { hashPassword } from '../../src/auth/password.js';
import { Inductee } from '../../src/models/Inductee.js';
import { Player } from '../../src/models/Player.js';
import { School } from '../../src/models/School.js';
import { Season } from '../../src/models/Season.js';
import { Sport } from '../../src/models/Sport.js';
import { Team } from '../../src/models/Team.js';
import { TeamSeason } from '../../src/models/TeamSeason.js';
import { User } from '../../src/models/User.js';
import { createMatches, findOrCreateCompetition } from './demoMatches.js';
import { COACHES, FIRST_NAMES, FORMER_COACH, INDUCTEES, LAST_NAMES, SEASON_QUOTE } from './people.js';
import { OPPONENTS, POSITION_PLANS, TEAMS } from './teams.js';

const assets = path.join(path.dirname(fileURLToPath(import.meta.url)), '../seed-assets');
const eat = (y, m, d, h = 0, min = 0) => new Date(Date.UTC(y, m - 1, d, h - 3, min));

export async function seedDemo(rand) {
  copyPortraits();
  const admin = await User.findOne({ role: 'admin' }).lean();
  const audit = { createdBy: admin._id, updatedBy: admin._id };
  const sports = Object.fromEntries((await Sport.find().lean()).map((s) => [s.slug, s]));
  const turi = await School.findOne({ isHome: true }).lean();
  const opponents = await School.insertMany(OPPONENTS.map(({ name, shortName }) => ({ name, shortName, ...audit })));
  const schools = Object.fromEntries(OPPONENTS.map((o, i) => [o.key, { ...o, doc: opponents[i] }]));
  const seasons = await Season.insertMany([
    { slug: '2025-2026', label: '2025/2026', startDate: eat(2025, 9, 1), endDate: eat(2026, 7, 31, 23, 59), isCurrent: false, ...audit },
    { slug: '2026-2027', label: '2026/2027', startDate: eat(2026, 9, 1), endDate: eat(2027, 7, 31, 23, 59), isCurrent: true, ...audit },
  ]);
  const coaches = await createCoaches();

  for (const def of TEAMS) {
    const sport = sports[def.sport];
    const team = await Team.create({ sport: sport._id, slug: def.slug, name: def.name, ageGroup: def.ageGroup, gender: def.gender, order: def.order, ...audit });
    const league = await findOrCreateCompetition(sport, def.league, audit);
    let squad = null;
    for (const season of seasons) {
      squad = await buildSquad(rand, def, sport, squad);
      const head = coaches[def.staff[0][0]];
      const teamSeason = await TeamSeason.create({
        team: team._id, season: season._id, sport: sport._id, members: squad, captain: pickCaptain(squad),
        depthChart: sport.scoreDetail === 'periods' ? depthChart(sport, squad) : [], leagueCompetition: league._id,
        seasonQuote: SEASON_QUOTE(sport.name), createdBy: head._id, updatedBy: head._id,
      });
      for (const [key, role] of def.staff) await User.updateOne({ _id: coaches[key]._id }, { $push: { assignments: { teamSeason: teamSeason._id, role } } });
      await createMatches(rand, { def, sport, season, teamSeason, league, schools, turi, head, audit });
    }
    if (def.photos) await assignPhotos(def.photos, squad);
  }
  await Inductee.insertMany(INDUCTEES.map((inductee, order) => ({ ...inductee, sport: sports[inductee.sport]._id, order, ...audit })));
}

function copyPortraits() {
  const target = path.join(config.uploadDir, 'seed');
  fs.mkdirSync(target, { recursive: true });
  for (const file of fs.readdirSync(assets)) fs.copyFileSync(path.join(assets, file), path.join(target, file));
}

async function createCoaches() {
  const password = config.seed.coachPassword;
  if (!password) throw new Error('Set SEED_COACH_PASSWORD (see .env.example)');
  const passwordHash = await hashPassword(password);
  const email = (name) => `${name.toLowerCase().replace(/\s+/g, '.')}@turi.test`;
  const users = await User.insertMany([
    ...COACHES.map((c) => ({ email: email(c.name), name: c.name, title: c.title, photoUrl: c.photo && `/uploads/seed/${c.photo}`, role: 'coach', passwordHash, mustChangePassword: false })),
    { ...FORMER_COACH, email: email(FORMER_COACH.name), role: 'coach', active: false, passwordHash, mustChangePassword: false },
  ]);
  return Object.fromEntries(COACHES.map((c, i) => [c.key, users[i]]));
}

/** Surnames are unique within a squad so lineups (which show surnames) stay unambiguous. */
function newPlayer(rand, gender, usedSurnames) {
  const sex = gender === 'boys' ? 'male' : gender === 'girls' ? 'female' : rand.pick(['male', 'female']);
  const lastName = rand.pick(LAST_NAMES.filter((name) => !usedSurnames.has(name)));
  usedSurnames.add(lastName);
  return { firstName: rand.pick(FIRST_NAMES[sex]), lastName, gender: sex };
}

/** About 70% of last season's squad returns (same number and position); new players fill the gaps. */
async function buildSquad(rand, def, sport, previous) {
  const open = POSITION_PLANS[sport.slug].slice(0, def.size);
  const returning = previous ? rand.shuffle(previous).slice(0, Math.round(def.size * 0.7)) : [];
  for (const member of returning) open.splice(open.indexOf(member.position), 1);
  const usedSurnames = new Set(await Player.find({ _id: { $in: returning.map((m) => m.player) } }).distinct('lastName'));
  const created = await Player.insertMany(open.map(() => newPlayer(rand, def.gender, usedSurnames)));
  const taken = new Set(returning.map((m) => m.number));
  const nextNumber = () => {
    let n = 1;
    while (taken.has(n)) n += 1;
    taken.add(n);
    return n;
  };
  return [...returning, ...created.map((p, i) => ({ player: p._id, number: nextNumber(), position: open[i] }))];
}

const pickCaptain = (squad) => (squad.find((m) => m.position !== 'GK') ?? squad[0]).player;

const depthChart = (sport, squad) =>
  sport.positions.map((p) => ({ position: p.key, players: squad.filter((m) => m.position === p.key).map((m) => m.player) }));

async function assignPhotos(prefix, squad) {
  const files = fs.readdirSync(assets).filter((f) => f.startsWith(`${prefix}-`)).sort();
  await Promise.all(files.slice(0, squad.length).map((file, i) => Player.updateOne({ _id: squad[i].player }, { photoUrl: `/uploads/seed/${file}` })));
}
