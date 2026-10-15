import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';

export const useHomeSchool = () =>
  useQuery({
    queryKey: ['schools', 'home'],
    queryFn: async () => (await api.get('/schools', { home: true })).data[0] ?? null,
    staleTime: 5 * 60_000,
  });
