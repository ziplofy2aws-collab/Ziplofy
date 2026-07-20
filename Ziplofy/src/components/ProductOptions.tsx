import {
  AdjustmentsHorizontalIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { Product } from '../contexts/product.context';

interface ProductOptionsProps {
  product: Product;
  onAddVariants: () => void;
  onAddOption: () => void;
  onDeleteVariantDimension: () => void;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({
  product,
  onAddVariants,
  onAddOption,
  onDeleteVariantDimension,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
          <AdjustmentsHorizontalIcon className="h-4 w-4 text-indigo-600" aria-hidden />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Options</h2>
          <p className="text-xs text-gray-500">Dimensions customers choose from</p>
        </div>
        <div className="ml-auto">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <PencilSquareIcon className="h-4 w-4" aria-hidden />
              Edit
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onAddVariants}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" aria-hidden />
                Add variants
              </button>
              <button
                type="button"
                onClick={onAddOption}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" aria-hidden />
                Add option
              </button>
              <button
                type="button"
                onClick={onDeleteVariantDimension}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                <TrashIcon className="h-4 w-4" aria-hidden />
                Delete variant
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <XMarkIcon className="h-4 w-4" aria-hidden />
                Done
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        {product.variants.map((opt) => (
          <div
            key={opt._id}
            className="rounded-xl border border-gray-200/80 bg-gray-50/30 p-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-gray-900">{opt.optionName}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {opt.values.map((v) => (
                <span
                  key={v}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductOptions;
