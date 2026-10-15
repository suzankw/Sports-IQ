// Response shapes for matches (docs/openapi.yaml MatchSummary / Match).
import { toSportDefinitions } from './sports.js';
import {
  AUDIT_POPULATE,
  auditFields,
  competitionRef,
  idOf,
  iso,
  playerRef,
  schoolRef,
  seasonRef,
  sportRef,
  staffRef,
  teamRef,
} from './serializers.js';

const PLAYER_FIELDS = 'firstName lastName photoUrl';
const playerPaths = ['lineup.player', 'events.player', 'events.assist', 'events.playerOff', 'playerStats.player', 'topPerformers'];

export const SUMMARY_POPULATE = [
  { path: 'teamSeason', select: 'team', populate: { path: 'team', select: 'slug name' } },
  { path: 'sport', select: 'slug name icon' },
  { path: 'season', select: 'slug label' },
  { path: 'competition', select: 'name shortName type' },
  { path: 'opponent', select: 'name shortName crestUrl' },
];

export const DETAIL_POPULATE = [
  {
    path: 'teamSeason',
    select: 'team members depthChart captain',
    populate: [{ path: 'team', select: 'slug name' }, { path: 'depthChart.players', select: PLAYER_FIELDS }, { path: 'captain', select: PLAYER_FIELDS }],
  },
  { path: 'sport' },
  ...SUMMARY_POPULATE.slice(2),
  ...playerPaths.map((path) => ({ path, select: PLAYER_FIELDS })),
  AUDIT_POPULATE,
];

const score = (s) => (s ? { turi: s.turi, opponent: s.opponent } : null);

export const toMatchSummary = (m) => ({
  id: idOf(m),
  sport: sportRef(m.sport),
  season: seasonRef(m.season),
  teamSeason: idOf(m.teamSeason),
  team: teamRef(m.teamSeason.team),
  competition: competitionRef(m.competition),
  round: m.round ?? null,
  opponent: schoolRef(m.opponent),
  homeAway: m.homeAway,
  kickoffAt: iso(m.kickoffAt),
  venue: m.venue ?? null,
  status: m.status,
  score: score(m.score),
  published: Boolean(m.publishedAt),
});

/** Adds ratio stats (e.g. shooting %) computed from their parts; they're never stored. */
export function withRatios(definitions, stats) {
  const out = { ...stats };
  for (const d of definitions.filter((def) => def.type === 'ratio')) {
    const denominator = stats[d.ratio.denominator] ?? 0;
    out[d.key] = denominator ? Math.round(((stats[d.ratio.numerator] ?? 0) / denominator) * 1000) / 10 : 0;
  }
  return out;
}

const optionalPlayer = (p) => (p ? playerRef(p) : null);

function resultFields(m) {
  const squad = new Map(m.teamSeason.members.map((member) => [String(member.player), member]));
  const rowFor = new Map(m.playerStats.map((row) => [idOf(row.player), row]));
  return {
    periodScores: m.periodScores.map(score),
    events: m.events.map((e) => ({
      type: e.type,
      side: e.side,
      minute: e.minute,
      player: optionalPlayer(e.player),
      assist: optionalPlayer(e.assist),
      playerOff: optionalPlayer(e.playerOff),
      playerName: e.playerName ?? null,
      ownGoal: e.ownGoal ?? false,
    })),
    formation: m.formation ?? null,
    lineup: m.lineup.map((l) => ({
      player: playerRef(l.player),
      number: l.number ?? null,
      slot: l.slot ?? null,
      position: rowFor.get(idOf(l.player))?.position ?? squad.get(idOf(l.player))?.position ?? null,
    })),
    teamStats: { turi: m.teamStats?.turi ?? {}, opponent: m.teamStats?.opponent ?? {} },
    playerStats: m.playerStats.map((row) => ({
      player: playerRef(row.player),
      number: squad.get(idOf(row.player))?.number ?? null,
      position: row.position,
      stats: withRatios(m.sport.playerStats, row.stats ?? {}),
    })),
    topPerformers: m.topPerformers.map(playerRef),
    report: m.report ? { text: m.report.text, attribution: m.report.attribution } : null,
    heroPhotoUrl: m.heroPhotoUrl ?? null,
    galleryUrls: m.galleryUrls ?? [],
  };
}

/** The match page. Result fields are left out when the caller may not see an unpublished result. */
export function toMatch(m, { turi, staff, showResult }) {
  return {
    ...toMatchSummary(m),
    sport: { ...sportRef(m.sport), ...toSportDefinitions(m.sport) },
    turi: schoolRef(turi),
    publishedAt: iso(m.publishedAt),
    staff: staff.map(({ user, role }) => ({ user: staffRef(user), role })),
    captain: optionalPlayer(m.teamSeason.captain),
    depthChart: (m.teamSeason.depthChart ?? []).map((row) => ({ position: row.position, players: row.players.map(playerRef) })),
    ...(showResult ? resultFields(m) : {}),
    version: m.__v,
    ...auditFields(m),
  };
}
