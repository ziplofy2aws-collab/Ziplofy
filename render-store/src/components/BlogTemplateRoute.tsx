import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { resolveBlogsTemplateIdFromThemeConfig } from '@codiic/create-theme/utils/blog-templates.util';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';
import { StorefrontBlogByUrlHandleLoader } from './StorefrontBlogByUrlHandleLoader';

type BlogTemplateRouteProps = {
  /** Editor preview override (e.g. `blogs.news`) — wins over theme JSON assignments. */
  activeTemplateId?: string;
  fallbackSectionIds?: string[];
};

/**
 * Blog listing route. Template selection is a local lookup in the loaded
 * theme JSON; blog data continues loading through the normal API.
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

    return resolveBlogsTemplateIdFromThemeConfig(themeConfig, blogHandle);
  }, [activeTemplateId, blogHandle, themeConfig]);

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
