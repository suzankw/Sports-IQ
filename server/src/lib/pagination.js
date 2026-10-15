/** Every list takes `page` and `pageSize` (default 50, max 200 — enforced by the contract). */
export function pageOf(query) {
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 50);
  return { page, pageSize, skip: (page - 1) * pageSize };
}
