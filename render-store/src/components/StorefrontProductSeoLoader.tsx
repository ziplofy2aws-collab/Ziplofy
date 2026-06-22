import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontProducts } from '@/contexts/product.context';

/** Loads product detail for platform SEO on `/products/:id` (id may be Mongo id or URL handle). */
export function StorefrontProductSeoLoader() {
  const { id } = useParams<{ id: string }>();
  const { storeFrontMeta } = useStorefront();
  const { fetchProductForRoute, clearProductDetail } = useStorefrontProducts();
  const storeId = storeFrontMeta?.storeId;

  useEffect(() => {
    if (!id || id === 'preview') {
      clearProductDetail();
      return;
    }
    if (!storeId) return;

    void fetchProductForRoute(storeId, id);

    return () => {
      clearProductDetail();
    };
  }, [id, storeId, fetchProductForRoute, clearProductDetail]);

  return null;
}
