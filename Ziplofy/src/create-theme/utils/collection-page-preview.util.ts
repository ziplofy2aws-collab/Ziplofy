import { isCollectionTemplatePreviewPage } from './collection-templates.util';
import type { Collection } from '../../contexts/collection.context';

/** Default storefront path for collection template editor preview. */
export const COLLECTION_PREVIEW_ROUTE_PLACEHOLDER = '/collections/preview';

export function collectionPreviewRouteFromHandle(urlHandle: string | null | undefined): string {
  const handle = urlHandle?.trim();
  if (!handle) return COLLECTION_PREVIEW_ROUTE_PLACEHOLDER;
  return `/collections/${encodeURIComponent(handle.toLowerCase())}`;
}

export function pickDefaultPreviewCollection(
  collections: Pick<Collection, 'urlHandle' | 'title'>[]
): Pick<Collection, 'urlHandle' | 'title'> | null {
  if (!collections.length) return null;
  return (
    collections.find((c) => c.urlHandle?.trim() && c.urlHandle.trim().toLowerCase() !== 'all') ??
    collections[0] ??
    null
  );
}

export function resolveCollectionTemplatePreviewRoute(
  previewPage: string,
  previewCollectionHandle: string | null | undefined
): string | undefined {
  if (!isCollectionTemplatePreviewPage(previewPage)) return undefined;
  return collectionPreviewRouteFromHandle(previewCollectionHandle);
}
