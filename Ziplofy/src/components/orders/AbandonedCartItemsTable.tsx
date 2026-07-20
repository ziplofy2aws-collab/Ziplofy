import React from 'react';
import AbandonedCartItemRow, { CartItem } from './AbandonedCartItemRow';

interface AbandonedCartItemsTableProps {
  cartItems: CartItem[];
  cartTotal: number;
  onViewProduct: (productId: string) => void;
}

const formatInr = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AbandonedCartItemsTable: React.FC<AbandonedCartItemsTableProps> = ({
  cartItems,
  cartTotal,
  onViewProduct,
}) => {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-[13px] font-semibold text-gray-900">Line items</h2>
        <p className="mt-0.5 text-[12px] text-gray-500">
          {cartItems.length} {cartItems.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Product</th>
              <th className="hidden px-3 py-2.5 text-[12px] font-medium text-gray-500 sm:table-cell">
                SKU
              </th>
              <th className="px-3 py-2.5 text-right text-[12px] font-medium text-gray-500">Price</th>
              <th className="px-3 py-2.5 text-center text-[12px] font-medium text-gray-500">Qty</th>
              <th className="px-3 py-2.5 text-right text-[12px] font-medium text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {cartItems.map((item) => (
              <AbandonedCartItemRow key={item._id} item={item} onViewProduct={onViewProduct} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <span className="text-[13px] font-medium text-gray-700">Cart total</span>
        <span className="text-[13px] font-semibold text-gray-900">{formatInr(cartTotal)}</span>
      </div>
    </section>
  );
};

export default AbandonedCartItemsTable;
