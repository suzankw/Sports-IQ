import mongoose, { Schema } from 'mongoose';
import { auditPlugin } from './audit.js';
import { ref } from './shared.js';

const competitionSchema = new Schema({
  sport: ref('Sport', { required: true }),
  name: { type: String, required: true },
  shortName: { type: String, required: true },
  type: { type: String, enum: ['league', 'cup', 'friendly'], default: 'league' },
});
competitionSchema.index({ sport: 1, name: 1 }, { unique: true });
competitionSchema.plugin(auditPlugin);

export const Competition = mongoose.model('Competition', competitionSchema);
