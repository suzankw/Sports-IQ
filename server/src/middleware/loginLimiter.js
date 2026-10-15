import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

// 10 attempts per 15 minutes per IP + email (docs/01-architecture.md §4.1).
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}|${String(req.body?.email ?? '').toLowerCase()}`,
  handler: (_req, res) =>
    res.status(429).json({
      error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again in 15 minutes.', details: [] },
    }),
});
