import { ArrowDownTrayIcon, GiftIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GiftCardTable from '../components/gift-card/GiftCardTable';
import { useGiftCards } from '../contexts/gift-cards.context';
import { useStore } from '../contexts/store.context';

type SortOrder = 'asc' | 'desc';

const GiftCardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { giftCards, loading, error, fetchGiftCardsByStoreId } = useGiftCards();
  const { activeStoreId } = useStore();
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleCreateGiftCard = useCallback(() => {
    navigate('/products/gift-cards/new');
  }, [navigate]);

  const handleAddGiftCardProduct = useCallback(() => {
    navigate('/products/gift-cards/products/new?from=gift_cards');
  }, [navigate]);

  const handleGiftCardClick = useCallback(
    (giftCardId: string) => {
      navigate(`/products/gift-cards/${giftCardId}`);
    },
    [navigate]
  );

  useEffect(() => {
    if (activeStoreId) {
      fetchGiftCardsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchGiftCardsByStoreId]);

  const sortedGiftCards = useMemo(() => {
    const sorted = [...giftCards].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }, [giftCards, sortOrder]);

  const handleSortToggle = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const hasGiftCards = giftCards.length > 0;

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2.5 pl-3 border-l-4 border-blue-500/60">
            <GiftIcon className="h-6 w-6 shrink-0 text-gray-700" aria-hidden />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gift cards</h1>
              {hasGiftCards ? (
                <p className="text-sm text-gray-500 mt-0.5">Manage your gift cards and create new ones</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            disabled={!hasGiftCards}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-600"></div>
          </div>
        )}

        {!loading && !error && !hasGiftCards && (
          <>
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="flex flex-col items-center justify-center text-center min-h-[420px] px-6 py-14">
                <div className="mb-8 flex h-36 w-36 items-center justify-center rounded-full bg-gray-100">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 rounded-lg bg-teal-500/90" />
                    <div className="absolute left-1/2 top-0 h-full w-3 -translate-x-1/2 rounded-sm bg-teal-600/80" />
                    <div className="absolute left-0 top-1/2 h-3 w-full -translate-y-1/2 rounded-sm bg-teal-600/80" />
                    <div className="absolute -top-2 left-1/2 h-5 w-8 -translate-x-1/2 rounded-t-full border-4 border-teal-600/80 border-b-0 bg-transparent" />
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900">Start selling gift cards</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
                  Add gift card products to sell or create gift cards and send them directly to your
                  customers.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCreateGiftCard}
                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                  >
                    Create gift card
                  </button>
                  <button
                    type="button"
                    onClick={handleAddGiftCardProduct}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Add gift card product
                  </button>
                </div>

                <p className="mt-6 text-xs text-gray-500">
                  By using gift cards, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                    Terms of Service
                  </a>
                </p>
              </div>
            </div>

            <div className="py-6 text-center">
              <p className="text-sm text-gray-500">
                Learn more about{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                  gift cards
                </a>
              </p>
            </div>
          </>
        )}

        {!loading && !error && hasGiftCards && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-900">
                {giftCards.length} Gift Card{giftCards.length !== 1 ? 's' : ''}
              </h2>
              <button
                type="button"
                onClick={handleCreateGiftCard}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Create gift card
              </button>
            </div>
            <GiftCardTable
              giftCards={sortedGiftCards}
              onGiftCardClick={handleGiftCardClick}
              sortOrder={sortOrder}
              onSortToggle={handleSortToggle}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCardsPage;
