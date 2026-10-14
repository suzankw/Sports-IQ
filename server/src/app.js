import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import * as OpenApiValidator from 'express-openapi-validator';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import { authenticate } from './middleware/authenticate.js';
import { requireAuth } from './middleware/requireAuth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const apiSpec = path.resolve(root, '../../docs/openapi.yaml');
const clientDist = path.resolve(root, '../../client/dist');
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export function buildApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          'img-src': ["'self'", 'data:', 'blob:'],
        },
      },
    }),
  );
  app.use(
    pinoHttp({
      logger,
      genReqId: (_req, res) => {
        const id = randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
      },
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use('/uploads', express.static(config.uploadDir, { immutable: true, maxAge: '365d', index: false }));

  app.use('/api/v1', authenticate, requireAuth);
  app.use(
    OpenApiValidator.middleware({
      apiSpec,
      validateRequests: true,
      validateResponses: config.isTest,
      validateSecurity: false,
      fileUploader: { limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } },
    }),
  );
  app.use('/api/v1', apiRouter);

  if (config.isProduction && fs.existsSync(clientDist)) {
    app.use(express.static(clientDist, { index: false }));
    app.get(/^\/(?!api\/|uploads\/).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}
