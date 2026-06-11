import { describe, expect, it } from 'vitest';
import { absoluteStorefrontUrl, buildSitemapXml } from './sitemap-xml.util';

describe('buildSitemapXml', () => {
  it('renders urlset with escaped loc values', () => {
    const xml = buildSitemapXml([
      { loc: 'https://nike.ziplofy.com/' },
      {
        loc: 'https://nike.ziplofy.com/products/64f1&special',
        lastmod: new Date('2026-05-30T12:00:00.000Z'),
      },
    ]);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://nike.ziplofy.com/</loc>');
    expect(xml).toContain('<loc>https://nike.ziplofy.com/products/64f1&amp;special</loc>');
    expect(xml).toContain('<lastmod>2026-05-30T12:00:00.000Z</lastmod>');
  });
});

describe('absoluteStorefrontUrl', () => {
  it('joins origin and pathname', () => {
    expect(absoluteStorefrontUrl('https://nike.ziplofy.com', '/products/1')).toBe(
      'https://nike.ziplofy.com/products/1'
    );
  });
});
