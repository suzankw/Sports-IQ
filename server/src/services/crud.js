import { assertCan } from '../auth/policy.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';
import { pageOf } from '../lib/pagination.js';
import { stamp } from '../models/audit.js';
import { AUDIT_POPULATE } from './serializers.js';

/**
 * List / create / update / delete for the simple resources (seasons, schools, teams, …).
 * Each resource configures: how to filter, check input, serialize and guard deletes.
 */
export function crudService({
  Model,
  type,
  label,
  toApi,
  populate = [],
  sort,
  filter = async () => ({}),
  prepare = async (input) => input,
  guardDelete = async () => null,
  policyResource = async () => undefined,
}) {
  const populateAll = [...populate, AUDIT_POPULATE];

  const load = async (id) => {
    const doc = await Model.findById(id);
    if (!doc) throw new NotFoundError(label);
    return doc;
  };
  const reload = async (id) => toApi(await Model.findById(id).populate(populateAll).lean());
  const authorize = async (actor, action, doc) => assertCan(actor, action, type, await policyResource(doc));

  return {
    async list(query) {
      const where = await filter(query);
      const { pageSize, skip } = pageOf(query);
      const order = typeof sort === 'function' ? sort(query) : sort;
      const [docs, total] = await Promise.all([
        Model.find(where).sort(order).skip(skip).limit(pageSize).populate(populateAll).lean(),
        Model.countDocuments(where),
      ]);
      return { items: docs.map(toApi), total };
    },

    async create(actor, input) {
      await authorize(actor, 'create');
      const doc = new Model(await prepare(input, null));
      await stamp(doc, actor).save();
      return reload(doc._id);
    },

    async update(actor, id, input) {
      const doc = await load(id);
      await authorize(actor, 'update', doc);
      doc.set(await prepare(input, doc));
      await stamp(doc, actor).save();
      return reload(id);
    },

    async remove(actor, id) {
      const doc = await load(id);
      await authorize(actor, 'delete', doc);
      const reason = await guardDelete(doc);
      if (reason) throw new ConflictError(reason);
      await doc.deleteOne();
    },
  };
}
