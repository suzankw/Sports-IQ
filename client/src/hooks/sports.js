import { useQuery } from '@tanstack/react-query';
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
