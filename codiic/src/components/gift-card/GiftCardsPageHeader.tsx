import { GiftIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { giftCardPrimaryButtonClass, giftCardSecondaryButtonClass } from './gift-card-ui.util';

const GiftCardsPageHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateGiftCard = useCallback(() => {
    navigate('/products/gift-cards/new');
  }, [navigate]);

  const handleAddGiftCardProduct = useCallback(() => {
    navigate('/products/gift-cards/products/new?from=gift_cards');
  }, [navigate]);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <GiftIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
        <h1 className="text-lg font-semibold text-gray-900">Gift cards</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={handleCreateGiftCard} className={giftCardSecondaryButtonClass}>
          Create gift card
        </button>
        <button type="button" onClick={handleAddGiftCardProduct} className={giftCardPrimaryButtonClass}>
          Add gift card product
        </button>
      </div>
    </div>
  );
};

export default GiftCardsPageHeader;
