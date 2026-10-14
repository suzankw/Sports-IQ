import mongoose, { Schema } from 'mongoose';
import { auditPlugin } from './audit.js';

const playerSchema = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['female', 'male'], required: true },
  photoUrl: { type: String, default: null },
});
playerSchema.index({ lastName: 1, firstName: 1 });
playerSchema.plugin(auditPlugin);

export const Player = mongoose.model('Player', playerSchema);
