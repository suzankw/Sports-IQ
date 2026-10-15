import { Schema } from 'mongoose';

/** Adds createdBy/updatedBy + timestamps to every editable collection (docs/02-database.md §1). */
export function auditPlugin(schema) {
  schema.add({
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  });
  schema.set('timestamps', true);
}

/** Records who is saving. Services call this before every save. */
export function stamp(doc, actor) {
  const id = actor?.id ?? null;
  if (doc.isNew) doc.createdBy = id;
  doc.updatedBy = id;
  return doc;
}
