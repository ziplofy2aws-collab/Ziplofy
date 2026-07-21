import React from 'react';
import { formatPurchaseOrderStatus } from './purchase-order-ui.util';

type PurchaseOrderStatusBadgeProps = {
  status: string;
};

const PurchaseOrderStatusBadge: React.FC<PurchaseOrderStatusBadgeProps> = ({ status }) => {
  const normalized = status.toLowerCase();
  const label = formatPurchaseOrderStatus(status);

  const className =
    normalized === 'received'
      ? 'bg-emerald-50 text-emerald-700'
      : normalized === 'ordered' || normalized === 'in_transit' || normalized === 'partially_received'
        ? 'bg-gray-100 text-gray-700'
        : normalized === 'cancelled'
          ? 'bg-red-50 text-red-600'
          : 'bg-gray-100 text-gray-500';

  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${className}`}>
      {label}
    </span>
  );
};

export default PurchaseOrderStatusBadge;
