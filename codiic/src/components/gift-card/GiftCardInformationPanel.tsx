import {
  CalendarDaysIcon,
  CurrencyDollarIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import type { GiftCard } from '../../contexts/gift-cards.context';

interface GiftCardInformationPanelProps {
  giftCard: GiftCard;
}

const GiftCardInformationPanel: React.FC<GiftCardInformationPanelProps> = ({
  giftCard
}) => {
  return (
    <div className="md:col-span-4">
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm h-full">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-2">
            <GiftIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Gift Card Information</h2>
            <p className="text-xs text-gray-600 mt-0.5">Detailed information about this gift card</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="pb-3 border-b border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Gift Card Code</p>
            <p className="text-sm font-medium font-mono tracking-wide text-gray-900">
              {giftCard.code}
            </p>
          </div>

          <div className="pb-3 border-b border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Initial Value</p>
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-4 h-4 text-blue-600 mr-1.5" />
              <span className="text-sm font-medium text-gray-900">₹{giftCard.initialValue}</span>
            </div>
          </div>

          <div className="pb-3 border-b border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Status</p>
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

          <div className="pb-3 border-b border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Created Date</p>
            <div className="flex items-center">
              <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-600 mr-1.5" />
              <span className="text-sm text-gray-700">
                {new Date(giftCard.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {giftCard.expirationDate && (
            <div className="pb-3 border-b border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Expiration Date</p>
              <div className="flex items-center">
                <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-600 mr-1.5" />
                <span className="text-sm text-gray-700">
                  {new Date(giftCard.expirationDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-600 mb-1">Last Updated</p>
            <div className="flex items-center">
              <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-600 mr-1.5" />
              <span className="text-sm text-gray-700">
                {new Date(giftCard.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardInformationPanel;

