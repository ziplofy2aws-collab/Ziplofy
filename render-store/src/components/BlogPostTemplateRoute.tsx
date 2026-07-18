import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { resolveBlogPostTemplateIdFromThemeConfig } from '@codiic/create-theme/utils/blog-templates.util';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';
import { StorefrontBlogPostByUrlHandleLoader } from './StorefrontBlogPostByUrlHandleLoader';

type BlogPostTemplateRouteProps = {
  /** Editor preview override (e.g. `blog-posts.feature`) — wins over JSON assignments. */
  activeTemplateId?: string;
  fallbackSectionIds?: string[];
};

/**
 * Blog post route. Template selection is a local lookup in the loaded theme JSON
 * using `blogHandle/articleHandle`; article data still loads through its normal API.
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

    return resolveBlogPostTemplateIdFromThemeConfig(
      themeConfig,
      blogHandle,
      articleHandle
    );
  }, [activeTemplateId, blogHandle, articleHandle, themeConfig]);

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
