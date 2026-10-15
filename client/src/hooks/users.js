import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client.js';

export const useResetPassword = () =>
  useMutation({ mutationFn: ({ id, temporaryPassword }) => api.post(`/users/${id}/password-reset`, { temporaryPassword }) });
