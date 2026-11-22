const crypto = require('crypto');
const dns = require('dns/promises');
const WebpanelStoreDomain = require('../models/WebpanelStoreDomain');

const HOSTNAME_RE = /^(?=.{1,253}$)(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

/** Strip protocol, path, port, trailing dot; lowercase. */
function normalizeHostname(input) {
  let value = String(input || '').trim().toLowerCase();
  value = value.replace(/^https?:\/\//i, '');
  value = value.split('/')[0] || '';
  value = value.split('?')[0] || '';
  value = value.split('#')[0] || '';
  value = value.split(':')[0] || '';
  value = value.replace(/\.$/, '');
  return value;
}

function assertValidCustomHostname(hostname) {
  if (!hostname || !HOSTNAME_RE.test(hostname)) {
    const err = new Error('Enter a valid domain (e.g. www.brand.com)');
    err.status = 400;
    throw err;
  }
  if (
    hostname === 'codiic.com' ||
    hostname.endsWith('.codiic.com') ||
    hostname.endsWith('.localhost')
  ) {
    const err = new Error('Platform domains cannot be connected as custom domains');
    err.status = 400;
    throw err;
  }
}

function generateVerificationToken() {
  return `codiic-verify-${crypto.randomBytes(16).toString('hex')}`;
}

/** "{sub}.{suffix}" — the host the renderer serves this store on. */
function storefrontHostSuffix() {
  const fromEnv = (process.env.STOREFRONT_HOST_SUFFIX || '').trim();
  if (fromEnv) return fromEnv.startsWith('.') ? fromEnv : `.${fromEnv}`;
  return (process.env.NODE_ENV || 'development') === 'production'
    ? '.crm-360.codiic.com'
    : '.localhost:3003';
}

function platformHostname(storeSubdomain) {
  return `${storeSubdomain}${storefrontHostSuffix()}`;
}

/** CNAME / A target merchants should point at. Prefer SaaS target when set. */
function platformDnsTarget(storeSubdomain) {
  const envTarget = (
    process.env.CLOUDFLARE_SAAS_CNAME_TARGET ||
    process.env.DOMAIN_PLATFORM_TARGET ||
    ''
  )
    .trim()
    .toLowerCase()
    .replace(/\.$/, '');
  const storeTarget = `${storeSubdomain}${storefrontHostSuffix()}`.toLowerCase().replace(/\.$/, '');
  const cnameTarget = envTarget || storeTarget;
  const aTargets = (process.env.DOMAIN_PLATFORM_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
  return { cnameTarget, aTargets };
}

function mergeDnsInstructions(base, extras) {
  const merged = [...base];
  const seen = new Set(base.map((row) => `${row.type}:${row.host}:${row.value}`));
  for (const extra of extras || []) {
    const type = String(extra.type || '').toUpperCase();
    if (!['CNAME', 'ALIAS', 'A', 'TXT'].includes(type)) continue;
    const key = `${type}:${extra.host}:${extra.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({ type, host: extra.host, value: extra.value, purpose: extra.purpose });
  }
  return merged;
}

function buildDnsInstructions(hostname, verificationToken, storeSubdomain) {
  const { cnameTarget, aTargets } = platformDnsTarget(storeSubdomain);
  const isApex = hostname.split('.').length === 2;

  const instructions = [
    {
      type: isApex ? 'ALIAS' : 'CNAME',
      host: hostname,
      value: cnameTarget,
      purpose: isApex
        ? 'Point the apex (@) at your storefront — use ALIAS/ANAME if CNAME is not allowed'
        : 'Point this hostname at your storefront',
    },
    {
      type: 'TXT',
      host: `_codiic-verify.${hostname}`,
      value: verificationToken,
      purpose: 'Prove you own this domain',
    },
  ];

  if (aTargets.length > 0) {
    instructions.push({
      type: 'A',
      host: hostname,
      value: aTargets.join(' or '),
      purpose: 'Optional A record if your DNS provider does not support CNAME/ALIAS on this host',
    });
  }
  return instructions;
}

const stripDnsDot = (v) => v.trim().toLowerCase().replace(/\.$/, '');

async function resolveCnames(hostname) {
  try {
    return (await dns.resolveCname(hostname)).map(stripDnsDot);
  } catch {
    return [];
  }
}

async function resolveARecords(hostname) {
  try {
    return await dns.resolve4(hostname);
  } catch {
    return [];
  }
}

async function resolveTxtFlat(hostname) {
  try {
    const chunks = await dns.resolveTxt(hostname);
    return chunks.map((parts) => parts.join('').trim());
  } catch {
    return [];
  }
}

async function verifyDomainDns({ hostname, verificationToken, storeSubdomain, requireTxt = true }) {
  const { cnameTarget, aTargets } = platformDnsTarget(storeSubdomain);
  const [cnames, aRecords, txtRecords, targetARecords] = await Promise.all([
    resolveCnames(hostname),
    resolveARecords(hostname),
    resolveTxtFlat(`_codiic-verify.${hostname}`),
    resolveARecords(cnameTarget),
  ]);

  const cnameOk = cnames.some((c) => c === cnameTarget || c.endsWith(`.${cnameTarget}`));
  const configuredIpOk = aTargets.length > 0 && aRecords.some((ip) => aTargets.includes(ip));
  // Apex ALIAS/ANAME flattens to A records — same IPs as the target is enough.
  const aliasIpOk =
    aRecords.length > 0 &&
    targetARecords.length > 0 &&
    aRecords.some((ip) => targetARecords.includes(ip));
  const aOk = configuredIpOk || aliasIpOk;
  const pointsAtPlatform = cnameOk || aOk;

  const txtOk = txtRecords.some((t) => t === verificationToken);
  const ownershipOk = requireTxt ? txtOk : true;
  const ok = pointsAtPlatform && ownershipOk;

  let message = 'Domain verified';
  if (!ok) {
    const parts = [];
    if (!pointsAtPlatform) {
      parts.push(`DNS must point to ${cnameTarget} (CNAME, or ALIAS/A resolving to the same IPs)`);
    }
    if (requireTxt && !txtOk) {
      parts.push(`TXT at _codiic-verify.${hostname} must equal ${verificationToken}`);
    }
    message = parts.join('. ');
  }

  return { ok, cnameOk, aOk, txtOk, message, observed: { cnames, aRecords, txtRecords } };
}

/** True if hostname is an active custom domain for any webpanel store. */
async function isActiveCustomDomainHostname(hostname) {
  const normalized = normalizeHostname(hostname);
  if (!normalized) return false;
  const doc = await WebpanelStoreDomain.findOne({ hostname: normalized, status: 'active' })
    .select('_id')
    .lean();
  return Boolean(doc);
}

module.exports = {
  normalizeHostname,
  assertValidCustomHostname,
  generateVerificationToken,
  storefrontHostSuffix,
  platformHostname,
  platformDnsTarget,
  mergeDnsInstructions,
  buildDnsInstructions,
  verifyDomainDns,
  isActiveCustomDomainHostname,
};
