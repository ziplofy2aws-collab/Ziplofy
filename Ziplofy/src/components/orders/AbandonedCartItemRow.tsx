import { CubeIcon } from '@heroicons/react/24/outline';
import React from 'react';

export interface CartItem {
  _id: string;
  quantity: number;
  addedAt: string;
  productVariant: {
    sku: string;
    price: number;
    compareAtPrice?: number;
    images?: string[];
    optionValues: Record<string, string>;
    productId: string;
  };
}

const formatInr = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface AbandonedCartItemRowProps {
  item: CartItem;
  onViewProduct: (productId: string) => void;
}

const AbandonedCartItemRow: React.FC<AbandonedCartItemRowProps> = ({ item, onViewProduct }) => {
  const productLabel =
    Object.entries(item.productVariant.optionValues || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ') || item.productVariant.sku;

  const lineTotal = item.productVariant.price * item.quantity;

  return (
    <tr className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50/80">
      <td className="px-3 py-2.5">
        <button
          type="button"
          onClick={() => onViewProduct(item.productVariant.productId)}
          className="flex items-center gap-2.5 text-left"
        >
          {item.productVariant.images && item.productVariant.images.length > 0 ? (
            <img
              src={item.productVariant.images[0]}
              alt=""
              className="h-9 w-9 shrink-0 rounded border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50">
              <CubeIcon className="h-4 w-4 text-gray-400" aria-hidden />
            </div>
          )}
          <span className="text-[13px] font-medium text-gray-900 hover:underline">{productLabel}</span>
        </button>
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-600 sm:table-cell">
        {item.productVariant.sku}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right text-[13px] text-gray-900">
        {formatInr(item.productVariant.price)}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-center text-[13px] text-gray-900">
        {item.quantity}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right text-[13px] font-medium text-gray-900">
        {formatInr(lineTotal)}
      </td>
    </tr>
  );
};

export default AbandonedCartItemRow;
