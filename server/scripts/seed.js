// npm run seed               → wipes the dev database and loads reference + demo data
// npm run seed -- --reference → only inserts missing reference data (safe in production)
import mongoose from 'mongoose';
import { config } from '../src/config.js';
import { connectDb, disconnectDb } from '../src/db.js';
import { seedDemo } from './seed-data/demo.js';
import { createRandom } from './seed-data/random.js';
import { seedReference } from './seed-data/reference.js';

const referenceOnly = process.argv.includes('--reference');
if (config.isProduction && !referenceOnly) {
  console.error('Refusing to load demo data in production. Use `npm run seed -- --reference`.');
  process.exit(1);
}

await connectDb();
if (!referenceOnly) {
  await mongoose.connection.dropDatabase();
  await mongoose.syncIndexes();
}
await seedReference();
if (!referenceOnly) await seedDemo(createRandom());

const counts = await Promise.all(
  Object.values(mongoose.models).map(async (model) => `${model.collection.name}: ${await model.countDocuments()}`),
);
console.log(`Seeded (${referenceOnly ? 'reference only' : 'reference + demo'}).\n  ${counts.join('\n  ')}`);
await disconnectDb();
