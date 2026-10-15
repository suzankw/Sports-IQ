// D14 result entry: Match ⇄ form values ⇄ PUT /matches/{id}/result body.
// Form shape: starters keyed `s_<slot>`, bench as ids, player stats keyed `p_<id>` (object keys in form paths must not look numeric).

const keyOf = (playerId) => `p_${playerId}`;
const slotKey = (slot) => `s_${slot}`;
const idOf = (key) => key.slice(2);
const toNumber = (value) => (value === '' || value === null || value === undefined || Number.isNaN(Number(value)) ? null : Number(value));

/** Stats the coach types in: manual and not worked out from others. The opponent's event stats are typed too. */
export const typedStats = (definitions, { allowEvents = false } = {}) => definitions.filter((d) => d.type !== 'ratio' && (allowEvents || d.source === 'manual'));

const statValues = (definitions, stats = {}) => Object.fromEntries(definitions.map((d) => [d.key, stats[d.key] ?? '']));
const numbersOnly = (stats) => Object.fromEntries(Object.entries(stats).flatMap(([k, v]) => (toNumber(v) === null ? [] : [[k, toNumber(v)]])));

const EVENT_BLANK = { player: '', assist: '', playerOff: '', playerName: '', ownGoal: false };
export const newEvent = (type, side = 'turi', minute = '') => ({ ...EVENT_BLANK, type, side, minute });

export function toResultForm(match) {
  const { sport } = match;
  const starters = Object.fromEntries((match.lineup ?? []).filter((l) => l.slot).map((l) => [slotKey(l.slot), l.player.id]));
  const rows = match.playerStats ?? [];
  const periods = sport.scoreDetail === 'periods' ? (sport.periods?.count ?? 4) : 0;
  return {
    status: match.status,
    score: { turi: match.score?.turi ?? 0, opponent: match.score?.opponent ?? 0 },
    periodScores: Array.from({ length: periods }, (_, i) => ({ turi: match.periodScores?.[i]?.turi ?? '', opponent: match.periodScores?.[i]?.opponent ?? '' })),
    events: (match.events ?? []).map((e) => ({ ...EVENT_BLANK, type: e.type, side: e.side, minute: e.minute, player: e.player?.id ?? '', assist: e.assist?.id ?? '', playerOff: e.playerOff?.id ?? '', playerName: e.playerName ?? '', ownGoal: e.ownGoal })),
    formation: match.formation ?? sport.formations[0]?.key ?? '',
    starters,
    bench: (match.lineup ?? []).filter((l) => !l.slot).map((l) => l.player.id),
    teamStats: {
      turi: statValues(typedStats(sport.teamStats), match.teamStats?.turi),
      opponent: statValues(typedStats(sport.teamStats, { allowEvents: true }), match.teamStats?.opponent),
    },
    playerStats: Object.fromEntries(rows.map((r) => [keyOf(r.player.id), { position: r.position, stats: statValues(typedStats(sport.playerStats), r.stats) }])),
    topPerformers: [0, 1, 2].map((i) => match.topPerformers?.[i]?.id ?? ''),
    report: { text: match.report?.text ?? '', attribution: match.report?.attribution ?? '' },
    heroPhotoUrl: match.heroPhotoUrl ?? null,
    galleryUrls: match.galleryUrls ?? [],
  };
}

/** Starters in the current formation's slots, by slot. */
export const startersOf = (values, sport) => {
  const formation = sport.formations.find((f) => f.key === values.formation);
  return (formation?.slots ?? []).flatMap((slot) => {
    const player = values.starters?.[slotKey(slot.key)];
    return player ? [{ player, slot: slot.key, position: slot.position }] : [];
  });
};

/** Who appeared: starters, subs who came on, and anyone with stats typed in — in that order, once each. */
export function appearedPlayers(values, sport) {
  const ids = [
    ...startersOf(values, sport).map((s) => s.player),
    ...values.events.filter((e) => e.type === 'sub' && e.player).map((e) => e.player),
    ...Object.entries(values.playerStats ?? {}).filter(([, row]) => Object.values(row.stats ?? {}).some((v) => toNumber(v) !== null)).map(([key]) => idOf(key)),
  ];
  return [...new Set(ids)];
}

