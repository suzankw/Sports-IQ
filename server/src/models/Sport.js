import mongoose, { Schema } from 'mongoose';
import { auditPlugin } from './audit.js';

const opts = { _id: false };

const statDefinitionSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    abbr: { type: String, required: true },
    icon: { type: String, default: null },
    type: { type: String, enum: ['count', 'percent', 'minutes', 'ratio'], required: true },
    ratio: {
      type: new Schema({ numerator: String, denominator: String }, opts),
      default: null,
    },
    source: { type: String, enum: ['manual', 'events'], required: true },
    aggregation: { type: String, enum: ['sum', 'avg'], required: true },
  },
  opts,
);

const positionSchema = new Schema(
  { key: { type: String, required: true }, name: { type: String, required: true }, headlineStats: [String] },
  opts,
);

const formationSchema = new Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    slots: [new Schema({ key: String, position: String, x: Number, y: Number }, opts)],
  },
  opts,
);

const leaderboardSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: String, required: true },
    group: { type: String, enum: ['attack', 'defense', 'discipline'], required: true },
    stats: [String],
  },
  opts,
);

const iconText = new Schema({ icon: String, label: String, text: String }, opts);
const contentSchema = new Schema(
  {
    hero: new Schema({ eyebrow: String, title: String, text: String, imageUrl: { type: String, default: null } }, opts),
    history: new Schema({ text: String, imageUrl: { type: String, default: null } }, opts),
    facts: [iconText],
    approach: new Schema({ strategic: String, character: String }, opts),
    benefits: [new Schema({ icon: String, title: String, text: String }, opts)],
    videos: [
      new Schema(
        { title: String, duration: String, category: String, url: String, thumbnailUrl: { type: String, default: null } },
        opts,
      ),
    ],
    pathways: [new Schema({ title: String, text: String, url: { type: String, default: null } }, opts)],
  },
  opts,
);

const sportSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'comingSoon'], default: 'comingSoon' },
    periods: { type: new Schema({ count: Number, minutes: Number }, opts), default: null },
    scoreDetail: { type: String, enum: ['events', 'periods'], default: null },
    scoringStat: { type: String, default: null },
    standingsPoints: {
      type: new Schema({ win: Number, draw: Number, loss: Number }, opts),
      default: () => ({ win: 3, draw: 1, loss: 0 }),
    },
    positions: [positionSchema],
    formations: [formationSchema],
    teamStats: [statDefinitionSchema],
    playerStats: [statDefinitionSchema],
    leaderboards: [leaderboardSchema],
    kpis: {
      type: new Schema({ cleanSheets: { type: Boolean, default: false }, teamStat: { type: String, default: null } }, opts),
      default: () => ({}),
    },
    content: { type: contentSchema, default: () => ({}) },
  },
  { optimisticConcurrency: true },
);
sportSchema.plugin(auditPlugin);

export const Sport = mongoose.model('Sport', sportSchema);
