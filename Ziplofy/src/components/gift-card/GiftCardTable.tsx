import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { GiftCard } from '../../contexts/gift-cards.context';
import GiftCardTableItem from './GiftCardTableItem';
import { giftCardTableHeadClass, giftCardTableHeadRightClass } from './gift-card-ui.util';

type SortOrder = 'asc' | 'desc';

interface GiftCardTableProps {
  giftCards: GiftCard[];
  onGiftCardClick: (giftCardId: string) => void;
  sortOrder?: SortOrder;
  onSortToggle?: () => void;
}

const GiftCardTable: React.FC<GiftCardTableProps> = ({
  giftCards,
  onGiftCardClick,
  sortOrder,
  onSortToggle,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const visibleIds = useMemo(() => giftCards.map((card) => card._id), [giftCards]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)).length,
    [visibleIds, selectedIds]
  );
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  const handleSelectRow = (giftCardId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(giftCardId);
      else next.delete(giftCardId);
      return next;
    });
  };

  const handleSelectAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) visibleIds.forEach((id) => next.add(id));
      else visibleIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="w-10 px-3 py-2.5 text-center">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => handleSelectAllVisible(e.target.checked)}
                aria-label="Select all gift cards"
                className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-300"
              />
            </th>
            <th className={giftCardTableHeadClass}>Gift card code</th>
            <th className={giftCardTableHeadRightClass}>Initial value</th>
            <th className={giftCardTableHeadClass}>Status</th>
            <th className={giftCardTableHeadRightClass}>Expiration date</th>
            <th className={giftCardTableHeadRightClass}>
              {onSortToggle ? (
                <button
                  type="button"
                  onClick={onSortToggle}
                  className="inline-flex items-center gap-1 transition-colors hover:text-gray-700"
                >
                  Created date
                  {sortOrder ? (
                    sortOrder === 'asc' ? (
                      <ArrowUpIcon className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownIcon className="h-3.5 w-3.5" />
                    )
                  ) : null}
                </button>
              ) : (
                'Created date'
              )}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {giftCards.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-16 text-center">
                <p className="text-[15px] font-semibold text-gray-900">No gift cards found</p>
                <p className="mt-1.5 text-[13px] font-normal text-gray-500">
                  Try changing the filters or search term
                </p>
              </td>
            </tr>
          ) : (
            giftCards.map((giftCard) => (
              <GiftCardTableItem
                key={giftCard._id}
                giftCard={giftCard}
                isSelected={selectedIds.has(giftCard._id)}
                onSelect={handleSelectRow}
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
