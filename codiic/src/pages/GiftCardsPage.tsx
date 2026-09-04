import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GiftCardTable from '../components/gift-card/GiftCardTable';
import GiftCardsPageFilters, {
  type GiftCardFilterTab,
} from '../components/gift-card/GiftCardsPageFilters';
import GiftCardsPageHeader from '../components/gift-card/GiftCardsPageHeader';
import {
  giftCardPrimaryButtonClass,
  giftCardSecondaryButtonClass,
} from '../components/gift-card/gift-card-ui.util';
import { useGiftCards } from '../contexts/gift-cards.context';
import { useStore } from '../contexts/store.context';

type SortOrder = 'asc' | 'desc';

const GiftCardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { giftCards, loading, error, fetchGiftCardsByStoreId } = useGiftCards();
  const { activeStoreId } = useStore();
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [activeTab, setActiveTab] = useState<GiftCardFilterTab>('All');
  const [search, setSearch] = useState('');

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

  const handleSortToggle = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const filteredGiftCards = useMemo(() => {
    const byTab = giftCards.filter((card) => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Active') return card.isActive;
      return !card.isActive;
    });

    const query = search.trim().toLowerCase();
    const searched = query
      ? byTab.filter(
          (card) =>
            card.code.toLowerCase().includes(query) ||
            card.initialValue.toString().includes(query) ||
            (card.notes || '').toLowerCase().includes(query)
        )
      : byTab;

    return [...searched].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [giftCards, activeTab, search, sortOrder]);

  const hasGiftCards = giftCards.length > 0;

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1000px] py-4">
        <GiftCardsPageHeader />

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          {hasGiftCards ? (
            <GiftCardsPageFilters
              activeTab={activeTab}
              onTabChange={setActiveTab}
              search={search}
              onSearchChange={setSearch}
            />
          ) : null}

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
            </div>
          ) : !hasGiftCards ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-[15px] font-semibold text-gray-900">Start selling gift cards</p>
              <p className="mt-1.5 max-w-md text-[13px] font-normal text-gray-500">
                Add gift card products to sell or create gift cards and send them directly to your
                customers.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button type="button" onClick={handleCreateGiftCard} className={giftCardSecondaryButtonClass}>
                  Create gift card
                </button>
                <button type="button" onClick={handleAddGiftCardProduct} className={giftCardPrimaryButtonClass}>
                  Add gift card product
                </button>
              </div>
              <p className="mt-5 text-xs text-gray-400">
                By using gift cards, you agree to our{' '}
                <a href="#" className="text-gray-600 underline hover:text-gray-800">
                  Terms of Service
                </a>
              </p>
            </div>
          ) : (
            <GiftCardTable
              giftCards={filteredGiftCards}
              onGiftCardClick={handleGiftCardClick}
              sortOrder={sortOrder}
              onSortToggle={handleSortToggle}
            />
          )}
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-gray-500">
            <a href="#" className="text-gray-600 hover:text-gray-800">
              Learn more about gift cards
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GiftCardsPage;
