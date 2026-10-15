import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';

// Lists and writes for the dashboard's resource screens. Keys start with the path's first segment
// ('/team-seasons' → 'team-seasons') so they line up with the public hooks' keys.
const keyOf = (path) => path.split('/')[1];

export const useList = (path, params = {}, { enabled = true } = {}) =>
  useQuery({
    queryKey: [keyOf(path), 'list', params],
    queryFn: async () => (await api.get(path, { ...params, pageSize: 200 })).data,
    enabled,
    placeholderData: keepPreviousData, // filters and search swap rows without a loading flash
  });

/** create / update / remove. Any write marks every cached query stale: names and refs appear on many pages. */
export function useResource(path) {
  const client = useQueryClient();
  const onSuccess = () => client.invalidateQueries();
  return {
    create: useMutation({ mutationFn: async (body) => (await api.post(path, body)).data, onSuccess }),
    update: useMutation({ mutationFn: async ({ id, ...body }) => (await api.patch(`${path}/${id}`, body)).data, onSuccess }),
    remove: useMutation({ mutationFn: (id) => api.delete(`${path}/${id}`), onSuccess }),
  };
}
