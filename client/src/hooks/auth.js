import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';

/** The signed-in staff member and their permissions, or null for a public visitor. */
export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return (await api.get('/auth/me')).data;
      } catch (error) {
        if (error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 60_000,
  });
