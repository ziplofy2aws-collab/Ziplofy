import geoip from 'geoip-lite';

export type LiveGeoLocation = {
  country: string;
  region: string;
  city: string;
  path: string;
};

const COUNTRY_NAMES: Record<string, string> = {
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  AE: 'United Arab Emirates',
  AU: 'Australia',
  CA: 'Canada',
  DE: 'Germany',
  FR: 'France',
  SG: 'Singapore',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  NP: 'Nepal',
  LK: 'Sri Lanka',
};

function countryDisplayName(code: string): string {
  if (!code) return 'Unknown';
  return COUNTRY_NAMES[code.toUpperCase()] || code;
}

function isPrivateOrLocalIp(ip: string): boolean {
  const cleaned = ip.replace(/^::ffff:/, '');
  if (!cleaned || cleaned === '::1' || cleaned === '127.0.0.1') return true;
  if (cleaned.startsWith('10.')) return true;
  if (cleaned.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(cleaned)) return true;
  return false;
}

export function lookupIpGeo(ip: string | undefined | null): LiveGeoLocation {
  const raw = (ip || '').trim();
  if (!raw || isPrivateOrLocalIp(raw)) {
    return {
      country: 'Local',
      region: '',
      city: 'Local',
      path: 'Local',
    };
  }

  const cleaned = raw.replace(/^::ffff:/, '');
  const hit = geoip.lookup(cleaned);
  if (!hit) {
    return {
      country: 'Unknown',
      region: '',
      city: 'Unknown',
      path: 'Unknown',
    };
  }

  const country = countryDisplayName(hit.country || '');
  const region = hit.region || '';
  const city = hit.city || region || country || 'Unknown';
  const path = [country, region, city].filter(Boolean).join(' · ');

  return { country, region, city, path };
}

export function getSocketClientIp(headers: Record<string, unknown>, address?: string): string {
  const forwarded = headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim() || '';
  }
  if (Array.isArray(forwarded) && typeof forwarded[0] === 'string') {
    return forwarded[0].split(',')[0]?.trim() || '';
  }
  const realIp = headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();
  return (address || '').trim();
}
