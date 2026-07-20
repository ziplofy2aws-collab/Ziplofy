import { MagnifyingGlassIcon, RectangleStackIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface Product {
  _id: string;
  title?: string;
  imageUrl?: string;
}

interface AddProductsToCollectionSectionProps {
  searchQuery: string;
  filteredProducts: Product[];
  selectedProducts: Product[];
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onProductSelect: (product: Product) => void;
}

const AddProductsToCollectionSection: React.FC<AddProductsToCollectionSectionProps> = ({
  searchQuery,
  filteredProducts,
  selectedProducts,
  onSearchChange,
  onProductSelect,
}) => {
  const showSearchDropdown = searchQuery.trim() && filteredProducts.length > 0;
  const showNoResults = searchQuery.trim() && filteredProducts.length === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">Add products</h2>
        <p className="mt-0.5 text-xs text-gray-500">Search your catalog and pick products to include</p>
      </div>
      <div className="p-5">
        <div className="relative">
          <label htmlFor="collection-product-search" className="sr-only">
            Search products
          </label>
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            id="collection-product-search"
            type="search"
            placeholder="Search by title, description, or SKU…"
            value={searchQuery}
            onChange={onSearchChange}
            autoComplete="off"
            className="w-full rounded-xl border border-gray-200 bg-gray-50/30 py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />

          {showSearchDropdown ? (
            <div className="absolute z-20 mt-2 max-h-[280px] w-full overflow-y-auto rounded-xl border border-gray-200/90 bg-white py-1 shadow-lg ring-1 ring-black/5">
              {filteredProducts.slice(0, 10).map((product) => {
                const isSelected = selectedProducts.some((p) => p?._id === product?._id);
                return (
                  <button
                    key={product?._id}
                    type="button"
                    onClick={() => onProductSelect(product)}
                    disabled={isSelected}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'cursor-not-allowed bg-gray-50 opacity-60'
                        : 'cursor-pointer hover:bg-blue-50/50'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg ${
                        isSelected ? 'ring-2 ring-emerald-400' : 'ring-1 ring-gray-200'
                      }`}
                    >
                      {product?.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                          <RectangleStackIcon className="h-4 w-4 text-white" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-900">
                        {product?.title || 'Untitled product'}
                      </span>
                      {isSelected ? (
                        <span className="mt-0.5 inline-block text-xs font-semibold text-emerald-600">
                          Already in queue
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}

          {showNoResults ? (
            <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-lg ring-1 ring-black/5">
              No products match your search.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AddProductsToCollectionSection;
