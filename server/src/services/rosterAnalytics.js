// Roster analytics (docs/02-database.md §6), all computed with aggregation pipelines.
import { Match } from '../models/Match.js';
import { Player } from '../models/Player.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { findPreviousSeason } from './lookup.js';
import { idOf, teamRef } from './serializers.js';

const playerIdsOf = (teamSeason) => teamSeason.members.map((m) => m.player._id ?? m.player);

async function genderCounts(playerIds) {
  const rows = await Player.aggregate([{ $match: { _id: { $in: playerIds } } }, { $group: { _id: '$gender', n: { $sum: 1 } } }]);
  const count = (gender) => rows.find((r) => r._id === gender)?.n ?? 0;
  return { female: count('female'), male: count('male') };
}

/** How many of these players were in any squad of the same sport the season before. */
async function returningCount(playerIds, sportId, season) {
  const previous = await findPreviousSeason(season);
  if (!previous) return 0;
  const [row] = await TeamSeason.aggregate([
    { $match: { sport: sportId, season: previous._id } },
    { $unwind: '$members' },
    { $match: { 'members.player': { $in: playerIds } } },
    { $group: { _id: '$members.player' } },
    { $count: 'n' },
  ]);
  return row?.n ?? 0;
}

async function squadFigures(teamSeason, season) {
  const ids = playerIdsOf(teamSeason);
  const [gender, returning] = await Promise.all([genderCounts(ids), returningCount(ids, teamSeason.sport._id ?? teamSeason.sport, season)]);
  return { ...gender, girls: gender.female, returning, new: ids.length - returning };
}

/** Each team's share of the sport's players this season. */
async function academy(sportId, seasonId) {
  const rows = await TeamSeason.aggregate([
    { $match: { sport: sportId, season: seasonId } },
    { $project: { team: 1, playerCount: { $size: '$members' } } },
    { $setWindowFields: { output: { total: { $sum: '$playerCount', window: { documents: ['unbounded', 'unbounded'] } } } } },
    { $lookup: { from: 'teams', localField: 'team', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $sort: { 'team.order': 1 } },
    { $project: { team: 1, playerCount: 1, share: { $cond: [{ $gt: ['$total', 0] }, { $round: [{ $multiply: [{ $divide: ['$playerCount', '$total'] }, 100] }, 1] }, 0] } } },
  ]);
  return rows.map((r) => ({ team: teamRef(r.team), playerCount: r.playerCount, share: r.share }));
}

export async function rosterAnalytics(teamSeason) {
  const season = teamSeason.season;
  const sportId = teamSeason.sport._id ?? teamSeason.sport;
  const previousSeason = await findPreviousSeason(season);
  const previousTeamSeason = previousSeason && (await TeamSeason.findOne({ team: teamSeason.team._id ?? teamSeason.team, season: previousSeason._id }).lean());
  const [current, previous, shares] = await Promise.all([
    squadFigures(teamSeason, season),
    previousTeamSeason ? squadFigures(previousTeamSeason, previousSeason) : null,
    academy(sportId, season._id),
  ]);
  return {
    playerCount: teamSeason.members.length,
    gender: { female: current.female, male: current.male },
    comparison: ['girls', 'new', 'returning'].map((metric) => ({ metric, current: current[metric], previous: previous?.[metric] ?? null })),
    academy: shares,
  };
}

/** The three most recent photos from the team's published matches. */
export async function recentGallery(teamSeasonId) {
  const rows = await Match.aggregate([
    { $match: { teamSeason: teamSeasonId, publishedAt: { $ne: null }, 'galleryUrls.0': { $exists: true } } },
    { $sort: { kickoffAt: -1 } },
    { $unwind: '$galleryUrls' },
    { $limit: 3 },
    { $project: { url: '$galleryUrls' } },
  ]);
  return rows.map((r) => ({ match: idOf(r), url: r.url }));
}
