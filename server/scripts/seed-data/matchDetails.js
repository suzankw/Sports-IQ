// Generates a believable, internally consistent result for a seeded match:
// lineups from the squad, events/period scores that add up to the score, and player stats that agree with both.
import { withEventStats } from '../../src/services/matchResult.js';
import { OPPONENT_SCORERS, REPORT_QUOTES } from './people.js';

/** Fills each formation slot with an unused member of that position (any outfield player if none left). */
function pickLineup(rand, slots, squad) {
  const pool = rand.shuffle(squad);
  const take = (match) => pool.splice(pool.findIndex(match), 1)[0];
  const starters = slots.map((slot) => {
    const member = pool.some((m) => m.position === slot.position) ? take((m) => m.position === slot.position) : take((m) => m.position !== 'GK');
    return { member, slot: slot.key };
  });
  return { starters, bench: pool };
}

const lineupOf = (starters, bench) => [
  ...starters.map(({ member, slot }) => ({ player: member.player, number: member.number, slot })),
  ...bench.map((member) => ({ player: member.player, number: member.number, slot: null })),
];

const sum = (rows, key) => rows.reduce((total, row) => total + (row.stats[key] ?? 0), 0);
const quarters = (rand, total) => rand.split(total, [1, 1, 1, 1]);

function football(rand, sport, squad, score) {
  const formation = rand.pick(sport.formations);
  const { starters, bench } = pickLineup(rand, formation.slots, squad);
  const onPitch = starters.map(({ member }) => ({ member, from: 0, to: 90 }));
  const events = [];

  for (const sub of rand.shuffle(bench).slice(0, rand.int(2, 3))) {
    const off = rand.pick(onPitch.filter((p) => p.to === 90 && p.from === 0 && p.member.position !== 'GK'));
    const minute = rand.int(55, 82);
    off.to = minute;
    onPitch.push({ member: sub, from: minute, to: 90 });
    events.push({ type: 'sub', side: 'turi', minute, player: sub.player, playerOff: off.member.player });
  }
  const activeAt = (minute) => onPitch.filter((p) => p.from <= minute && minute <= p.to);
  const scoringWeight = { FW: 6, MF: 3, DF: 1, GK: 0 };
  const creatingWeight = { FW: 3, MF: 4, DF: 1, GK: 0 };

  for (let i = 0; i < score.turi; i += 1) {
    const minute = rand.int(1, 90);
    const scorer = rand.weighted(activeAt(minute), (p) => scoringWeight[p.member.position] + 0.1);
    const assist = rand.chance(0.7) ? rand.weighted(activeAt(minute).filter((p) => p !== scorer), (p) => creatingWeight[p.member.position] + 0.1) : null;
    events.push({ type: 'goal', side: 'turi', minute, player: scorer.member.player, assist: assist?.member.player ?? null });
  }
  for (let i = 0; i < score.opponent; i += 1) {
    events.push({ type: 'goal', side: 'opponent', minute: rand.int(1, 90), playerName: rand.pick(OPPONENT_SCORERS) });
  }
  const outfield = onPitch.filter((p) => p.member.position !== 'GK');
  for (let i = rand.int(0, 2); i > 0; i -= 1) events.push({ type: 'yellow', side: 'turi', minute: rand.int(10, 88), player: rand.pick(outfield).member.player });
  if (rand.chance(0.05)) events.push({ type: 'red', side: 'turi', minute: rand.int(60, 89), player: rand.pick(outfield).member.player });
  events.sort((a, b) => a.minute - b.minute);

  const opponentOnTarget = score.opponent + rand.int(1, 4);
  const goalsBy = (id) => events.filter((e) => e.type === 'goal' && e.side === 'turi' && String(e.player) === String(id)).length;
  const playerStats = onPitch.map(({ member, from, to }) => {
    const pos = member.position;
    const keeper = pos === 'GK' && from === 0;
    const onTarget = goalsBy(member.player) + (pos === 'FW' || pos === 'MF' ? rand.int(0, 2) : 0);
    return {
      player: member.player,
      position: pos,
      stats: {
        minutes: to - from,
        shots: pos === 'GK' ? 0 : onTarget + rand.int(0, pos === 'FW' ? 3 : 1),
        shotsOnTarget: onTarget,
        tackles: pos === 'DF' ? rand.int(2, 7) : rand.int(0, 3),
        clearances: pos === 'DF' ? rand.int(2, 9) : rand.int(0, 1),
        saves: keeper ? opponentOnTarget - score.opponent : 0,
        goalsConceded: keeper ? score.opponent : 0,
      },
    };
  });
  const turiShots = sum(playerStats, 'shots');
  const turiOnTarget = sum(playerStats, 'shotsOnTarget');
  const possession = rand.int(42, 66);
  const teamStats = {
    turi: { possession, shots: turiShots, shotsOnTarget: turiOnTarget, corners: rand.int(2, 9), fouls: rand.int(6, 14), offsides: rand.int(0, 4), saves: opponentOnTarget - score.opponent },
    opponent: { possession: 100 - possession, shots: opponentOnTarget + rand.int(2, 6), shotsOnTarget: opponentOnTarget, corners: rand.int(1, 7), fouls: rand.int(7, 16), yellowCards: rand.int(0, 3), redCards: rand.chance(0.05) ? 1 : 0, offsides: rand.int(0, 5), saves: turiOnTarget - score.turi },
  };
  return { formation: formation.key, lineup: lineupOf(starters, bench), events, periodScores: [], playerStats, teamStats };
}

