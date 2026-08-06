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
      ? 'bg-[#cdfee1] text-[#0c5132]'
      : normalized === 'ordered' || normalized === 'in_transit' || normalized === 'partially_received'
        ? 'bg-admin-secondary text-admin-text'
        : 'bg-admin-secondary text-admin-text-secondary';

  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${className}`}>
      {label}
    </span>
  );
};

export default PurchaseOrderStatusBadge;
