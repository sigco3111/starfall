import { defineConfig } from 'vite';

export default defineConfig({
  base: '/starfall/',
  build: {
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 4096,
  },
  server: { port: 5173, strictPort: true },
});
