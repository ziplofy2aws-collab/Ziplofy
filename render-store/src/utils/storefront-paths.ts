/** Canonical storefront catalog URL paths (shared convention for render-store + catalog themes). */

export const STOREFRONT_PATHS = {
  home: '/',
  allProducts: '/collections/all',
  allCollections: '/collections',
  allBlogs: '/blogs/all',
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

/** `/blogs/{blogHandle}` using the blog URL handle field. */
export function blogPath(blogHandle: string): string {
  const handle = blogHandle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return handle ? `/blogs/${handle}` : '/blogs';
}

/** `/blogs/{blogHandle}/{articleHandle}` using blog + article URL handle fields. */
export function blogArticlePath(blogHandle: string, articleHandle: string): string {
  const blog = blogHandle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const article = articleHandle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!blog) return '/blogs';
  if (!article) return `/blogs/${blog}`;
  return `/blogs/${blog}/${article}`;
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
