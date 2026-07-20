import { ArrowPathIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';

interface AbandonedCartsHeaderProps {
  cartCount: number;
  totalLineItems: number;
  totalEstimatedValue: number;
  loading: boolean;
  onRefresh: () => void;
}

const formatInr = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AbandonedCartsHeader: React.FC<AbandonedCartsHeaderProps> = ({
  cartCount,
  totalLineItems,
  totalEstimatedValue,
  loading,
  onRefresh,
}) => {
  const handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <ShoppingCartIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
          <h1 className="text-lg font-semibold text-gray-900">Abandoned carts</h1>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
          Refresh
        </button>
      </div>

      {cartCount > 0 ? (
        <p className="mt-1.5 text-[13px] text-gray-500">
          {cartCount} {cartCount === 1 ? 'cart' : 'carts'} · {totalLineItems}{' '}
          {totalLineItems === 1 ? 'item' : 'items'} · {formatInr(totalEstimatedValue)} estimated value
        </p>
      ) : null}
    </div>
  );
};

export default AbandonedCartsHeader;
