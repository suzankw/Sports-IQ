import mongoose, { Schema } from 'mongoose';
import { auditPlugin } from './audit.js';

const schoolSchema = new Schema({
  name: { type: String, required: true, unique: true },
  shortName: { type: String, required: true },
  crestUrl: { type: String, default: null },
  isHome: { type: Boolean, default: false },
});
schoolSchema.index({ isHome: 1 }, { unique: true, partialFilterExpression: { isHome: true } });
schoolSchema.plugin(auditPlugin);

export const School = mongoose.model('School', schoolSchema);
