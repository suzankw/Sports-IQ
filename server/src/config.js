import path from 'node:path';

// The only module that reads process.env.
const env = process.env.NODE_ENV ?? 'development';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 characters (see .env.example)');
}

export const config = Object.freeze({
  env,
  isProduction: env === 'production',
  isTest: env === 'test',
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret,
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? 'uploads'),
  logLevel: env === 'test' ? 'silent' : (process.env.LOG_LEVEL ?? 'info'),
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL,
    adminPassword: process.env.SEED_ADMIN_PASSWORD,
    coachPassword: process.env.SEED_COACH_PASSWORD,
  },
});
