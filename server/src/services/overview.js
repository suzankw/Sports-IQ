import { NotFoundError } from '../lib/errors.js';
import { Competition } from '../models/Competition.js';
import { Match } from '../models/Match.js';
import { Season } from '../models/Season.js';
import { Sport } from '../models/Sport.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { COUNTED, playerTotalsStages, rankedStages, toLeaderRows } from './leaderboards.js';
import { SUMMARY_POPULATE, toMatchSummary } from './matchViews.js';
import { AUDIT_POPULATE, competitionRef, teamRef } from './serializers.js';
import { toSport } from './sports.js';
import { standingsRows } from './standings.js';

const upcoming = (sport, season) =>
  Match.find({ sport: sport._id, season: season._id, status: { $in: ['upcoming', 'live'] } })
    .sort({ kickoffAt: 1 })
    .limit(4)
    .populate(SUMMARY_POPULATE)
    .lean();

/** The sport's top scorers this season, across all its teams. */
async function topScorers(sport, season) {
  const rows = await Match.aggregate([
    { $match: { sport: sport._id, season: season._id, ...COUNTED } },
    ...playerTotalsStages([sport.scoringStat]),
    ...rankedStages([sport.scoringStat], 4),
  ]);
  return toLeaderRows(rows);
}

/** The top of the league table for the sport's first team (lowest order) that's in a league. */
async function firstTeamStandings(sport, season) {
  const [first] = await TeamSeason.aggregate([
    { $match: { sport: sport._id, season: season._id, leagueCompetition: { $ne: null } } },
    { $lookup: { from: 'teams', localField: 'team', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $sort: { 'team.order': 1 } },
    { $limit: 1 },
  ]);
  if (!first) return null;
  const competition = await Competition.findById(first.leagueCompetition).populate('sport').lean();
  return { competition: competitionRef(competition), team: teamRef(first.team), rows: await standingsRows(competition, season, 4) };
}

export async function getOverview(slug) {
  const sport = await Sport.findOne({ slug }).populate(AUDIT_POPULATE).lean();
  if (!sport) throw new NotFoundError('Sport');
  const season = await Season.findOne({ isCurrent: true }).lean();
  if (!season || sport.status !== 'active') return { sport: toSport(sport), upcoming: [], topScorers: [], standings: null };
  const [fixtures, scorers, standings] = await Promise.all([upcoming(sport, season), topScorers(sport, season), firstTeamStandings(sport, season)]);
  return { sport: toSport(sport), upcoming: fixtures.map(toMatchSummary), topScorers: scorers, standings };
}
