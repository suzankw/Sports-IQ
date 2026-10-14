import mongoose from 'mongoose';
import { config } from './config.js';

// Operator injection is blocked earlier: the OpenAPI validator types every query and body field.
mongoose.set('strictQuery', true);

export async function connectDb(uri = config.mongoUri) {
  if (!uri) throw new Error('MONGODB_URI is not set (see .env.example)');
  await mongoose.connect(uri);
  await mongoose.syncIndexes();
}

export const disconnectDb = () => mongoose.disconnect();
