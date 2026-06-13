import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStorefrontProducts } from '@/contexts/product.context';

/** Loads product detail for platform SEO on `/products/:id` (themes may fetch again independently). */
export function StorefrontProductSeoLoader() {
  const { id } = useParams<{ id: string }>();
  const { fetchProductById, clearProductDetail } = useStorefrontProducts();

  useEffect(() => {
    if (!id || id === 'preview') {
      clearProductDetail();
      return;
    }

    void fetchProductById(id);

    return () => {
      clearProductDetail();
    };
  }, [id, fetchProductById, clearProductDetail]);

  return null;
}
