import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// In Docker the backend is reached via the compose service name ("api").
// Override with VITE_API_PROXY_TARGET when running inside containers.
const API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Use polling when running inside Docker on Windows (bind mounts) so
    // file changes are detected. Enable with VITE_USE_POLLING=true.
    watch: {
      usePolling: process.env.VITE_USE_POLLING === 'true',
    },
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: false,
      },
      '/sanctum': {
        target: API_PROXY_TARGET,
        changeOrigin: false,
      },
    },
  },
})
