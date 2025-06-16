import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api'로 시작하는 모든 요청은 백엔드 서버(localhost:8080)로 전달
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
});
