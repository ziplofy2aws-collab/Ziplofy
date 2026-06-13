import { absoluteStorefrontUrl } from './sitemap-xml.util';

const DEFAULT_DISALLOW_PATHS = [
  '/auth/',
  '/profile',
  '/my-orders',
  '/preferences',
  '/cart',
] as const;

export function buildRobotsTxt(publicOrigin: string, disallowPaths: readonly string[] = DEFAULT_DISALLOW_PATHS): string {
  const sitemapUrl = absoluteStorefrontUrl(publicOrigin, '/sitemap.xml');
  const lines = [
    'User-agent: *',
    'Allow: /',
    ...disallowPaths.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${sitemapUrl}`,
  ];
  return `${lines.join('\n')}\n`;
}
