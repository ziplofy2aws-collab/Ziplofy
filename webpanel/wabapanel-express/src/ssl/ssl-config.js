/**
 * SSL worker configuration — all values come from the environment so the same
 * code runs on the gateway (production), in staging, and in local tests.
 */
const os = require('os');

const bool = (v, dflt = false) => {
  if (v == null || v === '') return dflt;
  return ['1', 'true', 'yes', 'on'].includes(String(v).trim().toLowerCase());
};

const int = (v, dflt) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : dflt;
};

const str = (v, dflt = '') => (v == null ? dflt : String(v).trim());

const config = {
  /** Public IP customer domains must resolve to before issuance. */
  gatewayPublicIp: str(process.env.SSL_GATEWAY_PUBLIC_IP),

  /** Let's Encrypt account email (required on the gateway). */
  letsEncryptEmail: str(process.env.LETSENCRYPT_EMAIL),

  /** Use LE staging CA — issue fake certs while testing the pipeline. */
  certbotStaging: bool(process.env.CERTBOT_STAGING, false),

  certbotBin: str(process.env.CERTBOT_BIN, 'certbot'),
  opensslBin: str(process.env.OPENSSL_BIN, 'openssl'),
  nginxBin: str(process.env.NGINX_BIN, 'nginx'),

  /** Shared ACME webroot served on :80 for every managed hostname. */
  acmeWebroot: str(process.env.ACME_WEBROOT, '/var/www/letsencrypt'),

  /** Directory where per-domain <host>.conf files are written. */
  nginxDomainConfDir: str(process.env.NGINX_DOMAIN_CONF_DIR, '/etc/nginx/conf.d/domains'),

  /** Certbot live dir — override for local tests (default is the real path). */
  letsencryptLiveDir: str(process.env.LETSENCRYPT_LIVE_DIR, '/etc/letsencrypt/live'),

  /** Command used to reload nginx — split on whitespace into argv. */
  nginxReloadCmd: str(process.env.NGINX_RELOAD_CMD, 'systemctl reload nginx'),

  /** Storefront SPA static root + API upstream (mirrors the wildcard vhost). */
  rendererRoot: str(process.env.STOREFRONT_RENDERER_ROOT, '/var/www/webpanel-store-renderer'),
  apiUpstream: str(process.env.STOREFRONT_API_UPSTREAM, 'https://crm-backend.codiic.com'),
  apiHostHeader: str(process.env.STOREFRONT_API_HOST_HEADER, 'crm-backend.codiic.com'),

  /** Worker identity + timing. */
  workerId: str(process.env.SSL_WORKER_ID, `${os.hostname()}-${process.pid}`),
  pollCron: str(process.env.SSL_POLL_CRON, '*/1 * * * *'),
  reconcileCron: str(process.env.SSL_RECONCILE_CRON, '*/15 * * * *'),
  expiryScanCron: str(process.env.SSL_EXPIRY_SCAN_CRON, '17 3 * * *'),
  lockTtlMs: int(process.env.SSL_LOCK_TTL_MS, 10 * 60 * 1000),
  maxAttempts: int(process.env.SSL_MAX_ATTEMPTS, 8),
  backoffBaseMs: int(process.env.SSL_BACKOFF_BASE_MS, 5 * 60 * 1000),
  backoffCapMs: int(process.env.SSL_BACKOFF_CAP_MS, 6 * 60 * 60 * 1000),

  mongodbUri: str(process.env.MONGODB_URI),
};

module.exports = config;
