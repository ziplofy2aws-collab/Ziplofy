/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { themePreviewFrameHeadersPlugin } from './src/vite-theme-preview-headers.plugin'
/** Dev/preview proxy to Ziplofy3b. In production EC2, prefer nginx → backend (see deploy/nginx-store-vhost.example.conf). */
const proxyTarget = process.env.VITE_PROXY_TARGET || process.env.ZIPLOFY3B_API_UPSTREAM || 'http://127.0.0.1:5000'

/** Extra Rollup inputs so remote theme blob imports resolve in production (no /src/*.ts on static host). */
const remoteThemeRuntimeInputs = {
  'remote-shim-react-jsx-runtime': path.resolve(__dirname, 'src/themes/remote-runtime-shims/react-jsx-runtime.ts'),
  'remote-shim-react': path.resolve(__dirname, 'src/themes/remote-runtime-shims/react.ts'),
  'remote-shim-react-router-dom': path.resolve(__dirname, 'src/themes/remote-runtime-shims/react-router-dom.ts'),
  'remote-shim-sdk': path.resolve(__dirname, 'src/sdk/index.ts'),
} as const

function attachForwardedHeaders(proxy: any) {
  proxy.on('proxyReq', (proxyReq: any, req: any) => {
    const host = req?.headers?.host
    if (typeof host === 'string') {
      proxyReq.setHeader('X-Forwarded-Host', host)
      proxyReq.setHeader('X-Forwarded-Proto', 'http')
    }
  })
}

function createDevProxy() {
  return {
    target: proxyTarget,
    changeOrigin: true,
    configure(proxy: any) {
      attachForwardedHeaders(proxy)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), themePreviewFrameHeadersPlugin()],
  preview: {
    port: 5180,
    proxy: {
      '/api': createDevProxy(),
      '/uploads': createDevProxy(),
      '/sitemap.xml': createDevProxy(),
      '/robots.txt': createDevProxy(),
    },
    headers: {
      'Content-Security-Policy':
        "frame-ancestors 'self' http://localhost:5173 https://admin.ziplofy.com https://dashboard.ziplofy.com https://*.ziplofy.com",
    },
  },
  build: {
    rollupOptions: {
      /** Blob-loaded themes import these URLs at runtime; Rollup must not drop their exports. */
      preserveEntrySignatures: 'exports-only',
      input: {
        main: path.resolve(__dirname, 'index.html'),
        ...remoteThemeRuntimeInputs,
      },
      output: {
        /**
         * One chunk for the whole React graph. Splitting react / jsx-runtime into separate
         * manualChunks duplicated React in vendor-react (useState on null in theme preview).
         */
        manualChunks(id) {
          const n = id.replace(/\\/g, '/');
          if (
            /node_modules\/(react-dom|react-router-dom|react-router|scheduler)(\/|$)/.test(n) ||
            /node_modules\/react(\/|$)/.test(n)
          ) {
            return 'vendor-react';
          }
          return undefined;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames(chunkInfo) {
          if (chunkInfo.name in remoteThemeRuntimeInputs) {
            const map: Record<string, string> = {
              'remote-shim-react-jsx-runtime': 'remote-theme-runtime/react-jsx-runtime.js',
              'remote-shim-react': 'remote-theme-runtime/react.js',
              'remote-shim-react-router-dom': 'remote-theme-runtime/react-router-dom.js',
              'remote-shim-sdk': 'remote-theme-runtime/sdk.js',
            };
            return map[chunkInfo.name] ?? 'assets/[name]-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
  resolve: {
    /** Single React instance for host app + @ziplofy/create-theme (avoids preview hook crashes). */
    dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@render-store/sdk': path.resolve(__dirname, 'src/sdk/index.ts'),
      '@ziplofy/create-theme': path.resolve(__dirname, '../Ziplofy/src/create-theme'),
    },
  },
  server: {
    host: true,
    cors: true,
    allowedHosts: true,
    proxy: {
      '/api': createDevProxy(),
      '/uploads': createDevProxy(),
      '/sitemap.xml': createDevProxy(),
      '/robots.txt': createDevProxy(),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
