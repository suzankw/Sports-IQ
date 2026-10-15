import { validationProblems } from '../lib/errors.js';
import { Match } from '../models/Match.js';
import { EVENT_STAT_KEYS } from './eventStats.js';

const keysOf = (list) => list.map((item) => item.key);
const duplicates = (keys) => keys.filter((k, i) => keys.indexOf(k) !== i);

/** Checks that a sport's definitions refer to each other consistently. */
export function checkDefinitions(sport) {
  const problems = validationProblems();
  const playerKeys = keysOf(sport.playerStats);
  const countable = sport.playerStats.filter((d) => d.type !== 'ratio').map((d) => d.key);
  const positionKeys = keysOf(sport.positions);

  for (const list of ['positions', 'formations', 'teamStats', 'playerStats', 'leaderboards']) {
    for (const key of duplicates(keysOf(sport[list]))) problems.add(`/body/${list}`, `"${key}" is listed twice`);
  }
  for (const list of ['teamStats', 'playerStats']) {
    sport[list].forEach((d, i) => {
      if (d.source === 'events' && !EVENT_STAT_KEYS.includes(d.key)) {
        problems.add(`/body/${list}/${i}/source`, `Only ${EVENT_STAT_KEYS.join(', ')} can come from events`);
      }
      const ratioParts = d.type === 'ratio' ? [d.ratio?.numerator, d.ratio?.denominator] : [];
      if (d.type === 'ratio' && ratioParts.some((k) => !keysOf(sport[list]).includes(k))) {
        problems.add(`/body/${list}/${i}/ratio`, 'A ratio needs a numerator and denominator from the same list');
      }
    });
  }
  sport.positions.forEach((p, i) => {
    if (p.headlineStats.some((k) => !playerKeys.includes(k))) problems.add(`/body/positions/${i}/headlineStats`, 'Unknown player stat');
  });
  sport.formations.forEach((f, i) => {
    if (f.slots.some((s) => !positionKeys.includes(s.position))) problems.add(`/body/formations/${i}/slots`, 'Unknown position');
    if (duplicates(keysOf(f.slots)).length) problems.add(`/body/formations/${i}/slots`, 'Slot keys must be unique');
  });
  sport.leaderboards.forEach((l, i) => {
    if (l.stats.some((k) => !countable.includes(k))) problems.add(`/body/leaderboards/${i}/stats`, 'Unknown or ratio player stat');
  });
  if (sport.scoringStat && !countable.includes(sport.scoringStat)) problems.add('/body/scoringStat', 'Unknown player stat');
  if (sport.kpis?.teamStat && !keysOf(sport.teamStats).includes(sport.kpis.teamStat)) problems.add('/body/kpis/teamStat', 'Unknown team stat');
  if (sport.status === 'active' && !(sport.periods && sport.scoreDetail && sport.scoringStat)) {
    problems.add('/body/status', 'An active sport needs periods, scoreDetail and scoringStat');
  }
  problems.throwIfAny();
}

/** Stat keys that matches already use can't be removed. */
export async function checkRemovedKeys(sportId, before, after) {
  const problems = validationProblems();
  for (const list of ['teamStats', 'playerStats']) {
    const kept = new Set(keysOf(after[list]));
    for (const key of keysOf(before[list]).filter((k) => !kept.has(k))) {
      const paths = list === 'playerStats' ? [`playerStats.stats.${key}`] : [`teamStats.turi.${key}`, `teamStats.opponent.${key}`];
      const used = await Match.exists({ sport: sportId, $or: paths.map((p) => ({ [p]: { $exists: true } })) });
      if (used) problems.add(`/body/${list}`, `"${key}" is used by recorded matches and can't be removed`);
    }
  }
  problems.throwIfAny();
}
