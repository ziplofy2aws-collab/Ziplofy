import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';
import { StorefrontBlogByUrlHandleLoader } from './StorefrontBlogByUrlHandleLoader';

function resolveBlogJsonTemplateId(themeTemplate?: string | null): string {
  const normalized = (themeTemplate ?? 'default').trim().toLowerCase();
  if (!normalized || normalized === 'default' || normalized === 'blogs') return 'blogs';
  if (normalized.startsWith('blogs.')) return normalized;
  return 'blogs';
}

type BlogTemplateRouteProps = {
  /** Editor preview override (e.g. `blogs.news`) — wins over the blog's assignment. */
  activeTemplateId?: string;
  fallbackSectionIds?: string[];
};

/**
 * Blog listing route: loads the blog, then renders the assigned theme template
 * (`default` → `blogs`, or `blogs.{slug}` when present in theme config).
 */
export function BlogTemplateRoute({
  activeTemplateId,
  fallbackSectionIds = ['main_blog'],
}: BlogTemplateRouteProps) {
  const { blogHandle } = useParams<{ blogHandle?: string }>();
  const { themeConfig } = useStorefront();
  const { activeBlog, loading } = useStorefrontBlogs();

  const assignedTemplateId = useMemo(() => {
    if (activeTemplateId && (activeTemplateId === 'blogs' || activeTemplateId.startsWith('blogs.'))) {
      return activeTemplateId;
    }

    const requested = resolveBlogJsonTemplateId(activeBlog?.themeTemplate);
    const templates = (themeConfig?.templates ?? {}) as Record<string, unknown>;
    if (requested !== 'blogs' && templates[requested]) return requested;
    return 'blogs';
  }, [activeTemplateId, activeBlog, themeConfig]);

  const waitingForBlog =
    Boolean(blogHandle) && blogHandle !== 'preview' && !activeBlog && loading;

  return (
    <>
      <StorefrontBlogByUrlHandleLoader />
      {waitingForBlog ? null : (
        <CustomThemeTemplatePage
          templateId={assignedTemplateId}
          fallbackSectionIds={fallbackSectionIds}
        />
      )}
    </>
  );
}
