import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      // Improves file change detection when running inside Docker/Windows/Network mounts
      usePolling: true,
      interval: 200,
    },
    hmr: {
      // HMR will connect via the browser-exposed port mapped in docker-compose (3000 -> 5173)
      host: 'localhost',
      port: 3000,
    },
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
})
