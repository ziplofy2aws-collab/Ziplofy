"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicOriginFromRequest = publicOriginFromRequest;
exports.absolutizeMediaUrl = absolutizeMediaUrl;
exports.absolutizeImageUrlsArray = absolutizeImageUrlsArray;
/**
 * Public browser origin for absolute media URLs (uploads, etc.) when the API is behind a dev proxy.
 * Requires `X-Forwarded-Host` (and optionally `X-Forwarded-Proto`) from the reverse proxy.
 */
function publicOriginFromRequest(req) {
    const xfHost = req.get("x-forwarded-host");
    const xfProto = req.get("x-forwarded-proto");
    if (xfHost) {
        const host = xfHost.split(",")[0].trim();
        const proto = (xfProto || "http").split(",")[0].trim();
        return `${proto}://${host}`;
    }
    return `${req.protocol}://${req.get("host") || "localhost"}`;
}
function absolutizeMediaUrl(publicOrigin, url) {
    if (url == null || typeof url !== "string")
        return "";
    const u = url.trim();
    if (!u)
        return "";
    if (/^https?:\/\//i.test(u))
        return u;
    if (u.startsWith("//"))
        return `https:${u}`;
    if (u.startsWith("/"))
        return `${publicOrigin}${u}`;
    return `${publicOrigin}/${u}`;
}
function absolutizeImageUrlsArray(publicOrigin, urls) {
    if (!Array.isArray(urls))
        return [];
    return urls.map((x) => absolutizeMediaUrl(publicOrigin, String(x)));
}
