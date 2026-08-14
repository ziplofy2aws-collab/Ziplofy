/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { themePreviewFrameHeadersPlugin } from './src/vite-theme-preview-headers.plugin'
import { resolveZiplofyNodeModules } from './src/vite-resolve-ziplofy-deps.plugin'
/** Dev/preview proxy to codiic3b. In production EC2, prefer nginx → backend (see deploy/nginx-store-vhost.example.conf). */
const proxyTarget = process.env.VITE_PROXY_TARGET || process.env.codiic3B_API_UPSTREAM || 'http://127.0.0.1:5000'

/** Extra Rollup inputs so remote theme blob imports resolve in production (no /src/*.ts on static host). */
const remoteThemeRuntimeInputs = {
  'remote-shim-react-jsx-runtime': path.resolve(__dirname, 'src/themes/remote-runtime-shims/react-jsx-runtime.ts'),
  'remote-shim-react': path.resolve(__dirname, 'src/themes/remote-runtime-shims/react.ts'),
  'remote-shim-react-dom': path.resolve(__dirname, 'src/themes/remote-runtime-shims/react-dom.ts'),
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
  plugins: [react(), tailwindcss(), resolveZiplofyNodeModules(), themePreviewFrameHeadersPlugin()],
  preview: {
    port: 5180,
    host: true,
    // Vite preview host check is separate from `server.allowedHosts`.
    // Leading-dot entries allow apex + all subdomains (www.ziplofy.com, etc.).
    // Restart `vite preview` after changing this — config is not hot-reloaded for host checks.
    allowedHosts: [
      'localhost',
      'preview.codiic.com',
      '.codiic.com',
      'ziplofy.com',
      '.ziplofy.com',
      'www.ziplofy.com',
    ],
    proxy: {
      '/api': createDevProxy(),
      '/uploads': createDevProxy(),
      '/sitemap.xml': createDevProxy(),
      '/robots.txt': createDevProxy(),
    },
    headers: {
      // Production/static hosts should set this via nginx (see deploy/snippets/).
      // Vite preview uses the same permissive policy so local embed tests work.
      'Content-Security-Policy': "frame-ancestors *",
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /cookie/],
      transformMixedEsModules: true,
    },
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
              'remote-shim-react-dom': 'remote-theme-runtime/react-dom.js',
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
    /** Single React instance for host app + @codiic/create-theme (avoids preview hook crashes). */
    dedupe: [
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
      'cookie',
      'set-cookie-parser',
    ],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@render-store/sdk': path.resolve(__dirname, 'src/sdk/index.ts'),
      '@codiic/create-theme': path.resolve(__dirname, '../codiic/src/create-theme'),
      /**
       * Pin React to render-store's install so @codiic/create-theme (outside root)
       * and the host share one copy. Point at the package dir (not the CJS .js file)
       * so Vite can pick the correct exports condition.
       */
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      /**
       * react-router imports named exports from CJS packages (`cookie`, `set-cookie-parser`).
       * Vite can serve those raw CJS files without named ESM exports — shims fix that.
       */
      cookie: path.resolve(__dirname, 'src/shims/cookie.ts'),
      'set-cookie-parser': path.resolve(__dirname, 'src/shims/set-cookie-parser.ts'),
      /**
       * Prefer ESM build. `needsInterop` on the CJS/prebundle path made Vite do
       * `default["Toaster"]` where default is the toast() function → Toaster undefined.
       */
      'react-hot-toast': path.resolve(__dirname, 'node_modules/react-hot-toast/dist/index.mjs'),
    },
  },
  optimizeDeps: {
    include: [
      '@heroicons/react/24/outline',
      '@heroicons/react/24/solid',
      'qrcode',
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      'react-hot-toast',
      'goober',
    ],
    /**
     * Leave react-router on native ESM so cookie / set-cookie-parser aliases apply.
     * Prebundling it previously produced a missing react-router.js optimize-deps entry.
     */
    exclude: ['react-router', 'react-router-dom'],
  },
  server: {
    host: true,
    cors: true,
    allowedHosts: true,
    fs: {
      // @codiic/create-theme is aliased to ../codiic/src/create-theme
      allow: [path.resolve(__dirname), path.resolve(__dirname, '..')],
    },
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
