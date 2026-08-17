import crypto from 'crypto';
import dns from 'dns/promises';
import { config } from '../../config';
import { StoreDomain, type IDnsInstruction } from '../../models/store-domain.model';
import { CustomError } from '../../utils/error.utils';

const HOSTNAME_RE = /^(?=.{1,253}$)(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

/** Strip protocol, path, port, trailing dot; lowercase. */
export function normalizeHostname(input: string): string {
  let value = (input || '').trim().toLowerCase();
  value = value.replace(/^https?:\/\//i, '');
  value = value.split('/')[0] || '';
  value = value.split('?')[0] || '';
  value = value.split('#')[0] || '';
  value = value.split(':')[0] || '';
  value = value.replace(/\.$/, '');
  return value;
}

export function assertValidCustomHostname(hostname: string): void {
  if (!hostname || !HOSTNAME_RE.test(hostname)) {
    throw new CustomError('Enter a valid domain (e.g. www.brand.com)', 400);
  }

  if (hostname === 'codiic.com' || hostname.endsWith('.codiic.com') || hostname.endsWith('.localhost')) {
    throw new CustomError('Platform domains cannot be connected as custom domains', 400);
  }

  const labels = hostname.split('.');
  if (labels.length < 2) {
    throw new CustomError('Enter a valid domain (e.g. www.brand.com)', 400);
  }
}

export function generateVerificationToken(): string {
  return `codiic-verify-${crypto.randomBytes(16).toString('hex')}`;
}

/** CNAME / A target merchants should point at. Prefer Cloudflare SaaS target when set. */
export function platformDnsTarget(storeSubdomain: string): {
  cnameTarget: string;
  aTargets: string[];
} {
  // Cloudflare for SaaS CNAME target (recommended) or any other platform edge.
  const envTarget = (
    process.env.CLOUDFLARE_SAAS_CNAME_TARGET ||
    process.env.DOMAIN_PLATFORM_TARGET ||
    ''
  )
    .trim()
    .toLowerCase()
    .replace(/\.$/, '');
  const suffix = config.storeRenderMicroserviceUrlSuffix.replace(/^\./, '');
  const storeTarget = `${storeSubdomain}.${suffix}`.toLowerCase().replace(/\.$/, '');

  const cnameTarget = envTarget || storeTarget;
  const aTargets = (process.env.DOMAIN_PLATFORM_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);

  return { cnameTarget, aTargets };
}

export function mergeDnsInstructions(
  base: IDnsInstruction[],
  extras: Array<{
    type: string;
    host: string;
    value: string;
    purpose: string;
  }>,
): IDnsInstruction[] {
  const merged = [...base];
  const seen = new Set(base.map((row) => `${row.type}:${row.host}:${row.value}`));

  for (const extra of extras) {
    const type = extra.type.toUpperCase();
    if (type !== 'CNAME' && type !== 'ALIAS' && type !== 'A' && type !== 'TXT') continue;
    const key = `${type}:${extra.host}:${extra.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({
      type: type as IDnsInstruction['type'],
      host: extra.host,
      value: extra.value,
      purpose: extra.purpose,
    });
  }

  return merged;
}

export function buildDnsInstructions(
  hostname: string,
  verificationToken: string,
  storeSubdomain: string
): IDnsInstruction[] {
  const { cnameTarget, aTargets } = platformDnsTarget(storeSubdomain);
  const labels = hostname.split('.');
  const isApex = labels.length === 2;

  const instructions: IDnsInstruction[] = [
    {
      type: isApex ? 'ALIAS' : 'CNAME',
      host: hostname,
      value: cnameTarget,
      purpose: isApex
        ? 'Point the apex (@) at your Codiic storefront — use ALIAS/ANAME if CNAME is not allowed'
        : 'Point this hostname at your Codiic storefront',
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

function stripDnsDot(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '');
}

async function resolveCnames(hostname: string): Promise<string[]> {
  try {
    const records = await dns.resolveCname(hostname);
    return records.map(stripDnsDot);
  } catch (err: any) {
    if (err?.code === 'ENODATA' || err?.code === 'ENOTFOUND') return [];
    // Some providers return CNAME via resolveAny / follow differently
    return [];
  }
}

async function resolveARecords(hostname: string): Promise<string[]> {
  try {
    return await dns.resolve4(hostname);
  } catch (err: any) {
    if (err?.code === 'ENODATA' || err?.code === 'ENOTFOUND') return [];
    return [];
  }
}

async function resolveTxtFlat(hostname: string): Promise<string[]> {
  try {
    const chunks = await dns.resolveTxt(hostname);
    return chunks.map((parts) => parts.join('').trim());
  } catch (err: any) {
    if (err?.code === 'ENODATA' || err?.code === 'ENOTFOUND') return [];
    return [];
  }
}

export type DnsVerifyResult = {
  ok: boolean;
  cnameOk: boolean;
  aOk: boolean;
  txtOk: boolean;
  message: string;
  observed: {
    cnames: string[];
    aRecords: string[];
    txtRecords: string[];
  };
};

export async function verifyDomainDns(params: {
  hostname: string;
  verificationToken: string;
  storeSubdomain: string;
  requireTxt?: boolean;
}): Promise<DnsVerifyResult> {
  const { hostname, verificationToken, storeSubdomain, requireTxt = true } = params;
  const { cnameTarget, aTargets } = platformDnsTarget(storeSubdomain);

  const [cnames, aRecords, txtRecords, targetARecords] = await Promise.all([
    resolveCnames(hostname),
    resolveARecords(hostname),
    resolveTxtFlat(`_codiic-verify.${hostname}`),
    // Apex ALIAS/ANAME flattens to A records — compare IPs to the storefront target.
    resolveARecords(cnameTarget),
  ]);

  const cnameOk = cnames.some((c) => c === cnameTarget || c.endsWith(`.${cnameTarget}`));
  const configuredIpOk =
    aTargets.length > 0 && aRecords.some((ip) => aTargets.includes(ip));
  // Hostinger/Cloudflare ALIAS on @ has no CNAME at the apex; same IPs as the target is enough.
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
    const parts: string[] = [];
    if (!pointsAtPlatform) {
      parts.push(
        `DNS must point to ${cnameTarget} (CNAME, or ALIAS/A resolving to the same IPs)`
      );
    }
    if (requireTxt && !txtOk) {
      parts.push(`TXT at _codiic-verify.${hostname} must equal ${verificationToken}`);
    }
    message = parts.join('. ');
  }

  return {
    ok,
    cnameOk,
    aOk,
    txtOk,
    message,
    observed: { cnames, aRecords, txtRecords },
  };
}

/** True if hostname is an active custom domain for any store (CORS / public resolve). */
export async function isActiveCustomDomainHostname(hostname: string): Promise<boolean> {
  const normalized = normalizeHostname(hostname);
  if (!normalized) return false;

  const doc = await StoreDomain.findOne({
    hostname: normalized,
    status: 'active',
  })
    .select('_id')
    .lean();
  return Boolean(doc);
}
