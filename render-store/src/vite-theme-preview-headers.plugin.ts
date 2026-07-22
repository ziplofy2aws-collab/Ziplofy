import type { Plugin } from 'vite';

const FRAME_ANCESTORS = [
  "'self'",
  // codiic merchant dashboard (vite --port 3000)
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://admin.localhost:3000',
  // legacy admin / alternate local ports
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://admin.localhost:5173',
  'https://admin.codiic.com',
  'https://dashboard.codiic.com',
  'https://*.codiic.com',
].join(' ');

/** Allow theme editor iframes to embed /theme-preview (overrides restrictive defaults). */
function applyPreviewFrameHeaders(res: { setHeader: (k: string, v: string) => void; removeHeader?: (k: string) => void }) {
  res.setHeader('Content-Security-Policy', `frame-ancestors ${FRAME_ANCESTORS}`);
  // Invalid value "ALLOWALL" is ignored by browsers; omit X-Frame-Options so CSP governs embedding.
  try {
    res.removeHeader?.('X-Frame-Options');
  } catch {
    /* preview middleware may not support removeHeader */
  }
}

function isPreviewAssetPath(pathname: string): boolean {
  return (
    pathname === '/theme-preview' ||
    pathname.startsWith('/theme-preview/') ||
    pathname.startsWith('/remote-theme-runtime/')
  );
}

export function themePreviewFrameHeadersPlugin(): Plugin {
  return {
    name: 'theme-preview-frame-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0];
        if (isPreviewAssetPath(path)) {
          applyPreviewFrameHeaders(res);
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0];
        if (isPreviewAssetPath(path)) {
          applyPreviewFrameHeaders(res);
        }
        next();
      });
    },
  };
}
