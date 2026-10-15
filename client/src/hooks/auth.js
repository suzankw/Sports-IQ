import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

/** Mutations that return the new `Me` keep the cached user in step. */
function useMeMutation(mutationFn) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body) => (await mutationFn(body))?.data ?? null,
    onSuccess: (me) => client.setQueryData(['me'], me),
  });
}

export const useLogin = () => useMeMutation((credentials) => api.post('/auth/login', credentials));
export const useUpdateMe = () => useMeMutation((changes) => api.patch('/auth/me', changes));
export const useChangePassword = () => useMeMutation((passwords) => api.post('/auth/password', passwords));

/** Signs out and forgets everything cached for the user. */
export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      client.clear();
      client.setQueryData(['me'], null);
    },
  });
}
