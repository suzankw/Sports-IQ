import mongoose, { Schema } from 'mongoose';
import { auditPlugin } from './audit.js';
import { ref } from './shared.js';

const inducteeSchema = new Schema(
  {
    name: { type: String, required: true },
    photoUrl: { type: String, default: null },
    sport: ref('Sport', { default: null }),
    years: { type: String, default: null },
    achievement: { type: String, required: true },
    citation: { type: String, default: null },
    player: ref('Player', { default: null }),
    order: { type: Number, default: 0 },
  },
  { collection: 'halloffame' },
);
inducteeSchema.index({ sport: 1, order: 1 });
inducteeSchema.plugin(auditPlugin);

export const Inductee = mongoose.model('Inductee', inducteeSchema);
