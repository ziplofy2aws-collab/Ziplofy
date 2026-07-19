import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontProducts } from '@/contexts/product.context';
import { useStorefrontProductVariants } from '@/contexts/product-variant.context';

/**
 * Resolves `/product/preview` (and missing catalog) to the first public product
 * so the product template preview can render live storefront data.
 * Also supports legacy `/products/:id` param name.
 */
export function StorefrontProductPreviewLoader() {
  const params = useParams<{ id?: string; urlHandle?: string }>();
  const paramId = params.urlHandle ?? params.id;
  const { storeFrontMeta } = useStorefront();
  const {
    products,
    productDetail,
    fetchProductsByStoreId,
    fetchProductForRoute,
    fetchProductById,
  } = useStorefrontProducts();
  const { fetchVariantsByProductId } = useStorefrontProductVariants();
  const storeId = storeFrontMeta?.storeId;

  useEffect(() => {
    if (!storeId) return;

    if (!paramId || paramId === 'preview') {
      if (!products.length) {
        void fetchProductsByStoreId({ storeId, page: 1, limit: 1 });
      }
      return;
    }

    void fetchProductForRoute(storeId, paramId);
  }, [storeId, paramId, products.length, fetchProductsByStoreId, fetchProductForRoute]);

  useEffect(() => {
    if (!storeId) return;

    if (paramId === 'preview' || !paramId) {
      const fallbackId = products[0]?._id;
      if (fallbackId) {
        void fetchProductById(fallbackId);
      }
    }
  }, [storeId, paramId, products[0]?._id, fetchProductById]);

  const variantProductId = productDetail?._id ?? products[0]?._id ?? null;

  useEffect(() => {
    if (!variantProductId) return;
    void fetchVariantsByProductId(variantProductId);
  }, [variantProductId, fetchVariantsByProductId]);

  return null;
}
