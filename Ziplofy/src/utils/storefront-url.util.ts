import { slugFromTitle } from '../seo/seo-text.util';

/** Strip trailing slashes from a storefront origin. */
export function normalizeStorefrontOrigin(origin: string | undefined | null): string {
  return (origin ?? '').trim().replace(/\/+$/, '');
}

/** Match backend `slugifyMenuHandle` for URL path segments. */
export function normalizeStorefrontPathHandle(value: string): string {
  const decoded = decodeURIComponent(value.trim());
  const slug = decoded
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug;
}

function encodePathSegment(segment: string): string {
  const normalized = normalizeStorefrontPathHandle(segment);
  return encodeURIComponent(normalized);
}

/** Storefront path `/blogs/{blogHandle}` (no origin). */
export function buildStorefrontBlogPath(blogHandle: string): string {
  const handle = normalizeStorefrontPathHandle(blogHandle);
  return handle ? `/blogs/${handle}` : '/blogs';
}

/** Storefront path `/blogs/{blogHandle}/{postHandle}` (no origin). */
export function buildStorefrontBlogPostPath(blogHandle: string, postHandle: string): string {
  const blog = normalizeStorefrontPathHandle(blogHandle);
  const post = normalizeStorefrontPathHandle(postHandle);
  if (!blog) return '/blogs';
  if (!post) return `/blogs/${blog}`;
  return `/blogs/${blog}/${post}`;
}

/** `/blogs/{blogHandle}` */
export function buildStorefrontBlogUrl(
  origin: string | undefined | null,
  blogHandle: string
): string {
  const base = normalizeStorefrontOrigin(origin);
  const handle = normalizeStorefrontPathHandle(blogHandle);
  if (!base || !handle) return '';
  return `${base}/blogs/${encodePathSegment(handle)}`;
}

/** `/blogs/{blogHandle}/{postHandle}` */
export function buildStorefrontBlogPostUrl(
  origin: string | undefined | null,
  blogHandle: string,
  postHandle: string,
  options?: { preview?: boolean }
): string {
  const base = normalizeStorefrontOrigin(origin);
  const blog = normalizeStorefrontPathHandle(blogHandle);
  const post = normalizeStorefrontPathHandle(postHandle);
  if (!base || !blog || !post) return '';
  const path = `${base}/blogs/${encodePathSegment(blog)}/${encodePathSegment(post)}`;
  return options?.preview ? `${path}?preview=1` : path;
}

/** Resolve a blog post URL handle from saved + draft form state. */
export function resolveBlogPostUrlHandle(
  urlHandle: string,
  savedUrlHandle: string | undefined,
  title: string
): string {
  return (
    normalizeStorefrontPathHandle(urlHandle) ||
    normalizeStorefrontPathHandle(savedUrlHandle ?? '') ||
    slugFromTitle(title, 'blog-post')
  );
}

/** Resolve a blog listing URL handle from saved + draft form state. */
export function resolveBlogUrlHandle(
  urlHandle: string,
  savedUrlHandle: string | undefined,
  title: string
): string {
  return (
    normalizeStorefrontPathHandle(urlHandle) ||
    normalizeStorefrontPathHandle(savedUrlHandle ?? '') ||
    slugFromTitle(title, 'blog')
  );
}
