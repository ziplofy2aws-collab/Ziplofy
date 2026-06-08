import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { GiftCard } from '../../contexts/gift-cards.context';
import GiftCardTableItem from './GiftCardTableItem';

type SortOrder = 'asc' | 'desc';

interface GiftCardTableProps {
  giftCards: GiftCard[];
  onGiftCardClick: (giftCardId: string) => void;
  loading?: boolean;
  sortOrder?: SortOrder;
  onSortToggle?: () => void;
}

const GiftCardTable: React.FC<GiftCardTableProps> = ({
  giftCards,
  onGiftCardClick,
  loading = false,
  sortOrder,
  onSortToggle
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/80">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              Gift Card Code
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              Initial Value
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              Expiration Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              {onSortToggle ? (
                <button
                  onClick={onSortToggle}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Created Date
                  {sortOrder && (
                    <span className="inline-flex items-center">
                      {sortOrder === 'asc' ? (
                        <ArrowUpIcon className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownIcon className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </button>
              ) : (
                <span>Created Date</span>
              )}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                Loading gift cards...
              </td>
            </tr>
          ) : giftCards.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                No gift cards found
              </td>
            </tr>
          ) : (
            giftCards.map((giftCard) => (
              <GiftCardTableItem
                key={giftCard._id}
                giftCard={giftCard}
                onClick={onGiftCardClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GiftCardTable;