function basketball(rand, sport, squad, score) {
  const { starters, bench } = pickLineup(rand, sport.formations[0].slots, squad);
  const used = [...starters.map((s) => s.member), ...rand.shuffle(bench).slice(0, rand.int(3, Math.min(6, bench.length)))];
  const points = rand.split(score.turi, used.map((_, i) => (i < 5 ? 3 : 1)));
  const big = (pos) => pos === 'C' || pos === 'PF';
  const playerStats = used.map((member, i) => {
    const threes = Math.min(rand.int(0, 3), Math.floor(points[i] / 3));
    const freeThrows = Math.min(rand.int(0, 4), points[i] - threes * 3);
    return {
      player: member.player,
      position: member.position,
      stats: {
        minutes: i < 5 ? rand.int(22, 34) : rand.int(6, 16),
        points: points[i],
        rebounds: big(member.position) ? rand.int(4, 12) : rand.int(0, 5),
        assists: member.position === 'PG' ? rand.int(4, 10) : rand.int(0, 4),
        steals: rand.int(0, 4),
        blocks: big(member.position) ? rand.int(0, 4) : rand.int(0, 1),
        turnovers: rand.int(0, 4),
        fouls: rand.int(0, 4),
        threePointersMade: threes,
        freeThrowsMade: freeThrows,
        freeThrowsAttempted: freeThrows + rand.int(0, 2),
      },
    };
  });
  const attempted = sum(playerStats, 'freeThrowsAttempted');
  const teamStats = {
    turi: { rebounds: sum(playerStats, 'rebounds'), turnovers: sum(playerStats, 'turnovers'), fouls: sum(playerStats, 'fouls'), steals: sum(playerStats, 'steals'), threePointers: sum(playerStats, 'threePointersMade'), layups: rand.int(6, 16), freeThrowPct: attempted ? Math.round((sum(playerStats, 'freeThrowsMade') / attempted) * 100) : 0, assists: sum(playerStats, 'assists') },
    opponent: { rebounds: rand.int(20, 40), turnovers: rand.int(8, 20), fouls: rand.int(10, 22), steals: rand.int(3, 12), threePointers: rand.int(2, 9), layups: rand.int(5, 15), freeThrowPct: rand.int(50, 85), assists: rand.int(6, 18) },
  };
  const ours = quarters(rand, score.turi);
  const theirs = quarters(rand, score.opponent);
  return { formation: sport.formations[0].key, lineup: lineupOf(starters, bench), events: [], periodScores: ours.map((turi, q) => ({ turi, opponent: theirs[q] })), playerStats, teamStats };
}

