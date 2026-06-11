"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const sitemap_xml_util_1 = require("./sitemap-xml.util");
(0, vitest_1.describe)('buildSitemapXml', () => {
    (0, vitest_1.it)('renders urlset with escaped loc values', () => {
        const xml = (0, sitemap_xml_util_1.buildSitemapXml)([
            { loc: 'https://nike.ziplofy.com/' },
            {
                loc: 'https://nike.ziplofy.com/products/64f1&special',
                lastmod: new Date('2026-05-30T12:00:00.000Z'),
            },
        ]);
        (0, vitest_1.expect)(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        (0, vitest_1.expect)(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
        (0, vitest_1.expect)(xml).toContain('<loc>https://nike.ziplofy.com/</loc>');
        (0, vitest_1.expect)(xml).toContain('<loc>https://nike.ziplofy.com/products/64f1&amp;special</loc>');
        (0, vitest_1.expect)(xml).toContain('<lastmod>2026-05-30T12:00:00.000Z</lastmod>');
    });
});
(0, vitest_1.describe)('absoluteStorefrontUrl', () => {
    (0, vitest_1.it)('joins origin and pathname', () => {
        (0, vitest_1.expect)((0, sitemap_xml_util_1.absoluteStorefrontUrl)('https://nike.ziplofy.com', '/products/1')).toBe('https://nike.ziplofy.com/products/1');
    });
});
