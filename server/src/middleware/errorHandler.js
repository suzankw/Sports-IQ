import { AppError } from '../lib/errors.js';
import { config } from '../config.js';

/** The only place that builds error responses: `{ error: { code, message, details } }`. Express needs all 4 arguments. */
export function errorHandler(err, req, res, _next) {
  const { status, code, message, details } = describe(err);
  if (status >= 500) req.log.error({ err }, 'request failed');
  res.status(status).json({ error: { code, message, details } });
}

function describe(err) {
  if (err instanceof AppError) return reply(err.status, err.code, err.message, err.details);
  if (err.name === 'VersionError') return reply(409, 'CONFLICT', 'Someone else saved this first. Reload to see their changes.');
  if (err.code === 11000) return reply(409, 'CONFLICT', `That ${Object.keys(err.keyValue ?? {}).join(', ') || 'value'} is already in use`);
  if (err.code === 'LIMIT_FILE_SIZE' || err.status === 413 || err.type === 'entity.too.large') {
    return reply(413, 'PAYLOAD_TOO_LARGE', 'Photos must be 2 MB or smaller');
  }
  if (err.type === 'entity.parse.failed') return reply(400, 'VALIDATION_ERROR', 'The request body is not valid JSON');
  if (err.name === 'ValidationError' && err.errors) {
    return reply(400, 'VALIDATION_ERROR', 'The request is invalid', Object.values(err.errors).map((e) => ({ path: `/body/${e.path}`, message: e.message })));
  }
  // express-openapi-validator: { status, errors: [{ path, message }] }
  if (Array.isArray(err.errors) && err.status) {
    const details = err.errors.map((e) => ({ path: e.path, message: e.message }));
    if (err.status === 400) return reply(400, 'VALIDATION_ERROR', 'The request is invalid', details);
    if (err.status === 404 || err.status === 405) return reply(404, 'NOT_FOUND', 'Route not found');
    if (err.status === 415) return reply(415, 'UNSUPPORTED_MEDIA_TYPE', 'Upload a JPEG, PNG or WebP image');
    // A response that breaks the contract (validated in tests): show why outside production.
    return reply(500, 'INTERNAL_ERROR', 'Something went wrong', config.isProduction ? [] : details);
  }
  return reply(500, 'INTERNAL_ERROR', 'Something went wrong');
}

const reply = (status, code, message, details = []) => ({ status, code, message, details });
