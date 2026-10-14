import { pageOf } from '../lib/pagination.js';

export const sendData = (res, data, status = 200) => res.status(status).json({ data });

export function sendList(res, query, { items, total }) {
  const { page, pageSize } = pageOf(query);
  res.json({ data: items, meta: { page, pageSize, total } });
}

export const sendNoContent = (res) => res.status(204).end();
