import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ICON_NAMES } from './src/components/Icon/iconNames.js';

const api = 'http://localhost:3000';

// Poppins (headings) and Montserrat (body); icons separately so their names never flash as text.
const textFonts =
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700' +
  '&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap';
// Only the Material Symbols the app uses are downloaded.
const iconFont =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0' +
  `&icon_names=${[...ICON_NAMES].sort().join(',')}&display=block`;

const stylesheet = (href) => ({ tag: 'link', attrs: { rel: 'stylesheet', href }, injectTo: 'head' });
const injectFonts = {
  name: 'inject-fonts',
  transformIndexHtml: () => [
    { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' }, injectTo: 'head' },
    { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }, injectTo: 'head' },
    stylesheet(textFonts),
    stylesheet(iconFont),
  ],
};

export default defineConfig({
  plugins: [react(), injectFonts],
  server: {
    port: 5173,
    proxy: { '/api': api, '/uploads': api },
  },
});
