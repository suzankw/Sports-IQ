import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';

export const useSeasons = () =>
  useQuery({
    queryKey: ['seasons'],
    queryFn: async () => (await api.get('/seasons', { pageSize: 200 })).data,
    staleTime: 5 * 60_000,
  });

/** The season named in the URL, or the current one. */
export function useSeasonFromUrl(slug) {
  const seasons = useSeasons();
  const season = seasons.data?.find((s) => (slug ? s.slug === slug : s.isCurrent));
  return { seasons, season };
}
