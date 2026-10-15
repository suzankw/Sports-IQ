import { beforeEach, describe, expect, it } from 'vitest';
import { School } from '../src/models/School.js';
import { api, createWorld, expectPermissions, id } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
});

describe('schools', () => {
  it('filters the home school for the shell crest', async () => {
    const res = await api.get('/api/v1/schools?home=true');
    expect(res.body.data).toEqual([expect.objectContaining({ id: id(w.turi), isHome: true, crestUrl: null })]);
    expect((await api.get('/api/v1/schools?home=false')).body.meta.total).toBe(2);
  });

  it("won't delete Turi", async () => {
    const res = await api.delete(`/api/v1/schools/${id(w.turi)}`).set('Cookie', w.as.admin);
    expect(res.status).toBe(409);
  });

  it('rejects a duplicate name', async () => {
    const res = await api.post('/api/v1/schools').set('Cookie', w.as.admin).send({ name: 'Peponi School', shortName: 'P' });
    expect(res.status).toBe(409);
  });

  it('follows the permission matrix for create, update and delete', async () => {
    let n = 0;
    await expectPermissions(w, { anonymous: 401, otherCoach: 403, ownCoach: 403, admin: 201 }, () =>
      api.post('/api/v1/schools').send({ name: `Kenton College ${(n += 1)}`, shortName: 'Kenton' }),
    );
    await expectPermissions(w, { anonymous: 401, otherCoach: 403, ownCoach: 403, admin: 200 }, () =>
      api.patch(`/api/v1/schools/${id(w.turi)}`).send({ crestUrl: '/uploads/seed/turi.png' }),
    );
    await expectPermissions(
      w,
      { anonymous: 401, otherCoach: 403, ownCoach: 403, admin: 204 },
      (school) => api.delete(`/api/v1/schools/${id(school)}`),
      () => School.create({ name: `Temporary ${(n += 1)}`, shortName: 'Temp' }),
    );
  });
});
