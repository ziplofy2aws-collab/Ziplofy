import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { resolveCollectionTemplateIdFromThemeConfig } from '@codiic/create-theme/utils/collection-templates.util';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontCollections } from '@/contexts/storefront-collections.context';
import { StorefrontCollectionByUrlHandleLoader } from './StorefrontCollectionByUrlHandleLoader';

type CollectionTemplateRouteProps = {
  /** Editor preview override (e.g. `collection.sale`) — wins over theme JSON assignments. */
  activeTemplateId?: string;
  fallbackSectionIds?: string[];
  urlHandleOverride?: string;
};

/**
 * Collection details route. Template selection is a local lookup in the loaded
 * theme JSON; collection data continues loading through the normal API.
 */
export function CollectionTemplateRoute({
  activeTemplateId,
  fallbackSectionIds = ['main_collection'],
  urlHandleOverride,
}: CollectionTemplateRouteProps) {
  const { urlHandle: paramHandle } = useParams<{ urlHandle?: string }>();
  const routeHandle = urlHandleOverride ?? paramHandle;
  const { themeConfig } = useStorefront();
  const { activeCollection, loading } = useStorefrontCollections();

  const assignedTemplateId = useMemo(() => {
    if (
      activeTemplateId &&
      (activeTemplateId === 'collection' || activeTemplateId.startsWith('collection.'))
    ) {
      return activeTemplateId;
    }

    return resolveCollectionTemplateIdFromThemeConfig(themeConfig, routeHandle);
  }, [activeTemplateId, routeHandle, themeConfig]);

  const waitingForCollection =
    Boolean(routeHandle) &&
    routeHandle !== 'preview' &&
    !activeCollection &&
    loading;

  return (
    <>
      <StorefrontCollectionByUrlHandleLoader urlHandleOverride={urlHandleOverride} />
      {waitingForCollection ? null : (
        <CustomThemeTemplatePage
          templateId={assignedTemplateId}
          fallbackSectionIds={fallbackSectionIds}
        />
      )}
    </>
  );
}
