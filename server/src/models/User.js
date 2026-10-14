import mongoose, { Schema } from 'mongoose';
import { auditPlugin } from './audit.js';
import { ref } from './shared.js';

const assignmentSchema = new Schema(
  { teamSeason: ref('TeamSeason', { required: true }), role: { type: String, enum: ['head', 'assistant'], required: true } },
  { _id: false },
);

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  title: { type: String, default: null },
  photoUrl: { type: String, default: null },
  role: { type: String, enum: ['admin', 'coach'], default: 'coach' },
  active: { type: Boolean, default: true },
  passwordHash: { type: String, required: true, select: false },
  mustChangePassword: { type: Boolean, default: true },
  tokenVersion: { type: Number, default: 0 },
  assignments: [assignmentSchema],
});
userSchema.index({ 'assignments.teamSeason': 1 });
userSchema.plugin(auditPlugin);

export const User = mongoose.model('User', userSchema);
