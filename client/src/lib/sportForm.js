// The sport editor (D3/D4) edits a whole Sport in one form. These convert between the API shape and
// form values: key lists become comma text, nullable fields become '' and back.
import { fromCsv, toCsv } from './forms.js';

const statToForm = (d) => ({ ...d, icon: d.icon ?? '', ratio: d.ratio ?? { numerator: '', denominator: '' } });
const statFromForm = ({ ratio, icon, ...d }) => ({ ...d, icon: icon || null, ratio: d.type === 'ratio' ? ratio : null });
const image = (url) => url ?? null;

export const newStat = { key: '', label: '', abbr: '', icon: '', type: 'count', ratio: { numerator: '', denominator: '' }, source: 'manual', aggregation: 'sum' };

export function toSportForm(sport) {
  const { hero = {}, history = {}, approach = {}, facts = [], benefits = [], videos = [], pathways = [] } = sport.content ?? {};
  return {
    name: sport.name,
    icon: sport.icon,
    order: sport.order,
    status: sport.status,
    periods: sport.periods ?? { count: '', minutes: '' },
    scoreDetail: sport.scoreDetail ?? '',
    scoringStat: sport.scoringStat ?? '',
    standingsPoints: sport.standingsPoints,
    kpis: { cleanSheets: sport.kpis.cleanSheets, teamStat: sport.kpis.teamStat ?? '' },
    positions: sport.positions.map((p) => ({ ...p, headlineStats: toCsv(p.headlineStats) })),
    formations: sport.formations,
    playerStats: sport.playerStats.map(statToForm),
    teamStats: sport.teamStats.map(statToForm),
    leaderboards: sport.leaderboards.map((l) => ({ ...l, stats: toCsv(l.stats) })),
    content: {
      hero: { eyebrow: '', title: '', text: '', ...hero, imageUrl: image(hero.imageUrl) },
      history: { text: '', ...history, imageUrl: image(history.imageUrl) },
      approach: { strategic: '', character: '', ...approach },
      facts,
      benefits,
      videos: videos.map((v) => ({ duration: '', category: '', ...v, thumbnailUrl: image(v.thumbnailUrl) })),
      pathways: pathways.map((p) => ({ ...p, url: p.url ?? '' })),
    },
  };
}

/** Form values → SportUpdate (without `version`). Empty score settings are left out: they can't be cleared. */
export function fromSportForm({ periods, scoreDetail, scoringStat, kpis, positions, playerStats, teamStats, leaderboards, content, ...basics }) {
  return {
    ...basics,
    periods: Number.isFinite(periods.count) && Number.isFinite(periods.minutes) ? periods : null,
    ...(scoreDetail ? { scoreDetail } : {}),
    ...(scoringStat ? { scoringStat } : {}),
    kpis: { cleanSheets: kpis.cleanSheets, teamStat: kpis.teamStat || null },
    positions: positions.map((p) => ({ ...p, headlineStats: fromCsv(p.headlineStats) })),
    playerStats: playerStats.map(statFromForm),
    teamStats: teamStats.map(statFromForm),
    leaderboards: leaderboards.map((l) => ({ ...l, stats: fromCsv(l.stats) })),
    content: { ...content, pathways: content.pathways.map((p) => ({ ...p, url: p.url || null })) },
  };
}

/** Select options for the stat keys currently in a (form) list. */
export const keyOptions = (list = []) => list.filter((d) => d.key).map((d) => ({ value: d.key, label: d.label ? `${d.label} (${d.key})` : d.key }));
