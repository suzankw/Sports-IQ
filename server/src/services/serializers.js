// Shapes shared by many responses (docs/openapi.yaml "References embedded in responses").
export const iso = (date) => (date ? new Date(date).toISOString() : null);
export const idOf = (value) => String(value?._id ?? value);

export const sportRef = (s) => ({ id: idOf(s), slug: s.slug, name: s.name, icon: s.icon });
export const seasonRef = (s) => ({ id: idOf(s), slug: s.slug, label: s.label });
export const teamRef = (t) => ({ id: idOf(t), slug: t.slug, name: t.name });
export const schoolRef = (s) => ({ id: idOf(s), name: s.name, shortName: s.shortName, crestUrl: s.crestUrl ?? null });
export const competitionRef = (c) => ({ id: idOf(c), name: c.name, shortName: c.shortName, type: c.type });
export const staffRef = (u) => ({ id: idOf(u), name: u.name, title: u.title ?? null, photoUrl: u.photoUrl ?? null });
export const playerRef = (p) => ({
  id: idOf(p),
  firstName: p.firstName,
  lastName: p.lastName,
  shortName: `${p.firstName[0]}. ${p.lastName}`,
  photoUrl: p.photoUrl ?? null,
});

export const AUDIT_POPULATE = { path: 'updatedBy', select: 'name title photoUrl' };
export const auditFields = (doc) => ({
  updatedAt: iso(doc.updatedAt),
  updatedBy: doc.updatedBy ? staffRef(doc.updatedBy) : null,
});
