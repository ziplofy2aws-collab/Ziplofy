import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/** Dev/preview proxy to webpanel Express (wabapanel-express). */
const proxyTarget =
  process.env.VITE_PROXY_TARGET ||
  process.env.WEBPANEL_API_UPSTREAM ||
  'http://127.0.0.1:5001';

function attachForwardedHeaders(proxy: any) {
  proxy.on('proxyReq', (proxyReq: any, req: any) => {
    const host = req?.headers?.host;
    if (typeof host === 'string') {
      proxyReq.setHeader('X-Forwarded-Host', host);
      proxyReq.setHeader('X-Forwarded-Proto', 'http');
    }
  });
}

function createDevProxy() {
  return {
    target: proxyTarget,
    changeOrigin: true,
    configure(proxy: any) {
      attachForwardedHeaders(proxy);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@informatic-theme': path.resolve(import.meta.dirname, '../../remote-themes/informatic/src'),
      '@informatic-theme/sdk-shim': path.resolve(
        import.meta.dirname,
        '../../remote-themes/informatic/src/sdk-shim.tsx'
      ),
      '@render-store/sdk': path.resolve(
        import.meta.dirname,
        '../../remote-themes/informatic/src/sdk-shim.tsx'
      ),
    },
    dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom'],
  },
  server: {
    port: 3003,
    host: true,
    // Allow {sub}.localhost for local Informatic storefronts
    allowedHosts: ['localhost', '.localhost', '.crm-360.codiic.com'],
    fs: {
      allow: [
        path.resolve(import.meta.dirname),
        path.resolve(import.meta.dirname, '../../remote-themes/informatic'),
      ],
    },
    proxy: {
      '/api': createDevProxy(),
      '/uploads': createDevProxy(),
    },
  },
  preview: {
    port: 3003,
    host: true,
    allowedHosts: ['localhost', '.localhost', '.crm-360.codiic.com'],
    proxy: {
      '/api': createDevProxy(),
      '/uploads': createDevProxy(),
    },
  },
});
