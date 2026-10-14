import { NotFoundError } from '../lib/errors.js';
import { Competition } from '../models/Competition.js';
import { Match } from '../models/Match.js';
import { findHomeSchool, resolvePageFilters } from './lookup.js';
import { competitionRef, schoolRef, seasonRef, sportRef } from './serializers.js';

const countIf = (result) => ({ $sum: { $cond: [{ $eq: ['$result', result] }, 1, 0] } });
const side = (school, scored, conceded) => ({ school, for: scored, against: conceded });

/**
 * League table from published, completed Turi matches plus other schools' results (docs/02-database.md §6).
 * Each result becomes one row per school, grouped into P W D L GF GA, points by the sport's rules.
 */
function standingsPipeline({ competitionId, seasonId, turiId, points, limit }) {
  return [
    { $match: { competition: competitionId, season: seasonId, status: 'completed', publishedAt: { $ne: null } } },
    { $project: { playedAt: '$kickoffAt', sides: [side(turiId, '$score.turi', '$score.opponent'), side('$opponent', '$score.opponent', '$score.turi')] } },
    {
      $unionWith: {
        coll: 'leagueresults',
        pipeline: [
          { $match: { competition: competitionId, season: seasonId } },
          { $project: { playedAt: 1, sides: [side('$home.school', '$home.score', '$away.score'), side('$away.school', '$away.score', '$home.score')] } },
        ],
      },
    },
    { $unwind: '$sides' },
    { $replaceWith: { $mergeObjects: ['$sides', { playedAt: '$playedAt' }] } },
    { $set: { result: { $switch: { branches: [{ case: { $gt: ['$for', '$against'] }, then: 'W' }, { case: { $lt: ['$for', '$against'] }, then: 'L' }], default: 'D' } } } },
    { $sort: { playedAt: 1 } },
    {
      $group: {
        _id: '$school',
        played: { $sum: 1 },
        won: countIf('W'),
        drawn: countIf('D'),
        lost: countIf('L'),
        goalsFor: { $sum: '$for' },
        goalsAgainst: { $sum: '$against' },
        results: { $push: '$result' },
      },
    },
    {
      $set: {
        goalDifference: { $subtract: ['$goalsFor', '$goalsAgainst'] },
        points: { $add: [{ $multiply: ['$won', points.win] }, { $multiply: ['$drawn', points.draw] }, { $multiply: ['$lost', points.loss] }] },
        form: { $slice: ['$results', -5] },
      },
    },
    { $lookup: { from: 'schools', localField: '_id', foreignField: '_id', as: 'school' } },
    { $unwind: '$school' },
    { $sort: { points: -1, goalDifference: -1, goalsFor: -1, 'school.name': 1 } },
    // Number the sorted rows ($documentNumber only allows a single sort key).
    { $group: { _id: null, rows: { $push: '$$ROOT' } } },
    { $unwind: { path: '$rows', includeArrayIndex: 'index' } },
    { $replaceWith: { $mergeObjects: ['$rows', { position: { $add: ['$index', 1] } }] } },
    ...(limit ? [{ $limit: limit }] : []),
  ];
}

const toRow = (r) => ({
  position: r.position,
  school: schoolRef(r.school),
  isHome: r.school.isHome,
  played: r.played,
  won: r.won,
  drawn: r.drawn,
  lost: r.lost,
  goalsFor: r.goalsFor,
  goalsAgainst: r.goalsAgainst,
  goalDifference: r.goalDifference,
  points: r.points,
  form: r.form,
});

export async function standingsRows(competition, season, limit) {
  const turi = await findHomeSchool();
  const rows = await Match.aggregate(
    standingsPipeline({ competitionId: competition._id, seasonId: season._id, turiId: turi._id, points: competition.sport.standingsPoints, limit }),
  );
  return rows.map(toRow);
}

export async function getStandings(competitionId, seasonSlug) {
  const competition = await Competition.findById(competitionId).populate('sport').lean();
  if (!competition) throw new NotFoundError('Competition');
  const { season } = await resolvePageFilters({ season: seasonSlug });
  if (!season) throw new NotFoundError('Season');
  return {
    competition: competitionRef(competition),
    season: seasonRef(season),
    sport: sportRef(competition.sport),
    rows: await standingsRows(competition, season),
  };
}
