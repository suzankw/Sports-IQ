import mongoose, { Schema } from 'mongoose';
import { auditPlugin } from './audit.js';
import { ref } from './shared.js';

const teamSchema = new Schema({
  sport: ref('Sport', { required: true }),
  slug: { type: String, required: true },
  name: { type: String, required: true },
  ageGroup: { type: String, default: 'Open' },
  gender: { type: String, enum: ['boys', 'girls', 'mixed'], required: true },
  order: { type: Number, default: 0 },
});
teamSchema.index({ sport: 1, slug: 1 }, { unique: true });
teamSchema.index({ sport: 1, order: 1 });
teamSchema.plugin(auditPlugin);

export const Team = mongoose.model('Team', teamSchema);
