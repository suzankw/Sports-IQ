import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';

export const useSeasonStats = (teamSeasonId) =>
  useQuery({
    queryKey: ['team-seasons', teamSeasonId, 'stats'],
    queryFn: async () => (await api.get(`/team-seasons/${teamSeasonId}/stats`)).data,
    enabled: Boolean(teamSeasonId),
  });
