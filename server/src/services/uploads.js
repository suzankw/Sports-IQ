import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { assertCan } from '../auth/policy.js';
import { config } from '../config.js';
import { UnsupportedMediaTypeError, ValidationError } from '../lib/errors.js';

// Recognised by their first bytes, never by the name or the browser's claimed type. No SVG (it can carry scripts).
const SIGNATURES = [
  { ext: 'jpg', matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'png', matches: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: 'webp', matches: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
];

/** Stores an uploaded photo under UPLOAD_DIR/yyyy/mm/<uuid>.<ext> and returns its public URL. */
export async function saveUpload(actor, file) {
  assertCan(actor, 'create', 'upload');
  if (!file) throw new ValidationError('The request is invalid', [{ path: '/body/file', message: 'Choose a photo to upload' }]);
  const type = SIGNATURES.find((s) => s.matches(file.buffer));
  if (!type) throw new UnsupportedMediaTypeError();
  const now = new Date();
  const folder = path.join(String(now.getUTCFullYear()), String(now.getUTCMonth() + 1).padStart(2, '0'));
  const name = `${randomUUID()}.${type.ext}`;
  await fs.mkdir(path.join(config.uploadDir, folder), { recursive: true });
  await fs.writeFile(path.join(config.uploadDir, folder, name), file.buffer);
  return { url: `/uploads/${folder}/${name}` };
}
