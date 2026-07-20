/** Canonical storefront catalog URL paths (match render-store). */

export const STOREFRONT_PATHS = {
  home: '/',
  /** All products catalog */
  allProducts: '/collections/all',
  /** Collections index */
  allCollections: '/collections',
  cart: '/cart',
  search: '/search',
} as const;

/** Product detail: `/product/{urlHandle}` */
export function productPath(urlHandleOrId: string): string {
  const handle = urlHandleOrId.trim();
  return handle ? `/product/${encodeURIComponent(handle)}` : STOREFRONT_PATHS.allProducts;
}

/**
 * Single collection: `/collection/{urlHandle}`
 * Special case `all` → `/collections/all` (all products).
 */
export function collectionPath(urlHandle: string): string {
  const handle = urlHandle.trim().toLowerCase();
  if (!handle || handle === 'all') return STOREFRONT_PATHS.allProducts;
  return `/collection/${encodeURIComponent(handle)}`;
}

export function isAllProductsPath(pathname: string): boolean {
  return pathname === STOREFRONT_PATHS.allProducts || pathname === '/products';
}

export function isAllCollectionsPath(pathname: string): boolean {
  return pathname === STOREFRONT_PATHS.allCollections;
}

/** Normalize legacy storefront links written before path conventions settled. */
export function normalizeStorefrontPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return trimmed;
  if (trimmed === '/products' || trimmed.endsWith('/products')) return STOREFRONT_PATHS.allProducts;
  if (trimmed === '/collection') return STOREFRONT_PATHS.allCollections;
  const productLegacy = trimmed.match(/^\/products\/([^/?#]+)/);
  if (productLegacy) return productPath(decodeURIComponent(productLegacy[1]));
  const collectionPlural = trimmed.match(/^\/collections\/(?!all$)([^/?#]+)/);
  if (collectionPlural) return collectionPath(decodeURIComponent(collectionPlural[1]));
  return trimmed;
}
