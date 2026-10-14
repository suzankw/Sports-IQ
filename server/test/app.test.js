import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildApp } from '../src/app.js';

const api = request(buildApp());

describe('API pipeline', () => {
  it('answers unknown routes with the contract error shape', async () => {
    const res = await api.get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Route not found', details: [] } });
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  it('rejects anonymous writes with 401 before validating the body', async () => {
    const res = await api.post('/api/v1/seasons').send({ nonsense: true });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('sends security headers', async () => {
    const res = await api.get('/api/v1/nope');
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
