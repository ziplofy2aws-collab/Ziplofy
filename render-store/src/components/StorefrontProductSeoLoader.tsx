import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontProducts } from '@/contexts/product.context';

/** Loads product detail for platform SEO on `/product/:urlHandle` (handle or Mongo id). */
export function StorefrontProductSeoLoader() {
  const { urlHandle } = useParams<{ urlHandle: string }>();
  const { storeFrontMeta } = useStorefront();
  const { fetchProductForRoute, clearProductDetail } = useStorefrontProducts();
  const storeId = storeFrontMeta?.storeId;

  useEffect(() => {
    if (!urlHandle || urlHandle === 'preview') {
      clearProductDetail();
      return;
    }
    if (!storeId) return;

    void fetchProductForRoute(storeId, urlHandle);

    return () => {
      clearProductDetail();
    };
  }, [urlHandle, storeId, fetchProductForRoute, clearProductDetail]);

  return null;
}
