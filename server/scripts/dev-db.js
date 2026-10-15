// Local MongoDB for development when none is installed: reuses the binary the tests download.
import fs from 'node:fs';
import path from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server';

const dbPath = path.resolve('.dev-db');
fs.mkdirSync(dbPath, { recursive: true });

const mongo = await MongoMemoryServer.create({ instance: { port: 27017, dbPath, storageEngine: 'wiredTiger' } });
console.log(`MongoDB running at ${mongo.getUri()} — data kept in ${dbPath}. Press Ctrl+C to stop.`);

process.on('SIGINT', async () => {
  await mongo.stop({ doCleanup: false });
  process.exit(0);
});
