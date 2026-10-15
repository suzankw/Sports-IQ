import { beforeEach, describe, expect, it } from 'vitest';
import { User } from '../src/models/User.js';
import { PASSWORD, api, cookieFor, createUser, createWorld, expectPermissions, id } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
});

const ADMIN_ONLY = (ok) => ({ anonymous: 401, otherCoach: 403, ownCoach: 403, admin: ok });
const TEMPORARY = 'temporary-pass-123';
const newUser = (n, extra = {}) => ({ email: `new.coach${n}@turi.test`, name: `New Coach ${n}`, role: 'coach', temporaryPassword: TEMPORARY, ...extra });

describe('users', () => {
  it('lists staff with their assignments, admin only', async () => {
    await expectPermissions(w, ADMIN_ONLY(200), () => api.get('/api/v1/users'));
    const res = await api.get('/api/v1/users').set('Cookie', w.as.admin);
    const coach = res.body.data.find((u) => u.id === id(w.coach));
    expect(coach.assignments).toEqual([{ teamSeason: expect.objectContaining({ id: id(w.ownTeam), team: expect.objectContaining({ slug: 'first-xi' }) }), role: 'head' }]);
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|tokenVersion/);
  });

  it('creates an account that must change its temporary password', async () => {
    const res = await api.post('/api/v1/users').set('Cookie', w.as.admin).send(newUser(1, { assignments: [{ teamSeason: id(w.otherTeam), role: 'assistant' }] }));
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ mustChangePassword: true, active: true, assignments: [{ role: 'assistant' }] });
    const login = await api.post('/api/v1/auth/login').send({ email: 'new.coach1@turi.test', password: TEMPORARY });
    expect(login.body.data.user.mustChangePassword).toBe(true);
  });

  it('rejects a taken email, a duplicate or unknown assignment', async () => {
    const send = (body) => api.post('/api/v1/users').set('Cookie', w.as.admin).send(body);
    expect((await send(newUser(2, { email: w.coach.email.toUpperCase() }))).status).toBe(409);
    const twice = await send(newUser(3, { assignments: [{ teamSeason: id(w.ownTeam), role: 'head' }, { teamSeason: id(w.ownTeam), role: 'assistant' }] }));
    expect(twice.body.error.details[0].path).toBe('/body/assignments');
    expect((await send(newUser(4, { assignments: [{ teamSeason: id(w.season), role: 'head' }] }))).status).toBe(400);
  });

  it('signs a user out everywhere when disabled or their role changes', async () => {
    const mine = () => api.get('/api/v1/team-seasons?mine=true').set('Cookie', w.as.ownCoach);
    expect((await mine()).status).toBe(200);
    await api.patch(`/api/v1/users/${id(w.coach)}`).set('Cookie', w.as.admin).send({ active: false });
    expect((await mine()).status).toBe(401);
    const promoted = await api.patch(`/api/v1/users/${id(w.otherCoach)}`).set('Cookie', w.as.admin).send({ role: 'admin' });
    expect(promoted.body.data.role).toBe('admin');
    expect((await api.get('/api/v1/users').set('Cookie', w.as.otherCoach)).status).toBe(401);
  });

  it("won't let an admin disable or demote themselves", async () => {
    const self = (body) => api.patch(`/api/v1/users/${id(w.admin)}`).set('Cookie', w.as.admin).send(body);
    expect((await self({ active: false })).status).toBe(409);
    expect((await self({ role: 'coach' })).status).toBe(409);
    expect((await self({ name: 'Director of Sport' })).status).toBe(200);
  });

  it('sets a temporary password and revokes sessions', async () => {
    const res = await api.post(`/api/v1/users/${id(w.coach)}/password-reset`).set('Cookie', w.as.admin).send({ temporaryPassword: TEMPORARY });
    expect(res.status).toBe(204);
    expect((await api.get('/api/v1/team-seasons?mine=true').set('Cookie', w.as.ownCoach)).status).toBe(401);
    expect((await api.post('/api/v1/auth/login').send({ email: w.coach.email, password: PASSWORD })).status).toBe(401);
    const login = await api.post('/api/v1/auth/login').send({ email: w.coach.email, password: TEMPORARY });
    expect(login.body.data.user.mustChangePassword).toBe(true);
  });

  it('follows the permission matrix for writes', async () => {
    let n = 10;
    await expectPermissions(w, ADMIN_ONLY(201), () => api.post('/api/v1/users').send(newUser((n += 1))));
    await expectPermissions(w, ADMIN_ONLY(200), () => api.patch(`/api/v1/users/${id(w.coach)}`).send({ title: 'Mr.' }));
    await expectPermissions(
      w,
      ADMIN_ONLY(204),
      (user) => api.post(`/api/v1/users/${id(user)}/password-reset`).send({ temporaryPassword: TEMPORARY }),
      () => createUser(),
    );
  });

  it('keeps an admin out until a temporary password is changed', async () => {
    const forced = await User.findByIdAndUpdate(w.admin._id, { mustChangePassword: true }, { new: true });
    const res = await api.get('/api/v1/users').set('Cookie', cookieFor(forced));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('PASSWORD_CHANGE_REQUIRED');
  });
});
