import { assertCan } from '../auth/policy.js';
import { NotFoundError } from '../lib/errors.js';
import { pageOf } from '../lib/pagination.js';
import { stamp } from '../models/audit.js';
import { Sport } from '../models/Sport.js';
import { AUDIT_POPULATE, auditFields, idOf } from './serializers.js';
import { checkDefinitions, checkRemovedKeys } from './sportDefinitions.js';
import { assertVersion } from './version.js';

const statDefinition = (d) => ({
  key: d.key,
  label: d.label,
  abbr: d.abbr,
  icon: d.icon ?? null,
  type: d.type,
  ratio: d.ratio ? { numerator: d.ratio.numerator, denominator: d.ratio.denominator } : null,
  source: d.source,
  aggregation: d.aggregation,
});

export const toSportSummary = (s) => ({ id: idOf(s), slug: s.slug, name: s.name, icon: s.icon, order: s.order, status: s.status });

/** What a page needs to render match data for this sport. */
export const toSportDefinitions = (s) => ({
  periods: s.periods ? { count: s.periods.count, minutes: s.periods.minutes } : null,
  scoreDetail: s.scoreDetail ?? null,
  positions: s.positions.map((p) => ({ key: p.key, name: p.name, headlineStats: p.headlineStats })),
  formations: s.formations.map((f) => ({
    key: f.key,
    name: f.name,
    slots: f.slots.map(({ key, position, x, y }) => ({ key, position, x, y })),
  })),
  teamStats: s.teamStats.map(statDefinition),
  playerStats: s.playerStats.map(statDefinition),
});

export const toSport = (s) => ({
  ...toSportSummary(s),
  ...toSportDefinitions(s),
  scoringStat: s.scoringStat ?? null,
  standingsPoints: { win: s.standingsPoints.win, draw: s.standingsPoints.draw, loss: s.standingsPoints.loss },
  leaderboards: s.leaderboards.map(({ key, label, icon, group, stats }) => ({ key, label, icon, group, stats })),
  kpis: { cleanSheets: s.kpis?.cleanSheets ?? false, teamStat: s.kpis?.teamStat ?? null },
  content: s.content ?? {},
  version: s.__v,
  ...auditFields(s),
});

async function load(slug) {
  const sport = await Sport.findOne({ slug });
  if (!sport) throw new NotFoundError('Sport');
  return sport;
}
const reload = async (id) => toSport(await Sport.findById(id).populate(AUDIT_POPULATE).lean());

export async function listSports(query) {
  const { pageSize, skip } = pageOf(query);
  const [docs, total] = await Promise.all([Sport.find().sort({ order: 1 }).skip(skip).limit(pageSize).lean(), Sport.countDocuments()]);
  return { items: docs.map(toSportSummary), total };
}

export async function getSport(slug) {
  const sport = await Sport.findOne({ slug }).populate(AUDIT_POPULATE).lean();
  if (!sport) throw new NotFoundError('Sport');
  return toSport(sport);
}

export async function createSport(actor, input) {
  assertCan(actor, 'create', 'sport');
  const sport = new Sport(input);
  await stamp(sport, actor).save();
  return reload(sport._id);
}

export async function updateSport(actor, slug, { version, ...changes }) {
  assertCan(actor, 'update', 'sport');
  const sport = await load(slug);
  assertVersion(sport, version);
  const before = sport.toObject();
  sport.set(changes);
  const after = sport.toObject();
  checkDefinitions(after);
  await checkRemovedKeys(sport._id, before, after);
  await stamp(sport, actor).save();
  return reload(sport._id);
}
