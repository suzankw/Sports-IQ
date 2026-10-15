import mongoose, { Schema } from 'mongoose';
import { auditPlugin } from './audit.js';

const seasonSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isCurrent: { type: Boolean, default: false },
});
seasonSchema.index({ isCurrent: 1 }, { unique: true, partialFilterExpression: { isCurrent: true } });
seasonSchema.index({ startDate: -1 });
seasonSchema.plugin(auditPlugin);

export const Season = mongoose.model('Season', seasonSchema);
