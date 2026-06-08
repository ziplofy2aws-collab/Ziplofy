import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontCollections } from '@/contexts/storefront-collections.context';

/**
 * When the route is `/collections/:urlHandle`, loads collection metadata and products
 * via storefront API (storeId + urlHandle), not collection id.
 */
type Props = {
  /** Use when the route has no :urlHandle param (e.g. /collections/all). */
  urlHandleOverride?: string;
};

export function StorefrontCollectionByUrlHandleLoader({ urlHandleOverride }: Props = {}) {
  const { urlHandle: paramHandle } = useParams<{ urlHandle: string }>();
  const urlHandle = urlHandleOverride ?? paramHandle;
  const { storeFrontMeta } = useStorefront();
  const {
    getCollectionDetailsByUrlHandle,
    fetchProductsInCollectionByUrlHandle,
    clearActiveCollection,
  } = useStorefrontCollections();

  const storeId = storeFrontMeta?.storeId;

  useEffect(() => {
    if (!storeId || !urlHandle?.trim()) {
      clearActiveCollection();
      return;
    }

    const handle = urlHandle.trim().toLowerCase();

    void (async () => {
      try {
        await getCollectionDetailsByUrlHandle(storeId, handle);
        await fetchProductsInCollectionByUrlHandle(storeId, handle);
      } catch {
        /* errors surfaced via context.error */
      }
    })();

    return () => {
      clearActiveCollection();
    };
  }, [
    storeId,
    urlHandle,
    getCollectionDetailsByUrlHandle,
    fetchProductsInCollectionByUrlHandle,
    clearActiveCollection,
  ]);

  return null;
}
