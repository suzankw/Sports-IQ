// Stats with `source: 'events'` are counted from match events, never typed in (docs/02-database.md §2.1).
const PLAYER_RULES = {
  goals: (e, id) => e.type === 'goal' && !e.ownGoal && String(e.player) === id,
  assists: (e, id) => e.type === 'goal' && !e.ownGoal && String(e.assist) === id,
  yellowCards: (e, id) => e.type === 'yellow' && String(e.player) === id,
  redCards: (e, id) => e.type === 'red' && String(e.player) === id,
};
const TEAM_RULES = {
  yellowCards: (e) => e.type === 'yellow',
  redCards: (e) => e.type === 'red',
};

export const EVENT_STAT_KEYS = Object.keys(PLAYER_RULES);

const turiEvents = (events) => events.filter((e) => e.side === 'turi');

export const countPlayerEventStat = (events, key, playerId) =>
  turiEvents(events).filter((e) => PLAYER_RULES[key]?.(e, String(playerId))).length;

export const countTeamEventStat = (events, key) => turiEvents(events).filter((e) => TEAM_RULES[key]?.(e)).length;
