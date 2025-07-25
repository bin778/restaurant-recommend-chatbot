import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    https: {
      key: './localhost+4-key.pem',
      cert: './localhost+4.pem',
    },
  },
  preview: {
    https: {
      key: './localhost+4-key.pem',
      cert: './localhost+4.pem',
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    minify: 'terser',
    terserOptions: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
});
