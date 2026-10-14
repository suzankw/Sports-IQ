/** Deterministic random numbers (mulberry32), so every seed run produces the same data. */
export function createRandom(seed = 20261014) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min, max) => min + Math.floor(next() * (max - min + 1));
  const pick = (list) => list[Math.floor(next() * list.length)];
  const chance = (p) => next() < p;

  const shuffle = (list) => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const weighted = (items, weightOf) => {
    const total = items.reduce((sum, item) => sum + weightOf(item), 0);
    let r = next() * total;
    for (const item of items) {
      r -= weightOf(item);
      if (r <= 0) return item;
    }
    return items.at(-1);
  };

  /** Poisson-distributed count with mean `lambda` (football-like scores). */
  const poisson = (lambda) => {
    const limit = Math.exp(-lambda);
    let k = 0;
    for (let p = next(); p > limit; p *= next()) k += 1;
    return k;
  };

  /** Splits `total` into integers proportional (randomly) to `weights`. */
  const split = (total, weights) => {
    const counts = weights.map(() => 0);
    const indexes = weights.map((_, i) => i);
    for (let n = 0; n < total; n += 1) counts[weighted(indexes, (i) => weights[i])] += 1;
    return counts;
  };

  return { next, int, pick, chance, shuffle, weighted, poisson, split };
}
