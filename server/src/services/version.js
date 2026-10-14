import { ConflictError } from '../lib/errors.js';

/** Optimistic concurrency: the client sends the version it started editing from. */
export function assertVersion(doc, version) {
  if (doc.__v !== version) throw new ConflictError('Someone else saved this first. Reload to see their changes.');
}
