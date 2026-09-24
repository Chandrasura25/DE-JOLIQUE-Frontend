import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_DEV_API_PROXY || 'http://localhost:5000';

  return {
    plugins: [react(), tailwindcss()],
    // Tailwind runs as a Vite plugin; an inline config stops Vite from picking up
    // a postcss.config.* from a parent directory.
    css: { postcss: {} },
    server: {
      port: 5173,
      // In development the React app calls /api and /uploads on its own origin;
      // Vite forwards them to the Express server.
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/uploads': { target: apiTarget, changeOrigin: true },
      },
    },
    preview: { port: 4173 },
  };
});
