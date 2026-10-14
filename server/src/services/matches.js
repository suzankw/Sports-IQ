import { can } from '../auth/policy.js';
import { NotFoundError } from '../lib/errors.js';
import { Match } from '../models/Match.js';
import { findHomeSchool } from './lookup.js';
import { DETAIL_POPULATE, toMatch } from './matchViews.js';
import { staffOf } from './staff.js';

export async function getMatch(actor, id) {
  const match = await Match.findById(id).populate(DETAIL_POPULATE).lean();
  if (!match) throw new NotFoundError('Match');
  const [turi, staff] = await Promise.all([findHomeSchool(), staffOf(match.teamSeason._id)]);
  const showResult = Boolean(match.publishedAt) || can(actor, 'readDraft', 'match', { teamSeason: match.teamSeason._id });
  return toMatch(match, { turi, staff, showResult });
}
