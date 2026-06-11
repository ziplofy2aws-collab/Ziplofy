import type { Request } from 'express';
import { config } from '../config';
import { Subdomain } from '../models/subdomain.model';
import { Store } from '../models/store/store.model';
import { publicOriginFromRequest } from './public-origin.util';

const RESERVED_SUBDOMAINS = new Set(['admin', 'dashboard', 'preview', 'www', 'api']);

export type ResolvedStorefrontHost = {
  storeId: string;
  subdomain: string;
  /** Canonical public storefront origin used in sitemap absolute URLs. */
  publicOrigin: string;
};

type SubdomainMapping = {
  subdomain: string;
  customDomain?: string | null;
};

function isProduction(): boolean {
  return (process.env.NODE_ENV || 'development') === 'production';
}

/** Build the merchant-facing origin (not the API host) for sitemap loc URLs. */
export function canonicalStorefrontOrigin(mapping: SubdomainMapping, req: Request): string {
  const customDomain = mapping.customDomain?.trim().toLowerCase();
  if (customDomain) {
    const protocol = isProduction() ? 'https' : 'http';
    return `${protocol}://${customDomain}`;
  }

  const fromRequest = publicOriginFromRequest(req);
  const requestHost = fromRequest.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
  const storefrontHost = `${mapping.subdomain}${config.storeRenderMicroserviceUrlSuffix}`.toLowerCase();

  if (requestHost === storefrontHost || requestHost.startsWith(`${mapping.subdomain.toLowerCase()}.`)) {
    if (isProduction() && requestHost.endsWith('.ziplofy.com')) {
      return `https://${requestHost}`;
    }
    return fromRequest;
  }

  const protocol = isProduction() ? 'https' : 'http';
  return `${protocol}://${mapping.subdomain}${config.storeRenderMicroserviceUrlSuffix}`;
}

function hostnameFromRequest(req: Request): string {
  const xfHost = req.get('x-forwarded-host');
  const host = (xfHost || req.get('host') || '').split(',')[0].trim().toLowerCase();
  return host.split(':')[0];
}

export function subdomainFromRequest(req: Request): string | null {
  const querySub = (req.query.subdomain as string || '').trim().toLowerCase();
  if (querySub) return querySub;

  const hostname = hostnameFromRequest(req);
  if (!hostname) return null;

  const parts = hostname.split('.');
  if (parts.length < 2) return null;

  const label = parts[0];
  if (!label || RESERVED_SUBDOMAINS.has(label)) return null;
  return label;
}

/** Resolve store from subdomain query param or storefront Host / X-Forwarded-Host. */
export async function resolveStoreFromRequest(req: Request): Promise<ResolvedStorefrontHost | null> {
  const hostname = hostnameFromRequest(req);
  const subdomain = subdomainFromRequest(req);

  const mapping = subdomain
    ? await Subdomain.findOne({
        $or: [{ subdomain }, ...(hostname ? [{ customDomain: hostname }] : [])],
      }).lean()
    : hostname
      ? await Subdomain.findOne({ customDomain: hostname }).lean()
      : null;

  if (!mapping) return null;

  const store = await Store.findById(mapping.storeId).select('_id').lean();
  if (!store) return null;

  return {
    storeId: String(store._id),
    subdomain: mapping.subdomain,
    publicOrigin: canonicalStorefrontOrigin(mapping, req),
  };
}
