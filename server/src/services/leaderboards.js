// Shared aggregation stages for player leaderboards (season stats, overview top scorers).
import { playerRef } from './serializers.js';

/** One row per player: appearances, last position and the summed value of each stat key. */
export const playerTotalsStages = (keys) => [
  { $unwind: '$playerStats' },
  {
    $group: {
      _id: '$playerStats.player',
      appearances: { $sum: 1 },
      position: { $last: '$playerStats.position' },
      ...Object.fromEntries(keys.map((k) => [k, { $sum: { $ifNull: [`$playerStats.stats.${k}`, 0] } }])),
    },
  },
];

/** Rank players by the sum of `stats`, best first, ignoring players with nothing. */
export const rankedStages = (stats, limit) => [
  { $set: { value: { $add: stats.map((k) => `$${k}`) } } },
  { $match: { value: { $gt: 0 } } },
  { $sort: { value: -1, appearances: 1, _id: 1 } },
  { $limit: limit },
  { $lookup: { from: 'players', localField: '_id', foreignField: '_id', as: 'player' } },
  { $unwind: '$player' },
];

export const toLeaderRows = (rows) =>
  rows.map((r, i) => ({ rank: i + 1, player: playerRef(r.player), position: r.position ?? null, appearances: r.appearances, value: r.value }));

/** Only finished, published results count towards any statistic. */
export const COUNTED = { status: 'completed', publishedAt: { $ne: null } };