function netball(rand, sport, squad, score) {
  const { starters, bench } = pickLineup(rand, sport.formations[0].slots, squad);
  const used = [...starters.map((s) => s.member), ...rand.shuffle(bench).slice(0, rand.int(0, 2))];
  const shooters = used.filter((m) => m.position === 'GS' || m.position === 'GA');
  const goals = rand.split(score.turi, shooters.map((m) => (m.position === 'GS' ? 6 : 4)));
  const defender = (pos) => ['GK', 'GD', 'WD', 'C'].includes(pos);
  const playerStats = used.map((member) => {
    const shooter = shooters.indexOf(member);
    const scored = shooter >= 0 ? goals[shooter] : 0;
    return {
      player: member.player,
      position: member.position,
      stats: {
        goals: scored,
        attempts: shooter >= 0 ? scored + rand.int(2, 8) : 0,
        intercepts: defender(member.position) ? rand.int(0, 5) : rand.int(0, 1),
        deflections: defender(member.position) ? rand.int(1, 7) : rand.int(0, 2),
        rebounds: ['GS', 'GA', 'GD', 'GK'].includes(member.position) ? rand.int(0, 5) : 0,
        turnovers: rand.int(0, 3),
        penalties: rand.int(0, 6),
      },
    };
  });
  const teamStats = {
    turi: { shootingPct: Math.round((sum(playerStats, 'goals') / Math.max(1, sum(playerStats, 'attempts'))) * 100), centrePassConversion: rand.int(60, 88), rebounds: sum(playerStats, 'rebounds'), turnoversWon: sum(playerStats, 'intercepts') + rand.int(0, 4), shots: sum(playerStats, 'attempts'), contactPenalties: rand.int(8, 25), obstructionPenalties: rand.int(3, 12) },
    opponent: { shootingPct: rand.int(60, 85), centrePassConversion: rand.int(50, 80), rebounds: rand.int(4, 14), turnoversWon: rand.int(5, 18), shots: score.opponent + rand.int(6, 16), contactPenalties: rand.int(8, 25), obstructionPenalties: rand.int(3, 12) },
  };
  const ours = quarters(rand, score.turi);
  const theirs = quarters(rand, score.opponent);
  return { formation: sport.formations[0].key, lineup: lineupOf(starters, bench), events: [], periodScores: ours.map((turi, q) => ({ turi, opponent: theirs[q] })), playerStats, teamStats };
}

const GENERATORS = { football, basketball, netball };

/** Top performers: best weighted total of each player's headline stats — scoring counts most, then assists. */
function topPerformers(sport, playerStats) {
  const headline = Object.fromEntries(sport.positions.map((p) => [p.key, p.headlineStats]));
  const weight = (key) => (key === sport.scoringStat ? 5 : key === 'assists' ? 3 : 1);
  const rating = (row) => headline[row.position].reduce((total, key) => total + (row.stats[key] ?? 0) * weight(key), 0);
  return [...playerStats].sort((a, b) => rating(b) - rating(a)).slice(0, 3).map((row) => row.player);
}

export function generateResult(rand, sport, squad, score) {
  const detail = GENERATORS[sport.slug](rand, sport, squad, score);
  const { playerStats, teamStats } = withEventStats(sport, detail);
  return {
    ...detail,
    playerStats,
    teamStats,
    topPerformers: topPerformers(sport, playerStats),
    report: { text: rand.pick(REPORT_QUOTES), attribution: rand.chance(0.5) ? 'Director of Sport' : 'Head Coach' },
  };
}
