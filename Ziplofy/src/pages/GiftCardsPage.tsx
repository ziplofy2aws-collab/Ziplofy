import { CreditCardIcon, PlusIcon } from '@heroicons/react/24/outline';
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

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="pl-3 border-l-4 border-blue-500/60">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gift Cards</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your gift cards and create new ones</p>
          </div>
          <button
            onClick={handleCreateGiftCard}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Create Gift Card
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

        {!loading && !error && giftCards.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm min-h-[320px] flex justify-center items-center p-12">
            <div className="flex flex-col justify-center items-center text-center gap-4 max-w-md">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                <CreditCardIcon className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-semibold text-gray-900">No gift cards yet</h2>
                <p className="text-sm text-gray-500">Create your first gift card to get started</p>
              </div>
              <button
                onClick={handleCreateGiftCard}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Create Gift Card
              </button>
            </div>
          </div>
        )}

        {!loading && !error && giftCards.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
              <h2 className="text-base font-semibold text-gray-900">
                {giftCards.length} Gift Card{giftCards.length !== 1 ? 's' : ''}
              </h2>
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
