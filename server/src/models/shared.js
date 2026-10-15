import { Schema } from 'mongoose';

export const quoteSchema = new Schema(
  { text: { type: String, required: true }, attribution: { type: String, required: true } },
  { _id: false },
);

export const scoreSchema = new Schema(
  { turi: { type: Number, required: true, min: 0 }, opponent: { type: Number, required: true, min: 0 } },
  { _id: false },
);

export const ref = (model, extra = {}) => ({ type: Schema.Types.ObjectId, ref: model, ...extra });
