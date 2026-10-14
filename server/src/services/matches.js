import { can } from '../auth/policy.js';
import { NotFoundError } from '../lib/errors.js';
import { pageOf } from '../lib/pagination.js';
import { Match } from '../models/Match.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { findHomeSchool, resolvePageFilters } from './lookup.js';
import { DETAIL_POPULATE, SUMMARY_POPULATE, toMatch, toMatchSummary } from './matchViews.js';
import { staffOf } from './staff.js';

const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

/** "2026-10" → the UTC instants where that month starts and ends in EAT. */
function eatMonthRange(month) {
  const [year, m] = month.split('-').map(Number);
  return { $gte: new Date(Date.UTC(year, m - 1, 1) - EAT_OFFSET_MS), $lt: new Date(Date.UTC(year, m, 1) - EAT_OFFSET_MS) };
}

const VIEWS = {
  upcoming: { where: () => ({ status: { $in: ['upcoming', 'live'] } }), sort: { kickoffAt: 1 } },
  completed: { where: () => ({ status: 'completed' }), sort: { kickoffAt: -1 } },
  awaitingResult: { where: () => ({ status: { $ne: 'completed' }, kickoffAt: { $lt: new Date() } }), sort: { kickoffAt: 1 } },
};

/** Which team-seasons the filters allow: by id, by team in the season, and only mine if asked. */
async function teamSeasonFilter(actor, query, team, season) {
  let ids = null;
  if (query.teamSeason) ids = [query.teamSeason];
  else if (team) ids = (await TeamSeason.find({ team: team._id, season: season?._id }).distinct('_id')).map(String);
  if (String(query.mine) === 'true') {
    const mine = [...actor.teamSeasonIds];
    ids = ids ? ids.filter((id) => mine.includes(String(id))) : mine;
  }
  return ids;
}

/** Schedule page, live banner, dashboard lists. Rows hold public fields only. */
export async function listMatches(actor, query) {
  const { sport, season, team } = await resolvePageFilters(query);
  const view = VIEWS[query.view];
  const where = { ...view?.where() };
  const teamSeasons = await teamSeasonFilter(actor, query, team, season);
  if (teamSeasons) where.teamSeason = { $in: teamSeasons };
  else where.season = season?._id ?? null;
  if (sport) where.sport = sport._id;
  if (query.competition) where.competition = query.competition;
  if (query.status) where.status = query.status;
  if (query.month) where.kickoffAt = { ...where.kickoffAt, ...eatMonthRange(query.month) };
  if (query.published !== undefined) where.publishedAt = String(query.published) === 'true' ? { $ne: null } : null;

  const sort = query.sort ? { kickoffAt: query.sort.startsWith('-') ? -1 : 1 } : (view?.sort ?? { kickoffAt: 1 });
  const { pageSize, skip } = pageOf(query);
  const [docs, total] = await Promise.all([
    Match.find(where).sort(sort).skip(skip).limit(pageSize).populate(SUMMARY_POPULATE).lean(),
    Match.countDocuments(where),
  ]);
  return { items: docs.map(toMatchSummary), total };
}

export async function getMatch(actor, id) {
  const match = await Match.findById(id).populate(DETAIL_POPULATE).lean();
  if (!match) throw new NotFoundError('Match');
  const [turi, staff] = await Promise.all([findHomeSchool(), staffOf(match.teamSeason._id)]);
  const showResult = Boolean(match.publishedAt) || can(actor, 'readDraft', 'match', { teamSeason: match.teamSeason._id });
  return toMatch(match, { turi, staff, showResult });
}
