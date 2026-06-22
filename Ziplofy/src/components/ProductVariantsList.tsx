import React from 'react';
import { ProductVariant } from '../contexts/product-variant.context';
import ProductVariantCard from './ProductVariantCard';

interface ProductVariantsListProps {
  variants: ProductVariant[];
  productId: string;
  loading: boolean;
  /** Render without outer card wrapper when nested inside the Variants section. */
  embedded?: boolean;
}

function ProductVariantsList({
  variants,
  productId,
  loading,
  embedded = false,
}: ProductVariantsListProps) {
  const body = loading ? (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading variants"
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-100 bg-gray-50/50 p-4"
        >
          <div className="mb-4 flex justify-between">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
          <div className="mb-4 flex gap-2">
            <div className="h-6 w-14 rounded-lg bg-gray-200" />
            <div className="h-6 w-14 rounded-lg bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 rounded bg-gray-200" />
            <div className="h-10 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  ) : variants.length === 0 ? (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-gray-50/30 px-6 py-10 text-center">
      <p className="text-sm font-medium text-gray-900">No variant SKUs yet</p>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Variant SKUs will appear here after options are saved.
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {variants.map((variant) => (
        <ProductVariantCard key={variant._id} variant={variant} productId={productId} />
      ))}
    </div>
  );

  if (embedded) {
    return <div className="pt-2">{body}</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Variants</h2>
      {body}
    </div>
  );
}

export default ProductVariantsList;
