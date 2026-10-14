import { Types } from 'mongoose';
import { NotFoundError } from '../lib/errors.js';
import { pageOf } from '../lib/pagination.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { resolvePageFilters } from './lookup.js';
import { recentGallery, rosterAnalytics } from './rosterAnalytics.js';
import {
  AUDIT_POPULATE,
  auditFields,
  competitionRef,
  idOf,
  playerRef,
  seasonRef,
  sportRef,
  staffRef,
  teamRef,
} from './serializers.js';
import { staffOf } from './staff.js';

const PLAYER_FIELDS = 'firstName lastName photoUrl';
const REF_POPULATE = [
  { path: 'sport', select: 'slug name icon' },
  { path: 'season', select: 'slug label startDate' },
  { path: 'leagueCompetition', select: 'name shortName type' },
];

const refsOf = (ts) => ({
  id: idOf(ts),
  sport: sportRef(ts.sport),
  team: teamRef(ts.team),
  season: seasonRef(ts.season),
  leagueCompetition: ts.leagueCompetition ? competitionRef(ts.leagueCompetition) : null,
});

export const toTeamSeasonSummary = (ts) => ({ ...refsOf(ts), memberCount: ts.members.length });

/** Team tabs and pickers, in team order. `mine` limits to the caller's assignments. */
export async function listTeamSeasons(actor, query) {
  const { sport, season, team } = await resolvePageFilters(query);
  const where = { season: season?._id ?? null };
  if (sport) where.sport = sport._id;
  if (team) where.team = team._id;
  if (String(query.mine) === 'true') where._id = { $in: [...actor.teamSeasonIds].map((id) => new Types.ObjectId(id)) };
  const { pageSize, skip } = pageOf(query);
  const [{ items, total }] = await TeamSeason.aggregate([
    { $match: where },
    { $lookup: { from: 'teams', localField: 'team', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $sort: { 'team.order': 1, 'team.name': 1 } },
    { $facet: { items: [{ $skip: skip }, { $limit: pageSize }], total: [{ $count: 'n' }] } },
    { $project: { items: 1, total: { $ifNull: [{ $first: '$total.n' }, 0] } } },
  ]);
  await TeamSeason.populate(items, REF_POPULATE);
  return { items: items.map(toTeamSeasonSummary), total };
}

/** The roster page: squad, captain, depth chart, coaches, analytics and recent photos. */
export async function getTeamSeason(id) {
  const ts = await TeamSeason.findById(id)
    .populate([
      ...REF_POPULATE,
      { path: 'team', select: 'slug name order' },
      { path: 'members.player', select: PLAYER_FIELDS },
      { path: 'captain', select: PLAYER_FIELDS },
      { path: 'depthChart.players', select: PLAYER_FIELDS },
      AUDIT_POPULATE,
    ])
    .lean();
  if (!ts) throw new NotFoundError('Team-season');
  const [staff, analytics, gallery] = await Promise.all([staffOf(ts._id), rosterAnalytics(ts), recentGallery(ts._id)]);
  return {
    ...refsOf(ts),
    seasonQuote: ts.seasonQuote ? { text: ts.seasonQuote.text, attribution: ts.seasonQuote.attribution } : null,
    members: ts.members.map((m) => ({ player: playerRef(m.player), number: m.number, position: m.position })),
    captain: ts.captain ? playerRef(ts.captain) : null,
    depthChart: ts.depthChart.map((row) => ({ position: row.position, players: row.players.map(playerRef) })),
    staff: staff.map(({ user, role }) => ({ user: staffRef(user), role })),
    analytics,
    gallery,
    version: ts.__v,
    ...auditFields(ts),
  };
}
