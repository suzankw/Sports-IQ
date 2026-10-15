import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';

const FIVE_MINUTES = 5 * 60_000;

export const useSports = () =>
  useQuery({
    queryKey: ['sports'],
    queryFn: async () => (await api.get('/sports', { pageSize: 200 })).data,
    staleTime: FIVE_MINUTES,
  });

export const useSport = (slug) =>
  useQuery({
    queryKey: ['sports', slug],
    queryFn: async () => (await api.get(`/sports/${slug}`)).data,
    enabled: Boolean(slug),
    staleTime: FIVE_MINUTES,
  });

export const useSportOverview = (slug) =>
  useQuery({
    queryKey: ['sports', slug, 'overview'],
    queryFn: async () => (await api.get(`/sports/${slug}/overview`)).data,
    enabled: Boolean(slug),
  });

/** D3/D4 sport editor save (PATCH with `version`). */
export function useUpdateSport(slug) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body) => (await api.patch(`/sports/${slug}`, body)).data,
    onSuccess: (sport) => {
      client.setQueryData(['sports', slug], sport);
      return client.invalidateQueries();
    },
  });
}
