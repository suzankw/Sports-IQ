import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';

export const useMatch = (id) =>
  useQuery({
    queryKey: ['matches', id],
    queryFn: async () => (await api.get(`/matches/${id}`)).data,
    enabled: Boolean(id),
  });

export const useMatches = (params, { enabled = true } = {}) =>
  useQuery({
    queryKey: ['matches', params],
    queryFn: async () => (await api.get('/matches', params)).data,
    enabled,
  });

/** D14: PUT the whole result with `version`; the response is the saved match. */
export function useSaveResult(id) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body) => (await api.put(`/matches/${id}/result`, body)).data,
    onSuccess: (match) => {
      client.setQueryData(['matches', id], match);
      return client.invalidateQueries();
    },
  });
}
