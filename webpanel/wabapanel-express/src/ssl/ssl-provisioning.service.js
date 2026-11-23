/**
 * SSL provisioning pipeline for one verified custom domain.
 *
 *   DNS re-check → certbot (webroot HTTP-01) → verify cert files →
 *   render+install nginx conf → nginx -t → reload → status fields
 *
 * Runs on the storefront gateway (certbot + nginx live there). All external
 * commands use execFile argv arrays — no shell, no string interpolation.
 */
const fs = require('fs');
const fsp = fs.promises;
const dns = require('dns/promises');
const { execFile } = require('child_process');
const { promisify } = require('util');
const cfg = require('./ssl-config');
const nginx = require('./nginx-config.manager');

const execFileAsync = promisify(execFile);

const stripDnsDot = (v) => String(v || '').trim().toLowerCase().replace(/\.$/, '');

/** Resolve CNAME chain (≤5 hops) then A records; returns final IPv4 list. */
async function resolveToIps(hostname, depth = 0) {
  if (depth > 5) return [];
  try {
    const cnames = await dns.resolveCname(hostname);
    const ips = new Set();
    for (const c of cnames.map(stripDnsDot)) {
      for (const ip of await resolveToIps(c, depth + 1)) ips.add(ip);
    }
    return [...ips];
  } catch {
    try {
      return await dns.resolve4(hostname);
    } catch {
      return [];
    }
  }
}

/** True when `hostname` ultimately resolves to the storefront gateway IP. */
async function domainPointsAtGateway(hostname, gatewayIp) {
  const ips = await resolveToIps(hostname);
  return { ok: ips.includes(gatewayIp), ips };
}

/** `certbot certonly` via webroot — no shell, pure argv. */
async function issueCertificate(hostname) {
  const args = [
    'certonly',
    '--webroot', '-w', cfg.acmeWebroot,
    '-d', hostname,
    '--non-interactive',
    '--agree-tos',
    '--keep-until-expiring',
    '--preferred-challenges', 'http',
  ];
  if (cfg.letsEncryptEmail) args.push('--email', cfg.letsEncryptEmail);
  else args.push('--register-unsafely-without-email');
  if (cfg.certbotStaging) args.push('--staging');

  await execFileAsync(cfg.certbotBin, args, { timeout: 3 * 60 * 1000 });
}

const certPathFor = (hostname) => `/etc/letsencrypt/live/${hostname}/fullchain.pem`;
const keyPathFor = (hostname) => `/etc/letsencrypt/live/${hostname}/privkey.pem`;

/** notAfter Date from a PEM file via openssl; null on failure. */
async function readCertExpiry(certPath) {
  try {
    const { stdout } = await execFileAsync(cfg.opensslBin, ['x509', '-enddate', '-noout', '-in', certPath]);
    const m = /notAfter=(.+)/.exec(String(stdout));
    const d = m ? new Date(m[1].trim()) : null;
    return d && !Number.isNaN(d.getTime()) ? d : null;
  } catch {
    return null;
  }
}

const RATE_LIMIT_RE = /too many (?:certificates|registrations|requests)|rate limit|retry after/i;
const isRateLimitError = (msg) => RATE_LIMIT_RE.test(String(msg || ''));

/** Map raw certbot/nginx errors to a short, customer-safe message. */
function sanitizeSslError(error) {
  const raw = String(error?.stderr || error?.message || error || 'unknown error');
  if (isRateLimitError(raw)) {
    return 'Certificate provider rate limit reached — retrying automatically.';
  }
  if (/unauthorized|invalid response|challenge/i.test(raw)) {
    return 'Domain verification challenge failed — check that the domain still points to our servers.';
  }
  if (/connection refused|timeout|unreachable|no route/i.test(raw)) {
    return 'Could not reach the domain over HTTP — check firewall and DNS settings.';
  }
  if (/nginx -t failed|NGINX_TEST_FAILED/.test(raw)) {
    return 'Internal configuration validation failed — our team has been notified.';
  }
  if (/DNS problem|SERVFAIL|NXDOMAIN|no valid A/i.test(raw)) {
    return 'DNS resolution failed — check that the domain points to our servers.';
  }
  return 'Certificate provisioning failed — retrying automatically.';
}

