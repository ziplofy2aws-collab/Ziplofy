import { Squares2X2Icon } from '@heroicons/react/24/outline';
import React from 'react';
import { ProductVariant } from '../contexts/product-variant.context';
import ProductVariantCard from './ProductVariantCard';

interface ProductVariantsListProps {
  variants: ProductVariant[];
  productId: string;
  loading: boolean;
}

function ProductVariantsList({ variants, productId, loading }: ProductVariantsListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-1 border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Squares2X2Icon className="h-5 w-5 text-blue-600" aria-hidden />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Variants</h2>
            <p className="text-xs text-gray-500">{variants.length} SKU{variants.length === 1 ? '' : 's'}</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading variants">
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
          <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-gray-50/30 px-6 py-14 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-100 bg-white">
              <Squares2X2Icon className="h-6 w-6 text-gray-300" aria-hidden />
            </div>
            <p className="text-sm font-semibold text-gray-900">No variants yet</p>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Use <span className="font-medium text-gray-700">Add variants</span> above to generate SKUs from options.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {variants.map((variant) => (
              <ProductVariantCard key={variant._id} variant={variant} productId={productId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductVariantsList;
