import { beforeEach, describe, expect, it } from 'vitest';
import { Season } from '../src/models/Season.js';
import { api, createWorld, expectPermissions, id } from './helpers.js';

let w;
beforeEach(async () => {
  w = await createWorld();
});

const newSeason = (n = 1) => ({
  slug: `${2030 + n}-${2031 + n}`,
  label: `${2030 + n}/${2031 + n}`,
  startDate: '2027-08-31T21:00:00.000Z',
  endDate: '2028-07-31T20:59:59.000Z',
});

describe('seasons', () => {
  it('lists newest first', async () => {
    const res = await api.get('/api/v1/seasons');
    expect(res.body.data.map((s) => s.slug)).toEqual(['2026-2027', '2025-2026']);
    expect(res.body.data[0]).toMatchObject({ isCurrent: true, label: '2026/2027', updatedBy: null });
  });

  it('moves "current" when a new season is made current', async () => {
    const res = await api.post('/api/v1/seasons').set('Cookie', w.as.admin).send({ ...newSeason(), isCurrent: true });
    expect(res.status).toBe(201);
    expect(res.body.data.updatedBy.id).toBe(id(w.admin));
    expect(await Season.countDocuments({ isCurrent: true })).toBe(1);
    expect((await Season.findById(w.season._id)).isCurrent).toBe(false);
  });

  it('rejects a season that ends before it starts', async () => {
    const res = await api.patch(`/api/v1/seasons/${id(w.previous)}`).set('Cookie', w.as.admin).send({ endDate: '2020-01-01T00:00:00.000Z' });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([{ path: '/body/endDate', message: 'The season must end after it starts' }]);
  });

  it("won't delete the current season or one in use", async () => {
    expect((await api.delete(`/api/v1/seasons/${id(w.season)}`).set('Cookie', w.as.admin)).status).toBe(409);
  });

  it('follows the permission matrix for create, update and delete', async () => {
    let n = 0;
    await expectPermissions(w, { anonymous: 401, otherCoach: 403, ownCoach: 403, admin: 201 }, () =>
      api.post('/api/v1/seasons').send(newSeason((n += 1))),
    );
    await expectPermissions(w, { anonymous: 401, otherCoach: 403, ownCoach: 403, admin: 200 }, () =>
      api.patch(`/api/v1/seasons/${id(w.previous)}`).send({ label: '2025/2026' }),
    );
    await expectPermissions(
      w,
      { anonymous: 401, otherCoach: 403, ownCoach: 403, admin: 204 },
      (season) => api.delete(`/api/v1/seasons/${id(season)}`),
      () => Season.create(newSeason((n += 1))),
    );
  });
});
