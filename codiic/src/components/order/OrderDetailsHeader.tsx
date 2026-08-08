import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import {
  adminListFooterLinkClass,
  adminListSecondaryButtonClass,
} from '../admin-list-ui';
import {
  FulfillmentStatusBadge,
  PaymentStatusBadge,
} from '../orders/order-status-badges';
import type { AdminOrder } from '../../contexts/admin-order.context';
import {
  formatOrderDisplayId,
  formatOrderHeaderDate,
  getFulfillmentLabel,
  isOrderFulfilled,
} from '../../utils/order-details.util';

interface OrderDetailsHeaderProps {
  order: AdminOrder;
  onBack: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

function CancelledStatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ebebeb] px-2 py-0.5 text-[12px] font-medium text-[#616161]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#8a8a8a]" />
      {label}
    </span>
  );
}

const OrderDetailsHeader: React.FC<OrderDetailsHeaderProps> = ({
  order,
  onBack,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}) => {
  const fulfilled = isOrderFulfilled(order.status);
  const paymentBadgeStatus =
    order.paymentStatus === 'paid' ? 'paid' : order.paymentStatus === 'refunded' ? 'refunded' : 'pending';

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={onBack}
        className={`mb-4 inline-flex items-center gap-1 text-[13px] ${adminListFooterLinkClass}`}
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Orders
      </button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-admin-text">
              {formatOrderDisplayId(order._id, order.displayOrderId)}
            </h1>
            <PaymentStatusBadge status={paymentBadgeStatus} />
            {order.status === 'cancelled' ? (
              <CancelledStatusBadge label={getFulfillmentLabel(order.status)} />
            ) : (
              <FulfillmentStatusBadge status={fulfilled ? 'fulfilled' : 'unfulfilled'} />
            )}
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            {formatOrderHeaderDate(order.orderDate || order.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={adminListSecondaryButtonClass}>
            Refund
          </button>
          <button type="button" className={adminListSecondaryButtonClass}>
            Edit
          </button>
          <button type="button" className={`${adminListSecondaryButtonClass} gap-1`}>
            Print
            <ChevronDownIcon className="h-4 w-4 text-admin-text-secondary" />
          </button>
          <button type="button" className={`${adminListSecondaryButtonClass} gap-1`}>
            More actions
            <ChevronDownIcon className="h-4 w-4 text-admin-text-secondary" />
          </button>
          <div className="ml-1 flex overflow-hidden rounded-lg border border-admin-border bg-admin-surface">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="border-r border-admin-border px-2.5 py-1.5 text-admin-text-secondary transition-colors hover:bg-admin-row-hover disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous order"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              className="px-2.5 py-1.5 text-admin-text-secondary transition-colors hover:bg-admin-row-hover disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next order"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsHeader;
