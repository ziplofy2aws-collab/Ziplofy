import React from 'react';
import { formatTransferStatus } from './transfer-ui.util';

type TransferStatusBadgeProps = {
  status: string;
};

const TransferStatusBadge: React.FC<TransferStatusBadgeProps> = ({ status }) => {
  const normalized = status.toLowerCase();
  const label = formatTransferStatus(status);

  const className =
    normalized === 'transferred'
      ? 'bg-emerald-50 text-emerald-700'
      : normalized === 'in_progress' || normalized === 'ready_to_ship'
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

export default TransferStatusBadge;
