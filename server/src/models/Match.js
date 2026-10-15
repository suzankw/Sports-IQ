import mongoose, { Schema } from 'mongoose';
import { auditPlugin } from './audit.js';
import { quoteSchema, ref, scoreSchema } from './shared.js';

const opts = { _id: false };
const statMap = { type: Map, of: Number, default: () => ({}) };

const eventSchema = new Schema(
  {
    type: { type: String, enum: ['goal', 'yellow', 'red', 'sub'], required: true },
    side: { type: String, enum: ['turi', 'opponent'], required: true },
    minute: { type: Number, required: true },
    player: ref('Player', { default: null }),
    assist: ref('Player', { default: null }),
    playerOff: ref('Player', { default: null }),
    playerName: { type: String, default: null },
    ownGoal: { type: Boolean, default: false },
  },
  opts,
);

const matchSchema = new Schema(
  {
    teamSeason: ref('TeamSeason', { required: true }),
    sport: ref('Sport', { required: true }),
    season: ref('Season', { required: true }),
    competition: ref('Competition', { required: true }),
    round: { type: String, default: null },
    opponent: ref('School', { required: true }),
    homeAway: { type: String, enum: ['home', 'away'], default: 'home' },
    kickoffAt: { type: Date, required: true },
    venue: { type: String, default: null },
    status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
    score: { type: scoreSchema, default: null },
    periodScores: [scoreSchema],
    events: [eventSchema],
    formation: { type: String, default: null },
    lineup: [new Schema({ player: ref('Player'), number: { type: Number, default: null }, slot: { type: String, default: null } }, opts)],
    teamStats: { turi: statMap, opponent: statMap },
    playerStats: [new Schema({ player: ref('Player'), position: String, stats: statMap }, opts)],
    topPerformers: [ref('Player')],
    report: { type: quoteSchema, default: null },
    heroPhotoUrl: { type: String, default: null },
    galleryUrls: [String],
    publishedAt: { type: Date, default: null },
  },
  { optimisticConcurrency: true },
);
matchSchema.index({ teamSeason: 1, kickoffAt: 1 });
matchSchema.index({ sport: 1, season: 1, kickoffAt: 1 });
matchSchema.index({ competition: 1, season: 1, kickoffAt: 1 });
matchSchema.plugin(auditPlugin);

export const Match = mongoose.model('Match', matchSchema);
