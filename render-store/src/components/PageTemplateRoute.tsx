import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { resolvePageTemplateIdFromThemeConfig } from '@codiic/create-theme/utils/page-templates.util';
import { StorefrontPageByUrlHandleLoader } from '@/components/StorefrontPageByUrlHandleLoader';
import { StorefrontPagePage } from '@/pages/StorefrontPagePage';
import { useStorefront } from '@/contexts/store.context';

type PageTemplateRouteProps = {
  /** Editor preview override (e.g. `pages.contact`) — wins over theme JSON assignments. */
  activeTemplateId?: string;
  fallbackSectionIds?: string[];
};

/**
 * Custom page route: load Online Store page content by url handle inside one page shell,
 * then optional theme `templates.pages` sections (no second header/footer stack).
 */
export function PageTemplateRoute({
  activeTemplateId,
  fallbackSectionIds = [],
}: PageTemplateRouteProps) {
  const { urlHandle } = useParams<{ urlHandle?: string }>();
  const { themeConfig } = useStorefront();

  const assignedTemplateId = useMemo(() => {
    if (
      activeTemplateId &&
      (activeTemplateId === 'pages' || activeTemplateId.startsWith('pages.'))
    ) {
      return activeTemplateId;
    }
    return resolvePageTemplateIdFromThemeConfig(themeConfig, urlHandle);
  }, [activeTemplateId, themeConfig, urlHandle]);

  return (
    <>
      <StorefrontPageByUrlHandleLoader />
      <CustomThemeTemplatePage
        templateId={assignedTemplateId}
        fallbackSectionIds={fallbackSectionIds}
        leadIn={<StorefrontPagePage />}
      />
    </>
  );
}
