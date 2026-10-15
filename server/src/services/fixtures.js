import { assertCan } from '../auth/policy.js';
import { NotFoundError } from '../lib/errors.js';
import { stamp } from '../models/audit.js';
import { Competition } from '../models/Competition.js';
import { Match } from '../models/Match.js';
import { School } from '../models/School.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { badBody } from './lookup.js';
import { getMatch } from './matches.js';
import { assertVersion } from './version.js';

async function loadMatch(id) {
  const match = await Match.findById(id);
  if (!match) throw new NotFoundError('Match');
  return match;
}

/** The team-season the fixture belongs to, which the caller must be allowed to write to. */
async function writableTeamSeason(actor, action, id) {
  const teamSeason = await TeamSeason.findById(id).select('sport season').lean();
  if (!teamSeason) throw badBody('teamSeason', 'Unknown team');
  assertCan(actor, action, 'match', { teamSeason: id });
  return teamSeason;
}

/** Competition of the team's sport; the opponent is another school, not Turi. */
async function checkFixture(sport, { competition, opponent }) {
  if (competition) {
    const doc = await Competition.findById(competition).select('sport').lean();
    if (!doc || String(doc.sport) !== String(sport)) throw badBody('competition', "Choose a competition of this team's sport");
  }
  if (opponent) {
    const school = await School.findById(opponent).select('isHome').lean();
    if (!school || school.isHome) throw badBody('opponent', 'Choose another school');
  }
}

/** D13: a new fixture starts upcoming and unpublished. */
export async function createFixture(actor, input) {
  const teamSeason = await writableTeamSeason(actor, 'create', input.teamSeason);
  await checkFixture(teamSeason.sport, input);
  const match = new Match({ ...input, sport: teamSeason.sport, season: teamSeason.season });
  await stamp(match, actor).save();
  return getMatch(actor, match._id);
}

/** Moving a fixture to another team needs write access to both, and the same sport (results depend on it). */
export async function updateFixture(actor, id, { version, ...changes }) {
  const match = await loadMatch(id);
  assertCan(actor, 'update', 'match', { teamSeason: match.teamSeason });
  assertVersion(match, version);
  if (changes.teamSeason && String(changes.teamSeason) !== String(match.teamSeason)) {
    const target = await writableTeamSeason(actor, 'update', changes.teamSeason);
    if (String(target.sport) !== String(match.sport)) throw badBody('teamSeason', 'Choose a team of the same sport');
    match.season = target.season;
  }
  await checkFixture(match.sport, changes);
  match.set(changes);
  await stamp(match, actor).save();
  return getMatch(actor, id);
}

export async function deleteFixture(actor, id) {
  const match = await loadMatch(id);
  assertCan(actor, 'delete', 'match', { teamSeason: match.teamSeason });
  await match.deleteOne();
}
