import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import React from 'react';
import AbandonedCartItemRow, { CartItem } from './AbandonedCartItemRow';

interface AbandonedCartItemsTableProps {
  cartItems: CartItem[];
  cartTotal: number;
  onViewProduct: (productId: string) => void;
}

const formatInr = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AbandonedCartItemsTable: React.FC<AbandonedCartItemsTableProps> = ({ cartItems, cartTotal, onViewProduct }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-1 border-b border-gray-100 bg-linear-to-r from-gray-50/90 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <ShoppingBagIcon className="h-5 w-5 text-blue-600" aria-hidden />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Line items</h2>
            <p className="text-xs text-gray-500">{cartItems.length} product rows in this cart</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50/80">
              <th
                scope="col"
                className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 sm:px-5"
              >
                Product
              </th>
              <th
                scope="col"
                className="hidden px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 sm:table-cell sm:px-5"
              >
                SKU
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500 sm:px-5"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-gray-500 sm:px-5"
              >
                Qty
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500 sm:px-5"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {cartItems.map((item) => (
              <AbandonedCartItemRow key={item._id} item={item} onViewProduct={onViewProduct} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200/80 bg-linear-to-r from-gray-50/90 to-blue-50/20 px-5 py-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-gray-700">Cart total</span>
          <span className="text-xl font-bold tabular-nums text-blue-700">{formatInr(cartTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default AbandonedCartItemsTable;
