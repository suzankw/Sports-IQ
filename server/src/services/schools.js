import { LeagueResult } from '../models/LeagueResult.js';
import { Match } from '../models/Match.js';
import { School } from '../models/School.js';
import { anyExists, crudService } from './crud.js';
import { auditFields, schoolRef } from './serializers.js';

export const schoolService = crudService({
  Model: School,
  type: 'school',
  label: 'School',
  sort: { name: 1 },
  toApi: (s) => ({ ...schoolRef(s), isHome: s.isHome, ...auditFields(s) }),
  filter: async ({ home }) => (home === undefined ? {} : { isHome: String(home) === 'true' }),
  async guardDelete(school) {
    if (school.isHome) return "St. Andrew's Turi can't be deleted";
    const inUse = await anyExists([
      [Match, { opponent: school._id }],
      [LeagueResult, { $or: [{ 'home.school': school._id }, { 'away.school': school._id }] }],
    ]);
    return inUse ? 'This school is still used by matches or results' : null;
  },
});
