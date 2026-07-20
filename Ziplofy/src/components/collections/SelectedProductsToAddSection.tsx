import { PlusCircleIcon, RectangleStackIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface Product {
  _id: string;
  title?: string;
  imageUrl?: string;
}

interface SelectedProductsToAddSectionProps {
  selectedProducts: Product[];
  loading?: boolean;
  onRemoveProduct: (productId: string) => void;
  onAddProducts: () => void;
  onClearAll: () => void;
}

const SelectedProductsToAddSection: React.FC<SelectedProductsToAddSectionProps> = ({
  selectedProducts,
  loading = false,
  onRemoveProduct,
  onAddProducts,
  onClearAll,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50/40 to-white px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">Ready to add</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          {selectedProducts.length === 0
            ? 'Select products from the search above'
            : `${selectedProducts.length} selected — confirm to add to this collection`}
        </p>
      </div>

      <div className="p-5">
        {selectedProducts.length > 0 ? (
          <div className="space-y-3">
            <ul className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
              {selectedProducts.map((product) => (
                <li
                  key={product._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ring-gray-200">
                      {product?.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                          <RectangleStackIcon className="h-3.5 w-3.5 text-white" aria-hidden />
                        </div>
                      )}
                    </div>
                    <span className="truncate text-sm font-medium text-gray-900">
                      {product?.title || 'Untitled product'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveProduct(product._id)}
                    className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove from list"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={onAddProducts}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                <PlusCircleIcon className="h-4 w-4" aria-hidden />
                {loading
                  ? 'Adding…'
                  : `Add ${selectedProducts.length} ${selectedProducts.length === 1 ? 'product' : 'products'}`}
              </button>
              <button
                type="button"
                onClick={onClearAll}
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <XMarkIcon className="h-4 w-4" aria-hidden />
                Clear all
              </button>
            </div>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center text-sm text-gray-500">
            No products in the queue yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default SelectedProductsToAddSection;
