import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { resizeImage } from '../lib/resizeImage.js';

/** Resizes a chosen photo in the browser, uploads it and resolves to its URL. */
export const useUpload = () =>
  useMutation({
    mutationFn: async (file) => {
      const body = new FormData();
      body.append('file', await resizeImage(file), file.name);
      return (await api.post('/uploads', body)).data.url;
    },
  });
