/** Match backend `slugifyMenuHandle` for URL path segments. */
export function normalizeStorefrontPathHandle(value: string): string {
  const decoded = decodeURIComponent(value.trim());
  return decoded
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function encodeStorefrontPathHandle(value: string): string {
  const normalized = normalizeStorefrontPathHandle(value);
  return encodeURIComponent(normalized);
}
