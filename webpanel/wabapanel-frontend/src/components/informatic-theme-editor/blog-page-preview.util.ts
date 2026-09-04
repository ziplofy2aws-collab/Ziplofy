/** Template ids that show the blog post preview picker in the Informatic theme editor sidebar. */
export function isBlogPostTemplatePreviewPage(pageId: string): boolean {
  return pageId === 'blog_post' || pageId === 'blog-posts' || pageId === 'blog_posts';
}

/** Selected blog post preview target — editor-only state, not persisted in theme config. */
export type BlogPostPreviewSelection = {
  blogHandle: string;
  postHandle: string;
};

export const BLOG_POST_PREVIEW_ROUTE_PLACEHOLDER = '/blog/preview';

export function blogPostPreviewPathFromSelection(
  selection: BlogPostPreviewSelection | null | undefined
): string {
  const post = selection?.postHandle?.trim();
  if (!post) return BLOG_POST_PREVIEW_ROUTE_PLACEHOLDER;
  return `/blog/${encodeURIComponent(post)}`;
}

export function buildStorefrontBlogPostUrl(
  origin: string | null | undefined,
  postHandle: string
): string | null {
  const base = (origin ?? '').trim().replace(/\/+$/, '');
  const post = postHandle.trim();
  if (!base || !post) return null;
  return `${base}/blog/${encodeURIComponent(post)}?preview=1`;
}
