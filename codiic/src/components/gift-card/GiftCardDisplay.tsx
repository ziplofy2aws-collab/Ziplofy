import { CurrencyDollarIcon, GiftIcon, PencilIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { GiftCard } from '../../contexts/gift-cards.context';

interface GiftCardDisplayProps {
  giftCard: GiftCard;
  onEdit: () => void;
}

const GiftCardDisplay: React.FC<GiftCardDisplayProps> = ({ giftCard, onEdit }) => {
  return (
    <div className="md:col-span-4">
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm flex flex-col">
        {/* Header with Gift Icon and Edit Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-2">
              <GiftIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Gift Card</h3>
          </div>
          {giftCard.isActive && (
            <button
              onClick={onEdit}
              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Gift Card Code */}
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-1">Code</p>
          <p className="text-lg font-medium font-mono tracking-wide break-all text-gray-900">
            {giftCard.code}
          </p>
        </div>

        {/* Value */}
        <div className="mb-4 flex items-center">
          <CurrencyDollarIcon className="w-5 h-5 mr-2 text-blue-600" />
          <span className="text-xl font-medium text-gray-900">₹{giftCard.initialValue}</span>
        </div>

        {/* Status */}
        <div className="mt-auto pt-3 border-t border-gray-200">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              giftCard.isActive
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {giftCard.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GiftCardDisplay;

