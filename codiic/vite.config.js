import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const watchThemeRoot = path.resolve(__dirname, '../remote-themes/watch')
const watchDist = path.join(watchThemeRoot, 'dist')

const WATCH_ROOT_FILES = new Set([
  'theme.schema.json',
  'theme.default-config.json',
  'theme.manifest.json',
])

/**
 * Serve Watch pack from `remote-themes/watch` so catalog static editor
 * picks up local builds without copying into public/ or uploading to S3.
 */
function serveLocalWatchTheme() {
  return {
    name: 'serve-local-watch-theme',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url?.split('?')[0] || ''
        if (!raw.startsWith('/remote-themes/watch/')) return next()

        const rel = decodeURIComponent(raw.slice('/remote-themes/watch/'.length))
        if (!rel || rel.includes('..')) return next()

        const candidates = []
        if (WATCH_ROOT_FILES.has(rel)) {
          candidates.push(path.join(watchThemeRoot, rel))
        }
        candidates.push(path.join(watchDist, rel))
        candidates.push(path.join(watchThemeRoot, rel))

        const file = candidates.find((p) => fs.existsSync(p) && fs.statSync(p).isFile())
        if (!file) return next()

        const ext = path.extname(file).toLowerCase()
        const types = {
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.map': 'application/json; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2',
        }
        res.setHeader('Content-Type', types[ext] || 'application/octet-stream')
        res.setHeader('Cache-Control', 'no-store')
        fs.createReadStream(file).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serveLocalWatchTheme()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../render-store/src'),
      '@render-store/sdk': path.resolve(__dirname, '../render-store/src/sdk/index.ts'),
      '@codiic/create-theme': path.resolve(__dirname, 'src/create-theme'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
    allowedHosts: ['dashboard.codiic.com', 'admin.codiic.com', '.codiic.com', 'admin.localhost'],
    proxy: {
      // Local-only: embed preview on admin origin (optional). Production uses preview.codiic.com.
      '/theme-preview': { target: 'http://127.0.0.1:5180', changeOrigin: true },
      '/remote-theme-runtime': { target: 'http://127.0.0.1:5180', changeOrigin: true },
    },
  },
})
