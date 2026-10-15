// Turning a Match response into the words and numbers the match page shows.
import { formatDate, formatTime } from './dates.js';

export const STATUS_LABELS = { upcoming: 'Upcoming', live: 'Live', completed: 'Full time' };

/** The home side is always shown on the left. List rows don't carry Turi, so callers pass the home school. */
export function sidesOf(match, school = match.turi) {
  const turi = { key: 'turi', name: school?.name ?? "St. Andrew's Turi", crestUrl: school?.crestUrl ?? null, label: match.homeAway === 'home' ? 'Home' : 'Away' };
  const opponent = { key: 'opponent', name: match.opponent.name, crestUrl: match.opponent.crestUrl, label: match.homeAway === 'home' ? 'Away' : 'Home' };
  return match.homeAway === 'home' ? [turi, opponent] : [opponent, turi];
}

/** "O. Kariuki 14', 68'" per scorer (football), or the top scorers with points (basketball, netball). */
export function scorerLines(match, side) {
  if (!match.events) return [];
  if (match.sport.scoreDetail === 'events') {
    const byScorer = new Map();
    for (const e of match.events.filter((ev) => ev.type === 'goal' && ev.side === side)) {
      const name = e.player?.shortName ?? e.playerName ?? 'Unknown';
      byScorer.set(name, [...(byScorer.get(name) ?? []), `${e.minute}'${e.ownGoal ? ' (OG)' : ''}`]);
    }
    return [...byScorer].map(([name, minutes]) => `${name} ${minutes.join(', ')}`);
  }
  if (side !== 'turi') return [];
  const scoring = match.sport.playerStats.find((d) => d.key === 'points' || d.key === 'goals');
  return [...match.playerStats]
    .filter((row) => row.stats[scoring.key] > 0)
    .sort((a, b) => b.stats[scoring.key] - a.stats[scoring.key])
    .slice(0, 3)
    .map((row) => `${row.player.shortName} ${row.stats[scoring.key]} ${scoring.abbr}`);
}

export const kickoffText = (match) => `${formatDate(match.kickoffAt)} · ${formatTime(match.kickoffAt)}`;

export const formatStat = (value, definition) => (definition.type === 'percent' || definition.type === 'ratio' ? `${value}%` : String(value));

/** "First XI · Rift Valley Regionals — Regional Final" */
export const fixtureTitle = (match) =>
  `${match.team.name} · ${match.competition.name}${match.round ? ` — ${match.round}` : ''}`;
