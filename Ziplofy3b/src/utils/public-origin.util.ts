import type { Request } from "express";

/**
 * Public browser origin for absolute media URLs (uploads, etc.) when the API is behind a dev proxy.
 * Requires `X-Forwarded-Host` (and optionally `X-Forwarded-Proto`) from the reverse proxy.
 */
export function publicOriginFromRequest(req: Request): string {
  const xfHost = req.get("x-forwarded-host");
  const xfProto = req.get("x-forwarded-proto");
  if (xfHost) {
    const host = xfHost.split(",")[0].trim();
    const proto = (xfProto || "http").split(",")[0].trim();
    return `${proto}://${host}`;
  }
  return `${req.protocol}://${req.get("host") || "localhost"}`;
}

export function absolutizeMediaUrl(publicOrigin: string, url: string): string {
  if (url == null || typeof url !== "string") return "";
  const u = url.trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) return `${publicOrigin}${u}`;
  return `${publicOrigin}/${u}`;
}

export function absolutizeImageUrlsArray(publicOrigin: string, urls: unknown): string[] {
  if (!Array.isArray(urls)) return [];
  return urls.map((x) => absolutizeMediaUrl(publicOrigin, String(x)));
}
