/** Storefront blog URL paths — prefer SDK `blogPath` / `blogArticlePath` when available. */
import { blogPath as sdkBlogPath, blogArticlePath as sdkBlogArticlePath } from '@render-store/sdk';

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
  return sdkBlogPath(blogHandle);
}

/** `/blogs/{blogHandle}/{articleHandle}` */
export function blogArticlePath(blogHandle: string, articleHandle: string): string {
  return sdkBlogArticlePath(blogHandle, articleHandle);
}