function computeBackoffMs(attemptCount, { base = cfg.backoffBaseMs, cap = cfg.backoffCapMs } = {}) {
  const exp = Math.min(attemptCount, 20);
  return Math.min(base * 2 ** exp, cap);
}

/**
 * Provision one verified domain document. Returns Mongo patch fields.
 * Throws on any step failure — the worker records the error and schedules
 * the next retry.
 */
async function provisionDomainDoc(doc) {
  const hostname = nginx.assertSafeHostname(doc.hostname);

  // 1. Re-verify DNS still points at this gateway (guards against the
  //    customer changing DNS after verification, and against issuance for
  //    hostnames we don't control).
  const { ok, ips } = await domainPointsAtGateway(hostname, cfg.gatewayPublicIp);
  if (!ok) {
    const err = new Error(`Domain does not resolve to this gateway (got: ${ips.join(', ') || 'none'})`);
    err.code = 'DNS_NOT_POINTING';
    err.userMessage = 'Domain no longer points to our servers — restore the DNS records.';
    throw err;
  }

  // 2. Request the certificate (idempotent — certbot skips valid existing certs).
  try {
    await issueCertificate(hostname);
  } catch (e) {
    e.code = e.code || 'CERTBOT_FAILED';
    throw e;
  }

  // 3. Verify the issued files exist and read expiry.
  const certPath = certPathFor(hostname);
  const keyPath = keyPathFor(hostname);
  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    const err = new Error('certbot completed but certificate files are missing');
    err.code = 'CERT_FILES_MISSING';
    err.userMessage = 'Certificate provisioning failed — retrying automatically.';
    throw err;
  }
  const expiresAt = await readCertExpiry(certPath);

  // 4. Render + install the nginx vhost (atomic; nginx -t gate; safe reload).
  const template = await nginx.loadTemplate();
  const content = nginx.renderDomainConf(template, {
    hostname,
    certPath,
    keyPath,
    acmeWebroot: cfg.acmeWebroot,
    rendererRoot: cfg.rendererRoot,
    apiUpstream: cfg.apiUpstream,
    apiHostHeader: cfg.apiHostHeader,
  });
  await nginx.installDomainConf({
    confDir: cfg.nginxDomainConfDir,
    hostname,
    content,
    nginxBin: cfg.nginxBin,
    reloadCmd: cfg.nginxReloadCmd,
  });

  return {
    sslStatus: 'active',
    sslProvider: 'letsencrypt',
    sslError: null,
    sslIssuedAt: new Date(),
    sslExpiresAt: expiresAt,
    lastSslCheckAt: new Date(),
    sslNextRetryAt: null,
    sslLockedUntil: null,
    sslLockedBy: null,
    certificatePath: certPath,
    privateKeyPath: keyPath,
  };
}

/** Remove a domain's nginx conf (cert files are left in place — harmless). */
async function deprovisionHostname(hostname) {
  const removed = await nginx.removeDomainConf(cfg.nginxDomainConfDir, hostname);
  if (!removed) return false;
  const t = await nginx.testNginx(cfg.nginxBin);
  if (!t.ok) {
    const err = new Error(`nginx -t failed after removing ${hostname}.conf`);
    err.stderr = t.stderr;
    err.code = 'NGINX_TEST_FAILED';
    throw err;
  }
  await nginx.reloadNginx(cfg.nginxReloadCmd);
  return true;
}

/** Refresh sslExpiresAt for one domain from its on-disk certificate. */
async function refreshCertExpiry(doc) {
  const hostname = doc.hostname;
  const certPath = doc.certificatePath || certPathFor(hostname);
  try {
    await fsp.access(certPath);
  } catch {
    return { sslExpiresAt: null, missing: true };
  }
  const expiresAt = await readCertExpiry(certPath);
  return { sslExpiresAt: expiresAt, missing: false };
}

module.exports = {
  resolveToIps,
  domainPointsAtGateway,
  issueCertificate,
  readCertExpiry,
  sanitizeSslError,
  isRateLimitError,
  computeBackoffMs,
  certPathFor,
  keyPathFor,
  provisionDomainDoc,
  deprovisionHostname,
  refreshCertExpiry,
};
