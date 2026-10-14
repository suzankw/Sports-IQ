import mongoose, { Schema } from 'mongoose';
import { auditPlugin } from './audit.js';
import { quoteSchema, ref } from './shared.js';

const memberSchema = new Schema(
  { player: ref('Player', { required: true }), number: { type: Number, required: true }, position: { type: String, required: true } },
  { _id: false },
);
const depthSchema = new Schema({ position: String, players: [ref('Player')] }, { _id: false });

const teamSeasonSchema = new Schema(
  {
    team: ref('Team', { required: true }),
    season: ref('Season', { required: true }),
    sport: ref('Sport', { required: true }),
    members: [memberSchema],
    captain: ref('Player', { default: null }),
    depthChart: [depthSchema],
    leagueCompetition: ref('Competition', { default: null }),
    seasonQuote: { type: quoteSchema, default: null },
  },
  { optimisticConcurrency: true },
);
teamSeasonSchema.index({ team: 1, season: 1 }, { unique: true });
teamSeasonSchema.index({ sport: 1, season: 1 });
teamSeasonSchema.index({ 'members.player': 1 });
teamSeasonSchema.plugin(auditPlugin);

export const TeamSeason = mongoose.model('TeamSeason', teamSeasonSchema);
