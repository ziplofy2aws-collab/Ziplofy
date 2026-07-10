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
    <tr className="transition-colors hover:bg-blue-50/30">
      <td className="px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onViewProduct(item.productVariant.productId)}
            className="flex items-center gap-3 text-left"
          >
            {item.productVariant.images && item.productVariant.images.length > 0 ? (
              <img
                src={item.productVariant.images[0]}
                alt=""
                className="h-12 w-12 shrink-0 rounded-xl border border-gray-200 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-linear-to-br from-gray-50 to-gray-100">
                <CubeIcon className="h-6 w-6 text-gray-400" aria-hidden />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 hover:text-blue-700 hover:underline">{productLabel}</p>
              <p className="mt-0.5 font-mono text-xs text-gray-500 sm:hidden">{item.productVariant.sku}</p>
            </div>
          </button>
          </div>
      </td>
      <td className="hidden whitespace-nowrap px-4 py-4 sm:table-cell sm:px-5">
        <p className="font-mono text-sm text-gray-600">{item.productVariant.sku}</p>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right sm:px-5">
        <p className="text-sm font-medium tabular-nums text-gray-900">{formatInr(item.productVariant.price)}</p>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-center sm:px-5">
        <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-gray-100 px-2 py-0.5 text-sm font-semibold tabular-nums text-gray-800">
          {item.quantity}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right sm:px-5">
        <p className="text-sm font-semibold tabular-nums text-blue-700">{formatInr(lineTotal)}</p>
      </td>
    </tr>
  );
};

export default AbandonedCartItemRow;
