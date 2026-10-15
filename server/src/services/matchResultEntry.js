import { assertCan } from '../auth/policy.js';
import { NotFoundError, validationProblems } from '../lib/errors.js';
import { stamp } from '../models/audit.js';
import { Match } from '../models/Match.js';
import { Sport } from '../models/Sport.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { getMatch } from './matches.js';
import { withEventStats } from './matchResult.js';
import { checkEvents, checkLineup, checkPublish, checkScore, checkSquadPlayers, checkStats } from './resultRules.js';
import { assertVersion } from './version.js';

/** D14: saves the whole result in one write. Event-sourced stats are recalculated; publishing runs the strict checks. */
export async function saveResult(actor, id, { version, published, ...input }) {
  const match = await Match.findById(id);
  if (!match) throw new NotFoundError('Match');
  assertCan(actor, 'update', 'match', { teamSeason: match.teamSeason });
  assertVersion(match, version);
  const [sport, teamSeason] = await Promise.all([Sport.findById(match.sport).lean(), TeamSeason.findById(match.teamSeason).select('members').lean()]);
  const squad = new Map(teamSeason.members.map((m) => [String(m.player), m]));

  const problems = validationProblems();
  checkScore(problems, input);
  checkSquadPlayers(problems, input, squad);
  checkLineup(problems, input, sport);
  checkStats(problems, input, sport);
  checkEvents(problems, input);
  problems.throwIfAny();

  const { playerStats, teamStats } = withEventStats(sport, input);
  if (published) checkPublish(problems, input, sport, playerStats);
  problems.throwIfAny();

  match.set({
    ...input,
    lineup: input.lineup.map((l) => ({ ...l, number: squad.get(String(l.player)).number })),
    playerStats,
    teamStats,
    publishedAt: published ? (match.publishedAt ?? new Date()) : null,
  });
  await stamp(match, actor).save();
  return getMatch(actor, id);
}
