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
    collections,
    getCollectionDetailsByUrlHandle,
    fetchProductsInCollectionByUrlHandle,
    fetchCollectionsByStoreId,
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
        if (handle === 'preview') {
          let list = collections;
          if (!list.length) {
            list = await fetchCollectionsByStoreId(storeId);
          }
          const first =
            list.find((c) => c.urlHandle?.trim() && c.urlHandle.trim().toLowerCase() !== 'all') ??
            list[0];
          if (!first?.urlHandle?.trim()) return;
          const resolved = first.urlHandle.trim().toLowerCase();
          await getCollectionDetailsByUrlHandle(storeId, resolved);
          await fetchProductsInCollectionByUrlHandle(storeId, resolved);
          return;
        }

        if (handle !== 'all') {
          await getCollectionDetailsByUrlHandle(storeId, handle);
        }
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
    fetchCollectionsByStoreId,
    collections,
    clearActiveCollection,
  ]);

  return null;
}
