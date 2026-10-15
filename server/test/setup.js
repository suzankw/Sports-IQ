import os from 'node:os';
import path from 'node:path';
import { afterAll, afterEach, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-32-characters';
process.env.UPLOAD_DIR = path.join(os.tmpdir(), 'sports-iq-test-uploads');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const { connectDb } = await import('../src/db.js');
  await connectDb(mongo.getUri());
});

afterEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});
