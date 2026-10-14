// The one API client. Components never call fetch: hooks call this.
const BASE = '/api/v1';

export class ApiError extends Error {
  constructor(status, { code, message, details } = {}) {
    super(message ?? 'Something went wrong');
    this.status = status;
    this.code = code ?? 'INTERNAL_ERROR';
    this.details = details ?? [];
  }
}

const toQuery = (params = {}) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return entries.length ? `?${new URLSearchParams(entries)}` : '';
};

async function request(method, path, { params, body } = {}) {
  const isForm = body instanceof FormData;
  const res = await fetch(`${BASE}${path}${toQuery(params)}`, {
    method,
    credentials: 'same-origin',
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body && !isForm ? JSON.stringify(body) : body,
  });
  if (res.status === 204) return null;
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, payload.error);
  return payload;
}

export const api = {
  get: (path, params) => request('GET', path, { params }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path),
};
