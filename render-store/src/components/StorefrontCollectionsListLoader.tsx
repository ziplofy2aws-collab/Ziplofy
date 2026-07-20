import { useEffect } from 'react';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontCollections } from '@/contexts/storefront-collections.context';

/** Loads all collections for `/collections` (collections index page). */
export function StorefrontCollectionsListLoader() {
  const { storeFrontMeta } = useStorefront();
  const { fetchCollectionsByStoreId, clearActiveCollection } = useStorefrontCollections();
  const storeId = storeFrontMeta?.storeId;

  useEffect(() => {
    if (!storeId) return;
    clearActiveCollection();
    void fetchCollectionsByStoreId(storeId);
  }, [storeId, fetchCollectionsByStoreId, clearActiveCollection]);

  return null;
}
