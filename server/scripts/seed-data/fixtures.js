// When matches are played. All times are EAT (UTC+3).

/** Circle-method double round-robin: 2·(n−1) rounds of [home, away] pairs. */
export function doubleRoundRobin(teams) {
  const order = [...teams];
  const rounds = [];
  for (let r = 0; r < order.length - 1; r += 1) {
    const pairs = [];
    for (let i = 0; i < order.length / 2; i += 1) {
      const pair = [order[i], order[order.length - 1 - i]];
      pairs.push(r % 2 ? pair.reverse() : pair);
    }
    rounds.push(pairs);
    order.splice(1, 0, order.pop());
  }
  return [...rounds, ...rounds.map((pairs) => pairs.map(([home, away]) => [away, home]))];
}

/** League rounds fall on these Saturdays (weeks after the first Saturday of September): term 1 and term 2. */
export const LEAGUE_WEEKS = [1, 3, 5, 7, 9, 19, 21, 23, 25, 27];

/** The Saturday `week` weeks after the season's first September Saturday, at `eatHour`, as a Date. */
export function saturday(seasonStartYear, week, eatHour) {
  const firstOfSeptember = Date.UTC(seasonStartYear, 8, 1);
  const firstSaturday = firstOfSeptember + ((6 - new Date(firstOfSeptember).getUTCDay() + 7) % 7) * 864e5;
  return new Date(firstSaturday + week * 7 * 864e5 + (eatHour - 3) * 36e5);
}
