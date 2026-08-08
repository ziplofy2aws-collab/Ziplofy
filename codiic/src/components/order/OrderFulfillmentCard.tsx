import { ChevronDownIcon, TruckIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { adminListFooterLinkClass, adminListSecondaryButtonClass } from '../admin-list-ui';
import { FulfillmentStatusBadge } from '../orders/order-status-badges';
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
  const cancelled = order.status === 'cancelled';

  return (
    <div className={orderCardClass}>
      <div
        className={`flex items-center gap-2 border-b border-admin-divider px-4 py-3 ${
          fulfilled
            ? 'bg-[#cdfee1]/35'
            : cancelled
              ? 'bg-admin-table-header'
              : 'bg-[#fce8de]/50'
        }`}
      >
        {cancelled ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ebebeb] px-2 py-0.5 text-[12px] font-medium text-[#616161]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8a8a8a]" />
            {getFulfillmentLabel(order.status)}
          </span>
        ) : (
          <FulfillmentStatusBadge status={fulfilled ? 'fulfilled' : 'unfulfilled'} />
        )}
      </div>

      <div className="flex items-center gap-2 border-b border-admin-divider px-4 py-3 text-[13px] text-admin-text-secondary">
        <TruckIcon className="h-4 w-4 text-admin-text-subdued" />
        <span>Standard</span>
      </div>

      <div className="divide-y divide-admin-divider">
        {order.items?.map((item) => {
          const variant = item.productVariantId;
          const product = variant?.productId;
          const productId = getProductIdFromItem(item);
          const name = product?.title || 'Product';
          const image = variant?.images?.[0] || product?.imageUrls?.[0];

          return (
            <div
              key={item._id}
              className={`flex items-center gap-3 px-4 py-3 ${
                productId ? 'cursor-pointer hover:bg-admin-row-hover' : ''
              }`}
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
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-admin-border bg-admin-secondary">
                {image ? (
                  <img src={image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-admin-text-subdued">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-[13px] font-medium ${adminListFooterLinkClass}`}>{name}</p>
                <p className="text-[13px] text-admin-text-secondary">
                  {formatOrderCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="shrink-0 text-[13px] font-medium text-admin-text">
                {formatOrderCurrency(item.total)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end border-t border-admin-divider bg-admin-table-header px-4 py-3">
        <button
          type="button"
          disabled={fulfilled || cancelled}
          className={`${adminListSecondaryButtonClass} gap-1`}
        >
          Mark as fulfilled
          <ChevronDownIcon className="h-4 w-4 text-admin-text-secondary" />
        </button>
      </div>
    </div>
  );
};

export default OrderFulfillmentCard;
