import { beforeEach, describe, expect, it } from 'vitest';
import { User } from '../src/models/User.js';
import { api, cookieFor, createUser, createWorld, expectPermissions, id, PASSWORD } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
});

const sessionCookie = (res) => res.headers['set-cookie']?.find((c) => c.startsWith('siq_session='));

describe('POST /auth/login', () => {
  it('signs in, sets an httpOnly SameSite=Strict cookie and returns the user with permissions', async () => {
    const res = await api.post('/api/v1/auth/login').send({ email: w.coach.email.toUpperCase(), password: PASSWORD });
    expect(res.status).toBe(200);
    expect(sessionCookie(res)).toMatch(/HttpOnly/);
    expect(sessionCookie(res)).toMatch(/SameSite=Strict/);
    expect(res.body.data.user).toMatchObject({ email: w.coach.email, role: 'coach' });
    expect(res.body.data.permissions.screens).not.toContain('users');
    expect(res.body.data.permissions.teamSeasons).toEqual([
      expect.objectContaining({ id: id(w.ownTeam), role: 'head', team: expect.objectContaining({ slug: 'first-xi' }) }),
    ]);
  });

  it('gives the same answer for a wrong password, an unknown email and a disabled account', async () => {
    await User.updateOne({ _id: w.otherCoach._id }, { active: false });
    const attempts = [
      { email: w.coach.email, password: 'wrong-password' },
      { email: 'nobody@turi.test', password: PASSWORD },
      { email: w.otherCoach.email, password: PASSWORD },
    ];
    for (const body of attempts) {
      const res = await api.post('/api/v1/auth/login').send(body);
      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe('Invalid email or password');
    }
  });

  it('rate-limits repeated attempts', async () => {
    const attempt = () => api.post('/api/v1/auth/login').send({ email: 'limit@turi.test', password: 'nope' });
    for (let i = 0; i < 10; i += 1) expect((await attempt()).status).toBe(401);
    const res = await attempt();
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMITED');
  });
});

describe('GET /auth/me', () => {
  it('is null for visitors', async () => {
    const res = await api.get('/api/v1/auth/me');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: null });
  });

  it('gives admins every screen', async () => {
    const res = await api.get('/api/v1/auth/me').set('Cookie', w.as.admin);
    expect(res.body.data.permissions.screens).toContain('users');
    expect(res.body.data.permissions.teamSeasons).toEqual([]);
  });

  it('treats a disabled user as a visitor straight away', async () => {
    await User.updateOne({ _id: w.coach._id }, { active: false });
    expect((await api.get('/api/v1/auth/me').set('Cookie', w.as.ownCoach)).body.data).toBeNull();
  });
});

describe('temporary passwords', () => {
  it('blocks writes until the password is changed, then revokes the old session', async () => {
    const user = await createUser({ mustChangePassword: true });
    const oldCookie = cookieFor(user);

    const blocked = await api.patch('/api/v1/auth/me').set('Cookie', oldCookie).send({ name: 'New Name' });
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe('PASSWORD_CHANGE_REQUIRED');

    const wrong = await api.post('/api/v1/auth/password').set('Cookie', oldCookie).send({ currentPassword: 'nope', newPassword: 'a-brand-new-password' });
    expect(wrong.status).toBe(400);

    const changed = await api.post('/api/v1/auth/password').set('Cookie', oldCookie).send({ currentPassword: PASSWORD, newPassword: 'a-brand-new-password' });
    expect(changed.status).toBe(200);
    expect(changed.body.data.user.mustChangePassword).toBe(false);

    expect((await api.get('/api/v1/auth/me').set('Cookie', oldCookie)).body.data).toBeNull();
    const fresh = sessionCookie(changed).split(';')[0];
    expect((await api.patch('/api/v1/auth/me').set('Cookie', fresh).send({ title: 'Ms.' })).status).toBe(200);
  });
});

describe('own account', () => {
  it('lets staff change their own name, title and photo but nothing else', async () => {
    const res = await api.patch('/api/v1/auth/me').set('Cookie', w.as.ownCoach).send({ name: 'Coach Renamed', photoUrl: '/uploads/me.jpg' });
    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({ name: 'Coach Renamed', photoUrl: '/uploads/me.jpg', role: 'coach' });
    const escalate = await api.patch('/api/v1/auth/me').set('Cookie', w.as.ownCoach).send({ role: 'admin' });
    expect(escalate.status).toBe(400);
  });

  it('follows the permission matrix', async () => {
    await expectPermissions(w, { anonymous: 401, otherCoach: 200, ownCoach: 200, admin: 200 }, () =>
      api.patch('/api/v1/auth/me').send({ title: 'Mr.' }),
    );
    await expectPermissions(w, { anonymous: 401, otherCoach: 204, ownCoach: 204, admin: 204 }, () => api.post('/api/v1/auth/logout'));
    await expectPermissions(w, { anonymous: 401, otherCoach: 400, ownCoach: 400, admin: 400 }, () =>
      api.post('/api/v1/auth/password').send({ currentPassword: 'definitely-wrong', newPassword: 'another-new-password' }),
    );
  });
});
