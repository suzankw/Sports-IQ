import { countPlayerEventStat, countTeamEventStat } from './eventStats.js';

const eventKeys = (definitions) => definitions.filter((d) => d.source === 'events').map((d) => d.key);

/**
 * Fills event-sourced stats (goals, assists, cards) from the events into the player rows and the
 * Turi side of the team stats. Used by result entry and by the seed, so both count the same way.
 */
export function withEventStats(sport, { events, playerStats, teamStats }) {
  const playerKeys = eventKeys(sport.playerStats);
  const teamKeys = eventKeys(sport.teamStats);
  return {
    playerStats: playerStats.map((row) => ({
      ...row,
      stats: { ...row.stats, ...Object.fromEntries(playerKeys.map((k) => [k, countPlayerEventStat(events, k, row.player)])) },
    })),
    teamStats: {
      turi: { ...teamStats.turi, ...Object.fromEntries(teamKeys.map((k) => [k, countTeamEventStat(events, k)])) },
      opponent: teamStats.opponent,
    },
  };
}
