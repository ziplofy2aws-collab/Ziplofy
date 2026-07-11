import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import type { AdminOrder } from '../../contexts/admin-order.context';
import {
  formatOrderDisplayId,
  formatOrderHeaderDate,
  getFulfillmentLabel,
  getPaymentStatusLabel,
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

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: 'paid' | 'unfulfilled' | 'fulfilled' | 'cancelled' | 'pending';
}) {
  const toneClass =
    tone === 'unfulfilled'
      ? 'bg-[#FFEA8A] text-[#5c5a1f]'
      : tone === 'fulfilled'
        ? 'bg-emerald-100 text-emerald-800'
        : tone === 'cancelled'
          ? 'bg-gray-200 text-gray-700'
          : tone === 'pending'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-[#E3E3E3] text-gray-800';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
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
  const fulfillmentTone =
    order.status === 'cancelled' ? 'cancelled' : fulfilled ? 'fulfilled' : 'unfulfilled';
  const paymentTone =
    order.paymentStatus === 'paid'
      ? 'paid'
      : order.paymentStatus === 'refunded'
        ? 'cancelled'
        : 'pending';

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Orders
      </button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">{formatOrderDisplayId(order._id)}</h1>
            <StatusBadge label={getPaymentStatusLabel(order.paymentStatus)} tone={paymentTone} />
            <StatusBadge label={getFulfillmentLabel(order.status)} tone={fulfillmentTone} />
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {formatOrderHeaderDate(order.orderDate || order.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Refund
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Print
            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            More actions
            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
          </button>
          <div className="ml-1 flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="border-r border-gray-200 px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous order"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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
