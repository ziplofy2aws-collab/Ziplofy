"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSitemapXml = buildSitemapXml;
exports.absoluteStorefrontUrl = absoluteStorefrontUrl;
function escapeXml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
function formatLastmod(date) {
    if (!date || Number.isNaN(date.getTime()))
        return undefined;
    return date.toISOString();
}
function buildSitemapXml(entries) {
    const urls = entries
        .map((entry) => {
        const lastmod = formatLastmod(entry.lastmod);
        const lastmodTag = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : '';
        return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmodTag}\n  </url>`;
    })
        .join('\n');
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        urls,
        '</urlset>',
    ].join('\n');
}
function absoluteStorefrontUrl(publicOrigin, pathname) {
    const base = publicOrigin.replace(/\/+$/, '');
    const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return `${base}${path}`;
}
