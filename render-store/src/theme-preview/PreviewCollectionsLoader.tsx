import { useEffect } from 'react';
import { useStorefrontCollections } from '@/contexts/storefront-collections.context';

export function PreviewCollectionsLoader({ storeId }: { storeId: string }) {
  const { fetchCollectionsByStoreId } = useStorefrontCollections();

  useEffect(() => {
    if (!storeId) return;
    void fetchCollectionsByStoreId(storeId);
  }, [storeId, fetchCollectionsByStoreId]);

  return null;
}
