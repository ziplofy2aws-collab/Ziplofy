/**
 * Build Informatic / webpanel storefront URL for a store subdomain.
 *
 * Dev:  http://{subdomain}.localhost:3003
 * Prod: https://{subdomain}.crm-360.codiic.com
 */

export function getStorefrontHostSuffix(): string {
  const fromEnv = process.env.NEXT_PUBLIC_STOREFRONT_HOST_SUFFIX?.trim();
  if (fromEnv) return fromEnv.startsWith('.') ? fromEnv : `.${fromEnv}`;
  if (process.env.NODE_ENV === 'production') return '.crm-360.codiic.com';
  return '.localhost:3003';
}

export function getStorefrontProtocol(): string {
  const fromEnv = process.env.NEXT_PUBLIC_STOREFRONT_PROTOCOL?.trim().toLowerCase();
  if (fromEnv === 'http' || fromEnv === 'https') return fromEnv;
  return process.env.NODE_ENV === 'production' ? 'https' : 'http';
}

export function buildStorefrontUrl(subdomain: string | null | undefined, customDomain?: string | null): string | null {
  const custom = (customDomain || '').trim().toLowerCase();
  if (custom) {
    return `${getStorefrontProtocol()}://${custom}`.replace(/\/+$/, '');
  }
  const sub = (subdomain || '').trim().toLowerCase();
  if (!sub) return null;
  return `${getStorefrontProtocol()}://${sub}${getStorefrontHostSuffix()}`.replace(/\/+$/, '');
}

export function displayStorefrontHost(url: string | null | undefined): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    return u.host + (u.pathname === '/' ? '' : u.pathname.replace(/\/$/, ''));
  } catch {
    return url.replace(/^https?:\/\//, '');
  }
}

export function normalizeStorefrontOrigin(origin: string | undefined | null): string {
  return (origin ?? '').trim().replace(/\/+$/, '');
}
