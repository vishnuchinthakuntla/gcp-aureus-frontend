import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/ngrok': {
        target: "https://b413-175-101-6-106.ngrok-free.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ngrok/, ''),
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      },
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
      },
    },
  },
})