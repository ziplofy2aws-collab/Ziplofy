/**
 * Production CORS helpers for wabapanel-express.
 * Frontend (prod): https://crm-360.codiic.com
 * Backend (prod):  https://crm-backend.codiic.com
 */

function stripTrailingSlash(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function uniqueNonEmpty(list) {
  return [...new Set(list.map(stripTrailingSlash).filter(Boolean))];
}

/**
 * Allowed browser origins for CORS + Socket.io.
 * Prefer CORS_ORIGINS (comma-separated), then FRONTEND_URL / ADMIN_URL,
 * then hard defaults for Codiic production + local dev.
 */
function getAllowedOrigins() {
  const fromEnvList = String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const defaults =
    process.env.NODE_ENV === 'production'
      ? [
          'https://crm-360.codiic.com',
          process.env.FRONTEND_URL,
          process.env.ADMIN_URL,
        ]
      : [
          process.env.FRONTEND_URL || 'http://localhost:3002',
          process.env.ADMIN_URL || 'http://localhost:3002',
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
        ];

  return uniqueNonEmpty([...fromEnvList, ...defaults]);
}

function isOriginAllowed(origin, allowed = getAllowedOrigins()) {
  if (!origin) return true; // non-browser / same-origin / curl
  const normalized = stripTrailingSlash(origin);
  return allowed.includes(normalized);
}

function corsOriginDelegate(allowed = getAllowedOrigins()) {
  return function originCheck(origin, callback) {
    if (isOriginAllowed(origin, allowed)) {
      // Reflect the request origin when allowed (required for credentials: true)
      callback(null, origin || true);
      return;
    }
    console.warn(`[CORS] Blocked origin: ${origin}`);
    callback(null, false);
  };
}

module.exports = {
  getAllowedOrigins,
  isOriginAllowed,
  corsOriginDelegate,
  stripTrailingSlash,
};
