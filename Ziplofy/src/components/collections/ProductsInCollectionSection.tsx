import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { CollectionEntry } from '../../contexts/collection-entries.context';
import ProductsInCollectionList from './ProductsInCollectionList';

interface ProductsInCollectionSectionProps {
  collectionEntries: CollectionEntry[];
  loading?: boolean;
  onProductClick: (productId: string) => void;
  onRemoveProduct: (e: React.MouseEvent, entryId: string) => void;
}

const ProductsInCollectionSection: React.FC<ProductsInCollectionSectionProps> = ({
  collectionEntries,
  loading = false,
  onProductClick,
  onRemoveProduct,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm lg:min-h-[320px]">
      <div className="flex flex-col gap-1 border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <ShoppingBagIcon className="h-5 w-5 text-blue-600" aria-hidden />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Products in this collection</h2>
            <p className="text-xs text-gray-500">{collectionEntries.length} linked</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading products">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 max-w-xs rounded bg-gray-200" />
                  <div className="h-3 w-1/2 max-w-[200px] rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : collectionEntries.length > 0 ? (
          <ProductsInCollectionList
            collectionEntries={collectionEntries}
            onProductClick={onProductClick}
            onRemoveProduct={onRemoveProduct}
          />
        ) : (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-gray-50/30 px-6 py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
              <ShoppingBagIcon className="h-7 w-7 text-gray-300" aria-hidden />
            </div>
            <p className="text-sm font-semibold text-gray-900">No products yet</p>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Use the search on the left to find products and add them to this collection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsInCollectionSection;
