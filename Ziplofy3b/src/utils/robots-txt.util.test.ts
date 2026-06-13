import { describe, expect, it } from 'vitest';
import { buildRobotsTxt } from './robots-txt.util';

describe('buildRobotsTxt', () => {
  it('includes allow rules and sitemap for the storefront origin', () => {
    const text = buildRobotsTxt('https://nike.ziplofy.com');

    expect(text).toContain('User-agent: *');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Disallow: /auth/');
    expect(text).toContain('Sitemap: https://nike.ziplofy.com/sitemap.xml');
  });
});