const cleanEvent = ({ type, side, minute, player, assist, playerOff, playerName, ownGoal }) => ({
  type,
  side,
  minute: toNumber(minute) ?? 0,
  ...(player ? { player } : {}),
  ...(assist && type === 'goal' ? { assist } : {}),
  ...(playerOff && type === 'sub' ? { playerOff } : {}),
  ...(playerName ? { playerName } : {}),
  ...(ownGoal && type === 'goal' ? { ownGoal: true } : {}),
});

/** Form values → MatchResultInput. `positionOf(id)` gives a player's squad position for rows without one. */
export function fromResultForm(values, match, { published, positionOf }) {
  const { sport } = match;
  const starters = startersOf(values, sport);
  const startingIds = new Set(starters.map((s) => s.player));
  const slotPosition = new Map(starters.map((s) => [s.player, s.position]));
  const periodScores = values.periodScores.map((p) => ({ turi: toNumber(p.turi) ?? 0, opponent: toNumber(p.opponent) ?? 0 }));
  return {
    version: match.version,
    status: values.status,
    score: values.status === 'upcoming' ? null : { turi: toNumber(values.score.turi) ?? 0, opponent: toNumber(values.score.opponent) ?? 0 },
    periodScores: periodScores.some((p) => p.turi || p.opponent) ? periodScores : [],
    events: sport.scoreDetail === 'events' ? values.events.map(cleanEvent).sort((a, b) => a.minute - b.minute) : [],
    formation: values.formation || null,
    lineup: [...starters.map(({ player, slot }) => ({ player, slot })), ...values.bench.filter((id) => !startingIds.has(id)).map((player) => ({ player, slot: null }))],
    teamStats: { turi: numbersOnly(values.teamStats.turi), opponent: numbersOnly(values.teamStats.opponent) },
    playerStats: appearedPlayers(values, sport).map((player) => {
      const row = values.playerStats?.[keyOf(player)];
      return { player, position: row?.position || slotPosition.get(player) || positionOf(player), stats: numbersOnly(row?.stats ?? {}) };
    }),
    topPerformers: [...new Set(values.topPerformers.filter(Boolean))],
    report: values.report.text.trim() ? { text: values.report.text.trim(), attribution: values.report.attribution.trim() } : null,
    heroPhotoUrl: values.heroPhotoUrl ?? null,
    galleryUrls: values.galleryUrls.filter(Boolean),
    published,
  };
}

/** Turi's goals, assists and cards from the events, as the server counts them (shown read-only). */
export function eventTotals(events) {
  const player = {};
  const team = { yellowCards: 0, redCards: 0 };
  const bump = (id, key) => {
    if (!id) return;
    player[id] = { ...player[id], [key]: (player[id]?.[key] ?? 0) + 1 };
  };
  for (const e of events.filter((ev) => ev.side === 'turi')) {
    if (e.type === 'goal' && !e.ownGoal) {
      bump(e.player, 'goals');
      bump(e.assist, 'assists');
    }
    if (e.type === 'yellow' || e.type === 'red') {
      const key = e.type === 'yellow' ? 'yellowCards' : 'redCards';
      bump(e.player, key);
      team[key] += 1;
    }
  }
  return { player, team };
}

/** "Quarter", "Half" or "Period" for a sport's period count. */
export const periodName = (count) => (count === 4 ? 'Quarter' : count === 2 ? 'Half' : 'Period');

export { keyOf as statsKey, slotKey };

/**
 * Everyone result entry may name: the squad (with this season's numbers), plus anyone already in the
 * saved result who has since left the squad (shown, but not offered).
 */
export function peopleOf(squad, match) {
  const people = new Map();
  const add = (player, extra) =>
    people.set(player.id, { id: player.id, shortName: player.shortName, photoUrl: player.photoUrl, ...extra, label: `${extra.number ?? '–'} · ${player.shortName}` });
  for (const m of squad.members) add(m.player, { number: m.number, position: m.position, inSquad: true });
  for (const row of [...(match.lineup ?? []), ...(match.playerStats ?? [])]) {
    if (!people.has(row.player.id)) add(row.player, { number: row.number, position: row.position, inSquad: false });
  }
  return people;
}
