"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalStorefrontOrigin = canonicalStorefrontOrigin;
exports.subdomainFromRequest = subdomainFromRequest;
exports.resolveStoreFromRequest = resolveStoreFromRequest;
const config_1 = require("../config");
const subdomain_model_1 = require("../models/subdomain.model");
const store_model_1 = require("../models/store/store.model");
const public_origin_util_1 = require("./public-origin.util");
const RESERVED_SUBDOMAINS = new Set(['admin', 'dashboard', 'preview', 'www', 'api']);
function isProduction() {
    return (process.env.NODE_ENV || 'development') === 'production';
}
/** Build the merchant-facing origin (not the API host) for sitemap loc URLs. */
function canonicalStorefrontOrigin(mapping, req) {
    const customDomain = mapping.customDomain?.trim().toLowerCase();
    if (customDomain) {
        const protocol = isProduction() ? 'https' : 'http';
        return `${protocol}://${customDomain}`;
    }
    const fromRequest = (0, public_origin_util_1.publicOriginFromRequest)(req);
    const requestHost = fromRequest.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    const storefrontHost = `${mapping.subdomain}${config_1.config.storeRenderMicroserviceUrlSuffix}`.toLowerCase();
    if (requestHost === storefrontHost || requestHost.startsWith(`${mapping.subdomain.toLowerCase()}.`)) {
        if (isProduction() && requestHost.endsWith('.ziplofy.com')) {
            return `https://${requestHost}`;
        }
        return fromRequest;
    }
    const protocol = isProduction() ? 'https' : 'http';
    return `${protocol}://${mapping.subdomain}${config_1.config.storeRenderMicroserviceUrlSuffix}`;
}
function hostnameFromRequest(req) {
    const xfHost = req.get('x-forwarded-host');
    const host = (xfHost || req.get('host') || '').split(',')[0].trim().toLowerCase();
    return host.split(':')[0];
}
function subdomainFromRequest(req) {
    const querySub = (req.query.subdomain || '').trim().toLowerCase();
    if (querySub)
        return querySub;
    const hostname = hostnameFromRequest(req);
    if (!hostname)
        return null;
    const parts = hostname.split('.');
    if (parts.length < 2)
        return null;
    const label = parts[0];
    if (!label || RESERVED_SUBDOMAINS.has(label))
        return null;
    return label;
}
/** Resolve store from subdomain query param or storefront Host / X-Forwarded-Host. */
async function resolveStoreFromRequest(req) {
    const hostname = hostnameFromRequest(req);
    const subdomain = subdomainFromRequest(req);
    const mapping = subdomain
        ? await subdomain_model_1.Subdomain.findOne({
            $or: [{ subdomain }, ...(hostname ? [{ customDomain: hostname }] : [])],
        }).lean()
        : hostname
            ? await subdomain_model_1.Subdomain.findOne({ customDomain: hostname }).lean()
            : null;
    if (!mapping)
        return null;
    const store = await store_model_1.Store.findById(mapping.storeId).select('_id').lean();
    if (!store)
        return null;
    return {
        storeId: String(store._id),
        subdomain: mapping.subdomain,
        publicOrigin: canonicalStorefrontOrigin(mapping, req),
    };
}
