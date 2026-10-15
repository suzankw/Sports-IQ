import { config } from './config.js';
import { connectDb } from './db.js';
import { buildApp } from './app.js';
import { logger } from './lib/logger.js';

await connectDb();
buildApp().listen(config.port, () => logger.info(`API listening on http://localhost:${config.port}`));
