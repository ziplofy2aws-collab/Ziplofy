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
      ? 'bg-[#cdfee1] text-[#0c5132]'
      : normalized === 'in_progress' || normalized === 'ready_to_ship'
        ? 'bg-admin-secondary text-admin-text'
        : 'bg-admin-secondary text-admin-text-secondary';

  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${className}`}>
      {label}
    </span>
  );
};

export default TransferStatusBadge;
