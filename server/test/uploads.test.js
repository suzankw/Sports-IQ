import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { config } from '../src/config.js';
import { api, createWorld, expectPermissions } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
});

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64)]);
const upload = (buffer, name = 'photo.png') => api.post('/api/v1/uploads').attach('file', buffer, name);

describe('POST /uploads', () => {
  it('stores a PNG and returns a URL that is then served', async () => {
    const res = await upload(PNG).set('Cookie', w.as.ownCoach);
    expect(res.status).toBe(201);
    expect(res.body.data.url).toMatch(/^\/uploads\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.png$/);
    expect(fs.existsSync(path.join(config.uploadDir, res.body.data.url.replace('/uploads/', '')))).toBe(true);
    const served = await api.get(res.body.data.url);
    expect(served.status).toBe(200);
    expect(served.headers['cache-control']).toContain('immutable');
  });

  it('checks the file content, not the name', async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const res = await upload(svg, 'innocent.png').set('Cookie', w.as.ownCoach);
    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
  });

  it('rejects files over 2 MB', async () => {
    const res = await upload(Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024)])).set('Cookie', w.as.ownCoach);
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('follows the permission matrix', async () => {
    await expectPermissions(w, { anonymous: 401, otherCoach: 201, ownCoach: 201, admin: 201 }, () => upload(PNG));
  });
});
