import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({ 
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  server: {
    allowedHosts: ['dashboard.ziplofy.com', 'admin.ziplofy.com', '.ziplofy.com', 'admin.localhost'],
    proxy: {
      // Local-only: embed preview on admin origin (optional). Production uses preview.ziplofy.com.
      '/theme-preview': { target: 'http://127.0.0.1:5180', changeOrigin: true },
      '/remote-theme-runtime': { target: 'http://127.0.0.1:5180', changeOrigin: true },
    },
  },
})
