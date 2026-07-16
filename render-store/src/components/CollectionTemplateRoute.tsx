import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontCollections } from '@/contexts/storefront-collections.context';
import { StorefrontCollectionByUrlHandleLoader } from './StorefrontCollectionByUrlHandleLoader';

function resolveCollectionJsonTemplateId(themeTemplate?: string | null): string {
  const normalized = (themeTemplate ?? 'default').trim().toLowerCase();
  if (!normalized || normalized === 'default' || normalized === 'collection') return 'collection';
  if (normalized.startsWith('collection.')) return normalized;
  return 'collection';
}

type CollectionTemplateRouteProps = {
  /** Editor preview override (e.g. `collection.sale`) — wins over the collection's assignment. */
  activeTemplateId?: string;
  fallbackSectionIds?: string[];
  urlHandleOverride?: string;
};

/**
 * Collection details route: loads the collection, then renders the assigned theme template
 * (`default` → `collection`, or `collection.{slug}` when present in theme config).
 */
export function CollectionTemplateRoute({
  activeTemplateId,
  fallbackSectionIds = ['main_collection'],
  urlHandleOverride,
}: CollectionTemplateRouteProps) {
  const { urlHandle: paramHandle } = useParams<{ urlHandle?: string }>();
  const routeHandle = urlHandleOverride ?? paramHandle;
  const { themeConfig } = useStorefront();
  const { activeCollection, collections, loading } = useStorefrontCollections();

  const assignedTemplateId = useMemo(() => {
    if (
      activeTemplateId &&
      (activeTemplateId === 'collection' || activeTemplateId.startsWith('collection.'))
    ) {
      return activeTemplateId;
    }

    const collection =
      activeCollection ??
      (routeHandle && routeHandle !== 'preview' ? null : collections[0] ?? null);

    const requested = resolveCollectionJsonTemplateId(collection?.themeTemplate);
    const templates = (themeConfig?.templates ?? {}) as Record<string, unknown>;
    if (requested !== 'collection' && templates[requested]) return requested;
    return 'collection';
  }, [activeTemplateId, activeCollection, collections, routeHandle, themeConfig]);

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
