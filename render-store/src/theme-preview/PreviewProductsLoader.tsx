import { useEffect } from 'react';
import { useStorefrontProducts } from '@/contexts/product.context';

/** Fetches public catalog products so section themes can render featured grids in preview. */
export function PreviewProductsLoader({ storeId }: { storeId: string }) {
  const { fetchProductsByStoreId } = useStorefrontProducts();

  useEffect(() => {
    if (!storeId) return;
    void fetchProductsByStoreId({ storeId, page: 1, limit: 12 });
  }, [storeId, fetchProductsByStoreId]);

  return null;
}
