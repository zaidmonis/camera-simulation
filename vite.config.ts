import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
const repoName = process.env.GITHUB_REPOSITORY?.split('/')?.[1];

export default defineConfig({
  base: repoName ? `/${repoName}/` : '/',
  plugins: [react()],
  server: {
    host: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts'
  }
});
