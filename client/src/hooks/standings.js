import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';

export const useStandings = (competitionId, season) =>
  useQuery({
    queryKey: ['standings', competitionId, season],
    queryFn: async () => (await api.get(`/competitions/${competitionId}/standings`, { season })).data,
    enabled: Boolean(competitionId && season),
  });
