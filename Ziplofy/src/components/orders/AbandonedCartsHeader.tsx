import { ArrowPathIcon, BanknotesIcon, ShoppingCartIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
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
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-blue-50/25 px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 pl-3 border-l-4 border-blue-500/70">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Abandoned carts</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500">
              Shoppers who left before checkout. Review carts, send recovery emails, and win back revenue.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 lg:self-center"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            Refresh
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <ShoppingCartIcon className="h-4 w-4 text-blue-600" aria-hidden />
              Carts
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">{cartCount}</p>
          </div>
          <div className="rounded-xl border border-gray-200/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <Squares2X2Icon className="h-4 w-4 text-blue-600" aria-hidden />
              Line items
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">{totalLineItems}</p>
          </div>
          <div className="rounded-xl border border-gray-200/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm sm:col-span-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <BanknotesIcon className="h-4 w-4 text-blue-600" aria-hidden />
              Est. cart value
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
              {formatInr(totalEstimatedValue)}
            </p>
          </div>
        </div>
      </div>

      <p className="hidden text-xs leading-relaxed text-gray-500 sm:block sm:px-1">
        <span className="font-semibold text-gray-700">Tip:</span> Open a cart to see every variant, then send a personalized recovery email from the actions.
      </p>
    </div>
  );
};

export default AbandonedCartsHeader;
