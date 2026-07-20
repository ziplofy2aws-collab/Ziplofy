import React from 'react';
import ProductTableHeaderRow from './ProductTableHeaderRow';
import VariantTableRow from './VariantTableRow';

interface ProductWithVariantsRowProps {
  productId: string;
  productImage?: string;
  productTitle: string;
  variants: any[];
  selectedVariantIds: Set<string>;
  onVariantToggle: (variantId: string) => void;
}

const ProductWithVariantsRow: React.FC<ProductWithVariantsRowProps> = ({
  productId,
  productImage,
  productTitle,
  variants,
  selectedVariantIds,
  onVariantToggle,
}) => {
  return (
    <React.Fragment key={`prod-${productId}`}>
      <ProductTableHeaderRow
        productImage={productImage}
        productTitle={productTitle}
      />
      {(variants || []).map((v: any) => (
        <VariantTableRow
          key={`var-${v._id}`}
          variantId={String(v._id)}
          variant={v}
          isSelected={selectedVariantIds.has(String(v._id))}
          onToggle={onVariantToggle}
        />
      ))}
    </React.Fragment>
  );
};

export default ProductWithVariantsRow;

