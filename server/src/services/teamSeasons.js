import { Types } from 'mongoose';
import { assertCan } from '../auth/policy.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';
import { pageOf } from '../lib/pagination.js';
import { stamp } from '../models/audit.js';
import { Competition } from '../models/Competition.js';
import { Match } from '../models/Match.js';
import { Season } from '../models/Season.js';
import { Team } from '../models/Team.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { User } from '../models/User.js';
import { anyExists } from './crud.js';
import { badBody, resolvePageFilters } from './lookup.js';
import { recentGallery, rosterAnalytics } from './rosterAnalytics.js';
import {
  AUDIT_POPULATE,
  auditFields,
  competitionRef,
  playerRef,
  staffRef,
  teamSeasonRef,
} from './serializers.js';
import { staffOf } from './staff.js';
import { assertVersion } from './version.js';

const PLAYER_FIELDS = 'firstName lastName photoUrl';
const REF_POPULATE = [
  { path: 'sport', select: 'slug name icon' },
  { path: 'season', select: 'slug label startDate' },
  { path: 'leagueCompetition', select: 'name shortName type' },
];

const refsOf = (ts) => ({
  ...teamSeasonRef(ts),
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

async function loadTeamSeason(id) {
  const teamSeason = await TeamSeason.findById(id);
  if (!teamSeason) throw new NotFoundError('Team-season');
  return teamSeason;
}

/** A team's league must be a league competition of the same sport. */
async function checkLeague(competitionId, sportId) {
  if (!competitionId) return;
  const competition = await Competition.findById(competitionId).lean();
  if (!competition || competition.type !== 'league' || String(competition.sport) !== String(sportId)) {
    throw badBody('leagueCompetition', 'Choose a league of the same sport');
  }
}

/** Season setup (D6). `copyFrom` copies another season's members of the same team (not captain or depth chart). */
export async function createTeamSeason(actor, { team, season, leagueCompetition = null, seasonQuote = null, copyFrom }) {
  assertCan(actor, 'create', 'teamSeason');
  const teamDoc = await Team.findById(team).lean();
  if (!teamDoc) throw badBody('team', 'Unknown team');
  if (!(await Season.exists({ _id: season }))) throw badBody('season', 'Unknown season');
  await checkLeague(leagueCompetition, teamDoc.sport);
  let members = [];
  if (copyFrom) {
    const source = await TeamSeason.findById(copyFrom).lean();
    if (!source || String(source.team) !== String(team)) throw badBody('copyFrom', 'Copy from a season of the same team');
    members = source.members;
  }
  const teamSeason = new TeamSeason({ team, season, sport: teamDoc.sport, leagueCompetition, seasonQuote, members });
  await stamp(teamSeason, actor).save();
  return getTeamSeason(teamSeason._id);
}

export async function updateTeamSeason(actor, id, { version, ...changes }) {
  assertCan(actor, 'update', 'teamSeason');
  const teamSeason = await loadTeamSeason(id);
  assertVersion(teamSeason, version);
  if ('leagueCompetition' in changes) await checkLeague(changes.leagueCompetition, teamSeason.sport);
  teamSeason.set(changes);
  await stamp(teamSeason, actor).save();
  return getTeamSeason(id);
}

export async function deleteTeamSeason(actor, id) {
  assertCan(actor, 'delete', 'teamSeason');
  const teamSeason = await loadTeamSeason(id);
  const inUse = await anyExists([
    [Match, { teamSeason: teamSeason._id }],
    [User, { 'assignments.teamSeason': teamSeason._id }],
  ]);
  if (inUse) throw new ConflictError('This team has matches or coaches this season — remove those first');
  await teamSeason.deleteOne();
}

