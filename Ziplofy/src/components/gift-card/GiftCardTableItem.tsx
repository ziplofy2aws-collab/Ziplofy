import React from 'react';
import type { GiftCard } from '../../contexts/gift-cards.context';

interface GiftCardTableItemProps {
  giftCard: GiftCard;
  onClick: (giftCardId: string) => void;
}

const GiftCardTableItem: React.FC<GiftCardTableItemProps> = ({ giftCard, onClick }) => {
  const handleClick = () => {
    onClick(giftCard._id);
  };

  return (
    <tr
      onClick={handleClick}
      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
        <div className="font-mono">{giftCard.code}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
        ₹{giftCard.initialValue.toFixed(2)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border ${
            giftCard.isActive
              ? 'bg-green-50 text-green-700 border-green-200/80'
              : 'bg-red-50 text-red-700 border-red-200/80'
          }`}
        >
          {giftCard.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
        {giftCard.expirationDate
          ? new Date(giftCard.expirationDate).toLocaleDateString()
          : '—'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
        {new Date(giftCard.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
};

export default GiftCardTableItem;

