import { isBlogPostsTemplatePreviewPage, isBlogsTemplatePreviewPage } from './blog-templates.util';
import { blogArticlePath, blogListingPath } from '../runtime/shared/blogPaths';
import type { Blog } from '../../contexts/blog.context';

/** Default storefront path for blog template editor preview. */
export const BLOG_PREVIEW_ROUTE_PLACEHOLDER = '/blogs/preview';

export function blogPreviewRouteFromHandle(urlHandle: string | null | undefined): string {
  const handle = urlHandle?.trim();
  if (!handle) return BLOG_PREVIEW_ROUTE_PLACEHOLDER;
  return blogListingPath(handle);
}

export function pickDefaultPreviewBlog(
  blogs: Pick<Blog, 'urlHandle' | 'title'>[]
): Pick<Blog, 'urlHandle' | 'title'> | null {
  if (!blogs.length) return null;
  return blogs.find((b) => Boolean(b.urlHandle?.trim())) ?? blogs[0] ?? null;
}

export function resolveBlogsTemplatePreviewRoute(
  previewPage: string,
  previewBlogHandle: string | null | undefined
): string | undefined {
  if (!isBlogsTemplatePreviewPage(previewPage)) return undefined;
  return blogPreviewRouteFromHandle(previewBlogHandle);
}

/** Default storefront path for blog post template editor preview. */
export const BLOG_POST_PREVIEW_ROUTE_PLACEHOLDER = '/blogs/preview/preview';

/** Selected blog post preview target: which article renders in the canvas. */
export type BlogPostPreviewSelection = {
  blogHandle: string;
  postHandle: string;
};

export function blogPostPreviewRouteFromSelection(
  selection: BlogPostPreviewSelection | null | undefined
): string {
  const blog = selection?.blogHandle?.trim();
  const post = selection?.postHandle?.trim();
  if (!blog || !post) return BLOG_POST_PREVIEW_ROUTE_PLACEHOLDER;
  return blogArticlePath(blog, post);
}

export function resolveBlogPostsTemplatePreviewRoute(
  previewPage: string,
  selection: BlogPostPreviewSelection | null | undefined
): string | undefined {
  if (!isBlogPostsTemplatePreviewPage(previewPage)) return undefined;
  return blogPostPreviewRouteFromSelection(selection);
}
