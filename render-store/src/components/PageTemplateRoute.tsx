import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { resolvePageTemplateIdFromThemeConfig } from '@codiic/create-theme/utils/page-templates.util';
import { useStorefront } from '@/contexts/store.context';

type PageTemplateRouteProps = {
  /** Editor preview override (e.g. `pages.contact`) — wins over theme JSON assignments. */
  activeTemplateId?: string;
  fallbackSectionIds?: string[];
};

/**
 * Custom page route: resolve template from the already-loaded theme JSON
 * (`page_template_assignments[urlHandle]` → `templates.pages` / `templates.pages.*`).
 * No extra storefront API call.
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
    <CustomThemeTemplatePage
      templateId={assignedTemplateId}
      fallbackSectionIds={fallbackSectionIds}
    />
  );
}
