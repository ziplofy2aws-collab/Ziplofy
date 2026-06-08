import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStorefrontProducts } from '@/contexts/product.context';
import { useStorefrontProductVariants } from '@/contexts/product-variant.context';

/**
 * Resolves `/products/preview` (and missing catalog) to the first public product
 * so the product template preview can render live storefront data.
 */
export function StorefrontProductPreviewLoader() {
  const { id: paramId } = useParams<{ id: string }>();
  const { products, fetchProductById } = useStorefrontProducts();
  const { fetchVariantsByProductId } = useStorefrontProductVariants();

  const productId =
    paramId && paramId !== 'preview' ? paramId : (products[0]?._id ?? null);

  useEffect(() => {
    if (!productId) return;
    void fetchProductById(productId);
    void fetchVariantsByProductId(productId);
  }, [productId, fetchProductById, fetchVariantsByProductId]);

  return null;
}
