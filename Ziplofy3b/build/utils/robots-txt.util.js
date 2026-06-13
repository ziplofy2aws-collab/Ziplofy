"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRobotsTxt = buildRobotsTxt;
const sitemap_xml_util_1 = require("./sitemap-xml.util");
const DEFAULT_DISALLOW_PATHS = [
    '/auth/',
    '/profile',
    '/my-orders',
    '/preferences',
    '/cart',
];
function buildRobotsTxt(publicOrigin, disallowPaths = DEFAULT_DISALLOW_PATHS) {
    const sitemapUrl = (0, sitemap_xml_util_1.absoluteStorefrontUrl)(publicOrigin, '/sitemap.xml');
    const lines = [
        'User-agent: *',
        'Allow: /',
        ...disallowPaths.map((path) => `Disallow: ${path}`),
        '',
        `Sitemap: ${sitemapUrl}`,
    ];
    return `${lines.join('\n')}\n`;
}
