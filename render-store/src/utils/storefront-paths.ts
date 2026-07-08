/** Canonical storefront catalog URL paths (shared convention for render-store + catalog themes). */

export const STOREFRONT_PATHS = {
  home: '/',
  allProducts: '/collections/all',
  allCollections: '/collections',
  cart: '/cart',
  search: '/search',
} as const;

export function productPath(urlHandleOrId: string): string {
  const handle = urlHandleOrId.trim();
  return handle ? `/product/${encodeURIComponent(handle)}` : STOREFRONT_PATHS.allProducts;
}

export function collectionPath(urlHandle: string): string {
  const handle = urlHandle.trim().toLowerCase();
  if (!handle || handle === 'all') return STOREFRONT_PATHS.allProducts;
  return `/collection/${encodeURIComponent(handle)}`;
}

export function isAllProductsPath(pathname: string): boolean {
  return pathname === STOREFRONT_PATHS.allProducts;
}

export function isAllCollectionsPath(pathname: string): boolean {
  return pathname === STOREFRONT_PATHS.allCollections;
}

export function isCollectionProductsPath(pathname: string): boolean {
  return (
    isAllProductsPath(pathname) ||
    /^\/collection\/[^/]+$/.test(pathname) ||
    /^\/collections\/(?!all$)[^/]+$/.test(pathname)
  );
}

export function isCollectionsListPath(pathname: string): boolean {
  return isAllCollectionsPath(pathname);
}
