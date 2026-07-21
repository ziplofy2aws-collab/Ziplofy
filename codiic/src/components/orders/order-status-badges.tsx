import React from 'react';
import type { OrderFulfillmentStatus, OrderPaymentStatus } from './orders-table.types';

export function PaymentStatusBadge({ status }: { status: OrderPaymentStatus }) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2 py-0.5 text-[12px] font-normal text-orange-800">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
        Payment pending
      </span>
    );
  }
  if (status === 'refunded') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-normal text-gray-700">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
        Refunded
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-normal text-gray-700">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
      Paid
    </span>
  );
}

export function FulfillmentStatusBadge({ status }: { status: OrderFulfillmentStatus }) {
  if (status === 'fulfilled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-normal text-gray-700">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
        Fulfilled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[12px] font-normal text-amber-900">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Unfulfilled
    </span>
  );
}

export function OrderItemsPopoverSkeleton() {
  return (
    <div className="space-y-3 p-3">
      <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
      <div className="h-8 w-full animate-pulse rounded bg-gray-100" />
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-gray-100" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-3.5 w-8 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}
