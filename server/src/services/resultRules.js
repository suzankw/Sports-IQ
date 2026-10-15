// Checks for PUT /matches/{id}/result (docs/02-database.md §2.9 "Validation in the service").
// Each takes the input, the sport and the squad, and adds problems with request paths.

const ids = (list) => list.map(String);
const EXTRA_MINUTES = 40;

/** Turi players in the lineup, stats, events and top performers must be in the squad. */
export function checkSquadPlayers(problems, input, squad) {
  const inSquad = (id) => squad.has(String(id));
  input.lineup.forEach((l, i) => !inSquad(l.player) && problems.add(`/body/lineup/${i}/player`, 'Not in the squad'));
  input.playerStats.forEach((r, i) => !inSquad(r.player) && problems.add(`/body/playerStats/${i}/player`, 'Not in the squad'));
  input.topPerformers.forEach((p, i) => !inSquad(p) && problems.add(`/body/topPerformers/${i}`, 'Not in the squad'));
  input.events.forEach((e, i) => {
    for (const key of ['player', 'assist', 'playerOff']) {
      if (e[key] && !inSquad(e[key])) problems.add(`/body/events/${i}/${key}`, 'Not in the squad');
    }
  });
}

/** Starters sit in slots of the chosen formation, each slot once; nobody is listed twice. */
export function checkLineup(problems, { formation, lineup }, sport) {
  const shape = sport.formations.find((f) => f.key === formation);
  if (formation && !shape) problems.add('/body/formation', 'Unknown formation');
  const slots = new Set(shape?.slots.map((s) => s.key) ?? []);
  const usedSlots = new Set();
  const players = ids(lineup.map((l) => l.player));
  lineup.forEach((l, i) => {
    if (players.indexOf(String(l.player)) !== i) problems.add(`/body/lineup/${i}/player`, 'Listed twice');
    if (l.slot === null) return;
    if (!slots.has(l.slot)) problems.add(`/body/lineup/${i}/slot`, formation ? `Not a position in ${formation}` : 'Choose a formation first');
    else if (usedSlots.has(l.slot)) problems.add(`/body/lineup/${i}/slot`, 'Two players in one position');
    usedSlots.add(l.slot);
  });
}

/** Only typed-in stats are accepted: events fill Turi's goals, assists and cards; ratios are worked out. */
function checkStatMap(problems, path, stats, definitions, { allowEvents, maxMinutes }) {
  const byKey = new Map(definitions.map((d) => [d.key, d]));
  for (const [key, value] of Object.entries(stats)) {
    const d = byKey.get(key);
    if (!d) problems.add(`${path}/${key}`, 'Unknown stat');
    else if (d.type === 'ratio') problems.add(`${path}/${key}`, 'Worked out from other stats');
    else if (d.source === 'events' && !allowEvents) problems.add(`${path}/${key}`, 'Counted from match events');
    else if (d.type === 'minutes' && value > maxMinutes) problems.add(`${path}/${key}`, `At most ${maxMinutes}`);
    else if (d.type === 'percent' && value > 100) problems.add(`${path}/${key}`, 'At most 100');
  }
}

export function checkStats(problems, input, sport) {
  const maxMinutes = (sport.periods ? sport.periods.count * sport.periods.minutes : 90) + EXTRA_MINUTES;
  const positions = new Set(sport.positions.map((p) => p.key));
  input.playerStats.forEach((row, i) => {
    if (!positions.has(row.position)) problems.add(`/body/playerStats/${i}/position`, 'Unknown position');
    checkStatMap(problems, `/body/playerStats/${i}/stats`, row.stats, sport.playerStats, { allowEvents: false, maxMinutes });
  });
  checkStatMap(problems, '/body/teamStats/turi', input.teamStats.turi, sport.teamStats, { allowEvents: false, maxMinutes });
  // The opponent's cards aren't in Turi's events, so they're typed in.
  checkStatMap(problems, '/body/teamStats/opponent', input.teamStats.opponent, sport.teamStats, { allowEvents: true, maxMinutes });
}

/** Turi's goals and cards need a player; a sub needs who came on and off. */
export function checkEvents(problems, { events }) {
  events.forEach((e, i) => {
    const turi = e.side === 'turi';
    if (e.type === 'sub' && (!turi || !e.player || !e.playerOff)) problems.add(`/body/events/${i}`, 'A substitution needs the player on and off');
    if ((e.type === 'yellow' || e.type === 'red') && turi && !e.player) problems.add(`/body/events/${i}/player`, 'Choose the player');
    if (e.type === 'goal' && turi && !e.ownGoal && !e.player) problems.add(`/body/events/${i}/player`, 'Choose the scorer');
  });
}

export function checkScore(problems, { status, score }) {
  if (status !== 'upcoming' && !score) problems.add('/body/score', 'Enter the score');
}

const sum = (list, side) => list.reduce((total, s) => total + s[side], 0);

/** Publishing: a finished match whose details add up. `playerStats` already include event-sourced stats. */
export function checkPublish(problems, input, sport, playerStats) {
  if (input.status !== 'completed') problems.add('/body/status', 'Only a finished match can be published');
  if (!input.score) return;
  if (sport.scoringStat) {
    const ownGoals = input.events.filter((e) => e.type === 'goal' && e.side === 'turi' && e.ownGoal).length;
    const total = playerStats.reduce((n, row) => n + (row.stats[sport.scoringStat] ?? 0), 0) + ownGoals;
    if (total !== input.score.turi) problems.add('/body/score/turi', `Players' ${sport.scoringStat} add up to ${total}, not ${input.score.turi}`);
  }
  if (input.periodScores.length && (sum(input.periodScores, 'turi') !== input.score.turi || sum(input.periodScores, 'opponent') !== input.score.opponent)) {
    problems.add('/body/periodScores', "The period scores don't add up to the final score");
  }
  const played = new Set(ids(input.playerStats.map((r) => r.player)));
  input.topPerformers.forEach((p, i) => !played.has(String(p)) && problems.add(`/body/topPerformers/${i}`, "Didn't play — add their stats first"));
}

