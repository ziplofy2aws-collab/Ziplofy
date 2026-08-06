import { ArrowPathIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { adminListSecondaryButtonClass } from '../admin-list-ui';

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
          <ShoppingCartIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
          <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Abandoned carts</h1>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className={`${adminListSecondaryButtonClass} gap-1.5`}
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
          Refresh
        </button>
      </div>

      {cartCount > 0 ? (
        <p className="mt-1.5 text-[13px] text-admin-text-secondary">
          {cartCount} {cartCount === 1 ? 'cart' : 'carts'} · {totalLineItems}{' '}
          {totalLineItems === 1 ? 'item' : 'items'} · {formatInr(totalEstimatedValue)} estimated value
        </p>
      ) : null}
    </div>
  );
};

export default AbandonedCartsHeader;
