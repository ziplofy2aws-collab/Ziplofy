import React from 'react';
import type { GiftCard } from '../../contexts/gift-cards.context';
import GiftCardStatusBadge from './GiftCardStatusBadge';
import {
  giftCardTableCellClass,
  giftCardTableCellRightClass,
} from './gift-card-ui.util';

interface GiftCardTableItemProps {
  giftCard: GiftCard;
  isSelected: boolean;
  onSelect: (giftCardId: string, checked: boolean) => void;
  onClick: (giftCardId: string) => void;
}

const GiftCardTableItem: React.FC<GiftCardTableItemProps> = ({
  giftCard,
  isSelected,
  onSelect,
  onClick,
}) => {
  return (
    <tr
      onClick={() => onClick(giftCard._id)}
      className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50/60"
    >
      <td className="w-10 px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(giftCard._id, e.target.checked)}
          aria-label={`Select gift card ${giftCard.code}`}
          className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-300"
        />
      </td>
      <td className={`${giftCardTableCellClass} font-medium text-gray-900`}>
        <span className="font-mono text-[12px]">{giftCard.code}</span>
      </td>
      <td className={giftCardTableCellRightClass}>₹{giftCard.initialValue.toFixed(2)}</td>
      <td className={giftCardTableCellClass}>
        <GiftCardStatusBadge isActive={giftCard.isActive} />
      </td>
      <td className={giftCardTableCellRightClass}>
        {giftCard.expirationDate
          ? new Date(giftCard.expirationDate).toLocaleDateString()
          : '—'}
      </td>
      <td className={giftCardTableCellRightClass}>
        {new Date(giftCard.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
};

export default GiftCardTableItem;
