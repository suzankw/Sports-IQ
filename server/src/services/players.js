import { Inductee } from '../models/Inductee.js';
import { Match } from '../models/Match.js';
import { Player } from '../models/Player.js';
import { TeamSeason } from '../models/TeamSeason.js';
import { anyExists, crudService } from './crud.js';
import { badQuery } from './lookup.js';
import { auditFields, playerRef } from './serializers.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Every squad the player is in — a coach may edit players of their own squads. */
const squadsOf = async (player) => (await TeamSeason.find({ 'members.player': player._id }).select('_id').lean()).map((ts) => ts._id);

export const playerService = crudService({
  Model: Player,
  type: 'player',
  label: 'Player',
  sort: ({ sort }) => (sort === '-lastName' ? { lastName: -1, firstName: -1 } : { lastName: 1, firstName: 1 }),
  toApi: (p) => ({ ...playerRef(p), gender: p.gender, ...auditFields(p) }),
  async filter({ search, teamSeason }) {
    const where = {};
    if (search) {
      const start = new RegExp(`^${escapeRegex(search)}`, 'i');
      where.$or = [{ firstName: start }, { lastName: start }];
    }
    if (teamSeason) {
      const squad = await TeamSeason.findById(teamSeason).select('members.player').lean();
      if (!squad) throw badQuery('teamSeason', 'Unknown team-season');
      where._id = { $in: squad.members.map((m) => m.player) };
    }
    return where;
  },
  policyResource: async (player) => (player ? { teamSeasons: await squadsOf(player) } : undefined),
  async guardDelete(player) {
    const inUse = await anyExists([
      [TeamSeason, { 'members.player': player._id }],
      [Match, { $or: [{ 'lineup.player': player._id }, { 'playerStats.player': player._id }] }],
      [Inductee, { player: player._id }],
    ]);
    return inUse ? 'This player is in a squad, a match or the Hall of Fame' : null;
  },
});
