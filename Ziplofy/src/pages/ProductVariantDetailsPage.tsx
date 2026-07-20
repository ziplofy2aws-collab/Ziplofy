import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ProductNotFound from '../components/ProductNotFound';
import ProductFormPageSkeleton from '../components/products/ProductFormPageSkeleton';
import { ProductVariantEditForm } from '../components/products/ProductVariantEditForm';
import VariantNotFound from '../components/VariantNotFound';
import { useProductVariants } from '../contexts/product-variant.context';
import { useProducts } from '../contexts/product.context';

const ProductVariantDetailsPage: React.FC = () => {
  const { id, variantId } = useParams();
  const { activeProduct, activeProductLoading, fetchProductById, clearActiveProduct } = useProducts();
  const { activeVariant, activeVariantLoading, fetchProductVariantDetailsById, clearActiveVariant } =
    useProductVariants();

  const product = useMemo(
    () => (activeProduct?._id === id ? activeProduct : null),
    [activeProduct, id]
  );

  const variant = useMemo(() => {
    if (!activeVariant || !variantId || !id) return null;
    if (activeVariant._id !== variantId) return null;
    if (String(activeVariant.productId) !== String(id)) return null;
    return activeVariant;
  }, [activeVariant, variantId, id]);

  useEffect(() => {
    if (!id) return;
    fetchProductById(id).catch(() => {
      // handled by not-found state
    });
    return () => {
      clearActiveProduct();
    };
  }, [id, fetchProductById, clearActiveProduct]);

  useEffect(() => {
    if (!variantId) return;
    fetchProductVariantDetailsById(variantId, id).catch(() => {
      // handled by not-found state
    });
    return () => {
      clearActiveVariant();
    };
  }, [variantId, id, fetchProductVariantDetailsById, clearActiveVariant]);

  if (activeProductLoading || activeVariantLoading) {
    return <ProductFormPageSkeleton />;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  if (!variant) {
    return <VariantNotFound productId={id} />;
  }

  return <ProductVariantEditForm product={product} variant={variant} />;
};

export default ProductVariantDetailsPage;
