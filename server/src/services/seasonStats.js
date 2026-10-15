// Season Statistics page (docs/02-database.md §6): every figure is an aggregation over the
// team-season's published, completed matches.
import { NotFoundError } from '../lib/errors.js';
import { Match } from '../models/Match.js';
import { School } from '../models/School.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { findPreviousSeason } from './lookup.js';
import { COUNTED, playerTotalsStages, rankedStages, toLeaderRows } from './leaderboards.js';
import { idOf, iso, schoolRef } from './serializers.js';
import { toTeamSeasonSummary } from './teamSeasons.js';

const counted = (teamSeasonId) => ({ teamSeason: teamSeasonId, ...COUNTED });
const countWhere = (comparison) => ({ $sum: { $cond: [{ [comparison]: ['$score.turi', '$score.opponent'] }, 1, 0] } });
const round1 = (expression) => ({ $round: [expression, 1] });

async function kpiTotals(teamSeasonId, teamStat) {
  const [row] = await Match.aggregate([
    { $match: counted(teamSeasonId) },
    {
      $group: {
        _id: null,
        played: { $sum: 1 },
        won: countWhere('$gt'),
        drawn: countWhere('$eq'),
        lost: countWhere('$lt'),
        scored: { $sum: '$score.turi' },
        conceded: { $sum: '$score.opponent' },
        cleanSheets: { $sum: { $cond: [{ $eq: ['$score.opponent', 0] }, 1, 0] } },
        teamStat: teamStat ? { [`$${teamStat.aggregation}`]: `$teamStats.turi.${teamStat.key}` } : { $first: null },
      },
    },
    { $set: { winRate: { $cond: [{ $gt: ['$played', 0] }, round1({ $multiply: [{ $divide: ['$won', '$played'] }, 100] }), 0] }, teamStat: round1('$teamStat') } },
  ]);
  return row ?? { played: 0, won: 0, drawn: 0, lost: 0, scored: 0, conceded: 0, cleanSheets: 0, teamStat: null, winRate: 0 };
}

async function previousWinRate(ts) {
  const season = await findPreviousSeason(ts.season);
  const previous = season && (await TeamSeason.findOne({ team: ts.team._id, season: season._id }).lean());
  if (!previous) return null;
  const totals = await kpiTotals(previous._id, null);
  return totals.played ? totals.winRate : null;
}

async function kpis(ts, sport) {
  const definition = sport.teamStats.find((d) => d.key === sport.kpis?.teamStat);
  const [totals, previous] = await Promise.all([kpiTotals(ts._id, definition), previousWinRate(ts)]);
  return {
    played: totals.played,
    won: totals.won,
    drawn: totals.drawn,
    lost: totals.lost,
    winRate: totals.winRate,
    winRateChange: previous === null ? null : Math.round((totals.winRate - previous) * 10) / 10,
    scored: totals.scored,
    conceded: totals.conceded,
    cleanSheets: sport.kpis?.cleanSheets ? totals.cleanSheets : null,
    teamStat: definition && totals.teamStat !== null ? { key: definition.key, label: definition.label, value: totals.teamStat } : null,
  };
}

async function form(teamSeasonId, teamStatKey) {
  const rows = await Match.aggregate([
    { $match: counted(teamSeasonId) },
    { $sort: { kickoffAt: -1 } },
    { $limit: 10 },
    { $sort: { kickoffAt: 1 } },
    { $lookup: { from: 'schools', localField: 'opponent', foreignField: '_id', as: 'opponent' } },
    { $unwind: '$opponent' },
    { $project: { kickoffAt: 1, opponent: 1, goalDifference: { $subtract: ['$score.turi', '$score.opponent'] }, teamStat: teamStatKey ? { $ifNull: [`$teamStats.turi.${teamStatKey}`, null] } : null } },
  ]);
  return rows.map((r) => ({ match: idOf(r), kickoffAt: iso(r.kickoffAt), opponent: schoolRef(r.opponent), goalDifference: r.goalDifference, teamStat: r.teamStat }));
}

/** Every leaderboard of the sport (top 10), in one pass over the player rows. */
async function leaderboards(teamSeasonId, sport) {
  if (!sport.leaderboards.length) return [];
  const keys = [...new Set(sport.leaderboards.flatMap((l) => l.stats))];
  const [boards] = await Match.aggregate([
    { $match: counted(teamSeasonId) },
    ...playerTotalsStages(keys),
    { $facet: Object.fromEntries(sport.leaderboards.map((board) => [board.key, rankedStages(board.stats, 10)])) },
  ]);
  return sport.leaderboards.map(({ key, label, icon, group }) => ({ key, label, icon, group, rows: toLeaderRows(boards?.[key] ?? []) }));
}

const RECORDS = {
  scoringPeak: { sort: { 'score.turi': -1, kickoffAt: -1 }, value: (m) => m.score.turi },
  dominantWin: { match: { margin: { $gt: 0 } }, sort: { margin: -1, kickoffAt: -1 }, value: (m) => m.margin },
  defensiveStruggle: { sort: { 'score.opponent': -1, kickoffAt: -1 }, value: (m) => m.score.opponent },
};

/** Season records (Q25): most scored, biggest winning margin, most conceded. */
async function records(teamSeasonId) {
  const [found] = await Match.aggregate([
    { $match: counted(teamSeasonId) },
    { $set: { margin: { $subtract: ['$score.turi', '$score.opponent'] } } },
    { $facet: Object.fromEntries(Object.entries(RECORDS).map(([key, r]) => [key, [...(r.match ? [{ $match: r.match }] : []), { $sort: r.sort }, { $limit: 1 }]])) },
  ]);
  const matches = Object.entries(found ?? {}).filter(([, list]) => list.length).map(([key, [m]]) => ({ key, m }));
  const schools = new Map((await School.find({ _id: { $in: matches.map(({ m }) => m.opponent) } }).lean()).map((s) => [idOf(s), s]));
  return matches.map(({ key, m }) => ({
    key,
    value: RECORDS[key].value(m),
    match: { id: idOf(m), kickoffAt: iso(m.kickoffAt), opponent: schoolRef(schools.get(idOf(m.opponent))), score: { turi: m.score.turi, opponent: m.score.opponent } },
  }));
}

export async function getSeasonStats(id) {
  const ts = await TeamSeason.findById(id).populate(['team', 'season', 'sport', 'leagueCompetition']).lean();
  if (!ts) throw new NotFoundError('Team-season');
  const sport = ts.sport;
  const [kpiValues, formRows, boards, recordRows] = await Promise.all([kpis(ts, sport), form(ts._id, sport.kpis?.teamStat), leaderboards(ts._id, sport), records(ts._id)]);
  return {
    teamSeason: toTeamSeasonSummary(ts),
    kpis: kpiValues,
    form: formRows,
    leaderboards: boards,
    records: recordRows,
    quote: ts.seasonQuote ? { text: ts.seasonQuote.text, attribution: ts.seasonQuote.attribution } : null,
  };
}
