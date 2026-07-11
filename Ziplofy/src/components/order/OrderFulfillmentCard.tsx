import { ChevronDownIcon, TruckIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { AdminOrder, AdminOrderItem } from '../../contexts/admin-order.context';
import {
  formatOrderCurrency,
  getFulfillmentLabel,
  isOrderFulfilled,
  orderCardClass,
} from '../../utils/order-details.util';

interface OrderFulfillmentCardProps {
  order: AdminOrder;
  getProductIdFromItem: (item: AdminOrderItem) => string | null;
}

const OrderFulfillmentCard: React.FC<OrderFulfillmentCardProps> = ({ order, getProductIdFromItem }) => {
  const fulfilled = isOrderFulfilled(order.status);

  return (
    <div className={orderCardClass}>
      <div
        className={`flex items-center gap-2 border-b px-4 py-3 ${
          fulfilled ? 'border-emerald-100 bg-emerald-50/60' : 'border-amber-100 bg-[#FFEA8A]/40'
        }`}
      >
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            fulfilled ? 'bg-emerald-100 text-emerald-800' : 'bg-[#FFEA8A] text-[#5c5a1f]'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {getFulfillmentLabel(order.status)}
        </span>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 text-sm text-gray-700">
        <TruckIcon className="h-4 w-4 text-gray-500" />
        <span>Standard</span>
      </div>

      <div className="divide-y divide-gray-100">
        {order.items?.map((item) => {
          const variant = item.productVariantId;
          const product = variant?.productId;
          const productId = getProductIdFromItem(item);
          const name = product?.title || 'Product';
          const image = variant?.images?.[0] || product?.imageUrls?.[0];

          return (
            <div
              key={item._id}
              className={`flex items-center gap-3 px-4 py-3 ${productId ? 'cursor-pointer hover:bg-gray-50/80' : ''}`}
              onClick={() => {
                if (productId) window.open(`/products/${productId}`, '_blank', 'noopener,noreferrer');
              }}
              onKeyDown={(e) => {
                if (productId && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  window.open(`/products/${productId}`, '_blank', 'noopener,noreferrer');
                }
              }}
              role={productId ? 'button' : undefined}
              tabIndex={productId ? 0 : undefined}
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                {image ? (
                  <img src={image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">No image</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-blue-700">{name}</p>
                <p className="text-sm text-gray-600">
                  {formatOrderCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="shrink-0 text-sm font-medium text-gray-900">{formatOrderCurrency(item.total)}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end border-t border-gray-100 bg-gray-50/50 px-4 py-3">
        <button
          type="button"
          disabled={fulfilled || order.status === 'cancelled'}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark as fulfilled
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default OrderFulfillmentCard;
