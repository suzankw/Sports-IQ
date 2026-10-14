import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';

export const useMatch = (id) =>
  useQuery({
    queryKey: ['matches', id],
    queryFn: async () => (await api.get(`/matches/${id}`)).data,
    enabled: Boolean(id),
  });
