import mongoose, { Schema } from 'mongoose';
import { auditPlugin } from './audit.js';
import { ref } from './shared.js';

const sideSchema = new Schema(
  { school: ref('School', { required: true }), score: { type: Number, required: true, min: 0 } },
  { _id: false },
);

const leagueResultSchema = new Schema({
  competition: ref('Competition', { required: true }),
  season: ref('Season', { required: true }),
  playedAt: { type: Date, required: true },
  home: { type: sideSchema, required: true },
  away: { type: sideSchema, required: true },
});
leagueResultSchema.index({ competition: 1, season: 1, playedAt: 1 });
leagueResultSchema.plugin(auditPlugin);

export const LeagueResult = mongoose.model('LeagueResult', leagueResultSchema);
