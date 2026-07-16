import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';
import { StorefrontBlogPostByUrlHandleLoader } from './StorefrontBlogPostByUrlHandleLoader';

function resolveBlogPostJsonTemplateId(themeTemplate?: string | null): string {
  const normalized = (themeTemplate ?? 'default').trim().toLowerCase();
  if (!normalized || normalized === 'default' || normalized === 'blog-posts') return 'blog-posts';
  if (normalized.startsWith('blog-posts.')) return normalized;
  return 'blog-posts';
}

type BlogPostTemplateRouteProps = {
  /** Editor preview override (e.g. `blog-posts.feature`) — wins over the post's assignment. */
  activeTemplateId?: string;
  fallbackSectionIds?: string[];
};

/**
 * Blog post route: loads the article, then renders the assigned theme template
 * (`default` → `blog-posts`, or `blog-posts.{slug}` when present in theme config).
 */
export function BlogPostTemplateRoute({
  activeTemplateId,
  fallbackSectionIds = ['blog_post_main'],
}: BlogPostTemplateRouteProps) {
  const { blogHandle, articleHandle } = useParams<{
    blogHandle?: string;
    articleHandle?: string;
  }>();
  const { themeConfig } = useStorefront();
  const { activePost, loading } = useStorefrontBlogs();

  const assignedTemplateId = useMemo(() => {
    if (
      activeTemplateId &&
      (activeTemplateId === 'blog-posts' || activeTemplateId.startsWith('blog-posts.'))
    ) {
      return activeTemplateId;
    }

    const requested = resolveBlogPostJsonTemplateId(activePost?.themeTemplate);
    const templates = (themeConfig?.templates ?? {}) as Record<string, unknown>;
    if (requested !== 'blog-posts' && templates[requested]) return requested;
    return 'blog-posts';
  }, [activeTemplateId, activePost, themeConfig]);

  const waitingForPost =
    Boolean(blogHandle) &&
    blogHandle !== 'preview' &&
    Boolean(articleHandle) &&
    articleHandle !== 'preview' &&
    !activePost &&
    loading;

  return (
    <>
      <StorefrontBlogPostByUrlHandleLoader />
      {waitingForPost ? null : (
        <CustomThemeTemplatePage
          templateId={assignedTemplateId}
          fallbackSectionIds={fallbackSectionIds}
        />
      )}
    </>
  );
}
