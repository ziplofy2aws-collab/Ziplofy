import { useEffect, useMemo } from 'react';
import {
  useStorefront,
  useStorefrontCollections,
  useStorefrontProducts,
  type StorefrontProductItem,
} from '@render-store/sdk';

/** Map legacy theme defaults to storefront collection url handles. */
export function resolveFeaturedCollectionHandle(raw: string): string {
  const handle = raw.trim().toLowerCase();
  if (!handle || handle === 'products') return '';
  return handle;
}

type UseFeaturedCollectionProductsArgs = {
  collectionHandle: string;
  limit: number;
};

export function useFeaturedCollectionProducts({
  collectionHandle,
  limit,
}: UseFeaturedCollectionProductsArgs): StorefrontProductItem[] {
  const { storeFrontMeta } = useStorefront();
  const storeId = storeFrontMeta?.storeId ?? '';
  const resolvedHandle = resolveFeaturedCollectionHandle(collectionHandle);

  const { products: storeProducts, fetchProductsByStoreId } = useStorefrontProducts();
  const { products: collectionProducts, fetchProductsInCollectionByUrlHandle } =
    useStorefrontCollections();

  useEffect(() => {
    if (!storeId) return;
    if (resolvedHandle) {
      void fetchProductsInCollectionByUrlHandle(storeId, resolvedHandle, { page: 1, limit });
      return;
    }
    void fetchProductsByStoreId({ storeId, page: 1, limit });
  }, [
    storeId,
    resolvedHandle,
    limit,
    fetchProductsByStoreId,
    fetchProductsInCollectionByUrlHandle,
  ]);

  return useMemo(() => {
    const source = resolvedHandle ? collectionProducts : storeProducts;
    return source.slice(0, limit);
  }, [resolvedHandle, collectionProducts, storeProducts, limit]);
}
