import type { Plugin } from 'vite';

/**
 * Theme editor embeds `/theme-preview` cross-origin (dashboard → preview host).
 * Permissive frame-ancestors so production/staging/local dashboards can all embed.
 * CSP frame-ancestors overrides X-Frame-Options in modern browsers.
 */
const FRAME_ANCESTORS = '*';

/** Allow theme editor iframes to embed /theme-preview (overrides restrictive defaults). */
function applyPreviewFrameHeaders(res: {
  setHeader: (k: string, v: string) => void;
  removeHeader?: (k: string) => void;
}) {
  res.setHeader('Content-Security-Policy', `frame-ancestors ${FRAME_ANCESTORS}`);
  // Omit X-Frame-Options so CSP governs embedding.
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
