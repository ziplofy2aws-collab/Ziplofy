import { ExclamationTriangleIcon, TagIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AmountOffOrderTable from '../components/AmountOffOrderTable';
import AmountOffProductsTable from '../components/AmountOffProductsTable';
import BuyXGetYTable from '../components/BuyXGetYTable';
import DiscountsPageHeader from '../components/DiscountsPageHeader';
import FreeShippingTable from '../components/FreeShippingTable';
import Tabs from '../components/Tabs';
import { useAmountOffOrderDiscount } from '../contexts/amount-off-order-discount.context';
import { useAmountOffProductsDiscount } from '../contexts/amount-off-products-discount.context';
import { useBuyXGetYDiscount } from '../contexts/buy-x-get-y-discount.context';
import { useFreeShippingDiscount } from '../contexts/free-shipping-discount.context';
import { useStore } from '../contexts/store.context';

const EmptyState = ({ message, onCreate }: { message: string; onCreate: () => void }) => (
  <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/30 px-8 py-14 text-center">
    <div className="relative mb-5">
      <div
        className="absolute inset-0 rounded-full bg-blue-400/10 blur-xl"
        aria-hidden
      />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <TagIcon className="h-8 w-8 text-blue-500" aria-hidden />
      </div>
    </div>
    <p className="max-w-sm text-sm font-medium text-gray-700">{message}</p>
    <p className="mt-1 max-w-sm text-xs text-gray-500">
      New promotions of this type will show up in the list here.
    </p>
    <button
      type="button"
      onClick={onCreate}
      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
    >
      Create discount
    </button>
  </div>
);

const DiscountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { discounts, error, fetchDiscountsByStoreId } = useAmountOffProductsDiscount();
  const {
    discounts: bxgyDiscounts,
    error: bxgyError,
    fetchDiscountsByStoreId: fetchBxgyByStoreId,
  } = useBuyXGetYDiscount();
  const {
    discounts: aooDiscounts,
    error: aooError,
    fetchDiscountsByStoreId: fetchAooByStoreId,
  } = useAmountOffOrderDiscount();
  const {
    discounts: fsDiscounts,
    error: fsError,
    fetchDiscountsByStoreId: fetchFsByStoreId,
  } = useFreeShippingDiscount();
  const { activeStoreId } = useStore();

  const [tab, setTab] = useState<string>('amount-off-products');

  useEffect(() => {
    const load = async () => {
      if (!activeStoreId) return;
      try {
        if (tab === 'amount-off-products') {
          await fetchDiscountsByStoreId(activeStoreId, { page: 1, limit: 10 });
        } else if (tab === 'buy-x-get-y') {
          await fetchBxgyByStoreId(activeStoreId, { page: 1, limit: 10 });
        } else if (tab === 'amount-off-order') {
          await fetchAooByStoreId(activeStoreId, { page: 1, limit: 10 });
        } else if (tab === 'free-shipping') {
          await fetchFsByStoreId(activeStoreId, { page: 1, limit: 10 });
        }
      } catch {
        /* context handles errors */
      }
    };
    load();
  }, [activeStoreId, tab, fetchDiscountsByStoreId, fetchBxgyByStoreId, fetchAooByStoreId, fetchFsByStoreId]);

  const handleCreateDiscount = useCallback(() => {
    const routes: Record<string, string> = {
      'amount-off-products': '/discounts/new/amount-off-products',
      'buy-x-get-y': '/discounts/new/buy-x-get-y',
      'amount-off-order': '/discounts/new/amount-off-order',
      'free-shipping': '/discounts/new/free-shipping',
    };
    navigate(routes[tab] || '/discounts/new/amount-off-products');
  }, [navigate, tab]);

  const handleTabChange = useCallback((newTab: string) => {
    setTab(newTab);
  }, []);

  const tabs = [
    { id: 'amount-off-products', label: 'Amount off products' },
    { id: 'buy-x-get-y', label: 'Buy X Get Y' },
    { id: 'amount-off-order', label: 'Amount off order' },
    { id: 'free-shipping', label: 'Free shipping' },
  ];

  const { activeCount, activeTabLabel } = useMemo(() => {
    switch (tab) {
      case 'amount-off-products':
        return {
          activeCount: discounts.length,
          activeTabLabel: discounts.length === 1 ? 'product discount' : 'product discounts',
        };
      case 'buy-x-get-y':
        return {
          activeCount: bxgyDiscounts.length,
          activeTabLabel: bxgyDiscounts.length === 1 ? 'BXGY discount' : 'BXGY discounts',
        };
      case 'amount-off-order':
        return {
          activeCount: aooDiscounts.length,
          activeTabLabel: aooDiscounts.length === 1 ? 'order discount' : 'order discounts',
        };
      case 'free-shipping':
        return {
          activeCount: fsDiscounts.length,
          activeTabLabel: fsDiscounts.length === 1 ? 'shipping discount' : 'shipping discounts',
        };
      default:
        return { activeCount: 0, activeTabLabel: '' };
    }
  }, [tab, discounts.length, bxgyDiscounts.length, aooDiscounts.length, fsDiscounts.length]);

  const currentError =
    tab === 'amount-off-products'
      ? error
      : tab === 'buy-x-get-y'
        ? bxgyError
        : tab === 'amount-off-order'
          ? aooError
          : tab === 'free-shipping'
            ? fsError
            : null;

  return (
    <div className="w-full space-y-6 pb-8">
      <DiscountsPageHeader
        onCreateDiscount={handleCreateDiscount}
        activeCount={activeCount}
        activeTabLabel={activeTabLabel}
      />

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-4 py-4 sm:px-5 sm:py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Discount type</p>
          <Tabs variant="pills" tabs={tabs} activeTab={tab} onTabChange={handleTabChange} />
        </div>

        <div className="p-4 sm:p-5">
          {currentError ? (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200/90 bg-red-50/80 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
                <ExclamationTriangleIcon className="h-5 w-5" aria-hidden />
              </div>
              <p className="min-w-0 flex-1 text-sm text-red-900">{currentError}</p>
            </div>
          ) : null}

          {tab === 'amount-off-products' && discounts.length > 0 && (
            <AmountOffProductsTable discounts={discounts} />
          )}
          {tab === 'buy-x-get-y' && bxgyDiscounts.length > 0 && (
            <BuyXGetYTable discounts={bxgyDiscounts} />
          )}
          {tab === 'amount-off-order' && aooDiscounts.length > 0 && (
            <AmountOffOrderTable discounts={aooDiscounts} />
          )}
          {tab === 'free-shipping' && fsDiscounts.length > 0 && (
            <FreeShippingTable discounts={fsDiscounts} />
          )}

          {tab === 'amount-off-products' && discounts.length === 0 && (
            <EmptyState message="No amount off products discounts yet." onCreate={handleCreateDiscount} />
          )}
          {tab === 'buy-x-get-y' && bxgyDiscounts.length === 0 && (
            <EmptyState message="No Buy X Get Y discounts yet." onCreate={handleCreateDiscount} />
          )}
          {tab === 'amount-off-order' && aooDiscounts.length === 0 && (
            <EmptyState message="No amount off order discounts yet." onCreate={handleCreateDiscount} />
          )}
          {tab === 'free-shipping' && fsDiscounts.length === 0 && (
            <EmptyState message="No free shipping discounts yet." onCreate={handleCreateDiscount} />
          )}
        </div>
      </section>
    </div>
  );
};

export default DiscountsPage;
