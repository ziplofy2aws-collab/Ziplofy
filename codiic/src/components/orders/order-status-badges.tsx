import React from 'react';
import type { OrderFulfillmentStatus, OrderPaymentStatus } from './orders-table.types';

const badgeBaseClass =
  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium';

export function PaymentStatusBadge({ status }: { status: OrderPaymentStatus }) {
  if (status === 'pending') {
    return (
      <span className={`${badgeBaseClass} bg-admin-secondary text-admin-text`}>
        <span className="h-1.5 w-1.5 rounded-full bg-admin-text-subdued" />
        Payment pending
      </span>
    );
  }
  if (status === 'refunded') {
    return (
      <span className={`${badgeBaseClass} bg-admin-secondary text-admin-text-secondary`}>
        <span className="h-1.5 w-1.5 rounded-full bg-admin-text-subdued" />
        Refunded
      </span>
    );
  }
  return (
    <span className={`${badgeBaseClass} bg-[#cdfee1] text-[#0c5132]`}>
      <span className="h-1.5 w-1.5 rounded-full bg-[#0c5132]" />
      Paid
    </span>
  );
}

export function FulfillmentStatusBadge({ status }: { status: OrderFulfillmentStatus }) {
  if (status === 'fulfilled') {
    return (
      <span className={`${badgeBaseClass} bg-[#cdfee1] text-[#0c5132]`}>
        <span className="h-1.5 w-1.5 rounded-full bg-[#0c5132]" />
        Fulfilled
      </span>
    );
  }
  return (
    <span className={`${badgeBaseClass} bg-admin-secondary text-admin-text-secondary`}>
      <span className="h-1.5 w-1.5 rounded-full bg-admin-text-subdued" />
      Unfulfilled
    </span>
  );
}

export function OrderItemsPopoverSkeleton() {
  return (
    <div className="space-y-3 p-3">
      <div className="h-5 w-24 animate-pulse rounded bg-admin-secondary" />
      <div className="h-8 w-full animate-pulse rounded bg-admin-secondary" />
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-admin-secondary" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-admin-secondary" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-admin-secondary" />
        </div>
        <div className="h-3.5 w-8 animate-pulse rounded bg-admin-secondary" />
      </div>
    </div>
  );
}
