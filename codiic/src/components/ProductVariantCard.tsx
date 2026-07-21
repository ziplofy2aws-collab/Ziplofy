import { ChevronRightIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductVariant } from '../contexts/product-variant.context';

interface ProductVariantCardProps {
  variant: ProductVariant;
  productId: string;
}

const formatInr = (n: number) =>
  `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ProductVariantCard: React.FC<ProductVariantCardProps> = ({ variant, productId }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(`/products/${productId}/variants/${variant._id}`);
  }, [navigate, productId, variant._id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const price = variant.price != null ? Number(variant.price) : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm ring-1 ring-black/[0.02] transition-all hover:border-blue-200/90 hover:shadow-md hover:shadow-blue-500/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="font-mono text-sm font-semibold text-gray-900">{variant.sku || '—'}</p>
        <span className="shrink-0 rounded-lg bg-blue-50 px-2 py-0.5 text-sm font-bold tabular-nums text-blue-800">
          {formatInr(price)}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {variant.optionValues &&
          Object.entries(variant.optionValues).map(([key, value]) => (
            <span
              key={`${key}-${value}`}
              className="rounded-lg border border-gray-200 bg-gray-50/80 px-2 py-1 text-xs font-medium text-gray-700"
            >
              {key}: {value}
            </span>
          ))}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-xs">
        <div>
          <p className="font-medium text-gray-500">Inventory</p>
          <p className="mt-0.5 font-semibold text-gray-900">
            {variant.isInventoryTrackingEnabled ? 'Tracked' : 'Off'}
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Weight</p>
          <p className="mt-0.5 font-semibold text-gray-900">
            {variant.weightValue ?? 0} {variant.weightUnit || 'kg'}
          </p>
        </div>
      </div>

      <p className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
        <span>Oversell: {variant.outOfStockContinueSelling ? 'Yes' : 'No'}</span>
        <ChevronRightIcon className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </p>
    </div>
  );
};

export default ProductVariantCard;
