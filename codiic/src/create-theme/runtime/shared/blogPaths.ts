/** Storefront blog URL paths — `/blogs/{blogHandle}` and `/blogs/{blogHandle}/{articleHandle}`. */

export function normalizeBlogPathHandle(value: string): string {
  const decoded = (() => {
    try {
      return decodeURIComponent(value.trim());
    } catch {
      return value.trim();
    }
  })();
  return decoded
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** `/blogs/{blogHandle}` */
export function blogListingPath(blogHandle: string): string {
  const handle = normalizeBlogPathHandle(blogHandle);
  return handle ? `/blogs/${handle}` : '/blogs';
}

/** `/blogs/{blogHandle}/{articleHandle}` */
export function blogArticlePath(blogHandle: string, articleHandle: string): string {
  const blog = normalizeBlogPathHandle(blogHandle);
  const article = normalizeBlogPathHandle(articleHandle);
  if (!blog) return '/blogs';
  if (!article) return `/blogs/${blog}`;
  return `/blogs/${blog}/${article}`;
}
