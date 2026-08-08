import React from 'react';
import type { OrderFulfillmentStatus, OrderPaymentStatus } from './orders-table.types';

const badgeBaseClass =
  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium';

/** Soft pastel status tones (low-saturation pills) */
const toneSuccess = 'bg-[#e3f1df] text-[#1b5e3b]';
const toneSuccessDot = 'bg-[#4a8c68]';
/** Payment waiting attention — soft amber */
const tonePaymentPending = 'bg-[#fef3d0] text-[#6b5500]';
const tonePaymentPendingDot = 'bg-[#c9a227]';
/** Fulfillment backlog — soft peach (distinct from payment) */
const toneUnfulfilled = 'bg-[#fce8de] text-[#8a3b12]';
const toneUnfulfilledDot = 'bg-[#d4784a]';
const toneNeutral = 'bg-[#ebebeb] text-[#616161]';
const toneNeutralDot = 'bg-[#8a8a8a]';

export function PaymentStatusBadge({ status }: { status: OrderPaymentStatus }) {
  if (status === 'pending') {
    return (
      <span className={`${badgeBaseClass} ${tonePaymentPending}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${tonePaymentPendingDot}`} />
        Payment pending
      </span>
    );
  }
  if (status === 'refunded') {
    return (
      <span className={`${badgeBaseClass} ${toneNeutral}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${toneNeutralDot}`} />
        Refunded
      </span>
    );
  }
  return (
    <span className={`${badgeBaseClass} ${toneSuccess}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${toneSuccessDot}`} />
      Paid
    </span>
  );
}

export function FulfillmentStatusBadge({ status }: { status: OrderFulfillmentStatus }) {
  if (status === 'fulfilled') {
    return (
      <span className={`${badgeBaseClass} ${toneSuccess}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${toneSuccessDot}`} />
        Fulfilled
      </span>
    );
  }
  return (
    <span className={`${badgeBaseClass} ${toneUnfulfilled}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${toneUnfulfilledDot}`} />
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
