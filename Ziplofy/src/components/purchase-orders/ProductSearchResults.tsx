import React from 'react';
import ProductWithVariantsRow from './ProductWithVariantsRow';

interface ProductSearchResultsProps {
  results: any[];
  selectedVariantIds: Set<string>;
  onVariantToggle: (variantId: string) => void;
}

const ProductSearchResults: React.FC<ProductSearchResultsProps> = ({
  results,
  selectedVariantIds,
  onVariantToggle,
}) => {
  return (
    <>
      {results.map((item: any) => (
        <ProductWithVariantsRow
          key={`prod-${item.product?._id}`}
          productId={item.product?._id}
          productImage={item.product?.imageUrls?.[0]}
          productTitle={item.product?.title || 'Unnamed product'}
          variants={item.variants || []}
          selectedVariantIds={selectedVariantIds}
          onVariantToggle={onVariantToggle}
        />
      ))}
    </>
  );
};

export default ProductSearchResults;

