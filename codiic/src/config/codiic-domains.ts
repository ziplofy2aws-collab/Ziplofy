/** Production codiic.com hostnames — shared across dashboard env resolution. */
export const CODIIC_PRODUCTION = {
  apiOrigin: 'https://backend.codiic.com',
  apiUrl: 'https://backend.codiic.com/api',
  authOrigin: 'https://auth.codiic.com',
  dashboardOrigin: 'https://dashboard.codiic.com',
  adminOrigin: 'https://admin.codiic.com',
  previewOrigin: 'https://preview.codiic.com',
  storefrontSuffix: '.codiic.com',
} as const;

export function isCodiicProductionHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === 'codiic.com' || h.endsWith('.codiic.com');
}
